import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerDocs } from './docs/routes.mjs';

const app = express();
const port = Number(process.env.PORT || 8787);
const apiKey = process.env.RIOT_API_KEY;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const platformToRegion = {
  br1: 'americas', la1: 'americas', la2: 'americas', na1: 'americas',
  eun1: 'europe', euw1: 'europe', tr1: 'europe', ru: 'europe',
  jp1: 'asia', kr: 'asia',
  oc1: 'sea', ph2: 'sea', sg2: 'sea', th2: 'sea', tw2: 'sea', vn2: 'sea',
};
const cache = new Map();
const matchCache = new Map();
const queueIds = { solo: 420, flex: 440 };
let championIndex = { version: '', byId: new Map(), expiresAt: 0 };
const requestBuckets = new Map();

function allowRequest(ip) {
  const now = Date.now();
  const current = requestBuckets.get(ip) || { start: now, count: 0 };
  if (now - current.start > 60_000) {
    current.start = now;
    current.count = 0;
  }
  current.count += 1;
  requestBuckets.set(ip, current);
  return current.count <= 60;
}

async function riotGet(host, endpoint) {
  const response = await fetch(`https://${host}.api.riotgames.com${endpoint}`, {
    headers: { 'X-Riot-Token': apiKey },
  });
  if (!response.ok) {
    const error = new Error(`Riot API: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// Data Dragon: mapa championId -> nazwa pliku ikony, odświeżana raz na godzinę.
async function getChampionIndex() {
  if (championIndex.expiresAt > Date.now()) return championIndex;
  const versions = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then((item) => item.json());
  const version = versions[0];
  const data = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/pl_PL/champion.json`).then((item) => item.json());
  const byId = new Map(Object.values(data.data).map((champion) => [Number(champion.key), { key: champion.id, name: champion.name }]));
  championIndex = { version, byId, expiresAt: Date.now() + 3_600_000 };
  return championIndex;
}

async function loadMastery(platform, puuid) {
  const [top, score, index] = await Promise.all([
    riotGet(platform, `/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(puuid)}/top?count=3`),
    riotGet(platform, `/lol/champion-mastery/v4/scores/by-puuid/${encodeURIComponent(puuid)}`),
    getChampionIndex(),
  ]);
  return {
    score,
    top: top.map((item) => {
      const champion = index.byId.get(item.championId);
      return {
        championId: item.championId,
        name: champion?.name || String(item.championId),
        level: item.championLevel,
        points: item.championPoints,
        iconUrl: champion ? `https://ddragon.leagueoflegends.com/cdn/${index.version}/img/champion/${champion.key}.png` : '',
      };
    }),
  };
}

async function loadMatch(region, matchId) {
  const cached = matchCache.get(matchId);
  if (cached) return cached;
  const match = await riotGet(region, `/lol/match/v5/matches/${encodeURIComponent(matchId)}`);
  matchCache.set(matchId, match);
  if (matchCache.size > 500) matchCache.delete(matchCache.keys().next().value);
  return match;
}

// Forma z ostatnich gier wybranej kolejki: W/L, KDA i CS na minutę.
async function loadRecent(region, puuid, queue) {
  const ids = await riotGet(
    region,
    `/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?queue=${queueIds[queue]}&count=10`,
  );
  const matches = (await Promise.allSettled(ids.map((id) => loadMatch(region, id))))
    .filter((item) => item.status === 'fulfilled')
    .map((item) => item.value);
  const games = matches
    .map((match) => {
      const me = match.info.participants.find((participant) => participant.puuid === puuid);
      if (!me) return null;
      return {
        win: me.win,
        kills: me.kills,
        deaths: me.deaths,
        assists: me.assists,
        cs: me.totalMinionsKilled + me.neutralMinionsKilled,
        minutes: match.info.gameDuration / 60,
        endedAt: match.info.gameEndTimestamp || 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.endedAt - a.endedAt);
  if (!games.length) return { games: [], kda: 0, csPerMin: 0 };
  const sum = (key) => games.reduce((total, game) => total + game[key], 0);
  const minutes = games.reduce((total, game) => total + game.minutes, 0);
  return {
    games: games.map((game) => game.win),
    kda: Math.round(((sum('kills') + sum('assists')) / Math.max(1, sum('deaths'))) * 10) / 10,
    csPerMin: minutes ? Math.round((sum('cs') / minutes) * 10) / 10 : 0,
  };
}

app.disable('x-powered-by');
app.get('/api/health', (_request, response) => {
  response.json({ ok: true, riotKeyConfigured: Boolean(apiKey) });
});

app.get('/riot.txt', (_request, response) => {
  const verificationCode = String(process.env.RIOT_VERIFY || '').trim();
  if (!verificationCode) return response.status(404).type('text/plain').send('');
  response.set('Cache-Control', 'public, max-age=300');
  return response.type('text/plain').send(`${verificationCode}\n`);
});

app.get('/api/player', async (request, response) => {
  if (!allowRequest(request.ip || 'unknown')) {
    return response.status(429).json({ error: 'Za dużo zapytań. Spróbuj ponownie za minutę.' });
  }
  if (!apiKey) {
    return response.status(503).json({ error: 'Serwer nie ma skonfigurowanego klucza RIOT_API_KEY.' });
  }

  const gameName = String(request.query.gameName || '').trim();
  const tagLine = String(request.query.tagLine || '').trim();
  const platform = String(request.query.platform || '').toLowerCase();
  const region = platformToRegion[platform];
  const queue = request.query.queue === 'flex' ? 'flex' : 'solo';
  if (!gameName || !tagLine || !region) {
    return response.status(400).json({ error: 'Podaj poprawny Riot ID i obsługiwany region.' });
  }

  const cacheKey = `${platform}:${gameName.toLowerCase()}#${tagLine.toLowerCase()}:${queue}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    response.set('Cache-Control', 'public, max-age=30');
    return response.json(cached.value);
  }

  try {
    const account = await riotGet(
      region,
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    );
    const summoner = await riotGet(
      platform,
      `/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(account.puuid)}`,
    );
    const entries = await riotGet(
      platform,
      `/lol/league/v4/entries/by-puuid/${encodeURIComponent(account.puuid)}`,
    );
    const versions = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then((item) => item.json());
    // Moduły opcjonalne: ich awaria nie psuje podstawowych danych banera.
    const [mastery, recent] = await Promise.allSettled([
      loadMastery(platform, account.puuid),
      loadRecent(region, account.puuid, queue),
    ]);
    const solo = entries.find((entry) => entry.queueType === 'RANKED_SOLO_5x5') || null;
    const flex = entries.find((entry) => entry.queueType === 'RANKED_FLEX_SR') || null;
    const value = {
      riotId: `${account.gameName}#${account.tagLine}`,
      gameName: account.gameName,
      tagLine: account.tagLine,
      platform,
      summonerLevel: summoner.summonerLevel,
      profileIconUrl: `https://ddragon.leagueoflegends.com/cdn/${versions[0]}/img/profileicon/${summoner.profileIconId}.png`,
      solo,
      flex,
      mastery: mastery.status === 'fulfilled' ? mastery.value : null,
      recent: recent.status === 'fulfilled' ? recent.value : null,
      // Kody błędów modułów opcjonalnych (np. 403 = klucz bez dostępu), aby Studio mogło to pokazać.
      moduleErrors: {
        ...(mastery.status === 'rejected' && { mastery: Number(mastery.reason?.status) || 0 }),
        ...(recent.status === 'rejected' && { recent: Number(recent.reason?.status) || 0 }),
      },
      updatedAt: new Date().toISOString(),
    };
    for (const [name, result] of [['mastery', mastery], ['recent', recent]]) {
      if (result.status === 'rejected') console.warn(`Riot module "${name}" failed: ${result.reason?.message || result.reason}`);
    }
    cache.set(cacheKey, { value, expiresAt: Date.now() + 90_000 });
    response.set('Cache-Control', 'public, max-age=30');
    return response.json(value);
  } catch (error) {
    const status = Number(error.status) || 502;
    const messages = {
      401: 'Klucz Riot API jest nieprawidłowy lub wygasł.',
      403: 'Riot API odrzuciło klucz. Klucze deweloperskie wygasają co 24 godziny.',
      404: 'Nie znaleziono gracza o takim Riot ID w wybranym regionie.',
      429: 'Limit Riot API został chwilowo wyczerpany.',
    };
    return response.status(status).json({ error: messages[status] || 'Nie udało się pobrać danych z Riot API.' });
  }
});

registerDocs(app);

app.use(
  express.static(path.join(root, 'dist'), {
    setHeaders: (response, file) => {
      if (file.endsWith('version.json') || file.endsWith('index.html')) response.set('Cache-Control', 'no-store');
    },
  }),
);
app.use((_request, response) => response.sendFile(path.join(root, 'dist', 'index.html')));
app.listen(port, () => console.log(`LoL Banner API listening on http://localhost:${port}`));

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
  if (!gameName || !tagLine || !region) {
    return response.status(400).json({ error: 'Podaj poprawny Riot ID i obsługiwany region.' });
  }

  const cacheKey = `${platform}:${gameName.toLowerCase()}#${tagLine.toLowerCase()}`;
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
      updatedAt: new Date().toISOString(),
    };
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

app.use(express.static(path.join(root, 'dist')));
app.use((_request, response) => response.sendFile(path.join(root, 'dist', 'index.html')));
app.listen(port, () => console.log(`LoL Banner API listening on http://localhost:${port}`));

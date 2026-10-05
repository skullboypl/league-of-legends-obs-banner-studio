import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { RankEmblem } from "./RankEmblem";
import { tr } from "./i18n";
import type { BannerSettings, PlayerData } from "./types";
import "./animated.css";

type Props = { player: PlayerData; settings: BannerSettings };
type Atom = { key: string; label: string; value: ReactNode };

const serverLabel = (platform: string) =>
  platform === "eun1" ? "EUNE" : platform === "euw1" ? "EUW" : platform.toUpperCase();

function facts(player: PlayerData, settings: BannerSettings) {
  const ranked = player[settings.queue];
  const games = ranked ? ranked.wins + ranked.losses : 0;
  const winrate = games ? Math.round((ranked!.wins / games) * 100) : 0;
  const apex = Boolean(
    ranked && ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(ranked.tier),
  );
  const recent = player.recent?.games.length ? player.recent : null;
  const top = (player.mastery?.top ?? []).slice(0, settings.topCount);
  const pips = recent ? (
    <span className="form-pips" aria-label={tr(settings.lang, "Ostatnie gry")}>
      {[...recent.games].reverse().map((win, index) => (
        <i key={index} className={win ? "win" : "loss"} />
      ))}
    </span>
  ) : (
    "—"
  );
  const champs = top.length ? (
    <span className="top-champs">
      {top.map((champion) => (
        <span key={champion.championId} title={champion.name}>
          {champion.iconUrl ? <img src={champion.iconUrl} alt={champion.name} /> : champion.name.slice(0, 1)}
        </span>
      ))}
    </span>
  ) : (
    "—"
  );
  const atoms = [
    settings.showWinrate && { key: "wr", label: tr(settings.lang, "WIN RATE"), value: ranked ? winrate + "%" : "—" },
    settings.showRecord && {
      key: "rec",
      label: tr(settings.lang, "BILANS"),
      value: ranked ? ranked.wins + "W / " + ranked.losses + "L" : "—",
    },
    settings.showGames && { key: "games", label: tr(settings.lang, "MECZE"), value: ranked ? String(games) : "—" },
    settings.showForm && { key: "form", label: tr(settings.lang, "FORMA"), value: pips },
    settings.showKda && { key: "kda", label: "KDA", value: recent ? recent.kda.toFixed(1) : "—" },
    settings.showCs && { key: "cs", label: "CS / MIN", value: recent ? recent.csPerMin.toFixed(1) : "—" },
    settings.showMastery && {
      key: "mastery",
      label: "MASTERY",
      value: player.mastery ? player.mastery.score.toLocaleString("pl-PL") : "—",
    },
    settings.showTop && { key: "top", label: tr(settings.lang, "TOP CHAMPIONI"), value: champs },
  ].filter(Boolean) as Atom[];
  return {
    ranked,
    games,
    winrate,
    apex,
    atoms,
    recent,
    top,
    tier: ranked ? ranked.tier + (apex ? "" : " " + ranked.rank) : "UNRANKED",
    lp: ranked ? ranked.leaguePoints : null,
    progress: ranked && !apex ? Math.min(ranked.leaguePoints, 100) : apex ? 100 : 0,
    streak: Boolean(settings.showStreak && ranked?.hotStreak),
  };
}

function Avatar({ player, settings }: Props) {
  if (!settings.showIcon) return null;
  return (
    <div className="ab-avatar">
      {player.profileIconUrl ? <img src={player.profileIconUrl} alt="" /> : <span>{player.gameName.slice(0, 1)}</span>}
      {settings.showLevel && <small>{player.summonerLevel}</small>}
    </div>
  );
}

function Identity({ player, settings }: Props) {
  return (
    <div className="ab-identity">
      <h2>{player.gameName}</h2>
      <div>
        {settings.showTag && <span>#{player.tagLine}</span>}
        {settings.showRegion && <b>{serverLabel(player.platform)}</b>}
        {!settings.showIcon && settings.showLevel && <span>LVL {player.summonerLevel}</span>}
      </div>
    </div>
  );
}

function rootProps(settings: BannerSettings, name: string) {
  return {
    className:
      "anim-banner ab-" + name + " shape-" + settings.avatarShape + " font-" + settings.font + (settings.glow ? " has-glow" : ""),
    style: {
      "--accent": settings.accent,
      "--banner-bg":
        settings.background + Math.round(settings.opacity * 2.55).toString(16).padStart(2, "0"),
      "--ink": settings.textColor,
      "--radius": settings.radius + "px",
      "--speed": settings.speed / 100,
      "--period": 5 / (settings.speed / 100) + "s",
      "--flip-period": 9 / (settings.speed / 100) + "s",
    } as CSSProperties,
  };
}

/* DECK: stały nagłówek gracza i karta statystyk zmieniająca się sama. */
const DECK_BASE_MS = 4200;
function Deck({ player, settings }: Props) {
  const deckMs = DECK_BASE_MS / (settings.speed / 100);
  const f = facts(player, settings);
  const pick = (...keys: string[]) => f.atoms.filter((atom) => keys.includes(atom.key));
  const groups: Atom[][] = [
    [
      ...(settings.showLP ? [{ key: "lp", label: "LP", value: f.lp ?? "—" }] : []),
      ...pick("wr"),
    ],
    pick("rec", "games", "mastery"),
    pick("form", "kda", "cs"),
    pick("top"),
  ].filter((group) => group.length);
  const cards = groups.length ? groups : [[{ key: "lp", label: "LP", value: f.lp ?? "—" }]];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (cards.length < 2) return setIndex(0);
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % cards.length), deckMs);
    return () => window.clearInterval(timer);
  }, [cards.length, deckMs]);
  const current = cards[Math.min(index, cards.length - 1)];
  return (
    <article {...rootProps(settings, "deck")}>
      <Avatar player={player} settings={settings} />
      <Identity player={player} settings={settings} />
      {settings.showRank && (
        <div className="ab-rank">
          <RankEmblem tier={f.ranked?.tier} />
          <span>{f.tier}</span>
          {f.streak && <em>{tr(settings.lang, "SERIA")}</em>}
        </div>
      )}
      <div className="deck-view" key={index}>
        {current.map((atom) => (
          <div key={atom.key}>
            <small>{atom.label}</small>
            <strong>{atom.value}</strong>
          </div>
        ))}
      </div>
      {cards.length > 1 && (
        <>
          <i className="deck-timer" key={"t" + index} style={{ animationDuration: deckMs + "ms" }} />
          <span className="deck-dots" aria-hidden="true">
            {cards.map((_, dot) => (
              <i key={dot} className={dot === index ? "on" : ""} />
            ))}
          </span>
        </>
      )}
    </article>
  );
}

/* ORBIT: okrągły licznik z łukiem LP, statystyki jako chipy pod spodem. */
function Orbit({ player, settings }: Props) {
  const f = facts(player, settings);
  return (
    <article {...rootProps(settings, "orbit")}>
      <div className="orbit-disc">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle className="orbit-spin" cx="100" cy="100" r="97" />
          <circle className="orbit-track" cx="100" cy="100" r="88" />
          {settings.showProgress && (
            <circle
              className="orbit-arc"
              cx="100"
              cy="100"
              r="88"
              pathLength="100"
              style={{ "--arc": f.progress } as CSSProperties}
            />
          )}
        </svg>
        <div className="orbit-core">
          {settings.showIcon && (
            <div className="ab-avatar small">
              {player.profileIconUrl ? <img src={player.profileIconUrl} alt="" /> : <span>{player.gameName.slice(0, 1)}</span>}
              {settings.showLevel && <small>{player.summonerLevel}</small>}
            </div>
          )}
          <h2>{player.gameName}</h2>
          <div className="orbit-meta">
            {settings.showTag && <span>#{player.tagLine}</span>}
            {settings.showRegion && <b>{serverLabel(player.platform)}</b>}
          </div>
          {settings.showRank && <span className="orbit-tier">{f.tier}</span>}
          {settings.showLP && (
            <strong className="orbit-lp">
              {f.lp ?? "—"} <small>LP</small>
            </strong>
          )}
          {f.streak && <em className="ab-chip">{tr(settings.lang, "SERIA")}</em>}
        </div>
      </div>
      {f.atoms.length > 0 && (
        <div className="orbit-chips">
          {f.atoms.map((atom, i) => (
            <div key={atom.key} style={{ animationDelay: i * 90 + "ms" }}>
              <small>{atom.label}</small>
              <strong>{atom.value}</strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

/* MARQUEE: wąska taśma transmisyjna z przewijanymi statystykami. */
function Marquee({ player, settings }: Props) {
  const f = facts(player, settings);
  const items = (copy: string) => [
    <span key={copy + "name"} className="mq-item name">
      {player.gameName}
      {settings.showTag && <i>#{player.tagLine}</i>}
      {settings.showRegion && <b>{serverLabel(player.platform)}</b>}
    </span>,
    ...f.atoms.map((atom) => (
      <span key={copy + atom.key} className="mq-item">
        <small>{atom.label}</small>
        <strong>{atom.value}</strong>
      </span>
    )),
  ];
  return (
    <article {...rootProps(settings, "marquee")}>
      <div className="mq-badge">
        {settings.showIcon && (
          <div className="ab-avatar tiny">
            {player.profileIconUrl ? <img src={player.profileIconUrl} alt="" /> : <span>{player.gameName.slice(0, 1)}</span>}
          </div>
        )}
        {settings.showRank && <RankEmblem tier={f.ranked?.tier} />}
        <div>
          {settings.showRank && <span>{f.tier}</span>}
          {settings.showLP && (
            <strong>
              {f.lp ?? "—"} <small>LP</small>
            </strong>
          )}
        </div>
      </div>
      <div className="mq-viewport">
        <div className="mq-track">
          {["a", "b", "c", "d"].map((copy) => (
            <div key={copy} aria-hidden={copy === "a" ? undefined : "true"}>
              {items(copy)}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

/* HEXTECH: obracająca się, świecąca ramka i sześciokątny awatar. */
function Hex({ player, settings }: Props) {
  const f = facts(player, settings);
  return (
    <article {...rootProps(settings, "hex")}>
      <i className="hex-shine" aria-hidden="true" />
      {settings.showIcon && (
        <div className="hex-avatar">
          <div>
            {player.profileIconUrl ? <img src={player.profileIconUrl} alt="" /> : <span>{player.gameName.slice(0, 1)}</span>}
          </div>
          {settings.showLevel && <small>{player.summonerLevel}</small>}
        </div>
      )}
      <div className="hex-main">
        <div className="hex-name">
          <h2>{player.gameName}</h2>
          {settings.showTag && <span>#{player.tagLine}</span>}
          {settings.showRegion && <b>{serverLabel(player.platform)}</b>}
        </div>
        <div className="hex-rank">
          {settings.showRank && <RankEmblem tier={f.ranked?.tier} />}
          <div>
            {settings.showRank && (
              <span>
                {f.tier}
                {f.streak && <em>{tr(settings.lang, "SERIA")}</em>}
              </span>
            )}
            {settings.showLP && (
              <strong>
                {f.lp ?? "—"} <small>LP</small>
              </strong>
            )}
          </div>
        </div>
        {f.atoms.length > 0 && (
          <div className="hex-stats">
            {f.atoms.slice(0, 5).map((atom) => (
              <div key={atom.key}>
                <small>{atom.label}</small>
                <strong>{atom.value}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
      {settings.showProgress && f.ranked && !f.apex && (
        <i className="hex-progress" style={{ width: f.progress + "%" }} aria-hidden="true" />
      )}
    </article>
  );
}

/* TABS: pasek zakładek z przesuwanym podkreśleniem; każda zakładka to inna treść. */
const TAB_MS = 4800;
function formatPoints(points: number) {
  return points >= 1000 ? Math.round(points / 1000) + "k" : String(points);
}
function Tabs({ player, settings }: Props) {
  const f = facts(player, settings);
  const pick = (...keys: string[]) => f.atoms.filter((atom) => keys.includes(atom.key));
  const pages: { id: string; label: string; body: ReactNode }[] = [
    {
      id: "profile",
      label: tr(settings.lang, "PROFIL"),
      body: (
        <div className="tabs-profile">
          <Avatar player={player} settings={settings} />
          <Identity player={player} settings={settings} />
          {settings.showRank && (
            <div className="ab-rank">
              <RankEmblem tier={f.ranked?.tier} />
              <span>{f.tier}</span>
            </div>
          )}
          {settings.showLP && (
            <strong className="tabs-lp">
              {f.lp ?? "—"} <small>LP</small>
            </strong>
          )}
        </div>
      ),
    },
  ];
  const stats = pick("wr", "rec", "games", "mastery");
  if (stats.length)
    pages.push({
      id: "stats",
      label: tr(settings.lang, "STATYSTYKI"),
      body: <div className="tabs-grid">{stats.map(atomNode)}</div>,
    });
  const form = pick("form", "kda", "cs");
  if (form.length)
    pages.push({
      id: "form",
      label: tr(settings.lang, "FORMA"),
      body: <div className="tabs-grid big">{form.map(atomNode)}</div>,
    });
  if (settings.showTop && f.top.length)
    pages.push({
      id: "champs",
      label: tr(settings.lang, "CHAMPIONI"),
      body: (
        <div className="tabs-champs">
          {f.top.map((champion) => (
            <div key={champion.championId}>
              <span className="ab-champ-icon">
                {champion.iconUrl ? <img src={champion.iconUrl} alt="" /> : champion.name.slice(0, 1)}
              </span>
              <div>
                <strong>{champion.name}</strong>
                <small>
                  M{champion.level} · {tr(settings.lang, "{0} pkt", formatPoints(champion.points))}
                </small>
              </div>
            </div>
          ))}
        </div>
      ),
    });
  const [index, setIndex] = useState(0);
  const tabMs = TAB_MS / (settings.speed / 100);
  useEffect(() => {
    if (pages.length < 2) return setIndex(0);
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % pages.length), tabMs);
    return () => window.clearInterval(timer);
  }, [pages.length, tabMs]);
  const at = Math.min(index, pages.length - 1);
  return (
    <article {...rootProps(settings, "tabs")}>
      <nav className="tabs-nav" aria-hidden="true">
        {pages.map((page, i) => (
          <span key={page.id} className={i === at ? "on" : ""}>
            {page.label}
          </span>
        ))}
        <i style={{ width: 100 / pages.length + "%", transform: "translateX(" + at * 100 + "%)" }} />
      </nav>
      <div className="tabs-body" key={at}>
        {pages[at].body}
      </div>
    </article>
  );
}
function atomNode(atom: Atom) {
  return (
    <div key={atom.key}>
      <small>{atom.label}</small>
      <strong>{atom.value}</strong>
    </div>
  );
}

/* RADAR: HUD z obracającym się radarem; ostatnie gry to echa, które rozbłyskają przy przejściu wskazówki. */
function Radar({ player, settings }: Props) {
  const f = facts(player, settings);
  const games = (f.recent?.games ?? []).slice(0, 10);
  return (
    <article {...rootProps(settings, "radar")}>
      <div className="radar-disc" aria-hidden="true">
        <i className="radar-ring r1" />
        <i className="radar-ring r2" />
        <i className="radar-cross" />
        <i className="radar-sweep" />
        {games.map((win, i) => {
          const angle = (i / games.length) * Math.PI * 2;
          const radius = i % 2 ? 0.3 : 0.4;
          return (
            <b
              key={i}
              className={"radar-blip " + (win ? "win" : "loss")}
              style={{
                left: 50 + Math.sin(angle) * radius * 100 + "%",
                top: 50 - Math.cos(angle) * radius * 100 + "%",
                animationDelay: "calc(var(--period) * " + i / games.length + ")",
              }}
            />
          );
        })}
        <span className="radar-core">{settings.showRank && <RankEmblem tier={f.ranked?.tier} />}</span>
      </div>
      <div className="radar-hud">
        <i className="radar-scan" aria-hidden="true" />
        <div className="radar-name">
          <h2>{player.gameName}</h2>
          {settings.showTag && <span>#{player.tagLine}</span>}
          {settings.showRegion && <b>{serverLabel(player.platform)}</b>}
          {settings.showLevel && <em>LVL {player.summonerLevel}</em>}
        </div>
        <div className="radar-rank">
          {settings.showRank && <span>{f.tier}</span>}
          {settings.showLP && (
            <strong>
              {f.lp ?? "—"} <small>LP</small>
            </strong>
          )}
          {f.streak && <em className="ab-chip">{tr(settings.lang, "SERIA")}</em>}
        </div>
        {f.atoms.length > 0 && <div className="radar-stats">{f.atoms.slice(0, 4).map(atomNode)}</div>}
      </div>
    </article>
  );
}

/* FLIP: karty obracane jak tablica odlotów; każda ma dwie strony z prawdziwymi danymi. */
function Flip({ player, settings }: Props) {
  const f = facts(player, settings);
  const faces: Atom[] = [
    ...(settings.showLP ? [{ key: "lp", label: "LP", value: f.lp ?? "—" }] : []),
    ...(settings.showRank ? [{ key: "tier", label: tr(settings.lang, "RANGA"), value: f.tier }] : []),
    ...f.atoms,
  ];
  const cards: Atom[][] = [];
  for (let i = 0; i < faces.length && cards.length < 4; i += 2) cards.push(faces.slice(i, i + 2));
  return (
    <article {...rootProps(settings, "flip")}>
      <Avatar player={player} settings={settings} />
      <Identity player={player} settings={settings} />
      <div className="flip-board">
        {cards.map((pair, index) => (
          <div className="flip-card" key={pair[0].key}>
            <div
              className={"flip-inner" + (pair.length > 1 ? " flips" : "")}
              style={{ animationDelay: "calc(var(--flip-period) * " + index * 0.12 + ")" }}
            >
              {pair.map((atom, side) => (
                <div className={"flip-face " + (side ? "back" : "front")} key={atom.key}>
                  <small>{atom.label}</small>
                  <strong>{atom.value}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

/* LADDER: drabina wszystkich rang z animowanym wypełnieniem i pulsującym markerem. */
const LADDER = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"];
const LADDER_SHORT = ["IRN", "BRZ", "SLV", "GLD", "PLT", "EME", "DIA", "MST", "GM", "CH"];
function Ladder({ player, settings }: Props) {
  const f = facts(player, settings);
  const tierIndex = f.ranked ? LADDER.indexOf(f.ranked.tier) : -1;
  const inTier = f.apex ? 0.5 : f.progress / 100;
  const position = tierIndex < 0 ? 0 : ((tierIndex + inTier) / LADDER.length) * 100;
  return (
    <article {...rootProps(settings, "ladder")}>
      <div className="ladder-top">
        <Avatar player={player} settings={settings} />
        <Identity player={player} settings={settings} />
        <div className="ladder-rank">
          {settings.showRank && <span>{f.tier}</span>}
          {settings.showLP && (
            <strong>
              {f.lp ?? "—"} <small>LP</small>
            </strong>
          )}
        </div>
        {f.atoms.length > 0 && <div className="ladder-stats">{f.atoms.slice(0, 4).map(atomNode)}</div>}
      </div>
      <div className="ladder-track">
        {LADDER.map((tier, i) => (
          <div key={tier} className={"ladder-cell" + (i === tierIndex ? " here" : "")}>
            <i
              style={
                {
                  "--fill": i < tierIndex ? 1 : i === tierIndex ? inTier : 0,
                  animationDelay: i * 90 + "ms",
                } as CSSProperties
              }
            />
            <small>{LADDER_SHORT[i]}</small>
          </div>
        ))}
        {tierIndex >= 0 && (
          <span className="ladder-marker" style={{ left: position + "%" }}>
            <RankEmblem tier={f.ranked?.tier} />
          </span>
        )}
      </div>
    </article>
  );
}

export function AnimatedBanner(props: Props) {
  switch (props.settings.style) {
    case "tabs":
      return <Tabs {...props} />;
    case "radar":
      return <Radar {...props} />;
    case "flip":
      return <Flip {...props} />;
    case "ladder":
      return <Ladder {...props} />;
    case "orbit":
      return <Orbit {...props} />;
    case "marquee":
      return <Marquee {...props} />;
    case "hex":
      return <Hex {...props} />;
    default:
      return <Deck {...props} />;
  }
}

import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { RankEmblem } from "./RankEmblem";
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
    <span className="form-pips" aria-label="Ostatnie gry">
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
    settings.showWinrate && { key: "wr", label: "WIN RATE", value: ranked ? winrate + "%" : "—" },
    settings.showRecord && {
      key: "rec",
      label: "BILANS",
      value: ranked ? ranked.wins + "W / " + ranked.losses + "L" : "—",
    },
    settings.showGames && { key: "games", label: "MECZE", value: ranked ? String(games) : "—" },
    settings.showForm && { key: "form", label: "FORMA", value: pips },
    settings.showKda && { key: "kda", label: "KDA", value: recent ? recent.kda.toFixed(1) : "—" },
    settings.showCs && { key: "cs", label: "CS / MIN", value: recent ? recent.csPerMin.toFixed(1) : "—" },
    settings.showMastery && {
      key: "mastery",
      label: "MASTERY",
      value: player.mastery ? player.mastery.score.toLocaleString("pl-PL") : "—",
    },
    settings.showTop && { key: "top", label: "TOP CHAMPIONI", value: champs },
  ].filter(Boolean) as Atom[];
  return {
    ranked,
    games,
    winrate,
    apex,
    atoms,
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
          {f.streak && <em>SERIA</em>}
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
          {f.streak && <em className="ab-chip">SERIA</em>}
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
                {f.streak && <em>SERIA</em>}
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

export function AnimatedBanner(props: Props) {
  switch (props.settings.style) {
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

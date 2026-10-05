import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import type { BannerSettings, PlayerData } from "./types";
import { baseSize, dimensions, extraPanelHeight } from "./settings";

export function RankEmblem({ tier = "UNRANKED" }: { tier?: string }) {
  return (
    <svg
      className="rank-emblem"
      viewBox="0 0 100 100"
      fill="none"
      aria-label={tier}
    >
      <path
        d="M9 30 29 38 36 19 50 10 64 19 71 38 91 30 80 57 66 67 50 91 34 67 20 57Z"
        fill="currentColor"
        opacity=".18"
      />
      <path
        d="m50 10 22 29-7 29-15 22-15-22-7-29Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="m50 24 13 19-5 20-8 12-8-12-5-20Z" fill="currentColor" />
      <path
        d="m29 38-20-8 11 27 14 10M71 38l20-8-11 27-14 10M22 44l10 7m46-7-10 7"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="m50 24 0 51 13-32Z" fill="white" opacity=".25" />
    </svg>
  );
}
export function PlayerBanner({
  player,
  settings,
}: {
  player: PlayerData;
  settings: BannerSettings;
}) {
  const ranked = player[settings.queue];
  const games = ranked ? ranked.wins + ranked.losses : 0;
  const winrate = games ? Math.round((ranked!.wins / games) * 100) : 0;
  const apex =
    ranked && ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(ranked.tier);
  const recent = player.recent;
  const top = player.mastery?.top ?? [];
  const series = ranked?.miniSeries;
  const stats = [
    settings.showWinrate && {
      label: "WIN RATE",
      value: ranked ? winrate + "%" : "—",
    },
    settings.showRecord && {
      label: "BILANS",
      value: ranked ? ranked.wins + "W / " + ranked.losses + "L" : "—",
    },
    settings.showGames && {
      label: "MECZE",
      value: ranked ? String(games) : "—",
    },
  ].filter(Boolean) as { label: string; value: string }[];
  const extras = [
    settings.showForm && {
      label: "FORMA",
      value: recent?.games.length ? (
        <span className="form-pips" aria-label="Ostatnie gry">
          {[...recent.games].reverse().map((win, index) => (
            <i key={index} className={win ? "win" : "loss"} />
          ))}
        </span>
      ) : (
        "—"
      ),
    },
    settings.showKda && {
      label: "KDA",
      value: recent?.games.length ? recent.kda.toFixed(1) : "—",
    },
    settings.showCs && {
      label: "CS / MIN",
      value: recent?.games.length ? recent.csPerMin.toFixed(1) : "—",
    },
    settings.showTop && {
      label: "TOP CHAMPIONI",
      value: top.length ? (
        <span className="top-champs">
          {top.map((champion) => (
            <span key={champion.championId} title={champion.name}>
              {champion.iconUrl ? (
                <img src={champion.iconUrl} alt={champion.name} />
              ) : (
                champion.name.slice(0, 1)
              )}
            </span>
          ))}
        </span>
      ) : (
        "—"
      ),
    },
  ].filter(Boolean) as { label: string; value: ReactNode }[];
  const panelHeight = extraPanelHeight(settings);
  const themeStyle = {
    "--accent": settings.accent,
    "--banner-bg":
      settings.background +
      Math.round(settings.opacity * 2.55)
        .toString(16)
        .padStart(2, "0"),
    "--ink": settings.textColor,
    "--radius": settings.radius + "px",
  } as CSSProperties;
  const themeClass =
    " font-" + settings.font + (settings.glow ? " has-glow" : "") + (settings.animate ? " animated" : "");
  return (
    <div className="banner-stack">
    <article
      className={
        "player-banner banner-" +
        settings.style +
        " font-" +
        settings.font +
        (settings.glow ? " has-glow" : "") +
        (settings.animate ? " animated" : "")
      }
      style={
        {
          "--accent": settings.accent,
          "--banner-bg":
            settings.background +
            Math.round(settings.opacity * 2.55)
              .toString(16)
              .padStart(2, "0"),
          "--ink": settings.textColor,
          "--radius": settings.radius + "px",
        } as CSSProperties
      }
    >
      <div className="banner-topline">
        <span>LEAGUE OF LEGENDS</span>
        <span>
          {settings.queue === "solo" ? "RANKED SOLO / DUO" : "RANKED FLEX"}
        </span>
      </div>
      <div className="banner-profile">
        {settings.showIcon && (
          <div className="avatar">
            {player.profileIconUrl ? (
              <img src={player.profileIconUrl} alt="" />
            ) : (
              <span>{player.gameName.slice(0, 1)}</span>
            )}
            {settings.showLevel && <small>{player.summonerLevel}</small>}
          </div>
        )}
        <div className="identity">
          <h2>{player.gameName}</h2>
          <div>
            {settings.showTag && <span>#{player.tagLine}</span>}
            {settings.showRegion && (
              <b>
                {player.platform === "eun1"
                  ? "EUNE"
                  : player.platform === "euw1"
                    ? "EUW"
                    : player.platform.toUpperCase()}
              </b>
            )}
            {!settings.showIcon && settings.showLevel && (
              <span>LVL {player.summonerLevel}</span>
            )}
          </div>
        </div>
      </div>
      {(settings.showRank || settings.showLP) && (
        <div className="banner-rank">
          {settings.showRank && <RankEmblem tier={ranked?.tier} />}
          <div>
            {settings.showRank && (
              <span>
                {ranked
                  ? ranked.tier + (apex ? "" : " " + ranked.rank)
                  : "UNRANKED"}
              </span>
            )}
            {settings.showStreak && ranked?.hotStreak && (
              <em className="chip">SERIA</em>
            )}
            {settings.showStreak && series && (
              <em className="chip series" aria-label="Seria awansowa">
                {series.progress.split("").map((step, index) => (
                  <i key={index} className={step === "W" ? "win" : step === "L" ? "loss" : ""} />
                ))}
              </em>
            )}
            {settings.showLP && (
              <strong>
                {ranked ? ranked.leaguePoints : "—"} <small>LP</small>
              </strong>
            )}
          </div>
        </div>
      )}
      {stats.length > 0 && (
        <div className="banner-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <small>{stat.label}</small>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      )}
      {settings.showProgress && ranked && !apex && (
        <div
          className="lp-track"
          aria-label={ranked.leaguePoints + " LP ze 100"}
        >
          <i style={{ width: Math.min(ranked.leaguePoints, 100) + "%" }} />
        </div>
      )}
    </article>
    {panelHeight > 0 && (
      <div
        className={"banner-extra" + themeClass}
        style={{ ...themeStyle, height: panelHeight }}
      >
        {extras.map((stat) => (
          <div key={stat.label}>
            <small>{stat.label}</small>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
    )}
    </div>
  );
}
export function BannerFrame({
  player,
  settings,
  fit = true,
  maxHeight,
}: {
  player: PlayerData;
  settings: BannerSettings;
  fit?: boolean;
  maxHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const preset = baseSize(settings);
  const size = dimensions(settings);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setAvailable(entry.contentRect.width),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const ratio = fit
    ? Math.min(
        1,
        (available || size.width) / size.width,
        maxHeight ? maxHeight / size.height : 1,
      )
    : 1;
  const scale = (settings.scale / 100) * ratio;
  return (
    <div
      ref={ref}
      className="banner-frame"
      style={{ width: fit ? "100%" : size.width }}
    >
      <div
        style={{
          width: preset.width * scale,
          height: preset.height * scale,
          margin: "auto",
        }}
      >
        <div
          style={{
            width: preset.width,
            height: preset.height,
            transform: "scale(" + scale + ")",
            transformOrigin: "top left",
          }}
        >
          <PlayerBanner player={player} settings={settings} />
        </div>
      </div>
    </div>
  );
}

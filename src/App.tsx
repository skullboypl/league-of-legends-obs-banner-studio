import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { fetchPlayer, parseRiotId } from "./api";
import { watchForUpdates } from "./updates";
import { defaultSettings, platforms, samplePlayer } from "./data";
import { BannerFrame, RankEmblem } from "./PlayerBanner";
import {
  dimensions,
  avatarShapes,
  extraViews,
  presets,
  themes,
  settingsFromUrl,
  settingsQuery,
  studioSettings,
  widgetUrl,
} from "./settings";
import type { BannerSettings, PlayerData } from "./types";

const paths = {
  sliders: "M4 7h9m4 0h3M4 17h3m4 0h9M13 4v6M7 14v6",
  palette:
    "M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h4a4 4 0 0 0 4-4c0-3-4-6-9-6ZM7 9h.01M10 6h.01M15 7h.01",
  stats: "M4 20h16M6 16v-5m6 5V4m6 12V8",
  monitor: "M3 4h18v13H3zM8 21h8m-4-4v4",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  layers: "m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
  link: "m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 12a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1",
  book: "M4 4h7l1 2 1-2h7v16h-7l-1 1-1-1H4zM12 6v15",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20a8 8 0 0 1 16 0",
  levelUp: "M12 19V5m0 0-5 5m5-5 5 5",
  hash: "M5 9h14M5 15h14M10 4 8 20m8-16-2 16",
  globe:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
  shield: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  percent:
    "M19 5 5 19M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  record: "M4 6h16M4 12h10M4 18h6",
  progress: "M3 9h18v6H3zM6 12h6",
  flame: "M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9Z",
  activity: "M3 12h4l3-8 4 16 3-8h4",
  crosshair:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 3v5m0 8v5M3 12h5m8 0h5",
  coin: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v10M9 10c0-1 1-1.5 3-1.5s3 .5 3 1.5-1 1.5-3 2-3 1-3 2 1 1.5 3 1.5 3-.5 3-1.5",
  trophy:
    "M8 4h8v6a4 4 0 0 1-8 0V4ZM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 14v4m-4 3h8",
  star: "m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 3Z",
  heading: "M4 7V5h16v2M12 5v14m-3 0h6",
};
const optionIcons: Record<string, keyof typeof paths> = {
  showIcon: "user",
  showLevel: "levelUp",
  showTag: "hash",
  showRegion: "globe",
  showRank: "shield",
  showLP: "bolt",
  showWinrate: "percent",
  showRecord: "record",
  showGames: "layers",
  showProgress: "progress",
  showStreak: "flame",
  showForm: "activity",
  showKda: "crosshair",
  showCs: "coin",
  showTop: "trophy",
  showMastery: "star",
  showTopline: "heading",
};
function Icon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
function ViewPreview({ id }: { id: string }) {
  const tile = (key: number) => (
    <div key={key}>
      <i />
      <b />
    </div>
  );
  return (
    <span className={"vp vp-" + id} aria-hidden="true">
      {id === "strip" && [0, 1, 2, 3].map(tile)}
      {id === "pills" &&
        [0, 1, 2].map((key) => (
          <em key={key}>
            <i />
            <b />
          </em>
        ))}
      {id === "rings" && [0, 1, 2].map((key) => <u key={key} />)}
      {id === "cycle" && (
        <>
          <span>{[0, 1].map(tile)}</span>
          <span>{[0, 1, 2].map(tile)}</span>
          <s>
            <i />
            <i />
          </s>
        </>
      )}
      {id === "ticker" && (
        <span>{[0, 1, 2, 3, 4, 5].map(tile)}</span>
      )}
    </span>
  );
}
function Card({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="settings-card">
      <div className="card-title">
        <h3>{title}</h3>
        {note && <span>{note}</span>}
      </div>
      {children}
    </section>
  );
}
const tabs = [
  { id: "player", name: "Podstawowe", icon: "sliders" },
  { id: "style", name: "Wygląd", icon: "palette" },
  { id: "stats", name: "Statystyki", icon: "stats" },
] as const;
type Tab = (typeof tabs)[number]["id"];
const options = [
  ["showIcon", "Ikona gracza", "Awatar z profilu Riot"],
  ["showLevel", "Poziom konta", "Poziom przy ikonie lub nazwie"],
  ["showTag", "Tag Riot ID", "Tag gracza obok nazwy"],
  ["showRegion", "Serwer", "Region konta"],
  ["showRank", "Ranga i emblemat", "Aktualna dywizja w wybranej kolejce"],
  ["showLP", "Punkty ligowe", "Aktualne LP"],
  ["showWinrate", "Win rate", "Odsetek zwycięstw w kolejce"],
  ["showRecord", "Wygrane i porażki", "Bilans sezonu w kolejce"],
  ["showGames", "Liczba meczów", "Suma wygranych i porażek"],
  ["showProgress", "Pasek LP", "0–100 LP; bez paska dla Master+"],
  ["showStreak", "Serie", "Seria wygranych i seria awansowa"],
  ["showForm", "Forma", "Wyniki W/L z ostatnich 10 gier kolejki"],
  ["showKda", "KDA", "Średnie KDA z ostatnich 10 gier"],
  ["showCs", "CS na minutę", "Średnia z ostatnich 10 gier"],
  ["showTop", "Top championi", "Championi z najwyższym mastery"],
  ["showMastery", "Wynik mastery", "Łączny wynik mastery konta"],
  ["showTopline", "Pasek tytułowy", "Napis LEAGUE OF LEGENDS i nazwa kolejki (układy klasyczne)"],
] as const;

export function App() {
  const [settings, setSettings] = useState(studioSettings);
  const [tab, setTab] = useState<Tab>("player");
  const [player, setPlayer] = useState<PlayerData>(samplePlayer);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [scene, setScene] = useState("rift");
  const [importValue, setImportValue] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const frameHost = useRef<HTMLDivElement>(null);
  const [frameRoom, setFrameRoom] = useState(0);
  const request = useRef<AbortController>();
  const size = dimensions(settings);
  const selected = presets.find((p) => p.id === settings.style)!;
  const currentTab = tabs.find((t) => t.id === tab)!;
  // Podgląd uzupełnia brakujące dane przykładowymi, aby było widać docelowy wygląd.
  const needsMastery = settings.showTop && !player.mastery?.top.length;
  const needsRecent =
    (settings.showForm || settings.showKda || settings.showCs) &&
    !player.recent?.games.length;
  const previewPlayer: PlayerData = {
    ...player,
    mastery: needsMastery ? samplePlayer.mastery : player.mastery,
    recent: needsRecent ? samplePlayer.recent : player.recent,
  };
  const matched =
    loaded &&
    player.riotId.toLowerCase() === settings.riotId.trim().toLowerCase() &&
    player.platform === settings.platform;
  useEffect(() => {
    try {
      localStorage.setItem("lol-studio-v2", JSON.stringify(settings));
    } catch {
      /* Private browsing may block storage. */
    }
  }, [settings]);
  useEffect(() => {
    loadPlayer();
    return () => request.current?.abort();
  }, []);
  useEffect(() => {
    // Szerokość miejsca na podgląd iframe, do skalowania do okna.
    if (!exportOpen || !frameHost.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setFrameRoom(entry.contentRect.width),
    );
    observer.observe(frameHost.current);
    return () => observer.disconnect();
  }, [exportOpen]);
  useEffect(() => {
    // Forma z meczów zależy od kolejki, więc po jej zmianie pobieramy dane ponownie.
    if (loaded) loadPlayer();
  }, [settings.queue]);
  useEffect(
    () =>
      watchForUpdates(() => {
        setNotice("Wykryto nową wersję – odświeżam…");
        window.setTimeout(() => location.reload(), 2500);
      }),
    [],
  );
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  function update<K extends keyof BannerSettings>(
    key: K,
    value: BannerSettings[K],
  ) {
    setSettings((s) => ({ ...s, [key]: value }));
  }
  async function loadPlayer(event?: FormEvent) {
    event?.preventDefault();
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError("");
    try {
      const data = await fetchPlayer(
        settings.riotId,
        settings.platform,
        settings.queue,
        controller.signal,
      );
      setPlayer(data);
      setLoaded(true);
    } catch (reason) {
      if (!controller.signal.aborted)
        setError(
          reason instanceof Error
            ? reason.message
            : "Nie udało się pobrać danych.",
        );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  async function copy(value: string, label = "Skopiowano do schowka") {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(label);
    } catch {
      setNotice(
        "Schowek jest niedostępny. Zaznacz i skopiuj adres z okna eksportu.",
      );
    }
  }
  function importLink() {
    try {
      const url = new URL(importValue);
      if (!url.searchParams.has("riotId")) throw new Error();
      setSettings(settingsFromUrl(url.search));
      setNotice(
        "Wczytano ustawienia. Pobierz dane gracza, aby odświeżyć profil.",
      );
      setImportValue("");
    } catch {
      setNotice("Wklej pełny link do Studio lub widżetu zawierający Riot ID.");
    }
  }
  function openExport() {
    if (!parseRiotId(settings.riotId)) {
      setError("Wpisz Riot ID w formacie Nazwa#TAG.");
      setTab("player");
      return;
    }
    setExportOpen(true);
    dialog.current?.showModal();
  }
  const animatedSelected = Boolean(selected.animated);
  const presetButton = (p: (typeof presets)[number]) => (
    <button
      key={p.id}
      className={"preset " + (settings.style === p.id ? "chosen" : "")}
      aria-pressed={settings.style === p.id}
      onClick={() => update("style", p.id)}
    >
      <div className="preset-preview">
        <BannerFrame
          player={previewPlayer}
          maxHeight={p.animated ? 62 : 50}
          settings={{ ...settings, style: p.id, scale: 100, animate: false }}
        />
      </div>
      <span>
        <strong>{p.name}</strong>
        <small>
          {p.width} × {p.height}
        </small>
      </span>
      {settings.style === p.id && <b className="preset-check">✓</b>}
    </button>
  );
  const range = (
    key: "radius" | "opacity" | "scale" | "speed" | "topCount",
    label: string,
    min: number,
    max: number,
    suffix: string,
  ) => (
    <label className="range-row">
      <span>
        {label}
        <b>
          {settings[key]}
          {suffix}
        </b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={settings[key]}
        onChange={(e) => update(key, Number(e.target.value))}
      />
    </label>
  );
  const toggle = (key: "glow" | "animate", label: string) => (
    <label className="toggle">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={settings[key]}
        onChange={(e) => update(key, e.target.checked)}
      />
      <i />
    </label>
  );
  return (
    <div className="studio">
      <aside className="sidebar">
        <a href="/" className="brand">
          <span className="brand-mark">
            <Icon name="layers" />
          </span>
          <span>
            Banner<small>STUDIO / LEAGUE</small>
          </span>
        </a>
        <div className="workspace-label">TWÓJ WARSZTAT</div>
        <nav aria-label="Ustawienia banera">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "active" : ""}
              aria-current={tab === t.id ? "page" : undefined}
              aria-label={t.name}
              onClick={() => setTab(t.id)}
            >
              <Icon name={t.icon} />
              <span>{t.name}</span>
              <span className="nav-arrow">›</span>
            </button>
          ))}
        </nav>
        <div className="docs-nav" role="navigation" aria-label="Dokumentacja">
          <a href="/docs/obs-studio">
            <Icon name="monitor" />
            <span>Instrukcja OBS</span>
            <span className="nav-arrow">›</span>
          </a>
          <a href="/docs">
            <Icon name="book" />
            <span>Dokumentacja</span>
            <span className="nav-arrow">›</span>
          </a>
        </div>
        <div className="sidebar-bottom">
          <div className="game-badge">
            L
            <span>
              LEAGUE
              <br />
              OF LEGENDS
            </span>
          </div>
          <p>
            Twoja ranga.
            <br />
            Twój styl. Twój stream.
          </p>
          <small>
            Stworzone przez Skull <span>↗</span>
          </small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Warsztat <i>/</i> <b>{currentTab.name}</b>
          </span>
          <span>
            <Icon name="monitor" /> OBS & STREAMLABS{" "}
            <i className="status-dot" />
          </span>
        </header>
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              LEAGUE OF LEGENDS <span>/</span> BANNER STUDIO
            </p>
            <h1>
              Twoja ranga. Na Twoim streamie<span>.</span>
            </h1>
            <p>Ustaw profil, dopasuj baner i przenieś go prosto do OBS.</p>
          </div>
          <span className="heading-emblem">
            <RankEmblem />
          </span>
        </div>
        <main className="studio-main">
          <div className="controls">
            <div className="section-label">
              <h2>{currentTab.name}</h2>
              <span>
                Zapis automatyczny <i className="status-dot" />
              </span>
            </div>
            {tab === "player" && (
              <>
                <Card title="Profil gracza" note="RIOT ID">
                  <form onSubmit={loadPlayer}>
                    <label>
                      Riot ID
                      <input
                        value={settings.riotId}
                        onChange={(e) => update("riotId", e.target.value)}
                        placeholder="Nazwa#TAG"
                        required
                      />
                    </label>
                    <p className="hint">Nazwa i tag z Twojego konta Riot.</p>
                    <div className="field-pair">
                      <label>
                        Serwer
                        <select
                          value={settings.platform}
                          onChange={(e) => update("platform", e.target.value)}
                        >
                          {platforms.map(([id, name]) => (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Kolejka
                        <select
                          value={settings.queue}
                          onChange={(e) =>
                            update("queue", e.target.value as "solo" | "flex")
                          }
                        >
                          <option value="solo">Ranked Solo / Duo</option>
                          <option value="flex">Ranked Flex</option>
                        </select>
                      </label>
                    </div>
                    <button className="load-button" disabled={loading}>
                      <Icon name="arrow" />
                      {loading ? "Pobieranie…" : "Pobierz dane gracza"}
                    </button>
                    {error && (
                      <p className="error" role="alert">
                        {error}
                      </p>
                    )}
                  </form>
                  <div className="profile-summary">
                    <div className="summary-avatar">
                      {player.profileIconUrl ? (
                        <img src={player.profileIconUrl} alt="" />
                      ) : (
                        player.gameName[0]
                      )}
                    </div>
                    <div>
                      <strong>{player.riotId}</strong>
                      <small>
                        {matched ? "Profil połączony" : "Podgląd przykładowy"} ·
                        poziom {player.summonerLevel}
                      </small>
                    </div>
                    <span className={matched ? "connected" : "demo"}>
                      {matched ? "●" : "DEMO"}
                    </span>
                  </div>
                </Card>
                <Card title="Wygląd banera" note={presets.length + " UKŁADÓW"}>
                  <button
                    className="selected-layout"
                    onClick={() => setTab("style")}
                  >
                    <span className="mini-layout">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span>
                      <strong>{selected.name}</strong>
                      <small>{selected.note}</small>
                    </span>
                    <Icon name="arrow" />
                  </button>
                  <p className="hint">
                    Wybierz układ, paletę i dopasuj detale do swojego streamu.
                  </p>
                </Card>
                <Card title="Rozmiar źródła" note="OBS">
                  {range("scale", "Skala banera", 60, 160, "%")}
                  <div className="size-readout">
                    <span>
                      {size.width} <small>×</small> {size.height}{" "}
                      <small>px</small>
                    </span>
                    <button onClick={() => update("scale", 100)}>
                      Zalecany
                    </button>
                  </div>
                </Card>
              </>
            )}
            {tab === "style" && (
              <>
                <Card title="Wybierz układ" note="LEAGUE COLLECTION">
                  <div className="preset-grid">
                    {presets.filter((p) => !p.animated).map(presetButton)}
                  </div>
                </Card>
                <Card title="Animowane banery" note="INNY WYGLĄD">
                  <p className="hint">
                    Osobne banery z własną budową i ruchem. Motywy ich nie
                    dotyczą, ale kolory, krój pisma i widoczne elementy tak.
                  </p>
                  <div className="preset-grid">
                    {presets.filter((p) => p.animated).map(presetButton)}
                  </div>
                </Card>
                <Card title="Motyw banera" note="UKŁADY KLASYCZNE">
                  <div
                    className={
                      "theme-chips" + (animatedSelected ? " disabled" : "")
                    }
                    role="radiogroup"
                    aria-label="Motyw banera"
                  >
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        role="radio"
                        aria-checked={settings.theme === t.id}
                        disabled={animatedSelected}
                        className={settings.theme === t.id ? "active" : ""}
                        title={t.note}
                        onClick={() => update("theme", t.id)}
                      >
                        <i className={"theme-dot dot-" + t.id} />
                        {t.name}
                      </button>
                    ))}
                  </div>
                  {animatedSelected && (
                    <p className="hint">
                      Wybrany baner animowany ma własny wygląd. Wybierz układ
                      klasyczny, aby użyć motywów.
                    </p>
                  )}
                </Card>
                <Card title="Kolor i wykończenie">
                  <div className="swatches">
                    {[
                      ["Hextech", "#c89b3c"],
                      ["Riot", "#eb3d4d"],
                      ["Ocean", "#38c9d5"],
                      ["Emerald", "#42cf9b"],
                      ["Arcane", "#a18afb"],
                      ["Ice", "#d3e4f5"],
                    ].map(([name, color]) => (
                      <button
                        key={name}
                        title={name}
                        aria-label={name}
                        aria-pressed={settings.accent === color}
                        style={{ background: color }}
                        onClick={() => update("accent", color)}
                      >
                        {settings.accent === color ? "✓" : ""}
                      </button>
                    ))}
                  </div>
                  {(
                    [
                      ["accent", "Akcent"],
                      ["background", "Tło banera"],
                      ["textColor", "Kolor tekstu"],
                    ] as const
                  ).map(([key, label]) => (
                    <label className="color-row" key={key}>
                      <span>{label}</span>
                      <code>{settings[key]}</code>
                      <input
                        type="color"
                        value={settings[key]}
                        onChange={(e) => update(key, e.target.value)}
                      />
                    </label>
                  ))}
                  <label className="font-select">
                    Krój pisma
                    <select
                      value={settings.font}
                      onChange={(e) =>
                        update("font", e.target.value as BannerSettings["font"])
                      }
                    >
                      <option value="sans">Inter · nowoczesny</option>
                      <option value="condensed">
                        Barlow Condensed · esport
                      </option>
                      <option value="mono">Monospace · techniczny</option>
                    </select>
                  </label>
                  {range("radius", "Zaokrąglenie", 0, 32, " px")}
                  {range("opacity", "Krycie tła", 10, 100, "%")}
                  {range("scale", "Skala", 60, 160, "%")}
                  {range("speed", "Tempo animacji", 50, 200, "%")}
                  <div className="shape-picker" role="radiogroup" aria-label="Kształt awatara">
                    <span>Kształt awatara</span>
                    {avatarShapes.map(([id, name]) => (
                      <button
                        key={id}
                        role="radio"
                        aria-checked={settings.avatarShape === id}
                        className={settings.avatarShape === id ? "active" : ""}
                        onClick={() => update("avatarShape", id)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  {toggle("glow", "Poświata akcentu")}
                  {toggle("animate", "Animowana linia akcentu")}
                </Card>
              </>
            )}
            {tab === "stats" && (
              <Card title="Elementy na banerze" note="WIDOCZNOŚĆ">
                <p className="hint">
                  Statystyki dotyczą wybranej kolejki i danych zwracanych przez
                  Riot.
                </p>
                {options.map(([key, label, hint]) => (
                  <label className="toggle" key={key}>
                    <span className="opt-icon">
                      <Icon name={optionIcons[key]} />
                    </span>
                    <span>
                      <strong>{label}</strong>
                      <small>{hint}</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) => update(key, e.target.checked)}
                    />
                    <i />
                  </label>
                ))}
                {matched &&
                  ((settings.showTop && player.moduleErrors?.mastery !== undefined) ||
                    ((settings.showForm || settings.showKda || settings.showCs) &&
                      player.moduleErrors?.recent !== undefined)) && (
                    <p className="error" role="alert">
                      Riot nie zwrócił części danych (
                      {[
                        player.moduleErrors?.mastery !== undefined &&
                          "top championi: błąd " + player.moduleErrors.mastery,
                        player.moduleErrors?.recent !== undefined &&
                          "forma/KDA/CS: błąd " + player.moduleErrors.recent,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                      ). Błąd 403 oznacza klucz bez dostępu do tego API, 429 – limit zapytań.
                    </p>
                  )}
                {range("topCount", "Liczba championów", 1, 3, "")}
                <div className="view-picker" role="radiogroup" aria-label="Prezentacja dodatkowych statystyk">
                  <span>Prezentacja forma / KDA / CS / top championi</span>
                  {extraViews.map(([id, name, note]) => (
                    <button
                      key={id}
                      role="radio"
                      aria-checked={settings.extraView === id}
                      className={settings.extraView === id ? "active" : ""}
                      onClick={() => update("extraView", id)}
                    >
                      <ViewPreview id={id} />
                      <strong>{name}</strong>
                      <small>{note}</small>
                    </button>
                  ))}
                </div>
              </Card>
            )}
            <details className="settings-card import-card">
              <summary>Wczytaj ustawienia z linku</summary>
              <input
                aria-label="Link do importu"
                value={importValue}
                onChange={(e) => setImportValue(e.target.value)}
                placeholder="https://…/widget?…"
              />
              <button onClick={importLink}>Wczytaj ustawienia</button>
            </details>
            <button
              className="reset-button"
              onClick={() => {
                setSettings({ ...defaultSettings });
                setNotice("Przywrócono domyślne ustawienia.");
              }}
            >
              Przywróć domyślne ustawienia
            </button>
          </div>
          <section className="preview-column">
            <div className="preview-card">
              <div className="preview-heading">
                <h2>
                  <Icon name="monitor" />
                  Podgląd na żywo
                </h2>
                <span>
                  <i className="status-dot" />
                  {loading ? "POBIERANIE" : matched ? "DANE RIOT" : "DEMO"}
                </span>
              </div>
              <div className={"preview-scene scene-" + scene}>
                <div className="scene-caption">
                  <span>
                    {scene === "rift"
                      ? "SUMMONER’S RIFT"
                      : scene === "dark"
                        ? "CIEMNA SCENA"
                        : "PRZEZROCZYSTOŚĆ"}
                  </span>
                  <b>PREVIEW</b>
                </div>
                {scene === "rift" && (
                  <div className="map-lines" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                )}
                <BannerFrame player={previewPlayer} settings={settings} />
                {(needsMastery || needsRecent || !matched) && (
                  <span className="demo-note">Demo data for preview</span>
                )}
                <span className="scene-footer">
                  LEAGUE OF LEGENDS <i>•</i>{" "}
                  {settings.queue === "solo" ? "SOLO / DUO" : "FLEX"}
                </span>
              </div>
              <div className="scene-picker">
                <span>Tło podglądu</span>
                {[
                  ["rift", "Rift"],
                  ["dark", "Ciemne"],
                  ["transparent", "Szachownica"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className={scene === id ? "active" : ""}
                    aria-pressed={scene === id}
                    onClick={() => setScene(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="preview-meta">
                <span>
                  {selected.name} <i>/</i> {size.width} × {size.height} px
                </span>
                <span>Skalowany do podglądu</span>
              </div>
              <div className="export-block">
                <div className="export-title">
                  <h3>Twój baner jest gotowy</h3>
                  <span>OBS · STREAMLABS</span>
                </div>
                <p>Jeden link. Aktualne statystyki na streamie.</p>
                <div className="export-actions">
                  <button className="primary" onClick={openExport}>
                    <Icon name="monitor" />
                    Generuj link OBS
                    <Icon name="arrow" />
                  </button>
                  <button
                    aria-label="Udostępnij ustawienia"
                    title="Kopiuj link do ustawień Studio"
                    onClick={() =>
                      copy(
                        location.origin + "/?" + settingsQuery(settings),
                        "Skopiowano link do ustawień",
                      )
                    }
                  >
                    <Icon name="link" />
                  </button>
                </div>
              </div>
            </div>
            <a className="obs-tip" href="/docs/szybki-start">
              <Icon name="book" />
              <span>
                <strong>Pierwszy raz z banerem?</strong>
                <small>Dodaj go do OBS w kilku prostych krokach.</small>
              </span>
              <Icon name="arrow" />
            </a>
            <div className="collection-note">
              <span>LEAGUE COLLECTION</span>
              <p>Zaprojektowane do Twojej następnej wygranej.</p>
            </div>
          </section>
        </main>
        <footer>
          <span>
            Banner Studio <b>/ LEAGUE</b> · by Skull
          </span>
          <p>
            LoL Banner Studio is not endorsed by Riot Games and does not reflect
            the views or opinions of Riot Games or anyone officially involved in
            producing or managing Riot Games properties. Riot Games and all
            associated properties are trademarks or registered trademarks of
            Riot Games, Inc.
          </p>
        </footer>
      </div>
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      <dialog
        ref={dialog}
        className="export-dialog"
        onClose={() => setExportOpen(false)}
      >
        <div className="dialog-heading">
          <h2>Dodaj baner do OBS</h2>
          <button aria-label="Zamknij" onClick={() => dialog.current?.close()}>
            ×
          </button>
        </div>
        <p>Skopiuj adres do źródła „Przeglądarka”.</p>
        {exportOpen && (
          <>
            <div className="obs-preview-head">
              <span>Podgląd z wygenerowanego linku</span>
              <small>tak zobaczysz go w OBS</small>
            </div>
            <div ref={frameHost} className={"obs-frame scene-" + scene}>
              {(() => {
                const fit = Math.min(1, (frameRoom || size.width) / size.width);
                return (
                  <div
                    className="obs-frame-box"
                    style={{ width: size.width * fit, height: size.height * fit }}
                  >
                    <iframe
                      title="Podgląd widżetu z wygenerowanego linku"
                      src={widgetUrl(settings)}
                      style={{
                        width: size.width,
                        height: size.height,
                        transform: "scale(" + fit + ")",
                      }}
                    />
                  </div>
                );
              })()}
            </div>
          </>
        )}
        <label>
          Adres źródła
          <input
            readOnly
            value={widgetUrl(settings)}
            onFocus={(e) => e.target.select()}
          />
        </label>
        <button className="primary" onClick={() => copy(widgetUrl(settings))}>
          Kopiuj link OBS
        </button>
        <div className="export-dimensions">
          <div>
            Szerokość<strong>{size.width} px</strong>
          </div>
          <div>
            Wysokość<strong>{size.height} px</strong>
          </div>
        </div>
        <a href={widgetUrl(settings)} target="_blank" rel="noreferrer">
          Otwórz widżet w nowej karcie ↗
        </a>
        <p className="hint">Przezroczyste tło · aktualizacja co 2 minuty</p>
        {notice && <p role="status">{notice}</p>}
      </dialog>
    </div>
  );
}

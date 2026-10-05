import { defaultSettings, platforms } from "./data";
import type { BannerSettings, BannerStyle, BannerTheme } from "./types";

export const presets: {
  id: BannerStyle;
  name: string;
  note: string;
  width: number;
  height: number;
  animated?: boolean;
}[] = [
  {
    id: "crest",
    name: "Prime",
    note: "Pełny profil ranked",
    width: 820,
    height: 180,
  },
  {
    id: "lane",
    name: "Broadcast",
    note: "Pasek transmisyjny",
    width: 980,
    height: 130,
  },
  {
    id: "compact",
    name: "Compact",
    note: "Obok kamerki",
    width: 620,
    height: 140,
  },
  {
    id: "card",
    name: "Showcase",
    note: "Karta gracza",
    width: 360,
    height: 340,
  },
  {
    id: "split",
    name: "Split",
    note: "Dwie strony rankingu",
    width: 760,
    height: 200,
  },
  {
    id: "minimal",
    name: "Minimal",
    note: "Czysta typografia",
    width: 640,
    height: 120,
  },
  {
    id: "tower",
    name: "Tower",
    note: "Układ pionowy",
    width: 290,
    height: 420,
  },
  {
    id: "scoreboard",
    name: "Scoreboard",
    note: "Wyniki na pierwszym planie",
    width: 820,
    height: 210,
  },
  {
    id: "deck",
    name: "Deck",
    note: "Karty zmieniają się same",
    width: 520,
    height: 128,
    animated: true,
  },
  {
    id: "orbit",
    name: "Orbit",
    note: "Okrągły licznik LP",
    width: 300,
    height: 448,
    animated: true,
  },
  {
    id: "marquee",
    name: "Marquee",
    note: "Przewijana taśma",
    width: 920,
    height: 64,
    animated: true,
  },
  {
    id: "hex",
    name: "Hextech",
    note: "Świecąca ramka",
    width: 560,
    height: 170,
    animated: true,
  },
];
export const isAnimatedStyle = (style: BannerStyle) =>
  Boolean(presets.find((p) => p.id === style)?.animated);
export function sanitizeSettings(
  input: Record<string, unknown>,
): BannerSettings {
  const result = { ...defaultSettings };
  for (const key of Object.keys(defaultSettings) as (keyof BannerSettings)[]) {
    const value = input[key];
    if (typeof defaultSettings[key] === "boolean" && typeof value === "boolean")
      Object.assign(result, { [key]: value });
  }
  for (const key of ["accent", "background", "textColor"] as const) {
    if (typeof input[key] === "string" && /^#[0-9a-f]{6}$/i.test(input[key]))
      result[key] = input[key];
  }
  for (const [key, min, max] of [
    ["opacity", 10, 100],
    ["radius", 0, 32],
    ["scale", 60, 160],
    ["speed", 50, 200],
    ["topCount", 1, 3],
  ] as const) {
    const value = Number(input[key]);
    if (input[key] !== undefined && Number.isFinite(value))
      result[key] = Math.max(min, Math.min(max, value));
  }
  if (typeof input.riotId === "string" && input.riotId.trim())
    result.riotId = input.riotId.slice(0, 100);
  if (platforms.some(([p]) => p === input.platform))
    result.platform = String(input.platform);
  if (presets.some((p) => p.id === input.style))
    result.style = input.style as BannerStyle;
  if (input.queue === "flex") result.queue = "flex";
  result.topCount = Math.round(result.topCount);
  if (
    input.avatarShape === "square" ||
    input.avatarShape === "hex" ||
    input.avatarShape === "round"
  )
    result.avatarShape = input.avatarShape;
  if (themes.some((t) => t.id === input.theme))
    result.theme = input.theme as BannerTheme;
  if (extraViews.some(([id]) => id === input.extraView))
    result.extraView = input.extraView as BannerSettings["extraView"];
  if (input.font === "mono" || input.font === "condensed")
    result.font = input.font;
  return result;
}
export function settingsFromUrl(search = location.search) {
  const query = new URLSearchParams(search);
  const values: Record<string, unknown> = Object.fromEntries(query);
  for (const key of Object.keys(defaultSettings) as (keyof BannerSettings)[]) {
    if (typeof defaultSettings[key] === "boolean" && query.has(key))
      values[key] = query.get(key) === "1";
  }
  for (const [legacy, key] of [
    ["icon", "showIcon"],
    ["record", "showRecord"],
    ["winrate", "showWinrate"],
  ]) {
    if (query.has(legacy)) values[key] = query.get(legacy) !== "0";
  }
  return sanitizeSettings(values);
}
export function settingsQuery(settings: BannerSettings) {
  return new URLSearchParams(
    Object.fromEntries(
      Object.entries(settings).map(([k, v]) => [
        k,
        typeof v === "boolean" ? (v ? "1" : "0") : String(v),
      ]),
    ),
  ).toString();
}
export function widgetUrl(settings: BannerSettings) {
  return location.origin + "/widget?" + settingsQuery(settings);
}
export function studioSettings() {
  if (location.search) return settingsFromUrl();
  try {
    return sanitizeSettings(
      JSON.parse(localStorage.getItem("lol-studio-v2") || "{}"),
    );
  } catch {
    return { ...defaultSettings };
  }
}
// Stopka z dodatkowymi statystykami wewnątrz banera. Szerokości kafelków (px) służą do
// policzenia wierszy lub stron, żeby wymiary źródła OBS były przewidywalne.
const extraTileWidths = {
  strip: { showForm: 98, showKda: 36, showCs: 48, showTop: 86, showMastery: 56 },
  pills: { showForm: 162, showKda: 72, showCs: 92, showTop: 186, showMastery: 120 },
  rings: { showForm: 84, showKda: 64, showCs: 84, showTop: 86, showMastery: 62 },
} as const;
const EXTRA_GAP = { strip: 22, pills: 14, rings: 22 } as const;
const EXTRA_ROW = { strip: 36, pills: 24, rings: 36 } as const;
const EXTRA_ROW_GAP = 8;
const EXTRA_PADDING = 10;
export const avatarShapes = [
  ["round", "Okrągły"],
  ["square", "Kwadrat"],
  ["hex", "Sześciokąt"],
] as const;
export const extraViews = [
  ["strip", "Stopka", "Statyczne kafelki w stopce banera"],
  ["pills", "Kapsuły", "Statyczne, zwarte etykiety w stopce"],
  ["rings", "Pierścienie", "Statyczne wskaźniki kołowe"],
  ["cycle", "Rotacja", "Animowane: stopka zmienia strony co kilka sekund"],
  ["ticker", "Taśma", "Animowane: przewijana taśma statystyk"],
] as const;
export const themes: {
  id: BannerTheme;
  name: string;
  note: string;
}[] = [
  { id: "classic", name: "Classic", note: "Złoty pasek akcentu" },
  { id: "glass", name: "Glass", note: "Szkło i rozmycie" },
  { id: "neon", name: "Neon", note: "Świecąca ramka" },
  { id: "circuit", name: "Circuit", note: "Siatka i ścięte rogi" },
  { id: "aurora", name: "Aurora", note: "Animowana zorza" },
  { id: "amoled", name: "Amoled", note: "Czerń bez ramki" },
];
export function extraTiles(settings: BannerSettings) {
  return (
    Object.keys(extraTileWidths.strip) as (keyof typeof extraTileWidths.strip)[]
  ).filter((key) => settings[key]);
}
export function extraLayout(settings: BannerSettings) {
  const tiles = extraTiles(settings);
  // Animowane banery same decydują, jak pokazać dodatkowe statystyki.
  if (!tiles.length || isAnimatedStyle(settings.style)) return { height: 0, pages: [] as (typeof tiles)[] };
  const preset = presets.find((p) => p.id === settings.style)!;
  const room = preset.width - 48;
  const mode =
    settings.extraView === "pills" || settings.extraView === "rings"
      ? settings.extraView
      : "strip";
  const widths = extraTileWidths[mode];
  const gap = EXTRA_GAP[mode];
  const rows: (typeof tiles)[] = [[]];
  let used = 0;
  for (const key of tiles) {
    const row = rows[rows.length - 1];
    if (row.length && used + gap + widths[key] > room) {
      rows.push([key]);
      used = widths[key];
    } else {
      row.push(key);
      used += (row.length > 1 ? gap : 0) + widths[key];
    }
  }
  if (settings.extraView === "cycle" || settings.extraView === "ticker") {
    // Jeden stały wiersz: strony rotacji albo przewijana taśma.
    return {
      height: EXTRA_PADDING * 2 + EXTRA_ROW.strip,
      pages: settings.extraView === "cycle" ? rows : [tiles],
    };
  }
  return {
    height:
      EXTRA_PADDING * 2 +
      rows.length * EXTRA_ROW[mode] +
      (rows.length - 1) * EXTRA_ROW_GAP,
    pages: [tiles],
  };
}
// Rozmiar bazowy (skala 100%) razem ze stopką dodatkowych statystyk.
export function baseSize(settings: BannerSettings) {
  const preset = presets.find((p) => p.id === settings.style)!;
  return {
    width: preset.width,
    height: preset.height + extraLayout(settings).height,
  };
}
export function dimensions(settings: BannerSettings) {
  const base = baseSize(settings);
  return {
    width: Math.round((base.width * settings.scale) / 100),
    height: Math.round((base.height * settings.scale) / 100),
  };
}

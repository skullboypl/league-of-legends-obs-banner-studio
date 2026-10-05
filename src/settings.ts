import { defaultSettings, platforms } from "./data";
import type { BannerSettings, BannerStyle } from "./types";

export const presets: {
  id: BannerStyle;
  name: string;
  note: string;
  width: number;
  height: number;
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
];
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
export function dimensions(settings: BannerSettings) {
  const preset = presets.find((p) => p.id === settings.style)!;
  return {
    width: Math.round((preset.width * settings.scale) / 100),
    height: Math.round((preset.height * settings.scale) / 100),
  };
}

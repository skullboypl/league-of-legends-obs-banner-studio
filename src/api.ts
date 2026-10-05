import { tr, type Lang } from './i18n';
import type { PlayerData } from './types';

export function parseRiotId(value: string) {
  const separator = value.lastIndexOf('#');
  if (separator < 1 || separator === value.length - 1) return null;
  return { gameName: value.slice(0, separator).trim(), tagLine: value.slice(separator + 1).trim() };
}

export async function fetchPlayer(riotId: string, platform: string, queue: 'solo' | 'flex', lang: Lang, signal?: AbortSignal): Promise<PlayerData> {
  const parsed = parseRiotId(riotId);
  if (!parsed) throw new Error(tr(lang, 'Wpisz Riot ID w formacie Nazwa#TAG.'));
  const params = new URLSearchParams({ ...parsed, platform, queue, lang });
  const response = await fetch(`/api/player?${params}`, { signal });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || tr(lang, 'Nie udało się pobrać danych.'));
  return body;
}

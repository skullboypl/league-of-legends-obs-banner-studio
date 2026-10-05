import { useEffect, useState } from "react";
import { fetchPlayer } from "./api";
import { BannerFrame } from "./PlayerBanner";
import { settingsFromUrl } from "./settings";
import type { PlayerData } from "./types";

export function Widget() {
  const [settings] = useState(settingsFromUrl);
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = () =>
      fetchPlayer(settings.riotId, settings.platform)
        .then((data) => {
          if (active) {
            setPlayer(data);
            setError("");
          }
        })
        .catch((reason) => {
          if (active) setError(reason.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    load();
    const timer = window.setInterval(load, 120_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [settings]);

  return (
    <main className="widget-page">
      {player && (
        <BannerFrame player={player} settings={settings} fit={false} />
      )}
      {!player && (
        <p className="widget-message">
          {error ||
            (loading ? "Pobieranie danych Riot…" : "Brak danych gracza.")}
        </p>
      )}
    </main>
  );
}

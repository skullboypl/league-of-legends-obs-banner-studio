const CHECK_EVERY_MS = 60_000;

// Sprawdza /version.json i woła onUpdate, gdy na serwerze jest inny build niż załadowany.
export function watchForUpdates(onUpdate: () => void) {
  if (__BUILD_ID__ === "dev") return () => {};
  let done = false;
  const check = async () => {
    if (done) return;
    try {
      const response = await fetch("/version.json", { cache: "no-store" });
      if (!response.ok) return;
      const { id } = await response.json();
      if (typeof id === "string" && id !== __BUILD_ID__) {
        done = true;
        onUpdate();
      }
    } catch {
      /* Brak sieci: spróbujemy przy następnym sprawdzeniu. */
    }
  };
  const onVisible = () => document.visibilityState === "visible" && check();
  const timer = window.setInterval(check, CHECK_EVERY_MS);
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

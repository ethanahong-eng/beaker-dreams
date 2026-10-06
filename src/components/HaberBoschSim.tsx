import { useEffect, useRef, useState } from "react";

type HaberSim = { setTab: (tab: string) => void; redraw: () => void; destroy: () => void };

export function HaberBoschSim() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let sim: HaberSim | null = null;
    let cancelled = false;

    // three.js is large and the sim is below the fold, so it loads on demand.
    import("@/lib/haberSim").then(({ mountHaberSim }) => {
      const host = hostRef.current;
      if (cancelled || !host) return;
      sim = mountHaberSim(host) as HaberSim;
      setReady(true);
    });

    // The charts are drawn to canvas and read their colours once per draw, so a
    // theme switch needs an explicit redraw.
    const themeWatcher = new MutationObserver(() => sim?.redraw());
    themeWatcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelled = true;
      themeWatcher.disconnect();
      sim?.destroy();
    };
  }, []);

  return (
    <div className="relative">
      <div ref={hostRef} />
      {!ready && (
        <p className="absolute inset-0 grid min-h-[320px] place-items-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Loading simulation…
        </p>
      )}
    </div>
  );
}

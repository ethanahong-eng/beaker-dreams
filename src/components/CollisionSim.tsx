import { useEffect, useRef, useState } from "react";
import { createSoundEngine } from "@/lib/sound";

// A <-> nothing, A + B -> C + D. Every A-B collision is scored on two
// independent tests — enough kinetic energy along the line of impact, and
// close enough alignment between each particle's "reactive face" — so a
// collision only counts if BOTH pass. That's collision theory made
// literal: energy is necessary but not sufficient, which is the steric
// factor this page's copy already calls out.
type Kind = "A" | "B" | "C" | "D";
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: Kind;
  angle: number;
  spin: number;
};
type Flash = { x: number; y: number; age: number; life: number; color: string };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const COLOR: Record<Kind, string> = {
  A: "rgba(15, 23, 42, 0.85)",
  B: "rgba(14, 165, 233, 0.9)",
  C: "rgba(34, 197, 94, 0.9)",
  D: "rgba(217, 70, 239, 0.85)",
};

export function CollisionSim() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const soundRef = useRef<ReturnType<typeof createSoundEngine> | null>(null);
  if (!soundRef.current) soundRef.current = createSoundEngine();

  const stateRef = useRef({
    temp: 320,
    ea: 28,
    catalyst: false,
    steric: 0.5,
    running: true,
    soundOn: false,
  });

  const [temp, setTemp] = useState(320);
  const [ea, setEa] = useState(28);
  const [catalyst, setCatalyst] = useState(false);
  const [steric, setSteric] = useState(0.5);
  const [running, setRunning] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [resetTick, setResetTick] = useState(0);

  const successRef = useRef<HTMLSpanElement | null>(null);
  const convertedRef = useRef<HTMLSpanElement | null>(null);
  const energyBarRef = useRef<HTMLDivElement | null>(null);
  const stericBarRef = useRef<HTMLDivElement | null>(null);
  const successBarRef = useRef<HTMLDivElement | null>(null);

  stateRef.current.temp = temp;
  stateRef.current.ea = ea;
  stateRef.current.catalyst = catalyst;
  stateRef.current.steric = steric;
  stateRef.current.running = running;
  stateRef.current.soundOn = soundOn;

  const toggleSound = () => {
    setSoundOn((v) => {
      const next = !v;
      if (next) soundRef.current?.ensure();
      return next;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let flashes: Flash[] = [];
    // Exponential moving averages over recent collisions rather than
    // all-time cumulative counters, so the readout stays responsive to
    // slider changes instead of getting diluted by minutes of history.
    let energyFailEma = 0;
    let stericFailEma = 0;
    let successEma = 0;
    const initialCount = 90;

    const rand = (n: number) => (Math.random() - 0.5) * n;
    const spawn = (kind: Kind, w: number, h: number): Particle => ({
      x: 12 + Math.random() * (w - 24),
      y: 12 + Math.random() * (h - 24),
      vx: rand(110),
      vy: rand(110),
      kind,
      angle: Math.random() * Math.PI * 2,
      spin: rand(2),
    });

    const seed = (w: number, h: number) => {
      const list: Particle[] = [];
      for (let i = 0; i < initialCount / 2; i++) list.push(spawn("A", w, h));
      for (let i = 0; i < initialCount / 2; i++) list.push(spawn("B", w, h));
      particlesRef.current = list;
      energyFailEma = 0;
      stericFailEma = 0;
      successEma = 0;
    };

    const rect0 = canvas.getBoundingClientRect();
    seed(rect0.width || 600, rect0.height || 375);

    const frame = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      try {
        runFrame(dt);
      } finally {
        raf = requestAnimationFrame(frame);
      }
    };

    const runFrame = (dt: number) => {
      const s = stateRef.current;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== Math.floor(rect.width * dpr)) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = rect.width;
      const h = rect.height;

      const speed = Math.sqrt(s.temp / 300);
      const effectiveEa = s.catalyst ? s.ea * 0.6 : s.ea;
      const list = particlesRef.current;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(15, 23, 42, 0.05)";
      ctx.fillRect(0, 0, w, h);

      if (s.running) {
        for (const p of list) {
          p.x += p.vx * dt * speed;
          p.y += p.vy * dt * speed;
          p.angle += p.spin * dt * speed;
          if (p.x < 10 || p.x > w - 10) p.vx *= -1;
          if (p.y < 10 || p.y > h - 10) p.vy *= -1;
          p.x = clamp(p.x, 10, w - 10);
          p.y = clamp(p.y, 10, h - 10);
        }

        // Steric tolerance: how wide a cone (around each particle's facing
        // angle) still counts as "aligned enough" to react. 1 = any
        // orientation works; near 0 = collisions almost always miss.
        const coneHalfAngle = s.steric * Math.PI * 0.5;
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i]!;
            const b = list[j]!;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 0.0001;
            const minDist = 20;
            if (dist >= minDist) continue;
            const nx = dx / dist;
            const ny = dy / dist;
            const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (closing >= 0) continue;

            // Elastic bounce always happens, reaction or not.
            a.vx += closing * nx;
            a.vy += closing * ny;
            b.vx -= closing * nx;
            b.vy -= closing * ny;
            const overlap = minDist - dist;
            a.x -= (nx * overlap) / 2;
            a.y -= (ny * overlap) / 2;
            b.x += (nx * overlap) / 2;
            b.y += (ny * overlap) / 2;

            const isReactivePair =
              (a.kind === "A" && b.kind === "B") || (a.kind === "B" && b.kind === "A");
            if (!isReactivePair) continue;

            // Collision energy along the line of impact. `closing` is in
            // raw (unscaled) velocity units — the temperature slider only
            // scales *displayed* motion via `speed` at render/move time, so
            // it has to be reapplied here too, or raising temperature would
            // move particles faster without ever raising the energy of
            // their collisions. Calibrated so Ea's kJ/mol-ish numbers land
            // in a comparable range at the default 320 K.
            const closingEffective = closing * speed;
            const energy = 0.5 * closingEffective * closingEffective * 0.03;
            const hasEnergy = energy >= effectiveEa;

            const faceA = Math.atan2(ny, nx) - a.angle;
            const faceB = Math.atan2(-ny, -nx) - b.angle;
            const alignedA = Math.abs(Math.atan2(Math.sin(faceA), Math.cos(faceA))) < coneHalfAngle;
            const alignedB = Math.abs(Math.atan2(Math.sin(faceB), Math.cos(faceB))) < coneHalfAngle;
            const wellOriented = alignedA && alignedB;

            const emaAlpha = 0.12;
            let color: string;
            if (hasEnergy && wellOriented) {
              a.kind = "C";
              b.kind = "D";
              successEma += (1 - successEma) * emaAlpha;
              energyFailEma += (0 - energyFailEma) * emaAlpha;
              stericFailEma += (0 - stericFailEma) * emaAlpha;
              color = "rgba(34, 197, 94, 0.9)";
              if (s.soundOn) soundRef.current!.chime([880, 1108]);
            } else if (hasEnergy) {
              stericFailEma += (1 - stericFailEma) * emaAlpha;
              successEma += (0 - successEma) * emaAlpha;
              energyFailEma += (0 - energyFailEma) * emaAlpha;
              color = "rgba(234, 179, 8, 0.85)";
              if (s.soundOn) soundRef.current!.click({ freq: 500, gain: 0.06 });
            } else {
              energyFailEma += (1 - energyFailEma) * emaAlpha;
              successEma += (0 - successEma) * emaAlpha;
              stericFailEma += (0 - stericFailEma) * emaAlpha;
              color = "rgba(148, 163, 184, 0.6)";
            }
            flashes.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, age: 0, life: 0.3, color });
          }
        }
      }

      flashes = flashes.filter((f) => f.age < f.life);
      for (const f of flashes) {
        f.age += dt;
        const t = f.age / f.life;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 14 * t, 0, Math.PI * 2);
        ctx.strokeStyle = f.color.replace(/[\d.]+\)$/, `${0.7 * (1 - t)})`);
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      for (const p of list) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = COLOR[p.kind];
        ctx.fill();
        // Reactive-face wedge: the orientation the particle needs to
        // present at the moment of impact for a collision to succeed.
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, 9, p.angle - 0.35, p.angle + 0.35);
        ctx.closePath();
        ctx.fillStyle = COLOR[p.kind];
        ctx.fill();
      }

      if (successRef.current) successRef.current.textContent = `${(successEma * 100).toFixed(1)}%`;
      const startTotal = initialCount / 2;
      const remainingA = list.filter((p) => p.kind === "A").length;
      const convertedPct = (1 - remainingA / startTotal) * 100;
      if (convertedRef.current) convertedRef.current.textContent = `${convertedPct.toFixed(0)}%`;
      if (energyBarRef.current)
        energyBarRef.current.style.height = `${clamp(energyFailEma * 48, 2, 48)}px`;
      if (stericBarRef.current)
        stericBarRef.current.style.height = `${clamp(stericFailEma * 48, 2, 48)}px`;
      if (successBarRef.current)
        successBarRef.current.style.height = `${clamp(successEma * 48, 2, 48)}px`;
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [resetTick]);

  // Separate from the resettable animation effect above (mount-once) so
  // clicking Reset doesn't tear down the AudioContext out from under an
  // already-enabled sound toggle.
  useEffect(() => {
    return () => soundRef.current?.dispose();
  }, []);

  const effectiveEa = catalyst ? ea * 0.6 : ea;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            aria-label="Particle collision simulation for A + B reactions"
          />
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <div className="pointer-events-auto rounded-lg border border-border bg-card/90 p-4 backdrop-blur">
              <div className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">
                Collision outcomes
              </div>
              <div className="flex h-12 items-end gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div
                    ref={energyBarRef}
                    className="w-3 bg-muted-foreground"
                    style={{ height: "4px" }}
                  />
                  <span className="font-mono text-[9px] text-muted-foreground">low E</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div
                    ref={stericBarRef}
                    className="w-3"
                    style={{ height: "4px", backgroundColor: "rgb(234, 179, 8)" }}
                  />
                  <span className="font-mono text-[9px] text-muted-foreground">bad angle</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div
                    ref={successBarRef}
                    className="w-3"
                    style={{ height: "4px", backgroundColor: "rgb(34, 197, 94)" }}
                  />
                  <span className="font-mono text-[9px] text-muted-foreground">reacted</span>
                </div>
              </div>
            </div>
            <div className="pointer-events-auto flex gap-2">
              <button
                onClick={() => setResetTick((t) => t + 1)}
                className="rounded-full border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-accent"
              >
                Reset
              </button>
              <button
                onClick={() => setRunning((r) => !r)}
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent"
              >
                {running ? "Pause" : "Resume"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Effective Ea
            </span>
            <span className="font-mono text-2xl font-bold">{effectiveEa.toFixed(0)}</span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Success rate
            </span>
            <span ref={successRef} className="font-mono text-2xl font-bold text-accent">
              0.0%
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              A converted
            </span>
            <span ref={convertedRef} className="font-mono text-2xl font-bold">
              0%
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Legend
            </span>
            <span className="font-mono text-[11px] leading-relaxed">
              gray=low E · yellow=bad angle · green=reacted
            </span>
          </div>
        </div>
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest">
            Collision controls
          </h3>
          <div className="space-y-8">
            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Temperature</span>
                <span className="font-mono text-accent">{temp} K</span>
              </div>
              <input
                type="range"
                min={250}
                max={600}
                value={temp}
                aria-label="Collision temperature"
                onChange={(e) => setTemp(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
            </div>
            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Activation energy</span>
                <span className="font-mono text-accent">{ea} kJ/mol</span>
              </div>
              <input
                type="range"
                min={15}
                max={80}
                value={ea}
                aria-label="Collision activation energy"
                onChange={(e) => setEa(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
            </div>
            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Steric factor (orientation tolerance)</span>
                <span className="font-mono text-accent">{steric.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={steric}
                aria-label="Steric factor"
                onChange={(e) => setSteric(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                Low = only near-perfect alignment reacts, even with enough energy.
              </p>
            </div>
            <label
              className="flex cursor-pointer items-center gap-3"
              onClick={() => setCatalyst((c) => !c)}
            >
              <span
                className={`relative h-5 w-10 rounded-full transition-colors ${catalyst ? "bg-accent" : "bg-input"}`}
              >
                <span
                  className={`absolute top-1 h-3 w-3 rounded-full bg-card transition-all ${catalyst ? "right-1" : "left-1"}`}
                />
              </span>
              <span className="text-xs font-bold uppercase">Add catalyst</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3" onClick={toggleSound}>
              <span
                className={`relative h-5 w-10 rounded-full transition-colors ${soundOn ? "bg-accent" : "bg-input"}`}
              >
                <span
                  className={`absolute top-1 h-3 w-3 rounded-full bg-card transition-all ${soundOn ? "right-1" : "left-1"}`}
                />
              </span>
              <span className="text-xs font-bold uppercase">Sound effects</span>
            </label>
          </div>
        </div>

        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">
            A + B only becomes C + D when a collision clears the activation energy AND the two
            particles meet with their reactive faces aligned. Energy alone is not enough.
          </p>
          <div className="font-mono text-xs text-accent">— Collision theory</div>
        </div>
      </aside>
    </div>
  );
}

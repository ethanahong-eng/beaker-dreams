import { useEffect, useRef, useState } from "react";

type Preset = "baseline" | "exothermic" | "stress" | "haber";

const PRESETS: Record<Preset, { label: string; temp: number; pressure: number; addA: number }> = {
  baseline: { label: "Baseline (298 K)", temp: 298, pressure: 1.5, addA: 0 },
  exothermic: { label: "Heat the vessel", temp: 420, pressure: 1.5, addA: 0 },
  stress: { label: "Concentration stress", temp: 298, pressure: 1.5, addA: 0.6 },
  haber: { label: "High pressure squeeze", temp: 298, pressure: 4.2, addA: 0 },
};

// N2O4 (A) <=> 2 NO2 (B), forward is endothermic.
function kEq(T: number) {
  return 0.15 * Math.exp(-6500 * (1 / T - 1 / 298));
}
function kForward(T: number) {
  return 1.2 * Math.exp(-5200 * (1 / T - 1 / 298));
}

type Particle = { x: number; y: number; vx: number; vy: number; kind: 0 | 1 };

export function EquilibriumSim() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const stateRef = useRef({ nA: 1, nB: 0.05, temp: 298, pressure: 1.5, running: true, vectors: true });

  const [temp, setTemp] = useState(298);
  const [pressure, setPressure] = useState(1.5);
  const [running, setRunning] = useState(true);
  const [vectors, setVectors] = useState(true);
  const [preset, setPreset] = useState<Preset>("baseline");
  const [readout, setReadout] = useState({ q: 0, k: 0.15, cA: 1, cB: 0.05, rf: 0, rr: 0 });

  stateRef.current.temp = temp;
  stateRef.current.pressure = pressure;
  stateRef.current.running = running;
  stateRef.current.vectors = vectors;

  const applyPreset = (p: Preset) => {
    setPreset(p);
    const cfg = PRESETS[p];
    setTemp(cfg.temp);
    setPressure(cfg.pressure);
    if (cfg.addA > 0) stateRef.current.nA += cfg.addA;
  };

  const reset = () => {
    stateRef.current.nA = 1;
    stateRef.current.nB = 0.05;
    setTemp(298);
    setPressure(1.5);
    setPreset("baseline");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let sinceSync = 0;

    const rand = (n: number) => (Math.random() - 0.5) * n;
    const spawn = (kind: 0 | 1, w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: rand(60),
      vy: rand(60),
      kind,
    });

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
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

      if (s.running) {
        const total = s.nA + s.nB;
        const V = Math.max(0.2, (total * 0.0821 * s.temp) / (s.pressure * 12));
        const cA = s.nA / V;
        const cB = s.nB / V;
        const kf = kForward(s.temp);
        const K = kEq(s.temp);
        const kr = kf / K;
        const rf = kf * cA;
        const rr = kr * cB * cB;
        const step = Math.min(dt, 0.02);
        s.nA += (-rf + rr) * V * step * 4;
        s.nB += (2 * rf - 2 * rr) * V * step * 4;
        s.nA = Math.max(0.001, s.nA);
        s.nB = Math.max(0.001, s.nB);

        sinceSync += dt;
        if (sinceSync > 0.12) {
          sinceSync = 0;
          setReadout({ q: (cB * cB) / Math.max(cA, 1e-6), k: K, cA, cB, rf, rr });
        }
      }

      // Particle population reflects mole counts.
      const scale = 26;
      const wantA = Math.round(stateRef.current.nA * scale);
      const wantB = Math.round(stateRef.current.nB * scale);
      const list = particlesRef.current;
      const countOf = (kind: 0 | 1) => list.filter((p) => p.kind === kind).length;
      for (const kind of [0, 1] as const) {
        let diff = (kind === 0 ? wantA : wantB) - countOf(kind);
        while (diff > 0) {
          list.push(spawn(kind, w, h));
          diff--;
        }
        while (diff < 0) {
          const i = list.findIndex((p) => p.kind === kind);
          if (i < 0) break;
          list.splice(i, 1);
          diff++;
        }
      }

      const speed = Math.sqrt(stateRef.current.temp / 298);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(15, 23, 42, 0.02)";
      ctx.fillRect(0, 0, w, h);

      for (const p of list) {
        if (stateRef.current.running) {
          p.x += p.vx * dt * speed;
          p.y += p.vy * dt * speed;
          if (p.x < 6 || p.x > w - 6) p.vx *= -1;
          if (p.y < 6 || p.y > h - 6) p.vy *= -1;
          p.x = Math.max(6, Math.min(w - 6, p.x));
          p.y = Math.max(6, Math.min(h - 6, p.y));
        }
        const isA = p.kind === 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, isA ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = isA ? "rgba(15, 23, 42, 0.85)" : "rgba(14, 165, 233, 0.9)";
        ctx.fill();
        if (stateRef.current.vectors) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 0.12 * speed, p.y + p.vy * 0.12 * speed);
          ctx.strokeStyle = isA ? "rgba(15, 23, 42, 0.25)" : "rgba(14, 165, 233, 0.35)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const shift =
    Math.abs(readout.q - readout.k) < readout.k * 0.04
      ? "At equilibrium"
      : readout.q < readout.k
        ? "Shifting forward → more NO₂"
        : "Shifting backward → more N₂O₄";

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <canvas ref={canvasRef} className="h-full w-full" aria-label="Particle simulation of N2O4 and NO2" />
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <div className="pointer-events-auto rounded-lg border border-border bg-card/90 p-4 backdrop-blur">
              <div className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">Reaction rate (mol/L·s)</div>
              <div className="flex h-12 items-end gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-3 bg-foreground"
                    style={{ height: `${Math.min(48, readout.rf * 90 + 2)}px` }}
                  />
                  <span className="font-mono text-[9px] text-muted-foreground">fwd</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-3 bg-accent"
                    style={{ height: `${Math.min(48, readout.rr * 90 + 2)}px` }}
                  />
                  <span className="font-mono text-[9px] text-muted-foreground">rev</span>
                </div>
              </div>
            </div>
            <div className="pointer-events-auto flex gap-2">
              <button
                onClick={reset}
                className="rounded-full border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-accent"
              >
                Reset
              </button>
              <button
                onClick={() => setRunning((r) => !r)}
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent"
              >
                {running ? "Pause reaction" : "Resume reaction"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat label="Kc constant" value={readout.k.toFixed(3)} italic />
          <Stat label="Reaction quotient Qc" value={readout.q.toFixed(3)} accent />
          <Stat label="System temp" value={`${Math.round(temp)} K`} />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{shift}</p>
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest">System controls</h3>

          <div className="space-y-8">
            <Slider
              label="Temperature"
              value={`${Math.round(temp)} K`}
              min={250}
              max={520}
              step={1}
              current={temp}
              onChange={setTemp}
            />
            <Slider
              label="Pressure [N₂O₄]"
              value={`${pressure.toFixed(1)} atm`}
              min={0.5}
              max={5}
              step={0.1}
              current={pressure}
              onChange={setPressure}
            />
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => (stateRef.current.nA += 0.4)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary"
              >
                + Add N₂O₄
              </button>
              <button
                onClick={() => (stateRef.current.nB += 0.4)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary"
              >
                + Add NO₂
              </button>
            </div>

            <label className="flex cursor-pointer items-center gap-3 pt-2">
              <span
                className={`relative h-5 w-10 rounded-full transition-colors ${vectors ? "bg-accent" : "bg-input"}`}
                onClick={() => setVectors((v) => !v)}
              >
                <span
                  className={`absolute top-1 h-3 w-3 rounded-full bg-card transition-all ${vectors ? "right-1" : "left-1"}`}
                />
              </span>
              <span className="text-xs font-bold uppercase">Display vectors</span>
            </label>
          </div>

          <hr className="my-8 border-border" />

          <div className="space-y-3">
            <h4 className="font-mono text-[10px] font-bold uppercase text-muted-foreground">Scenario presets</h4>
            {(Object.keys(PRESETS) as Preset[]).map((p) => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  preset === p
                    ? "border-border bg-accent/5 font-medium text-accent"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {PRESETS[p].label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">Quick concept</h3>
          <p className="mb-4 text-sm leading-relaxed">
            "If a system at equilibrium is disturbed, the system will shift its position to counteract the
            disturbance."
          </p>
          <div className="font-mono text-xs text-accent">— Le Chatelier</div>
        </div>
      </aside>
    </div>
  );
}

function Stat({
  label,
  value,
  italic,
  accent,
}: {
  label: string;
  value: string;
  italic?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">{label}</span>
      <span
        className={`font-mono text-2xl font-bold ${italic ? "italic" : ""} ${accent ? "text-accent" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex justify-between text-xs font-medium">
        <span>{label}</span>
        <span className="font-mono text-accent">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
      />
    </div>
  );
}

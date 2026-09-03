import { useEffect, useRef, useState } from "react";

type Preset = "baseline" | "exothermic" | "stress" | "haber";

const PRESETS: Record<Preset, { label: string; temp: number; pressure: number; addA: number }> = {
  baseline: { label: "Baseline (298 K)", temp: 298, pressure: 1.5, addA: 0 },
  exothermic: { label: "Heat the vessel", temp: 420, pressure: 1.5, addA: 0 },
  stress: { label: "Concentration stress", temp: 298, pressure: 1.5, addA: 0.6 },
  haber: { label: "High pressure squeeze", temp: 298, pressure: 4.2, addA: 0 },
};

// N2O4 (A) <=> 2 NO2 (B), forward is endothermic.
const R_EFF = 0.0821 / 12; // ideal-gas constant, rescaled for a readable on-screen volume
const R_KJ = 0.008314;
const REACTION_DELTA_H_KJ = 6500 * R_KJ; // van't Hoff coefficient below -> kJ/mol (endothermic forward)

function kEq(T: number) {
  return 0.15 * Math.exp(-6500 * (1 / T - 1 / 298));
}
function kForward(T: number) {
  return 1.2 * Math.exp(-5200 * (1 / T - 1 / 298));
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Particle = { x: number; y: number; vx: number; vy: number; kind: 0 | 1 };
type Flash = { x: number; y: number; age: number; life: number; hot: boolean };

export function EquilibriumSim() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const stateRef = useRef({
    nA: 1,
    nB: 0.05,
    temp: 298,
    pressure: 1.5,
    volumeMode: "piston" as "piston" | "rigid",
    volume: 1.5,
    running: true,
    vectors: true,
  });

  const [temp, setTemp] = useState(298);
  const [pressure, setPressure] = useState(1.5);
  const [volumeMode, setVolumeMode] = useState<"piston" | "rigid">("piston");
  const [volume, setVolume] = useState(1.5);
  const [running, setRunning] = useState(true);
  const [vectors, setVectors] = useState(true);
  const [preset, setPreset] = useState<Preset>("baseline");
  const [readout, setReadout] = useState({
    q: 0,
    k: 0.15,
    cA: 1,
    cB: 0.05,
    rf: 0,
    rr: 0,
    v: 1.5,
    p: 1.5,
  });

  stateRef.current.temp = temp;
  stateRef.current.pressure = pressure;
  stateRef.current.volumeMode = volumeMode;
  stateRef.current.volume = volume;
  stateRef.current.running = running;
  stateRef.current.vectors = vectors;

  const applyPreset = (p: Preset) => {
    setPreset(p);
    const cfg = PRESETS[p];
    setTemp(cfg.temp);
    setPressure(cfg.pressure);
    setVolumeMode("piston");
    if (cfg.addA > 0) stateRef.current.nA += cfg.addA;
  };

  const reset = () => {
    stateRef.current.nA = 1;
    stateRef.current.nB = 0.05;
    setTemp(298);
    setPressure(1.5);
    setVolume(1.5);
    setVolumeMode("piston");
    setPreset("baseline");
  };

  // Seed the control being switched to from the value the other one just
  // derived, so flipping the toggle doesn't jump the vessel size.
  const switchToRigid = () => {
    setVolume(Number(readout.v.toFixed(2)));
    setVolumeMode("rigid");
  };
  const switchToPiston = () => {
    setPressure(Number(readout.p.toFixed(2)));
    setVolumeMode("piston");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let sinceSync = 0;
    let vesselScale = 0.55;

    const GRID_COLS = 16;
    const GRID_ROWS = 10;
    const gridA = new Float32Array(GRID_COLS * GRID_ROWS);
    const gridB = new Float32Array(GRID_COLS * GRID_ROWS);
    const rawA = new Float32Array(GRID_COLS * GRID_ROWS);
    const rawB = new Float32Array(GRID_COLS * GRID_ROWS);
    let flashes: Flash[] = [];

    const rand = (n: number) => (Math.random() - 0.5) * n;
    const spawn = (kind: 0 | 1, x0: number, y0: number, x1: number, y1: number): Particle => ({
      x: x0 + Math.random() * Math.max(1, x1 - x0),
      y: y0 + Math.random() * Math.max(1, y1 - y0),
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

      // A rigid vessel fixes V and lets pressure float as moles/T change;
      // a piston fixes external pressure and lets V respond instead. Both
      // are just the ideal gas law solved for the variable not being held.
      const total = s.nA + s.nB;
      let V: number;
      let P: number;
      if (s.volumeMode === "rigid") {
        V = Math.max(0.2, s.volume);
        P = (total * R_EFF * s.temp) / V;
      } else {
        P = s.pressure;
        V = Math.max(0.2, (total * R_EFF * s.temp) / P);
      }
      const cA = s.nA / V;
      const cB = s.nB / V;
      const kf = kForward(s.temp);
      const K = kEq(s.temp);
      const kr = kf / K;
      const rf = kf * cA;
      const rr = kr * cB * cB;

      if (s.running) {
        // Exponential (semi-implicit) integrator: dnA/dt = -kf*nA + rr*V is
        // linear in nA if we hold the reverse-reaction source (rr*V) fixed
        // over the step, so it has an exact closed-form solution that can
        // never overshoot equilibrium, no matter how large kf gets at high
        // temperature. nB is recovered from mass conservation.
        const step = Math.min(dt, 0.02);
        const stepScaled = step * 4;
        const totalAEquiv = s.nA + s.nB / 2;
        const source = rr * V;
        const decay = Math.exp(-kf * stepScaled);
        const nAEq = source / kf;
        s.nA = s.nA * decay + nAEq * (1 - decay);
        s.nB = 2 * (totalAEquiv - s.nA);
        s.nA = Math.max(0.001, s.nA);
        s.nB = Math.max(0.001, s.nB);
      }

      sinceSync += dt;
      if (sinceSync > 0.12) {
        sinceSync = 0;
        setReadout({ q: (cB * cB) / Math.max(cA, 1e-6), k: K, cA, cB, rf, rr, v: V, p: P });
      }

      // Vessel size tracks volume, eased rather than snapped so a
      // compression/expansion reads as a "squeeze" instead of a jump cut.
      const targetScale = clamp(0.25 + 0.22 * V, 0.25, 0.95);
      vesselScale += (targetScale - vesselScale) * Math.min(1, dt * 3);
      const vesselW = w * vesselScale;
      const vesselH = h * vesselScale;
      const vesselX = (w - vesselW) / 2;
      const vesselY = (h - vesselH) / 2;

      // Particle population reflects mole counts.
      const scale = 26;
      const wantA = Math.round(s.nA * scale);
      const wantB = Math.round(s.nB * scale);
      const list = particlesRef.current;
      const countOf = (kind: 0 | 1) => list.filter((p) => p.kind === kind).length;
      for (const kind of [0, 1] as const) {
        let diff = (kind === 0 ? wantA : wantB) - countOf(kind);
        while (diff > 0) {
          list.push(
            spawn(kind, vesselX + 8, vesselY + 8, vesselX + vesselW - 8, vesselY + vesselH - 8),
          );
          diff--;
        }
        while (diff < 0) {
          const i = list.findIndex((p) => p.kind === kind);
          if (i < 0) break;
          list.splice(i, 1);
          diff++;
        }
      }

      const speed = Math.sqrt(s.temp / 298);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(15, 23, 42, 0.05)";
      ctx.fillRect(0, 0, w, h);

      // Concentration heat map: bin particles into a coarse grid and ease
      // each cell toward its current count so the wash reads as a smooth
      // field rather than flickering frame to frame.
      const cellW = w / GRID_COLS;
      const cellH = h / GRID_ROWS;
      rawA.fill(0);
      rawB.fill(0);
      for (const p of list) {
        const cx = clamp(Math.floor(p.x / cellW), 0, GRID_COLS - 1);
        const cy = clamp(Math.floor(p.y / cellH), 0, GRID_ROWS - 1);
        const idx = cy * GRID_COLS + cx;
        if (p.kind === 0) rawA[idx]! += 1;
        else rawB[idx]! += 1;
      }
      const gridEase = Math.min(1, dt * 4);
      for (let i = 0; i < gridA.length; i++) {
        gridA[i]! += (rawA[i]! - gridA[i]!) * gridEase;
        gridB[i]! += (rawB[i]! - gridB[i]!) * gridEase;
      }
      for (let cy = 0; cy < GRID_ROWS; cy++) {
        for (let cx = 0; cx < GRID_COLS; cx++) {
          const idx = cy * GRID_COLS + cx;
          const a = Math.min(1, gridA[idx]! / 3);
          const b = Math.min(1, gridB[idx]! / 3);
          if (a < 0.03 && b < 0.03) continue;
          const x = cx * cellW;
          const y = cy * cellH;
          if (a >= 0.03) {
            ctx.fillStyle = `rgba(15, 23, 42, ${a * 0.16})`;
            ctx.fillRect(x, y, cellW + 1, cellH + 1);
          }
          if (b >= 0.03) {
            ctx.fillStyle = `rgba(14, 165, 233, ${b * 0.18})`;
            ctx.fillRect(x, y, cellW + 1, cellH + 1);
          }
        }
      }

      // Vessel wall: contracts/expands with volume, i.e. the "squeeze."
      ctx.strokeStyle = "rgba(100, 116, 139, 0.55)";
      ctx.lineWidth = 2;
      ctx.strokeRect(vesselX, vesselY, vesselW, vesselH);

      if (s.running) {
        for (const p of list) {
          p.x += p.vx * dt * speed;
          p.y += p.vy * dt * speed;
        }
      }
      const minX = vesselX + 6;
      const maxX = vesselX + vesselW - 6;
      const minY = vesselY + 6;
      const maxY = vesselY + vesselH - 6;
      for (const p of list) {
        if (p.x < minX || p.x > maxX) p.vx *= -1;
        if (p.y < minY || p.y > maxY) p.vy *= -1;
        p.x = clamp(p.x, minX, maxX);
        p.y = clamp(p.y, minY, maxY);
      }

      // Pairwise collisions: an equal-mass elastic bounce plus a flash,
      // brighter for "energetic" hits (a nod to the fraction-above-Ea idea
      // from the kinetics page). Purely cosmetic — the reaction-rate math
      // above already governs actual conversion, this doesn't feed back
      // into it.
      const hotThreshold = 70 * speed;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i]!;
          const b = list[j]!;
          const ra = a.kind === 0 ? 7 : 5;
          const rb = b.kind === 0 ? 7 : 5;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const minDist = ra + rb;
          if (dist >= minDist) continue;
          const nx = dx / dist;
          const ny = dy / dist;
          const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (closing >= 0) continue;
          a.vx += closing * nx;
          a.vy += closing * ny;
          b.vx -= closing * nx;
          b.vy -= closing * ny;
          const overlap = minDist - dist;
          a.x -= (nx * overlap) / 2;
          a.y -= (ny * overlap) / 2;
          b.x += (nx * overlap) / 2;
          b.y += (ny * overlap) / 2;
          if (flashes.length < 60) {
            flashes.push({
              x: (a.x + b.x) / 2,
              y: (a.y + b.y) / 2,
              age: 0,
              life: 0.35,
              hot: Math.abs(closing) > hotThreshold,
            });
          }
        }
      }

      flashes = flashes.filter((f) => f.age < f.life);
      for (const f of flashes) {
        f.age += dt;
        const t = f.age / f.life;
        const r = (f.hot ? 18 : 10) * t;
        ctx.beginPath();
        ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = f.hot
          ? `rgba(249, 115, 22, ${0.6 * (1 - t)})`
          : `rgba(148, 163, 184, ${0.4 * (1 - t)})`;
        ctx.lineWidth = f.hot ? 2 : 1;
        ctx.stroke();
      }

      for (const p of list) {
        const isA = p.kind === 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, isA ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = isA ? "rgba(15, 23, 42, 0.85)" : "rgba(14, 165, 233, 0.9)";
        ctx.fill();
        if (s.vectors) {
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

  const netHeat = REACTION_DELTA_H_KJ * (readout.rf - readout.rr);
  const heatText =
    Math.abs(netHeat) < 0.05
      ? "Heat flow ~balanced"
      : netHeat > 0
        ? "Absorbing heat (endothermic)"
        : "Releasing heat (exothermic)";

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            aria-label="Particle simulation of N2O4 and NO2"
          />
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <div className="pointer-events-auto rounded-lg border border-border bg-card/90 p-4 backdrop-blur">
              <div className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">
                Reaction rate (mol/L·s)
              </div>
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
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-3"
                    style={{
                      height: `${Math.min(48, Math.abs(netHeat) * 1.6 + 2)}px`,
                      backgroundColor: netHeat >= 0 ? "rgb(56, 189, 248)" : "rgb(249, 115, 22)",
                    }}
                  />
                  <span className="font-mono text-[9px] text-muted-foreground">heat</span>
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

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Kc constant" value={readout.k.toFixed(3)} italic />
          <Stat label="Reaction quotient Qc" value={readout.q.toFixed(3)} accent />
          <Stat label="System temp" value={`${Math.round(temp)} K`} />
          <Stat label="ΔH rxn" value={`+${REACTION_DELTA_H_KJ.toFixed(1)} kJ/mol`} italic small />
          <Stat
            label="Vessel"
            value={`${readout.v.toFixed(2)} L · ${readout.p.toFixed(2)} atm`}
            small
          />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{shift}</p>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {heatText}
        </p>
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest">
            System controls
          </h3>

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

            <div>
              <div className="mb-3 flex items-center justify-between text-xs font-medium">
                <span>Container</span>
                <div className="flex overflow-hidden rounded-full border border-border text-[10px] font-bold uppercase">
                  <button
                    onClick={switchToPiston}
                    className={`px-3 py-1 transition-colors ${
                      volumeMode === "piston"
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    Piston
                  </button>
                  <button
                    onClick={switchToRigid}
                    className={`px-3 py-1 transition-colors ${
                      volumeMode === "rigid"
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    Rigid
                  </button>
                </div>
              </div>
              {volumeMode === "piston" ? (
                <>
                  <Slider
                    label="Pressure [N₂O₄]"
                    value={`${pressure.toFixed(1)} atm`}
                    min={0.5}
                    max={5}
                    step={0.1}
                    current={pressure}
                    onChange={setPressure}
                  />
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    Fixed external pressure — vessel settles at {readout.v.toFixed(2)} L
                  </p>
                </>
              ) : (
                <>
                  <Slider
                    label="Container volume"
                    value={`${volume.toFixed(1)} L`}
                    min={0.3}
                    max={5}
                    step={0.1}
                    current={volume}
                    onChange={setVolume}
                  />
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    Fixed rigid volume — pressure reads {readout.p.toFixed(2)} atm
                  </p>
                </>
              )}
            </div>

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
            <h4 className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
              Scenario presets
            </h4>
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
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">
            "If a system at equilibrium is disturbed, the system will shift its position to
            counteract the disturbance."
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
  small,
}: {
  label: string;
  value: string;
  italic?: boolean;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
      <span
        className={`font-mono font-bold ${small ? "text-base" : "text-2xl"} ${italic ? "italic" : ""} ${accent ? "text-accent" : ""}`}
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

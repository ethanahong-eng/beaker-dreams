import { useEffect, useRef, useState } from "react";

type Preset = "baseline" | "exothermic" | "stress" | "haber" | "inert";

type PresetConfig = {
  label: string;
  temp: number;
  volume: number;
  inertPressure: number;
  addA: number;
};

const PRESETS: Record<Preset, PresetConfig> = {
  baseline: { label: "Baseline (298 K)", temp: 298, volume: 1.5, inertPressure: 0, addA: 0 },
  exothermic: { label: "Heat the vessel", temp: 420, volume: 1.5, inertPressure: 0, addA: 0 },
  stress: { label: "Concentration stress", temp: 298, volume: 1.5, inertPressure: 0, addA: 0.6 },
  haber: { label: "High pressure squeeze", temp: 298, volume: 0.4, inertPressure: 0, addA: 0 },
  inert: { label: "Add inert gas (no shift)", temp: 298, volume: 1.5, inertPressure: 3, addA: 0 },
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

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: 0 | 1;
  angle: number;
  spin: number;
};
type Flash = { x: number; y: number; age: number; life: number; hot: boolean };

// Bent NO2 (~134 deg O-N-O) and planar N2O4 (two bent halves sharing an N-N
// bond) instead of plain circles, so the particle shapes reflect real VSEPR
// geometry rather than being an arbitrary blob.
const NO2_HALF_ANGLE = ((180 - 134) / 2 + 67) * (Math.PI / 180);
function drawNO2(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
) {
  const bond = 6.5;
  const o1x = x + Math.cos(angle - NO2_HALF_ANGLE) * bond;
  const o1y = y + Math.sin(angle - NO2_HALF_ANGLE) * bond;
  const o2x = x + Math.cos(angle + NO2_HALF_ANGLE) * bond;
  const o2y = y + Math.sin(angle + NO2_HALF_ANGLE) * bond;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(o1x, o1y);
  ctx.lineTo(x, y);
  ctx.lineTo(o2x, o2y);
  ctx.stroke();
  ctx.fillStyle = color;
  for (const [cx, cy, r] of [
    [x, y, 3] as const,
    [o1x, o1y, 2.4] as const,
    [o2x, o2y, 2.4] as const,
  ]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

const N2O4_FLARE = 50 * (Math.PI / 180);
function drawN2O4(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
) {
  const halfNN = 4.5;
  const bond = 5.5;
  const n1x = x - Math.cos(angle) * halfNN;
  const n1y = y - Math.sin(angle) * halfNN;
  const n2x = x + Math.cos(angle) * halfNN;
  const n2y = y + Math.sin(angle) * halfNN;
  const dir1 = angle + Math.PI;
  const dir2 = angle;
  const atoms: Array<readonly [number, number, number]> = [
    [n1x, n1y, 2.8],
    [n2x, n2y, 2.8],
  ];
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(n1x, n1y);
  ctx.lineTo(n2x, n2y);
  ctx.stroke();
  for (const [nx, ny, dir] of [[n1x, n1y, dir1] as const, [n2x, n2y, dir2] as const]) {
    for (const sign of [-1, 1] as const) {
      const ox = nx + Math.cos(dir + sign * N2O4_FLARE) * bond;
      const oy = ny + Math.sin(dir + sign * N2O4_FLARE) * bond;
      ctx.beginPath();
      ctx.moveTo(nx, ny);
      ctx.lineTo(ox, oy);
      ctx.stroke();
      atoms.push([ox, oy, 2.3]);
    }
  }
  ctx.fillStyle = color;
  for (const [cx, cy, r] of atoms) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Velocity vectors get their own color and an arrowhead instead of a plain
// species-tinted line, which used to blend into the molecules' own bonds
// and made the "display vectors" toggle look like it did nothing.
function drawVector(ctx: CanvasRenderingContext2D, x: number, y: number, vx: number, vy: number) {
  const len = Math.hypot(vx, vy);
  if (len < 1) return;
  const ex = x + vx;
  const ey = y + vy;
  const angle = Math.atan2(vy, vx);
  const headLen = 4.5;
  ctx.strokeStyle = "rgba(217, 70, 239, 0.85)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.moveTo(ex, ey);
  ctx.lineTo(
    ex - headLen * Math.cos(angle - Math.PI / 6),
    ey - headLen * Math.sin(angle - Math.PI / 6),
  );
  ctx.moveTo(ex, ey);
  ctx.lineTo(
    ex - headLen * Math.cos(angle + Math.PI / 6),
    ey - headLen * Math.sin(angle + Math.PI / 6),
  );
  ctx.stroke();
}

export function EquilibriumSim() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const stateRef = useRef({
    nA: 1,
    nB: 0.05,
    temp: 298,
    volume: 1.5,
    inertPressure: 0,
    running: true,
    vectors: true,
  });

  const [temp, setTemp] = useState(298);
  const [volume, setVolume] = useState(1.5);
  const [inertPressure, setInertPressure] = useState(0);
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
  stateRef.current.volume = volume;
  stateRef.current.inertPressure = inertPressure;
  stateRef.current.running = running;
  stateRef.current.vectors = vectors;

  const applyPreset = (p: Preset) => {
    setPreset(p);
    const cfg = PRESETS[p];
    setTemp(cfg.temp);
    setVolume(cfg.volume);
    setInertPressure(cfg.inertPressure);
    if (cfg.addA > 0) stateRef.current.nA += cfg.addA;
  };

  const reset = () => {
    stateRef.current.nA = 1;
    stateRef.current.nB = 0.05;
    setTemp(298);
    setVolume(1.5);
    setInertPressure(0);
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
    let vesselScale = 0.55;

    const GRID_COLS = 22;
    const GRID_ROWS = 14;
    const gridA = new Float32Array(GRID_COLS * GRID_ROWS);
    const gridB = new Float32Array(GRID_COLS * GRID_ROWS);
    const rawA = new Float32Array(GRID_COLS * GRID_ROWS);
    const rawB = new Float32Array(GRID_COLS * GRID_ROWS);
    let flashes: Flash[] = [];

    // Low-res density buffer, alpha-blended and stretched onto the vessel
    // with the browser's bilinear image scaling — a cheap way to turn a
    // coarse grid into a smooth gradient instead of visible blocks.
    const heatCanvas = document.createElement("canvas");
    heatCanvas.width = GRID_COLS;
    heatCanvas.height = GRID_ROWS;
    const heatCtx = heatCanvas.getContext("2d")!;
    const heatImage = heatCtx.createImageData(GRID_COLS, GRID_ROWS);

    const rand = (n: number) => (Math.random() - 0.5) * n;
    const spawn = (kind: 0 | 1, x0: number, y0: number, x1: number, y1: number): Particle => ({
      x: x0 + Math.random() * Math.max(1, x1 - x0),
      y: y0 + Math.random() * Math.max(1, y1 - y0),
      vx: rand(60),
      vy: rand(60),
      kind,
      angle: Math.random() * Math.PI * 2,
      spin: rand(3),
    });

    const frame = (now: number) => {
      // rAF timestamps aren't guaranteed strictly increasing across every
      // frame pair (a busy main thread, e.g. from a preset click's
      // re-render, can occasionally hand back a `now` at or slightly
      // behind `last`). A negative dt would tick flash ages backwards into
      // negative territory, and ctx.arc throws on a negative radius —
      // which, uncaught, would stop this rAF loop from ever rescheduling
      // and freeze the simulation for good. Clamping here removes the
      // cause; the try/finally below is a backstop against any other.
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

      // Volume is its own independent control now — temperature and the
      // (inert-gas) pressure slider never feed back into it. Pressure is
      // purely a derived readout: the reactive species' partial pressure
      // (from the ideal gas law) plus whatever inert gas has been dialed
      // in. Adding inert gas raises total pressure without touching V or
      // [N2O4]/[NO2], so — correctly — it never shifts the equilibrium.
      const total = s.nA + s.nB;
      const V = Math.max(0.2, s.volume);
      const cA = s.nA / V;
      const cB = s.nB / V;
      const kf = kForward(s.temp);
      const K = kEq(s.temp);
      const kr = kf / K;
      const rf = kf * cA;
      const rr = kr * cB * cB;
      const pReactive = (total * R_EFF * s.temp) / V;
      const P = pReactive + s.inertPressure;

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
            spawn(kind, vesselX + 14, vesselY + 14, vesselX + vesselW - 14, vesselY + vesselH - 14),
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

      // Concentration heat map: bin particles (in vessel-relative
      // coordinates) into a coarse grid, ease each cell toward its current
      // count, then paint the low-res buffer scaled up over the vessel so
      // bilinear interpolation turns it into a smooth gradient.
      const cellW = vesselW / GRID_COLS;
      const cellH = vesselH / GRID_ROWS;
      rawA.fill(0);
      rawB.fill(0);
      for (const p of list) {
        const cx = clamp(Math.floor((p.x - vesselX) / cellW), 0, GRID_COLS - 1);
        const cy = clamp(Math.floor((p.y - vesselY) / cellH), 0, GRID_ROWS - 1);
        const idx = cy * GRID_COLS + cx;
        if (p.kind === 0) rawA[idx]! += 1;
        else rawB[idx]! += 1;
      }
      const gridEase = Math.min(1, dt * 4);
      for (let i = 0; i < gridA.length; i++) {
        gridA[i]! += (rawA[i]! - gridA[i]!) * gridEase;
        gridB[i]! += (rawB[i]! - gridB[i]!) * gridEase;
      }
      const heatData = heatImage.data;
      for (let i = 0; i < gridA.length; i++) {
        const a = Math.min(1, gridA[i]! / 3);
        const b = Math.min(1, gridB[i]! / 3);
        const density = a + b;
        const wA = density > 0 ? a / density : 0;
        const wB = 1 - wA;
        const p = i * 4;
        heatData[p] = 15 * wA + 14 * wB;
        heatData[p + 1] = 23 * wA + 165 * wB;
        heatData[p + 2] = 42 * wA + 233 * wB;
        heatData[p + 3] = Math.round(Math.min(0.55, density * 0.5) * 255);
      }
      heatCtx.putImageData(heatImage, 0, 0);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(heatCanvas, 0, 0, GRID_COLS, GRID_ROWS, vesselX, vesselY, vesselW, vesselH);
      ctx.restore();

      // Vessel wall: contracts/expands with volume, i.e. the "squeeze."
      ctx.strokeStyle = "rgba(100, 116, 139, 0.55)";
      ctx.lineWidth = 2;
      ctx.strokeRect(vesselX, vesselY, vesselW, vesselH);

      if (s.running) {
        for (const p of list) {
          p.x += p.vx * dt * speed;
          p.y += p.vy * dt * speed;
          p.angle += p.spin * dt * speed;
        }
      }
      const minX = vesselX + 14;
      const maxX = vesselX + vesselW - 14;
      const minY = vesselY + 14;
      const maxY = vesselY + vesselH - 14;
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
          const ra = a.kind === 0 ? 9 : 6;
          const rb = b.kind === 0 ? 9 : 6;
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
        const color = isA ? "rgba(15, 23, 42, 0.85)" : "rgba(14, 165, 233, 0.9)";
        if (isA) drawN2O4(ctx, p.x, p.y, p.angle, color);
        else drawNO2(ctx, p.x, p.y, p.angle, color);
        if (s.vectors) drawVector(ctx, p.x, p.y, p.vx * 0.22 * speed, p.vy * 0.22 * speed);
      }
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
        <h3 className="font-mono text-2xl font-bold tracking-tight">
          N₂O₄ (g) <span className="text-accent">⇌</span> 2 NO₂ (g)
        </h3>

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
            value={`${volume.toFixed(2)} L · ${readout.p.toFixed(2)} atm`}
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
            <Slider
              label="Container volume"
              value={`${volume.toFixed(1)} L`}
              min={0.3}
              max={5}
              step={0.1}
              current={volume}
              onChange={setVolume}
            />
            <div>
              <Slider
                label="Inert gas pressure"
                value={`${inertPressure.toFixed(1)} atm`}
                min={0}
                max={5}
                step={0.1}
                current={inertPressure}
                onChange={setInertPressure}
              />
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                Raises total pressure without changing volume or [N₂O₄]/[NO₂] — no equilibrium
                shift.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => (stateRef.current.nA += 0.4)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary"
              >
                + Add N₂O₄
              </button>
              <button
                onClick={() => (stateRef.current.nA = Math.max(0.05, stateRef.current.nA - 0.4))}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary"
              >
                − Remove N₂O₄
              </button>
              <button
                onClick={() => (stateRef.current.nB += 0.4)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary"
              >
                + Add NO₂
              </button>
              <button
                onClick={() => (stateRef.current.nB = Math.max(0.05, stateRef.current.nB - 0.4))}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-secondary"
              >
                − Remove NO₂
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

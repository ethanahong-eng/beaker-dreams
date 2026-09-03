import {
  useEffect,
  useRef,
  useState,
  type Ref,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { createSoundEngine } from "@/lib/sound";
import { rotate3d, type Vec3 } from "@/lib/project3d";

// Species ids for the water-gas shift reaction: CO + H2O <=> CO2 + H2.
// Unlike N2O4 <=> 2 NO2, this has two distinct reactants and two distinct
// products, and equal total moles of gas on each side -- so compressing the
// vessel raises pressure and collision frequency but, correctly, never
// shifts the equilibrium ratio.
const CO = 0 as const;
const H2O = 1 as const;
const CO2 = 2 as const;
const H2 = 3 as const;
type Species = typeof CO | typeof H2O | typeof CO2 | typeof H2;

type Preset = "baseline" | "heat" | "stress" | "squeeze" | "inert";

type PresetConfig = {
  label: string;
  temp: number;
  volume: number;
  inertPressure: number;
  addMix?: Partial<Record<Species, number>>;
};

const PRESETS: Record<Preset, PresetConfig> = {
  baseline: { label: "Baseline (298 K)", temp: 298, volume: 1.5, inertPressure: 0 },
  heat: { label: "Heat the vessel (shifts back)", temp: 460, volume: 1.5, inertPressure: 0 },
  stress: {
    label: "Concentration stress",
    temp: 298,
    volume: 1.5,
    inertPressure: 0,
    addMix: { [CO]: 14, [H2O]: 14 },
  },
  squeeze: {
    label: "Compress the vessel (no shift)",
    temp: 298,
    volume: 0.4,
    inertPressure: 0,
  },
  inert: { label: "Add inert gas (no shift)", temp: 298, volume: 1.5, inertPressure: 3 },
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const R_EFF = 0.0821 / 12; // ideal-gas constant, rescaled for a readable on-screen volume
const R_KJ = 0.008314;
const TREF = 298;
// van't Hoff coefficient -> ~-41 kJ/mol, matching the real (exothermic)
// water-gas shift enthalpy. Kc's reference value and the Arrhenius
// prefactor below are tuned for a visible, lively on-screen equilibrium
// rather than the (very large) literal room-temperature Kc.
const DELTA_H_OVER_R = -4950;
const REACTION_DELTA_H_KJ = DELTA_H_OVER_R * R_KJ;
const KC_REF = 2.2;
const EA_FWD_OVER_R = 2600;
const PARTICLES_PER_MOLE = 180;

function kcTarget(T: number) {
  return clamp(KC_REF * Math.exp(-DELTA_H_OVER_R * (1 / T - 1 / TREF)), 0.08, 15);
}
// Per-collision probabilities, not rate constants -- every qualifying
// reactant or product encounter rolls against these each frame. Their
// ratio is pinned to kcTarget(T) so the emergent particle population
// statistically settles near the same equilibrium the Kc stat displays.
function pForward(T: number) {
  return clamp(0.15 * Math.exp(-EA_FWD_OVER_R * (1 / T - 1 / TREF)), 0.015, 0.9);
}
function pReverse(T: number) {
  return clamp(pForward(T) / kcTarget(T), 0.015, 0.9);
}

type SpeciesInfo = { formula: string; role: "reactant" | "product"; radius: number };
const SPECIES_INFO: Record<Species, SpeciesInfo> = {
  [CO]: { formula: "CO", role: "reactant", radius: 0.085 },
  [H2O]: { formula: "H₂O", role: "reactant", radius: 0.105 },
  [CO2]: { formula: "CO₂", role: "product", radius: 0.115 },
  [H2]: { formula: "H₂", role: "product", radius: 0.07 },
};
const SPECIES_LIST: Array<{ kind: Species; initialCount: number }> = [
  { kind: CO, initialCount: 76 },
  { kind: H2O, initialCount: 76 },
  { kind: CO2, initialCount: 14 },
  { kind: H2, initialCount: 14 },
];

type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  kind: Species;
  angle: number;
  spin: number;
};
type Flash = {
  x: number;
  y: number;
  z: number;
  age: number;
  life: number;
  kind: "hot" | "cold" | "none";
};

const rand = (n: number) => (Math.random() - 0.5) * n;
const randIn = (extent: number) => (Math.random() * 2 - 1) * extent;

function spawnParticle(kind: Species): Particle {
  return {
    x: randIn(0.8),
    y: randIn(0.8),
    z: randIn(0.8),
    vx: rand(1.1),
    vy: rand(1.1),
    vz: rand(1.1),
    kind,
    angle: Math.random() * Math.PI * 2,
    spin: rand(3),
  };
}
function seedParticles(): Particle[] {
  const list: Particle[] = [];
  for (const sp of SPECIES_LIST) {
    for (let i = 0; i < sp.initialCount; i++) list.push(spawnParticle(sp.kind));
  }
  return list;
}

// CPK-style atom colors. C and H match the shades already used elsewhere on
// the site (VSEPR builder, reaction mechanism); O is new here.
const COLOR_C = "rgba(15, 23, 42, 0.92)";
const COLOR_O = "rgba(220, 38, 38, 0.92)";
const COLOR_H = "rgba(148, 163, 184, 0.9)";

function drawCO(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, scale: number) {
  const half = 4 * scale;
  const cx = x - Math.cos(angle) * half;
  const cy = y - Math.sin(angle) * half;
  const ox = x + Math.cos(angle) * half;
  const oy = y + Math.sin(angle) * half;
  ctx.strokeStyle = COLOR_C;
  ctx.lineWidth = 1.3 * scale;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(ox, oy);
  ctx.stroke();
  ctx.fillStyle = COLOR_C;
  ctx.beginPath();
  ctx.arc(cx, cy, 3.2 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLOR_O;
  ctx.beginPath();
  ctx.arc(ox, oy, 3.6 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawH2(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, scale: number) {
  const half = 3.2 * scale;
  const h1x = x - Math.cos(angle) * half;
  const h1y = y - Math.sin(angle) * half;
  const h2x = x + Math.cos(angle) * half;
  const h2y = y + Math.sin(angle) * half;
  ctx.strokeStyle = COLOR_H;
  ctx.lineWidth = 1.1 * scale;
  ctx.beginPath();
  ctx.moveTo(h1x, h1y);
  ctx.lineTo(h2x, h2y);
  ctx.stroke();
  ctx.fillStyle = COLOR_H;
  for (const [hx, hy] of [[h1x, h1y] as const, [h2x, h2y] as const]) {
    ctx.beginPath();
    ctx.arc(hx, hy, 2.2 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCO2(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  scale: number,
) {
  const bond = 6.5 * scale;
  const o1x = x + Math.cos(angle) * bond;
  const o1y = y + Math.sin(angle) * bond;
  const o2x = x - Math.cos(angle) * bond;
  const o2y = y - Math.sin(angle) * bond;
  ctx.strokeStyle = COLOR_C;
  ctx.lineWidth = 1.3 * scale;
  ctx.beginPath();
  ctx.moveTo(o1x, o1y);
  ctx.lineTo(o2x, o2y);
  ctx.stroke();
  ctx.fillStyle = COLOR_O;
  for (const [ox, oy] of [[o1x, o1y] as const, [o2x, o2y] as const]) {
    ctx.beginPath();
    ctx.arc(ox, oy, 2.8 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = COLOR_C;
  ctx.beginPath();
  ctx.arc(x, y, 3 * scale, 0, Math.PI * 2);
  ctx.fill();
}

const H2O_HALF_ANGLE = (104.5 / 2) * (Math.PI / 180);
function drawH2O(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  scale: number,
) {
  const bond = 6 * scale;
  const h1x = x + Math.cos(angle - H2O_HALF_ANGLE) * bond;
  const h1y = y + Math.sin(angle - H2O_HALF_ANGLE) * bond;
  const h2x = x + Math.cos(angle + H2O_HALF_ANGLE) * bond;
  const h2y = y + Math.sin(angle + H2O_HALF_ANGLE) * bond;
  ctx.strokeStyle = COLOR_O;
  ctx.lineWidth = 1.3 * scale;
  ctx.beginPath();
  ctx.moveTo(h1x, h1y);
  ctx.lineTo(x, y);
  ctx.lineTo(h2x, h2y);
  ctx.stroke();
  ctx.fillStyle = COLOR_O;
  ctx.beginPath();
  ctx.arc(x, y, 3.4 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLOR_H;
  for (const [hx, hy] of [[h1x, h1y] as const, [h2x, h2y] as const]) {
    ctx.beginPath();
    ctx.arc(hx, hy, 2.3 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

const DRAW_FNS: Record<
  Species,
  (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, scale: number) => void
> = {
  [CO]: drawCO,
  [H2O]: drawH2O,
  [CO2]: drawCO2,
  [H2]: drawH2,
};

// Velocity vectors get their own color and an arrowhead so "display
// vectors" doesn't blend into a molecule's own bond lines.
function drawVectorScreen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ex: number,
  ey: number,
) {
  const dx = ex - x;
  const dy = ey - y;
  if (Math.hypot(dx, dy) < 2) return;
  const angle = Math.atan2(dy, dx);
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

// Rate bars used a linear scale that pins at its cap across most of the
// temperature range; log-scaling keeps the low end readable while giving
// the bar somewhere to go across the full range instead of maxing out.
const barHeight = (rate: number) => clamp(14 * Math.log10(Math.max(0, rate) * 8 + 1) + 2, 2, 48);

// Perspective projection shared by particles, flashes and the vessel's
// wireframe box. Clamped defensively -- a corner-on view of a large vessel
// can push the raw perspective factor toward its pole, and an unclamped
// scale feeding into a canvas radius/arc call is exactly how an earlier
// version of this simulation crashed (NaN/negative radius -> uncaught
// exception -> the render loop dies for good).
const FOCAL = 4;
function project(pos: Vec3, yaw: number, pitch: number) {
  const [x1, y1, z2] = rotate3d(pos, yaw, pitch);
  const persp = clamp(FOCAL / (FOCAL - z2), 0.15, 4);
  return { x: x1 * persp, y: y1 * persp, z: z2, scale: persp };
}

const BOX_CORNERS: Vec3[] = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];
const BOX_EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

const MAX_PER_SPECIES = 130;
const STRESS_STEP = 10;

export function EquilibriumSim() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const seededRef = useRef(false);
  if (!seededRef.current) {
    particlesRef.current = seedParticles();
    seededRef.current = true;
  }
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const stateRef = useRef({
    temp: 298,
    volume: 1.5,
    inertPressure: 0,
    running: true,
    vectors: true,
    soundOn: false,
    yaw: 0.5,
    pitch: -0.3,
    zoom: 1,
  });
  const soundRef = useRef<ReturnType<typeof createSoundEngine> | null>(null);
  if (!soundRef.current) soundRef.current = createSoundEngine();

  // Kc, Qc, the rate bars, vessel pressure, and the shift/heat status text
  // all depend on values computed every animation frame. Reading them
  // straight from React state (throttled by re-renders) used to make the
  // numbers visibly freeze and jump during a slider drag; writing directly
  // to the DOM every frame bypasses that entirely.
  const kcRef = useRef<HTMLSpanElement | null>(null);
  const qcRef = useRef<HTMLSpanElement | null>(null);
  const vesselRef = useRef<HTMLSpanElement | null>(null);
  const shiftRef = useRef<HTMLParagraphElement | null>(null);
  const heatTextRef = useRef<HTMLParagraphElement | null>(null);
  const fwdBarRef = useRef<HTMLDivElement | null>(null);
  const revBarRef = useRef<HTMLDivElement | null>(null);
  const heatBarRef = useRef<HTMLDivElement | null>(null);

  const [temp, setTemp] = useState(298);
  const [volume, setVolume] = useState(1.5);
  const [inertPressure, setInertPressure] = useState(0);
  const [running, setRunning] = useState(true);
  const [vectors, setVectors] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [preset, setPreset] = useState<Preset>("baseline");

  stateRef.current.temp = temp;
  stateRef.current.volume = volume;
  stateRef.current.inertPressure = inertPressure;
  stateRef.current.running = running;
  stateRef.current.vectors = vectors;
  stateRef.current.soundOn = soundOn;

  const toggleSound = () => {
    setSoundOn((v) => {
      const next = !v;
      if (next) soundRef.current?.ensure();
      else soundRef.current?.stopDrone();
      return next;
    });
  };

  const addParticles = (kind: Species, count: number) => {
    const list = particlesRef.current;
    const room = MAX_PER_SPECIES - list.filter((p) => p.kind === kind).length;
    const n = Math.max(0, Math.min(count, room));
    for (let i = 0; i < n; i++) list.push(spawnParticle(kind));
  };
  const removeParticles = (kind: Species, count: number) => {
    const list = particlesRef.current;
    let n = count;
    for (let i = list.length - 1; i >= 0 && n > 0; i--) {
      if (list[i]!.kind === kind) {
        list.splice(i, 1);
        n--;
      }
    }
  };

  const applyPreset = (p: Preset) => {
    setPreset(p);
    const cfg = PRESETS[p];
    setTemp(cfg.temp);
    setVolume(cfg.volume);
    setInertPressure(cfg.inertPressure);
    if (cfg.addMix) {
      for (const [key, n] of Object.entries(cfg.addMix)) {
        if (n) addParticles(Number(key) as Species, n);
      }
    }
  };

  const reset = () => {
    particlesRef.current = seedParticles();
    setTemp(298);
    setVolume(1.5);
    setInertPressure(0);
    setPreset("baseline");
  };

  const onCanvasPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onCanvasPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    stateRef.current.yaw += dx * 0.008;
    stateRef.current.pitch = clamp(stateRef.current.pitch + dy * 0.008, -1.4, 1.4);
  };
  const onCanvasPointerUp = () => {
    dragRef.current = null;
  };
  const onCanvasWheel = (e: ReactWheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stateRef.current.zoom = clamp(stateRef.current.zoom * (1 - e.deltaY * 0.001), 0.5, 2.2);
  };
  const zoomBy = (factor: number) => {
    stateRef.current.zoom = clamp(stateRef.current.zoom * factor, 0.5, 2.2);
  };
  const resetView = () => {
    stateRef.current.yaw = 0.5;
    stateRef.current.pitch = -0.3;
    stateRef.current.zoom = 1;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let boxScale = 0.86;
    let fwdRateEMA = 0;
    let revRateEMA = 0;
    let wasAtEquilibrium = false;
    let flashes: Flash[] = [];

    const frame = (now: number) => {
      // rAF timestamps aren't guaranteed strictly increasing across every
      // frame pair. A negative dt would tick flash ages backwards into
      // negative territory, and ctx.arc throws on a negative radius --
      // which, uncaught, would stop this rAF loop from ever rescheduling.
      // Clamping removes the cause; try/finally is a backstop against any
      // other exception doing the same.
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
      const cx = w / 2;
      const cy = h / 2;

      const list = particlesRef.current;
      const V = Math.max(0.2, s.volume);
      const counts: Record<Species, number> = { [CO]: 0, [H2O]: 0, [CO2]: 0, [H2]: 0 };
      for (const p of list) counts[p.kind]++;
      const totalMoles = list.length / PARTICLES_PER_MOLE;
      const conc = (k: Species) => counts[k] / PARTICLES_PER_MOLE / V;
      const cCO = conc(CO);
      const cH2O = conc(H2O);
      const cCO2 = conc(CO2);
      const cH2 = conc(H2);
      const Kc = kcTarget(s.temp);
      const Qc = (cCO2 * cH2) / Math.max(cCO * cH2O, 1e-6);
      const pReactive = (totalMoles * R_EFF * s.temp) / V;
      const P = pReactive + s.inertPressure;

      const distanceRatio = Math.abs(Qc - Kc) / Kc;
      const atEquilibrium = distanceRatio < 0.04;
      if (kcRef.current) kcRef.current.textContent = Kc.toFixed(3);
      if (qcRef.current) qcRef.current.textContent = Qc.toFixed(3);
      if (vesselRef.current)
        vesselRef.current.textContent = `${V.toFixed(2)} L · ${P.toFixed(2)} atm`;
      if (shiftRef.current) {
        shiftRef.current.textContent = atEquilibrium
          ? "At equilibrium"
          : Qc < Kc
            ? "Shifting forward → more CO₂ + H₂"
            : "Shifting backward → more CO + H₂O";
      }

      // Vessel size tracks volume, eased rather than snapped so a
      // compression/expansion reads as a "squeeze" instead of a jump cut.
      const targetScale = clamp(0.5 + 0.24 * V, 0.5, 1.35);
      boxScale += (targetScale - boxScale) * Math.min(1, dt * 3);

      const pxPerUnit = Math.min(w, h) * 0.24;
      const toScreen = (pos: Vec3) => {
        const proj = project(pos, s.yaw, s.pitch);
        return {
          x: cx + proj.x * pxPerUnit * s.zoom,
          y: cy + proj.y * pxPerUnit * s.zoom,
          z: proj.z,
          scale: proj.scale * s.zoom,
        };
      };

      const speed = Math.sqrt(s.temp / 298);
      const pf = pForward(s.temp);
      const pr = pReverse(s.temp);

      if (s.running) {
        for (const p of list) {
          p.x += p.vx * dt * speed;
          p.y += p.vy * dt * speed;
          p.z += p.vz * dt * speed;
          p.angle += p.spin * dt * speed;
        }
      }
      for (const p of list) {
        if (p.x < -boxScale || p.x > boxScale) p.vx *= -1;
        if (p.y < -boxScale || p.y > boxScale) p.vy *= -1;
        if (p.z < -boxScale || p.z > boxScale) p.vz *= -1;
        p.x = clamp(p.x, -boxScale, boxScale);
        p.y = clamp(p.y, -boxScale, boxScale);
        p.z = clamp(p.z, -boxScale, boxScale);
      }

      // Pairwise collisions do double duty: an equal-mass elastic bounce
      // for every pair, and -- for a reactant pair (CO+H2O) or a product
      // pair (CO2+H2) -- a chance to transmute in place. Forward and
      // reverse conversions are checked in the same loop every frame, so
      // both directions are literally happening at once, not just implied
      // by aggregate concentration math.
      let fwdEvents = 0;
      let revEvents = 0;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i]!;
          const b = list[j]!;
          const ra = SPECIES_INFO[a.kind].radius;
          const rb = SPECIES_INFO[b.kind].radius;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dz = b.z - a.z;
          const dist = Math.hypot(dx, dy, dz) || 0.0001;
          const minDist = ra + rb;
          if (dist >= minDist) continue;
          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;
          const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny + (b.vz - a.vz) * nz;
          if (closing >= 0) continue;
          a.vx += closing * nx;
          a.vy += closing * ny;
          a.vz += closing * nz;
          b.vx -= closing * nx;
          b.vy -= closing * ny;
          b.vz -= closing * nz;
          const overlap = minDist - dist;
          a.x -= (nx * overlap) / 2;
          a.y -= (ny * overlap) / 2;
          a.z -= (nz * overlap) / 2;
          b.x += (nx * overlap) / 2;
          b.y += (ny * overlap) / 2;
          b.z += (nz * overlap) / 2;

          let flashKind: Flash["kind"] = "none";
          const isReactantPair =
            (a.kind === CO && b.kind === H2O) || (a.kind === H2O && b.kind === CO);
          const isProductPair =
            (a.kind === CO2 && b.kind === H2) || (a.kind === H2 && b.kind === CO2);
          if (s.running && isReactantPair && Math.random() < pf) {
            if (a.kind === CO) {
              a.kind = CO2;
              b.kind = H2;
            } else {
              a.kind = H2;
              b.kind = CO2;
            }
            flashKind = "hot";
            fwdEvents++;
          } else if (s.running && isProductPair && Math.random() < pr) {
            if (a.kind === CO2) {
              a.kind = CO;
              b.kind = H2O;
            } else {
              a.kind = H2O;
              b.kind = CO;
            }
            flashKind = "cold";
            revEvents++;
          }

          if (flashes.length < 90) {
            flashes.push({
              x: (a.x + b.x) / 2,
              y: (a.y + b.y) / 2,
              z: (a.z + b.z) / 2,
              age: 0,
              life: flashKind === "none" ? 0.3 : 0.5,
              kind: flashKind,
            });
          }
          if (s.soundOn) {
            if (flashKind === "hot")
              soundRef.current!.click({ freq: 1100 + Math.random() * 120, gain: 0.16 });
            else if (flashKind === "cold")
              soundRef.current!.click({ freq: 420 + Math.random() * 100, gain: 0.16 });
            else soundRef.current!.click({ freq: 650 + Math.random() * 150, gain: 0.05 });
          }
        }
      }

      const emaAlpha = Math.min(1, dt * 0.8);
      fwdRateEMA += (fwdEvents / Math.max(dt, 1e-4) - fwdRateEMA) * emaAlpha;
      revRateEMA += (revEvents / Math.max(dt, 1e-4) - revRateEMA) * emaAlpha;
      const netHeat = REACTION_DELTA_H_KJ * (fwdRateEMA - revRateEMA);
      if (fwdBarRef.current) fwdBarRef.current.style.height = `${barHeight(fwdRateEMA)}px`;
      if (revBarRef.current) revBarRef.current.style.height = `${barHeight(revRateEMA)}px`;
      if (heatBarRef.current) {
        heatBarRef.current.style.height = `${barHeight(Math.abs(netHeat))}px`;
        heatBarRef.current.style.backgroundColor =
          netHeat >= 0 ? "rgb(56, 189, 248)" : "rgb(249, 115, 22)";
      }
      if (heatTextRef.current) {
        heatTextRef.current.textContent =
          Math.abs(netHeat) < 0.02
            ? "Heat flow ~balanced"
            : netHeat > 0
              ? "Absorbing heat (endothermic)"
              : "Releasing heat (exothermic)";
      }

      // Sound: a rising drone as Qc closes in on Kc, a chime the moment it
      // crosses into "at equilibrium," then silence until the next
      // disturbance pushes it back out. Hysteresis keeps float jitter
      // right at the boundary from re-triggering the chime every frame.
      if (s.soundOn) {
        const sound = soundRef.current!;
        if (atEquilibrium && !wasAtEquilibrium) {
          sound.chime();
          sound.stopDrone();
          wasAtEquilibrium = true;
        } else if (distanceRatio > 0.08) {
          wasAtEquilibrium = false;
        }
        if (!wasAtEquilibrium) {
          const band = 0.6;
          if (distanceRatio < band) {
            const closeness = 1 - distanceRatio / band;
            sound.setDrone(280 + closeness * 480, 0.05 + closeness * 0.12);
          } else {
            sound.stopDrone();
          }
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(15, 23, 42, 0.05)";
      ctx.fillRect(0, 0, w, h);

      // 3D vessel wireframe -- corners rotate/zoom with the same camera as
      // the particles, so the box itself reads as a real rotatable object.
      const corners = BOX_CORNERS.map((c) =>
        toScreen([c[0] * boxScale, c[1] * boxScale, c[2] * boxScale]),
      );
      ctx.lineWidth = 1.5;
      for (const [i, j] of BOX_EDGES) {
        const A = corners[i]!;
        const B = corners[j]!;
        const avgZ = (A.z + B.z) / 2;
        ctx.strokeStyle = avgZ > 0 ? "rgba(100, 116, 139, 0.75)" : "rgba(100, 116, 139, 0.3)";
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
      }

      // Depth-sort particles and flashes together so nearer objects draw
      // on top regardless of which kind of object they are.
      flashes = flashes.filter((f) => f.age < f.life);
      const items: Array<{ z: number; draw: () => void }> = [];
      for (const f of flashes) {
        f.age += dt;
        const sp = toScreen([f.x, f.y, f.z]);
        const t = f.age / f.life;
        const baseR = f.kind === "none" ? 9 : 16;
        const r = Math.max(0, baseR * t * sp.scale);
        const color =
          f.kind === "hot"
            ? `rgba(249, 115, 22, ${0.65 * (1 - t)})`
            : f.kind === "cold"
              ? `rgba(56, 189, 248, ${0.65 * (1 - t)})`
              : `rgba(148, 163, 184, ${0.4 * (1 - t)})`;
        items.push({
          z: sp.z,
          draw: () => {
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = f.kind === "none" ? 1 : 2;
            ctx.stroke();
          },
        });
      }
      for (const p of list) {
        const sp = toScreen([p.x, p.y, p.z]);
        const drawScale = clamp(sp.scale, 0.15, 4);
        items.push({
          z: sp.z,
          draw: () => {
            DRAW_FNS[p.kind](ctx, sp.x, sp.y, p.angle, drawScale);
            if (s.vectors) {
              const sp2 = toScreen([p.x + p.vx * 0.4, p.y + p.vy * 0.4, p.z + p.vz * 0.4]);
              drawVectorScreen(ctx, sp.x, sp.y, sp2.x, sp2.y);
            }
          },
        });
      }
      items.sort((a, b) => a.z - b.z);
      for (const it of items) it.draw();
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  // Sound engine disposal is separated from the animation effect above so
  // remounts/resets that don't touch this effect's deps don't tear down
  // and recreate the AudioContext every time.
  useEffect(() => {
    return () => soundRef.current?.dispose();
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div>
          <h3 className="font-mono text-2xl font-bold tracking-tight">
            CO (g) + H₂O (g) <span className="text-accent">⇌</span> CO₂ (g) + H₂ (g)
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">The water-gas shift reaction</p>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <canvas
            ref={canvasRef}
            className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
            aria-label="3D particle simulation of the water-gas shift reaction"
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            onPointerLeave={onCanvasPointerUp}
            onWheel={onCanvasWheel}
          />
          <p className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Drag to rotate · Scroll to zoom
          </p>
          <div className="pointer-events-auto absolute right-4 top-4 flex gap-1 rounded-lg border border-border bg-card/90 p-1 backdrop-blur">
            <button
              onClick={() => zoomBy(0.85)}
              aria-label="Zoom out"
              className="h-7 w-7 rounded text-sm font-bold transition-colors hover:bg-secondary"
            >
              −
            </button>
            <button
              onClick={resetView}
              aria-label="Reset view"
              className="rounded px-2 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-secondary"
            >
              Reset view
            </button>
            <button
              onClick={() => zoomBy(1.18)}
              aria-label="Zoom in"
              className="h-7 w-7 rounded text-sm font-bold transition-colors hover:bg-secondary"
            >
              +
            </button>
          </div>
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <div className="pointer-events-auto rounded-lg border border-border bg-card/90 p-4 backdrop-blur">
              <div className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">
                Conversions / s (rel.)
              </div>
              <div className="flex h-12 items-end gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div ref={fwdBarRef} className="w-3 bg-foreground" style={{ height: "15px" }} />
                  <span className="font-mono text-[9px] text-muted-foreground">fwd</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div ref={revBarRef} className="w-3 bg-accent" style={{ height: "15px" }} />
                  <span className="font-mono text-[9px] text-muted-foreground">rev</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div ref={heatBarRef} className="w-3" style={{ height: "2px" }} />
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
          <Stat label="Kc constant" value="2.200" italic spanRef={kcRef} />
          <Stat label="Reaction quotient Qc" value="2.200" accent spanRef={qcRef} />
          <Stat label="System temp" value={`${Math.round(temp)} K`} />
          <Stat label="ΔH rxn" value={`${REACTION_DELTA_H_KJ.toFixed(1)} kJ/mol`} italic small />
          <Stat label="Vessel" value="1.50 L · 1.36 atm" small spanRef={vesselRef} />
        </div>
        <p ref={shiftRef} className="font-mono text-xs uppercase tracking-widest text-accent">
          At equilibrium
        </p>
        <p
          ref={heatTextRef}
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
        >
          Heat flow ~balanced
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
                Raises total pressure without changing volume or any concentration ratio — no
                equilibrium shift.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-medium">Add or remove species</h4>
              <div className="grid grid-cols-2 gap-3">
                {SPECIES_LIST.map(({ kind }) => (
                  <div
                    key={kind}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="font-mono text-xs font-medium">
                      {SPECIES_INFO[kind].formula}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => removeParticles(kind, STRESS_STEP)}
                        aria-label={`Remove ${SPECIES_INFO[kind].formula}`}
                        className="rounded border border-border px-2 py-1 text-xs font-bold transition-colors hover:bg-secondary"
                      >
                        −
                      </button>
                      <button
                        onClick={() => addParticles(kind, STRESS_STEP)}
                        aria-label={`Add ${SPECIES_INFO[kind].formula}`}
                        className="rounded border border-border px-2 py-1 text-xs font-bold transition-colors hover:bg-secondary"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <label
              className="flex cursor-pointer items-center gap-3 pt-2"
              onClick={() => setVectors((v) => !v)}
            >
              <span
                className={`relative h-5 w-10 rounded-full transition-colors ${vectors ? "bg-accent" : "bg-input"}`}
              >
                <span
                  className={`absolute top-1 h-3 w-3 rounded-full bg-card transition-all ${vectors ? "right-1" : "left-1"}`}
                />
              </span>
              <span className="text-xs font-bold uppercase">Display vectors</span>
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
  spanRef,
}: {
  label: string;
  value: string;
  italic?: boolean;
  accent?: boolean;
  small?: boolean;
  spanRef?: Ref<HTMLSpanElement>;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
      <span
        ref={spanRef}
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

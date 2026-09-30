import { useEffect, useMemo, useRef, useState } from "react";
import { Axes, pathFrom } from "@/components/figures/Figure";
import {
  MAX_PPM,
  MIN_PPM,
  PREINDUSTRIAL_PPM,
  TODAY_PPM,
  WATER_MASSES,
  revelleFactor,
  seawaterConstants,
  solveCarbonateSystem,
  solveFromDIC,
  type CarbonateState,
  type WaterMassId,
} from "@/lib/oceanChem";

// The surface ocean as a single well-mixed parcel under an atmosphere whose
// CO2 the reader controls. CO2 crosses the surface at a rate proportional to
// the gap between the air's CO2 and the CO2 the water "pushes back" with,
// the dissolved carbon (DIC) builds up, and the carbonate equilibria are
// re-solved exactly every frame (src/lib/oceanChem.ts). The real surface
// ocean closes that gap in about a year; here it takes a couple of seconds so
// the lag is visible.

/** DIC gained per second per mol/kg of CO2(aq) disequilibrium. */
const GAS_EXCHANGE = 8;

const PRESETS = [
  { label: "Ice age", ppm: 180 },
  { label: "1750", ppm: PREINDUSTRIAL_PPM },
  { label: "Today", ppm: TODAY_PPM },
  { label: "2× CO₂", ppm: 560 },
  { label: "2100, high", ppm: 1135 },
  { label: "Extreme", ppm: MAX_PPM },
];

/** Observed record to today, then a high-emissions (SSP5-8.5-like) path. */
const PATHWAY = [
  { year: 1750, ppm: 280 },
  { year: 1850, ppm: 285 },
  { year: 1900, ppm: 296 },
  { year: 1950, ppm: 311 },
  { year: 1980, ppm: 339 },
  { year: 2000, ppm: 369 },
  { year: 2020, ppm: 414 },
  { year: 2026, ppm: 430 },
  { year: 2050, ppm: 563 },
  { year: 2075, ppm: 780 },
  { year: 2100, ppm: 1135 },
];
const HISTORY_SECONDS = 5;
const FUTURE_SECONDS = 7;

function pathwayAt(t: number): { year: number; ppm: number } {
  const year =
    t <= HISTORY_SECONDS
      ? 1750 + (t / HISTORY_SECONDS) * (2026 - 1750)
      : 2026 + Math.min((t - HISTORY_SECONDS) / FUTURE_SECONDS, 1) * (2100 - 2026);
  for (let i = 1; i < PATHWAY.length; i++) {
    const a = PATHWAY[i - 1]!;
    const b = PATHWAY[i]!;
    if (year <= b.year) {
      return { year, ppm: a.ppm + ((year - a.year) / (b.year - a.year)) * (b.ppm - a.ppm) };
    }
  }
  return { year: 2100, ppm: 1135 };
}

/* Log-scaled slider: 280–560 ppm would otherwise be a sliver of the track. */
const LOG_SPAN = Math.log(MAX_PPM / MIN_PPM);
const ppmToSlider = (ppm: number) => Math.round((Math.log(ppm / MIN_PPM) / LOG_SPAN) * 1000);
const sliderToPpm = (s: number) => Math.round(MIN_PPM * Math.exp((s / 1000) * LOG_SPAN));

/* Deterministic scatter so server and client render identical particles. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SKY_DOTS = (() => {
  const r = mulberry32(7);
  return Array.from({ length: 80 }, () => ({ x: 14 + r() * 372, y: 16 + r() * 66, a: r() * 180 }));
})();
const SEA_DOTS = (() => {
  const r = mulberry32(11);
  return Array.from({ length: 80 }, () => ({ x: 12 + r() * 376, y: 124 + r() * 112 }));
})();
const EXCHANGE_DOTS = (() => {
  const r = mulberry32(23);
  return Array.from({ length: 10 }, () => ({ x: 26 + r() * 348, delay: r() * 2.4 }));
})();
const SURFACE_Y = 100;

/* Ω(aragonite) against atmospheric CO2 for every water mass, for the chart. */
const CURVE_PPM = Array.from({ length: 48 }, (_, i) => MIN_PPM * Math.exp((i / 47) * LOG_SPAN));
const OMEGA_CURVES = WATER_MASSES.map((w) => {
  let lo = MIN_PPM,
    hi = 8000;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (solveCarbonateSystem(mid, w.tempC, w.salinity).omegaAragonite > 1) lo = mid;
    else hi = mid;
  }
  return {
    id: w.id,
    points: CURVE_PPM.map((ppm) => ({
      ppm,
      omega: solveCarbonateSystem(ppm, w.tempC, w.salinity).omegaAragonite,
    })),
    crossesAt: lo,
  };
});
const WATER_COLOR: Record<WaterMassId, string> = {
  tropical: "var(--fig-1)",
  temperate: "var(--fig-3)",
  polar: "var(--fig-2)",
};

const fmtPct = (x: number) =>
  `${x >= 0 ? "+" : "−"}${Math.abs(x).toFixed(Math.abs(x) < 10 ? 1 : 0)}%`;
const umol = (molPerKg: number) => {
  const v = molPerKg * 1e6;
  return v < 100 ? v.toFixed(1) : v.toFixed(0);
};

function shellStatus(omega: number) {
  if (omega >= 3.5)
    return {
      label: "Comfortable",
      tone: "var(--fig-3)",
      text: "Carbonate is plentiful, so laying down shell and skeleton is cheap.",
    };
  if (omega >= 2)
    return {
      label: "Strained",
      tone: "color-mix(in oklab, var(--fig-3) 45%, var(--fig-1))",
      text: "Still supersaturated, but calcifying costs more energy and growth slows. Reef corals do best above roughly 3.5.",
    };
  if (omega >= 1)
    return {
      label: "Severe stress",
      tone: "color-mix(in oklab, var(--fig-3) 15%, var(--fig-1))",
      text: "Barely supersaturated. Field studies already find dissolution damage on pteropod shells in water only slightly above Ω = 1.",
    };
  return {
    label: "Corrosive",
    tone: "var(--fig-1)",
    text: "Undersaturated: bare aragonite now dissolves. Organisms spend energy just to keep what they have already built.",
  };
}

function CO2Glyph({ x, y, a }: { x: number; y: number; a: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)})`}>
      <circle cx={-4.6} cy={0} r={2.6} fill="var(--fig-1)" />
      <circle cx={0} cy={0} r={2.2} className="fill-foreground" opacity={0.75} />
      <circle cx={4.6} cy={0} r={2.6} fill="var(--fig-1)" />
    </g>
  );
}

const STEPS = [
  { key: "dissolve", title: "Dissolve", eq: "CO₂(g) ⇌ CO₂(aq)" },
  { key: "acidify", title: "Acidify", eq: "CO₂(aq) + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻" },
  { key: "buffer", title: "Buffer", eq: "H⁺ + CO₃²⁻ → HCO₃⁻" },
  { key: "net", title: "Net effect", eq: "CO₂ + CO₃²⁻ + H₂O → 2 HCO₃⁻" },
] as const;
type StepKey = (typeof STEPS)[number]["key"];

const HIGHLIGHT: Record<StepKey, string[]> = {
  dissolve: ["co2"],
  acidify: ["co2", "h", "hco3"],
  buffer: ["h", "co3", "hco3"],
  net: ["co2", "h", "hco3", "co3"],
};

export function OceanAcidificationSim() {
  const [airPpm, setAirPpm] = useState(TODAY_PPM);
  const [waterId, setWaterId] = useState<WaterMassId>("tropical");
  const [dic, setDic] = useState(() => solveCarbonateSystem(TODAY_PPM).dic);
  const dicRef = useRef(dic);
  const [playing, setPlaying] = useState(false);
  const [playYear, setPlayYear] = useState<number | null>(null);
  const [step, setStep] = useState<StepKey>("dissolve");
  const [reduceMotion, setReduceMotion] = useState(false);

  const water = WATER_MASSES.find((w) => w.id === waterId)!;
  const consts = useMemo(
    () => seawaterConstants(water.tempC, water.salinity),
    [water.tempC, water.salinity],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Gas exchange: integrate DIC toward equilibrium with the current air.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const co2Target = consts.K0 * airPpm * 1e-6 * (1 - consts.vapour);
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const gap = co2Target - solveFromDIC(dicRef.current, consts).co2aq;
      if (Math.abs(gap) / co2Target < 1e-4) return;
      const next = dicRef.current + GAS_EXCHANGE * gap * dt;
      dicRef.current = next;
      setDic(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [airPpm, consts]);

  // History-to-2100 playback drives the atmosphere; the ocean follows on its own.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const p = pathwayAt(t);
      setAirPpm(Math.round(p.ppm));
      setPlayYear(Math.round(p.year));
      if (t < HISTORY_SECONDS + FUTURE_SECONDS) raf = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const setAirManually = (ppm: number) => {
    setPlaying(false);
    setPlayYear(null);
    setAirPpm(ppm);
  };

  const startPlayback = () => {
    const start = solveCarbonateSystem(PREINDUSTRIAL_PPM, water.tempC, water.salinity).dic;
    dicRef.current = start;
    setDic(start);
    setAirPpm(PREINDUSTRIAL_PPM);
    setPlayYear(1750);
    setPlaying(true);
  };

  const chooseWater = (id: WaterMassId) => {
    const w = WATER_MASSES.find((m) => m.id === id)!;
    // A different place, not the same water warming up — start it equilibrated.
    const eqDic = solveCarbonateSystem(airPpm, w.tempC, w.salinity).dic;
    dicRef.current = eqDic;
    setDic(eqDic);
    setWaterId(id);
  };

  const now = useMemo(() => solveFromDIC(dic, consts), [dic, consts]);
  const pre = useMemo(
    () => solveCarbonateSystem(PREINDUSTRIAL_PPM, water.tempC, water.salinity),
    [water.tempC, water.salinity],
  );
  const revelleNow = useMemo(
    () => revelleFactor(airPpm, water.tempC, water.salinity),
    [airPpm, water.tempC, water.salinity],
  );
  const revellePre = useMemo(
    () => revelleFactor(PREINDUSTRIAL_PPM, water.tempC, water.salinity),
    [water.tempC, water.salinity],
  );
  const polarVsTropicalSolubility = useMemo(() => {
    const polar = WATER_MASSES.find((w) => w.id === "polar")!;
    const tropical = WATER_MASSES.find((w) => w.id === "tropical")!;
    return (
      seawaterConstants(polar.tempC, polar.salinity).K0 /
      seawaterConstants(tropical.tempC, tropical.salinity).K0
    );
  }, []);

  const hNow = Math.pow(10, -now.pH);
  const hPre = Math.pow(10, -pre.pH);
  const changes = {
    co2: (now.co2aq / pre.co2aq - 1) * 100,
    h: (hNow / hPre - 1) * 100,
    hco3: (now.hco3 / pre.hco3 - 1) * 100,
    co3: (now.co3 / pre.co3 - 1) * 100,
  };
  const gapPpm = airPpm - now.seawaterPpm;
  const flux = gapPpm > 2 ? "in" : gapPpm < -2 ? "out" : "balanced";
  const status = shellStatus(now.omegaAragonite);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <Readouts now={now} pre={pre} changes={changes} />
        <GasExchangePanel
          airPpm={airPpm}
          now={now}
          water={water}
          flux={flux}
          gapPpm={gapPpm}
          reduceMotion={reduceMotion}
          playYear={playYear}
        />
        <ChemistryPanel
          step={step}
          onStep={setStep}
          now={now}
          pre={pre}
          changes={changes}
          waterLabel={water.label}
          tempC={water.tempC}
          co2Solubility={polarVsTropicalSolubility}
          revelleNow={revelleNow}
          revellePre={revellePre}
        />
        <ConsequencesPanel
          airPpm={airPpm}
          now={now}
          pre={pre}
          waterId={waterId}
          status={status}
          revelleNow={revelleNow}
          revellePre={revellePre}
        />
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest">Controls</h3>
          <div className="space-y-8">
            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Atmospheric CO₂</span>
                <span className="font-mono text-accent">{airPpm} ppm</span>
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                value={ppmToSlider(airPpm)}
                aria-label="Atmospheric CO2 in parts per million"
                aria-valuetext={`${airPpm} ppm`}
                onChange={(e) => setAirManually(sliderToPpm(Number(e.target.value)))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setAirManually(p.ppm)}
                    aria-pressed={airPpm === p.ppm}
                    className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                      airPpm === p.ppm
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border hover:border-accent hover:text-accent"
                    }`}
                  >
                    {p.label}
                    <span className="block font-mono text-[9px] opacity-70">{p.ppm}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
                Log-scaled slider. Drag fast and watch the ocean lag behind the air.
              </p>
            </div>

            <div>
              <div className="mb-3 text-xs font-medium">Water</div>
              <div className="space-y-1.5" role="radiogroup" aria-label="Water mass">
                {WATER_MASSES.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    role="radio"
                    aria-checked={waterId === w.id}
                    onClick={() => chooseWater(w.id)}
                    className={`flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                      waterId === w.id
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent"
                    }`}
                  >
                    <span
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: WATER_COLOR[w.id] }}
                    />
                    <span>
                      <span className="block text-xs font-semibold">
                        {w.label} · {w.tempC} °C
                      </span>
                      <span className="block text-[11px] leading-snug text-muted-foreground">
                        {w.blurb}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={playing ? () => setAirManually(airPpm) : startPlayback}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
              >
                {playing ? "Pause" : "Play 1750 → 2100"}
              </button>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
                Measured CO₂ to today, then a high-emissions pathway (roughly SSP5-8.5) to 2100.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">
            The ocean doesn't just hold dissolved CO₂ — it turns it into bicarbonate by spending
            carbonate. That trade is what lets it absorb so much, and it's also exactly what makes
            the water harder to build shells in.
          </p>
          <div className="font-mono text-xs text-accent">— Le Chatelier, at ocean scale</div>
        </div>
      </aside>
    </div>
  );
}

function Readouts({
  now,
  pre,
  changes,
}: {
  now: CarbonateState;
  pre: CarbonateState;
  changes: { h: number; co3: number };
}) {
  const tiles = [
    {
      label: "Surface pH",
      value: now.pH.toFixed(2),
      sub: `1750: ${pre.pH.toFixed(2)}`,
    },
    {
      label: "H⁺ vs 1750",
      value: fmtPct(changes.h),
      // Make the log step explicit: a 0.15 pH drop is 10^0.15 = 1.41×, not 15%.
      sub: `pH −${(pre.pH - now.pH).toFixed(2)} → ×${Math.pow(10, pre.pH - now.pH).toFixed(2)}`,
    },
    {
      label: "CO₃²⁻ (µmol/kg)",
      value: umol(now.co3),
      sub: `${fmtPct(changes.co3)} vs 1750`,
    },
    {
      label: "Ω aragonite",
      value: now.omegaAragonite.toFixed(2),
      sub: now.omegaAragonite >= 1 ? "shells can form" : "shells dissolve",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-xl border border-border bg-card px-4 py-3">
          {/* No `uppercase`: it turns µmol into ΜMOL (reads as mmol) and pH into PH. */}
          <div className="text-[11px] font-medium text-muted-foreground">{t.label}</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums">{t.value}</div>
          <div className="font-mono text-[10px] text-muted-foreground">{t.sub}</div>
        </div>
      ))}
    </div>
  );
}

function GasExchangePanel({
  airPpm,
  now,
  water,
  flux,
  gapPpm,
  reduceMotion,
  playYear,
}: {
  airPpm: number;
  now: CarbonateState;
  water: (typeof WATER_MASSES)[number];
  flux: "in" | "out" | "balanced";
  gapPpm: number;
  reduceMotion: boolean;
  playYear: number | null;
}) {
  const skyCount = Math.min(SKY_DOTS.length, Math.max(4, Math.round(airPpm / 30)));
  const extra = Math.min(8, Math.round(Math.abs(gapPpm) / 20));
  const downCount = 2 + (gapPpm > 0 ? extra : 0);
  const upCount = 2 + (gapPpm < 0 ? extra : 0);

  const n = SEA_DOTS.length;
  const nCO3 = Math.round((now.co3 / now.dic) * n);
  const nCO2 = Math.max(1, Math.round((now.co2aq / now.dic) * n));
  const speciesOf = (i: number) => (i < nCO3 ? "co3" : i < nCO3 + nCO2 ? "co2" : "hco3");

  const barMax = Math.max(airPpm, now.seawaterPpm) * 1.08;
  const fluxText =
    flux === "in"
      ? "Net flux: into the ocean"
      : flux === "out"
        ? "Net flux: out of the ocean"
        : "Balanced — molecules still cross both ways, net zero";

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          1 · CO₂ crosses the sea surface
        </h3>
        {playYear !== null && (
          <span className="font-mono text-sm font-bold text-accent">year ≈ {playYear}</span>
        )}
      </div>
      <svg
        viewBox="0 0 400 244"
        className="h-auto w-full"
        role="img"
        aria-label={`Atmosphere at ${airPpm} ppm CO2 above ${water.label.toLowerCase()} water. ${fluxText}. The water's dissolved carbon is about ${Math.round((now.hco3 / now.dic) * 100)} percent bicarbonate and ${Math.round((now.co3 / now.dic) * 100)} percent carbonate.`}
      >
        <rect x={0} y={0} width={400} height={SURFACE_Y} fill="var(--fig-2)" fillOpacity={0.04} />
        <rect
          x={0}
          y={SURFACE_Y}
          width={400}
          height={244 - SURFACE_Y}
          fill="var(--fig-2)"
          fillOpacity={0.13}
        />
        <path
          d={`M0 ${SURFACE_Y} ${Array.from({ length: 16 }, (_, i) => `Q ${i * 25 + 12.5} ${SURFACE_Y + (i % 2 ? 3 : -3)} ${(i + 1) * 25} ${SURFACE_Y}`).join(" ")}`}
          fill="none"
          stroke="var(--fig-2)"
          strokeWidth={1.5}
        />

        {SKY_DOTS.slice(0, skyCount).map((d, i) => (
          <CO2Glyph key={i} x={d.x} y={d.y} a={d.a} />
        ))}

        {!reduceMotion &&
          EXCHANGE_DOTS.slice(0, downCount).map((d, i) => (
            <g key={`down-${i}`} opacity={0}>
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 -36"
                to="0 40"
                dur="2.4s"
                begin={`-${d.delay.toFixed(2)}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.2;0.65;1"
                dur="2.4s"
                begin={`-${d.delay.toFixed(2)}s`}
                repeatCount="indefinite"
              />
              <CO2Glyph x={d.x} y={SURFACE_Y} a={90} />
            </g>
          ))}
        {!reduceMotion &&
          EXCHANGE_DOTS.slice(10 - upCount).map((d, i) => (
            <g key={`up-${i}`} opacity={0}>
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 36"
                to="0 -40"
                dur="2.4s"
                begin={`-${d.delay.toFixed(2)}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.35;0.8;1"
                dur="2.4s"
                begin={`-${d.delay.toFixed(2)}s`}
                repeatCount="indefinite"
              />
              <CO2Glyph x={d.x} y={SURFACE_Y} a={90} />
            </g>
          ))}

        {SEA_DOTS.map((d, i) => {
          const s = speciesOf(i);
          return s === "co2" ? (
            <CO2Glyph key={i} x={d.x} y={d.y} a={(i * 37) % 180} />
          ) : (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={s === "co3" ? 4.2 : 2.6}
              fill={s === "co3" ? "var(--fig-3)" : "var(--fig-2)"}
              fillOpacity={s === "co3" ? 1 : 0.7}
            />
          );
        })}

        <text x={8} y={12} className="fill-muted-foreground font-mono" fontSize={9}>
          ATMOSPHERE · {airPpm} ppm CO₂
        </text>
        <text x={8} y={SURFACE_Y + 16} className="fill-muted-foreground font-mono" fontSize={9}>
          SURFACE OCEAN · {water.tempC} °C
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <svg width="16" height="8" viewBox="-8 -4 16 8" aria-hidden="true">
            <CO2Glyph x={0} y={0} a={0} />
          </svg>
          CO₂
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--fig-2)] opacity-70" />
          HCO₃⁻ bicarbonate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--fig-3)]" />
          CO₃²⁻ carbonate
        </span>
        <span>· each dot in the water ≈ 1/80 of dissolved carbon</span>
      </div>

      <div className="mt-5 space-y-2">
        {[
          { label: "Air", ppm: airPpm, color: "var(--fig-1)" },
          { label: "Surface water", ppm: now.seawaterPpm, color: "var(--fig-2)" },
        ].map((b) => (
          <div key={b.label} className="grid grid-cols-[92px_1fr_64px] items-center gap-3 text-xs">
            <span className="text-muted-foreground">{b.label}</span>
            <div className="h-2 rounded-full bg-secondary">
              <div
                className="h-2 rounded-full"
                style={{ width: `${(b.ppm / barMax) * 100}%`, background: b.color }}
              />
            </div>
            <span className="text-right font-mono tabular-nums">{Math.round(b.ppm)} ppm</span>
          </div>
        ))}
        <p
          className={`pt-1 text-xs font-semibold ${flux === "balanced" ? "text-muted-foreground" : "text-accent"}`}
        >
          {fluxText}
          {flux !== "balanced" && ` — gap ${Math.abs(Math.round(gapPpm))} ppm`}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          CO₂ moves from where its pressure is higher to where it's lower. The water's own CO₂
          pressure rises as it absorbs carbon, so uptake slows and stops once the two match — the
          real surface ocean catches up with the air in about a year.
        </p>
      </div>
    </div>
  );
}

function ChemistryPanel({
  step,
  onStep,
  now,
  pre,
  changes,
  waterLabel,
  tempC,
  co2Solubility,
  revelleNow,
  revellePre,
}: {
  step: StepKey;
  onStep: (s: StepKey) => void;
  now: CarbonateState;
  pre: CarbonateState;
  changes: { co2: number; h: number; hco3: number; co3: number };
  waterLabel: string;
  tempC: number;
  co2Solubility: number;
  revelleNow: number;
  revellePre: number;
}) {
  const explain: Record<StepKey, string> = {
    dissolve: `Henry's law: dissolved CO₂ is proportional to the CO₂ in the air. Right now that's ${umol(now.co2aq)} µmol/kg in ${waterLabel.toLowerCase()} water at ${tempC} °C. Gases dissolve better in cold water — at the same ppm, polar water holds ${co2Solubility.toFixed(1)}× as much CO₂ as tropical water.`,
    acidify: `Some dissolved CO₂ reacts with water to make carbonic acid, which gives up a proton. Every one of those protons is a push toward lower pH — dissolved CO₂ is up ${fmtPct(changes.co2)} since 1750.`,
    buffer: `Most of those protons never stay free: carbonate ions already in the water grab them, turning into bicarbonate. That's why H⁺ has changed by ${fmtPct(changes.h)} while dissolved CO₂ changed by ${fmtPct(changes.co2)} — and why carbonate has changed by ${fmtPct(changes.co3)}.`,
    net: `Add the steps and the protons cancel: absorbing CO₂ consumes carbonate. Carbonate is what shells are built from — and what let the water absorb CO₂ in the first place, so each tonne taken up makes the next one harder. Revelle factor: ${revellePre.toFixed(1)} in 1750, ${revelleNow.toFixed(1)} now.`,
  };
  const active = STEPS.find((s) => s.key === step)!;
  const highlighted = HIGHLIGHT[step];
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const rows = [
    { key: "co2", label: "CO₂(aq)", value: `${umol(now.co2aq)} µmol/kg`, change: changes.co2 },
    {
      key: "h",
      label: "H⁺",
      value: `${(Math.pow(10, -now.pH) * 1e9).toFixed(1)} nmol/kg`,
      change: changes.h,
    },
    { key: "hco3", label: "HCO₃⁻", value: `${umol(now.hco3)} µmol/kg`, change: changes.hco3 },
    { key: "co3", label: "CO₃²⁻", value: `${umol(now.co3)} µmol/kg`, change: changes.co3 },
  ];
  // Ratio to 1750 on a log axis: halving and doubling get equal length.
  const L = Math.log2(10);
  const barX = (change: number) => Math.log2(Math.max(0.1, Math.min(10, 1 + change / 100))) / L;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
        2 · What the dissolved CO₂ does next
      </h3>
      <div className="mb-5 grid grid-cols-4 gap-1.5" role="tablist" aria-label="Absorption steps">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={step === s.key}
            onClick={() => onStep(s.key)}
            className={`rounded-md border px-2 py-2 text-left text-[11px] font-semibold transition-colors ${
              step === s.key
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border hover:border-accent hover:text-accent"
            }`}
          >
            <span className="block font-mono text-[9px] opacity-70">STEP {i + 1}</span>
            {s.title}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="rounded-lg border border-border bg-background/40 p-4">
        <div className="font-mono text-base font-bold md:text-lg">{active.eq}</div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{explain[step]}</p>
        <div className="mt-3 flex justify-between">
          <button
            type="button"
            disabled={stepIndex === 0}
            onClick={() => onStep(STEPS[stepIndex - 1]!.key)}
            className="text-xs font-semibold text-accent disabled:opacity-30"
          >
            ← Back
          </button>
          <button
            type="button"
            disabled={stepIndex === STEPS.length - 1}
            onClick={() => onStep(STEPS[stepIndex + 1]!.key)}
            className="text-xs font-semibold text-accent disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-[11px] font-medium text-muted-foreground">
          <span>
            Change since 1750 (pH {pre.pH.toFixed(2)} → {now.pH.toFixed(2)})
          </span>
          <span>log scale</span>
        </div>
        <svg
          viewBox="0 0 400 138"
          className="h-auto w-full"
          role="img"
          aria-label="Change in each species since 1750"
        >
          {[0.1, 0.25, 0.5, 1, 2, 4, 10].map((r) => {
            const x = 250 + (Math.log2(r) / L) * 110;
            return (
              <g key={r}>
                <line
                  x1={x}
                  y1={4}
                  x2={x}
                  y2={116}
                  stroke={r === 1 ? "var(--fig-axis)" : "var(--fig-grid)"}
                  strokeWidth={r === 1 ? 1.5 : 1}
                />
                <text
                  x={x}
                  y={130}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={8.5}
                >
                  {r === 1 ? "1750" : r < 1 ? `×${r}` : `×${r}`}
                </text>
              </g>
            );
          })}
          {rows.map((r, i) => {
            const y = 10 + i * 27;
            const on = highlighted.includes(r.key);
            const v = barX(r.change) * 110;
            return (
              <g key={r.key} opacity={on ? 1 : 0.3}>
                <text x={0} y={y + 11} className="fill-foreground" fontSize={11} fontWeight={700}>
                  {r.label}
                </text>
                <text x={52} y={y + 11} className="fill-muted-foreground font-mono" fontSize={9}>
                  {r.value}
                </text>
                <rect
                  x={v >= 0 ? 250 : 250 + v}
                  y={y + 1}
                  width={Math.max(Math.abs(v), 1)}
                  height={14}
                  rx={2}
                  fill={r.change >= 0 ? "var(--fig-1)" : "var(--fig-2)"}
                />
                <text
                  x={v >= 0 ? 250 + v + 4 : 250 + v - 4}
                  y={y + 12}
                  textAnchor={v >= 0 ? "start" : "end"}
                  className="fill-foreground font-mono"
                  fontSize={9}
                  fontWeight={600}
                >
                  {fmtPct(r.change)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function Shell({ omega, tone }: { omega: number; tone: string }) {
  const health = Math.max(0, Math.min(1, (omega - 0.5) / 3.5));
  const pts = Array.from({ length: 90 }, (_, i) => {
    const th = (i / 89) * 3.4 * Math.PI;
    const r = 4.6 * Math.exp(0.235 * th);
    return { x: 80 + r * Math.cos(th), y: 70 + r * Math.sin(th) };
  });
  const pitCount = omega < 1 ? Math.round(Math.min(1, (1 - omega) / 0.6) * 14) : 0;
  const pits = pts.filter((_, i) => i > 30 && i % 4 === 0).slice(0, pitCount);
  const last = pts[pts.length - 1]!;
  return (
    <svg viewBox="0 0 160 140" className="h-auto w-32 shrink-0" aria-hidden="true">
      <path
        d={pathFrom(pts)}
        fill="none"
        stroke={tone}
        strokeWidth={1.2 + health * 4}
        strokeLinecap="round"
        opacity={0.4 + 0.6 * Math.min(1, omega / 2)}
      />
      {pts
        .filter((_, i) => i > 20 && i % 9 === 0)
        .map((p, i) => (
          <line
            key={i}
            x1={80 + (p.x - 80) * 0.72}
            y1={70 + (p.y - 70) * 0.72}
            x2={p.x}
            y2={p.y}
            stroke={tone}
            strokeWidth={0.8 + health}
            opacity={0.35 + 0.4 * health}
          />
        ))}
      {pits.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={2.4}
          className="fill-card"
          stroke={tone}
          strokeWidth={0.8}
        />
      ))}
      <circle
        cx={last.x}
        cy={last.y}
        r={4}
        fill="none"
        stroke={tone}
        strokeWidth={1.2}
        strokeDasharray={omega < 1 ? "2 2" : undefined}
      />
    </svg>
  );
}

function ConsequencesPanel({
  airPpm,
  now,
  pre,
  waterId,
  status,
  revelleNow,
  revellePre,
}: {
  airPpm: number;
  now: CarbonateState;
  pre: CarbonateState;
  waterId: WaterMassId;
  status: ReturnType<typeof shellStatus>;
  revelleNow: number;
  revellePre: number;
}) {
  const px = 34,
    py = 10,
    pw = 250,
    ph = 140;
  const oMax = 6.5;
  const xOf = (ppm: number) => px + (Math.log(ppm / MIN_PPM) / LOG_SPAN) * pw;
  const yOf = (o: number) => py + ph - (Math.min(o, oMax) / oMax) * ph;
  const tickPpm = [180, 280, 430, 1000, 2400];

  const gauges = [
    {
      label: "Ω aragonite",
      who: "corals, pteropods",
      value: now.omegaAragonite,
      prev: pre.omegaAragonite,
    },
    {
      label: "Ω calcite",
      who: "coccolithophores, forams",
      value: now.omegaCalcite,
      prev: pre.omegaCalcite,
    },
  ];
  const gMax = 7;

  const comp = (s: CarbonateState) => [
    { key: "co2", frac: s.co2aq / s.dic, color: "var(--fig-1)" },
    { key: "hco3", frac: s.hco3 / s.dic, color: "var(--fig-2)" },
    { key: "co3", frac: s.co3 / s.dic, color: "var(--fig-3)" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-5 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
        3 · What it does to shell-builders
      </h3>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-4">
            <Shell omega={now.omegaAragonite} tone={status.tone} />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Aragonite shell
              </div>
              <div className="text-lg font-bold" style={{ color: status.tone }}>
                {status.label}
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{status.text}</p>

          <div className="mt-4 space-y-3">
            {gauges.map((g) => (
              <div key={g.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>
                    <span className="font-semibold">{g.label}</span>{" "}
                    <span className="text-muted-foreground">· {g.who}</span>
                  </span>
                  <span className="font-mono tabular-nums">{g.value.toFixed(2)}</span>
                </div>
                <div className="relative h-2.5 rounded-full bg-secondary">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${(Math.min(g.value, gMax) / gMax) * 100}%`,
                      background: g.value >= 1 ? "var(--fig-3)" : "var(--fig-1)",
                    }}
                  />
                  <div
                    className="absolute -top-1 h-4.5 w-px bg-foreground"
                    style={{ left: `${(1 / gMax) * 100}%` }}
                    title="Ω = 1"
                  />
                  <div
                    className="absolute -top-0.5 h-3.5 w-0.5 rounded bg-muted-foreground/60"
                    style={{ left: `${(Math.min(g.prev, gMax) / gMax) * 100}%` }}
                    title="1750"
                  />
                </div>
              </div>
            ))}
            <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
              Ω = [Ca²⁺][CO₃²⁻] / Ksp. Black tick: Ω = 1, below which the mineral dissolves. Grey
              tick: 1750. Aragonite is ~50% more soluble, so it fails first.
            </p>
          </div>
        </div>

        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            Ω aragonite vs atmospheric CO₂
          </div>
          <svg
            viewBox="0 0 300 186"
            className="h-auto w-full"
            role="img"
            aria-label="Aragonite saturation against atmospheric CO2 for tropical, temperate and polar water. Polar water crosses below one first."
          >
            <Axes
              x={px}
              y={py}
              w={pw}
              h={ph}
              xLabel="atmospheric CO₂ (ppm, log)"
              xTicks={tickPpm.map((p) => ({
                at: Math.log(p / MIN_PPM) / LOG_SPAN,
                label: String(p),
              }))}
              yTicks={[0, 1, 2, 3, 4, 5, 6].map((o) => ({ at: o / oMax, label: String(o) }))}
            />
            <rect
              x={px}
              y={yOf(1)}
              width={pw}
              height={py + ph - yOf(1)}
              fill="var(--fig-1)"
              fillOpacity={0.1}
            />
            <line
              x1={px}
              y1={yOf(1)}
              x2={px + pw}
              y2={yOf(1)}
              stroke="var(--fig-1)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text x={px + 4} y={yOf(1) + 11} className="fill-muted-foreground" fontSize={8}>
              Ω &lt; 1: corrosive
            </text>
            {OMEGA_CURVES.map((c) => (
              <path
                key={c.id}
                d={pathFrom(c.points.map((p) => ({ x: xOf(p.ppm), y: yOf(p.omega) })))}
                fill="none"
                stroke={WATER_COLOR[c.id]}
                strokeWidth={c.id === waterId ? 2.5 : 1.25}
                opacity={c.id === waterId ? 1 : 0.45}
              />
            ))}
            {OMEGA_CURVES.filter((c) => c.crossesAt <= MAX_PPM).map((c) => (
              <circle
                key={c.id}
                cx={xOf(c.crossesAt)}
                cy={yOf(1)}
                r={2.5}
                fill={WATER_COLOR[c.id]}
              />
            ))}
            <line
              x1={xOf(airPpm)}
              y1={py}
              x2={xOf(airPpm)}
              y2={py + ph}
              stroke="var(--fig-axis)"
              strokeWidth={1}
            />
            <circle
              cx={xOf(airPpm)}
              cy={yOf(now.omegaAragonite)}
              r={4.5}
              fill={WATER_COLOR[waterId]}
              stroke="var(--card)"
              strokeWidth={1.5}
            />
          </svg>
          <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
            {OMEGA_CURVES.map((c) => {
              const w = WATER_MASSES.find((m) => m.id === c.id)!;
              return (
                <li key={c.id} className="flex items-center gap-2">
                  <span
                    className="inline-block h-0.5 w-4"
                    style={{ background: WATER_COLOR[c.id] }}
                  />
                  <span className={c.id === waterId ? "font-semibold text-foreground" : ""}>
                    {w.label}
                  </span>
                  <span className="ml-auto font-mono">
                    Ω &lt; 1 at{" "}
                    {c.crossesAt <= MAX_PPM
                      ? `~${Math.round(c.crossesAt / 10) * 10} ppm`
                      : `> ${MAX_PPM} ppm`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-6 border-t border-border pt-5 md:grid-cols-2">
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            Where the dissolved carbon sits
          </div>
          {[
            { label: "1750", s: pre },
            { label: "Now", s: now },
          ].map((row) => (
            <div
              key={row.label}
              className="mb-2 grid grid-cols-[40px_1fr] items-center gap-2 text-xs"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <div className="flex h-4 overflow-hidden rounded">
                {comp(row.s).map((seg) => (
                  <div
                    key={seg.key}
                    style={{ width: `${seg.frac * 100}%`, background: seg.color }}
                    className="flex items-center justify-end pr-1 font-mono text-[9px] text-white"
                  >
                    {seg.frac > 0.07 ? `${(seg.frac * 100).toFixed(0)}%` : ""}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            More total carbon, but a shrinking carbonate share: the trade the net reaction
            describes.
          </p>
        </div>
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            The buffer being spent
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-2xl font-bold tabular-nums">
              {revelleNow.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              Revelle factor (1750: {revellePre.toFixed(1)})
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            A 1% rise in dissolved carbon now raises the water's CO₂ pressure by about{" "}
            {revelleNow.toFixed(0)}%. The higher this climbs, the less each extra ppm in the air can
            push into the sea.
          </p>
        </div>
      </div>

      <p className="mt-5 font-mono text-[10px] leading-relaxed text-muted-foreground">
        Model: well-mixed surface water, total alkalinity 2300 µmol/kg, equilibrium constants from
        the standard CO2SYS set (Lueker 2000, Mucci 1983). Real waters vary with upwelling, rivers
        and biology — the trends are robust; exact numbers are regional.
      </p>
    </div>
  );
}

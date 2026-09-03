import { useMemo, useState } from "react";

// Same acid/base math as TitrationSim, but played as a game: the numeric
// pH and the curve are hidden. The only feedback is the flask's indicator
// color and the volume counter, exactly like doing this at a real bench —
// you call the endpoint by eye, then find out how close you were.
type Indicator = {
  name: string;
  low: string;
  high: string;
  rangeLow: number;
  rangeHigh: number;
};

const INDICATORS: Indicator[] = [
  { name: "Phenolphthalein", low: "transparent", high: "#e879b9", rangeLow: 8.2, rangeHigh: 10.0 },
  { name: "Bromothymol blue", low: "#eab308", high: "#3b82f6", rangeLow: 6.0, rangeHigh: 7.6 },
  { name: "Methyl orange", low: "#ef4444", high: "#f59e0b", rangeLow: 3.1, rangeHigh: 4.4 },
];

type Round = { pKa: number | null; indicator: Indicator };

function randomRound(): Round {
  const strong = Math.random() < 0.35;
  const indicator = INDICATORS[Math.floor(Math.random() * INDICATORS.length)]!;
  return { pKa: strong ? null : 2.5 + Math.random() * 6, indicator };
}

const acidMol = 0.025; // 25 mL of 1.0 M
const baseConc = 1.0;

function phAt(v: number, pKa: number | null) {
  const baseMol = (v / 1000) * baseConc;
  const totalV = (25 + v) / 1000;
  if (pKa === null) {
    if (baseMol < acidMol) return -Math.log10(Math.max(1e-9, (acidMol - baseMol) / totalV));
    if (Math.abs(baseMol - acidMol) < 1e-9) return 7;
    return 14 + Math.log10((baseMol - acidMol) / totalV);
  }
  if (baseMol <= 1e-9) return 0.5 * (pKa - Math.log10(acidMol / totalV));
  if (baseMol < acidMol) return pKa + Math.log10(baseMol / (acidMol - baseMol));
  if (Math.abs(baseMol - acidMol) < 1e-9) {
    const cb = acidMol / totalV;
    return 7 + 0.5 * pKa + 0.5 * Math.log10(cb);
  }
  return 14 + Math.log10((baseMol - acidMol) / totalV);
}

function equivalenceVolume() {
  return (acidMol / baseConc) * 1000; // always 25 mL given the fixed concentrations above
}

function mix(hex1: string, hex2: string, t: number) {
  if (hex1 === "transparent") hex1 = "#f8fafc";
  if (hex2 === "transparent") hex2 = "#f8fafc";
  const c1 = [1, 3, 5].map((i) => parseInt(hex1.slice(i, i + 2), 16));
  const c2 = [1, 3, 5].map((i) => parseInt(hex2.slice(i, i + 2), 16));
  const c = c1.map((v, i) => Math.round(v + (c2[i]! - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function BlindTitrationSim() {
  const [round, setRound] = useState<Round>(() => randomRound());
  const [volume, setVolume] = useState(0);
  const [dropId, setDropId] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);

  const ph = Math.max(0, Math.min(14, phAt(volume, round.pKa)));
  const { indicator } = round;
  const t = clamp01((ph - indicator.rangeLow) / (indicator.rangeHigh - indicator.rangeLow));
  const liquidColor = mix(indicator.low, indicator.high, t);

  const trueEquivalence = equivalenceVolume();
  const revealed = guess !== null;

  const path = useMemo(() => {
    const pts: string[] = [];
    for (let v = 0; v <= 50; v += 0.25) {
      const y = 100 - (Math.max(0, Math.min(14, phAt(v, round.pKa))) / 14) * 100;
      const x = (v / 50) * 100;
      pts.push(`${v === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return pts.join(" ");
  }, [round.pKa]);

  const addVolume = (amount: number) => {
    if (revealed) return;
    setVolume((v) => Math.min(50, Math.round((v + amount) * 100) / 100));
    setDropId((d) => d + 1);
  };

  const callEndpoint = () => setGuess(volume);

  const newRound = () => {
    setRound(randomRound());
    setVolume(0);
    setGuess(null);
    setDropId((d) => d + 1);
  };

  const error = revealed ? Math.abs((guess ?? 0) - trueEquivalence) : 0;
  const grade =
    error < 0.5 ? "Excellent" : error < 1.5 ? "Good" : error < 3 ? "Fair" : "Keep practicing";

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {indicator.name} — identity of the acid is hidden
            </span>
            <span className="font-mono text-xs text-accent">{volume.toFixed(2)} mL added</span>
          </div>

          <div className="flex flex-col items-center gap-4">
            <svg viewBox="0 0 120 60" className="h-16 w-32">
              <rect x="56" y="0" width="8" height="30" fill="var(--border)" />
              <rect x="50" y="0" width="20" height="10" rx="2" fill="var(--muted-foreground)" />
              <circle
                key={dropId}
                cx="60"
                cy="34"
                r="2.4"
                fill={liquidColor}
                className="drop-fall"
              />
            </svg>

            <svg viewBox="0 0 100 110" className="h-64 w-48">
              <path
                d="M35,5 L35,40 L12,95 Q10,102 18,102 L82,102 Q90,102 88,95 L65,40 L65,5 Z"
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="2"
              />
              <clipPath id="flask-clip">
                <path d="M35,40 L18,88 Q16,100 22,100 L78,100 Q84,100 82,88 L65,40 Z" />
              </clipPath>
              <rect
                x="10"
                y="40"
                width="80"
                height="65"
                fill={liquidColor}
                clipPath="url(#flask-clip)"
                style={{ transition: "fill 0.5s ease" }}
              />
              <rect x="30" y="2" width="10" height="6" fill="var(--foreground)" />
              <rect x="60" y="2" width="10" height="6" fill="var(--foreground)" />
            </svg>

            {!revealed ? (
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => addVolume(1)}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-accent"
                >
                  + 1 mL
                </button>
                <button
                  onClick={() => addVolume(0.1)}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-accent"
                >
                  + 0.1 mL
                </button>
                <button
                  onClick={callEndpoint}
                  className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent"
                >
                  This is the endpoint!
                </button>
              </div>
            ) : (
              <div className="w-full max-w-md space-y-4 text-center">
                <p className="font-mono text-sm uppercase tracking-widest text-accent">{grade}</p>
                <p className="text-sm text-muted-foreground">
                  You called it at{" "}
                  <span className="font-bold text-foreground">{volume.toFixed(2)} mL</span>. The
                  true equivalence point was{" "}
                  <span className="font-bold text-foreground">{trueEquivalence.toFixed(2)} mL</span>{" "}
                  (error {error.toFixed(2)} mL). This was a {round.pKa === null ? "strong" : "weak"}{" "}
                  acid
                  {round.pKa !== null ? ` (pKa ${round.pKa.toFixed(2)})` : ""}.
                </p>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full">
                  {[0, 25, 50, 75, 100].map((g) => (
                    <line
                      key={g}
                      x1="0"
                      y1={g}
                      x2="100"
                      y2={g}
                      stroke="var(--border)"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  <path
                    d={path}
                    fill="none"
                    stroke="var(--foreground)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1={(trueEquivalence / 50) * 100}
                    y1="0"
                    x2={(trueEquivalence / 50) * 100}
                    y2="100"
                    stroke="var(--accent)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={((guess ?? 0) / 50) * 100}
                    cy={100 - (ph / 14) * 100}
                    r="1.6"
                    fill="var(--destructive, #ef4444)"
                  />
                </svg>
                <button
                  onClick={newRound}
                  className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent"
                >
                  New round
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest">
            How to play
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Add titrant a little at a time and watch the flask's color, not a number. When you think
            the indicator has finished changing, call the endpoint. The pH and curve stay hidden
            until you do — exactly like reading a real titration by eye.
          </p>
        </div>
        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">
            The color change is not instant at exactly the equivalence point — it happens over the
            indicator's pH range. Choosing an indicator whose range falls inside the steepest part
            of the jump is what makes a titration accurate.
          </p>
          <div className="font-mono text-xs text-accent">— Indicator selection</div>
        </div>
      </aside>
    </div>
  );
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

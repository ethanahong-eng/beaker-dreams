import { useMemo, useState } from "react";

// Maxwell-Boltzmann style energy distribution with an activation-energy threshold.
export function RateSim() {
  const [temp, setTemp] = useState(320);
  const [ea, setEa] = useState(40);
  const [catalyst, setCatalyst] = useState(false);

  const effectiveEa = catalyst ? ea * 0.6 : ea;

  const { path, fraction, threshold } = useMemo(() => {
    const points: string[] = [];
    const scale = temp / 300;
    const peak = 22 * scale;
    let total = 0;
    let above = 0;
    const vals: number[] = [];
    for (let e = 0; e <= 100; e += 1) {
      const v = (e / (peak * peak)) * Math.exp(-(e * e) / (2 * peak * peak)) * 100;
      vals.push(v);
      total += v;
      if (e >= effectiveEa) above += v;
    }
    const max = Math.max(...vals);
    vals.forEach((v, i) => {
      const x = (i / 100) * 100;
      const y = 100 - (v / max) * 92;
      points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
    });
    return { path: points.join(" "), fraction: above / total, threshold: effectiveEa };
  }, [temp, effectiveEa]);

  const rate = (fraction * 1000).toFixed(1);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Molecular energy distribution
            </span>
            <span className="font-mono text-xs text-accent">{(fraction * 100).toFixed(1)}% above Ea</span>
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-64 w-full">
            <defs>
              <clipPath id="above-ea">
                <rect x={threshold} y="0" width={100 - threshold} height="100" />
              </clipPath>
            </defs>
            <path d={`${path} L100,100 L0,100 Z`} fill="var(--secondary)" />
            <path
              d={`${path} L100,100 L0,100 Z`}
              fill="var(--accent)"
              opacity="0.35"
              clipPath="url(#above-ea)"
            />
            <path d={path} fill="none" stroke="var(--foreground)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
            <line
              x1={threshold}
              y1="0"
              x2={threshold}
              y2="100"
              stroke="var(--accent)"
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="mt-2 flex justify-between font-mono text-[10px] uppercase text-muted-foreground">
            <span>Low energy</span>
            <span>Activation energy Ea</span>
            <span>High energy</span>
          </div>
        </div>
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest">Rate controls</h3>
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
                aria-label="Temperature"
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
                aria-label="Activation energy"
                onChange={(e) => setEa(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <span
                className={`relative h-5 w-10 rounded-full transition-colors ${catalyst ? "bg-accent" : "bg-input"}`}
                onClick={() => setCatalyst((c) => !c)}
              >
                <span
                  className={`absolute top-1 h-3 w-3 rounded-full bg-card transition-all ${catalyst ? "right-1" : "left-1"}`}
                />
              </span>
              <span className="text-xs font-bold uppercase">Add catalyst</span>
            </label>
          </div>
          <hr className="my-8 border-border" />
          <div className="rounded-lg border border-border p-4">
            <span className="block font-mono text-[10px] uppercase text-muted-foreground">Relative rate</span>
            <span className="font-mono text-2xl font-bold">{rate}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

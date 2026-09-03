import { useMemo, useState } from "react";

// Strong-base into weak/strong acid titration curve.
export function TitrationSim() {
  const [volume, setVolume] = useState(0); // mL of NaOH added
  const [pKa, setPKa] = useState(4.76);
  const [strong, setStrong] = useState(false);

  const acidMol = 0.025; // 25 mL of 1.0 M
  const baseConc = 1.0;

  const phAt = useMemo(() => {
    return (v: number) => {
      const baseMol = (v / 1000) * baseConc;
      const totalV = (25 + v) / 1000;
      if (strong) {
        if (baseMol < acidMol) return -Math.log10((acidMol - baseMol) / totalV);
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
    };
  }, [pKa, strong]);

  const ph = Math.max(0, Math.min(14, phAt(volume)));

  const path = useMemo(() => {
    const pts: string[] = [];
    for (let v = 0; v <= 50; v += 0.25) {
      const y = 100 - (Math.max(0, Math.min(14, phAt(v))) / 14) * 100;
      const x = (v / 50) * 100;
      pts.push(`${v === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return pts.join(" ");
  }, [phAt]);

  const phColor = ph < 4 ? "bg-destructive" : ph < 9 ? "bg-accent" : "bg-primary";

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Titration curve — 25 mL acid vs 1.0 M NaOH
            </span>
            <span className="font-mono text-xs text-accent">pH {ph.toFixed(2)}</span>
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-64 w-full">
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
              x1={(volume / 50) * 100}
              y1="0"
              x2={(volume / 50) * 100}
              y2="100"
              stroke="var(--accent)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={(volume / 50) * 100}
              cy={100 - (ph / 14) * 100}
              r="1.4"
              fill="var(--accent)"
            />
          </svg>
          <div className="mt-2 flex justify-between font-mono text-[10px] uppercase text-muted-foreground">
            <span>0 mL</span>
            <span>equivalence at 25 mL</span>
            <span>50 mL</span>
          </div>
        </div>
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest">
            Burette controls
          </h3>
          <div className="space-y-8">
            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Titrant added</span>
                <span className="font-mono text-accent">{volume.toFixed(1)} mL</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={0.5}
                value={volume}
                aria-label="Titrant added"
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
            </div>
            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Acid pKa</span>
                <span className="font-mono text-accent">{strong ? "—" : pKa.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={2}
                max={7}
                step={0.01}
                value={pKa}
                disabled={strong}
                aria-label="Acid pKa"
                onChange={(e) => setPKa(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)] disabled:opacity-40"
              />
            </div>
            <label
              className="flex cursor-pointer items-center gap-3"
              onClick={() => setStrong((s) => !s)}
            >
              <span
                className={`relative h-5 w-10 rounded-full transition-colors ${strong ? "bg-accent" : "bg-input"}`}
              >
                <span
                  className={`absolute top-1 h-3 w-3 rounded-full bg-card transition-all ${strong ? "right-1" : "left-1"}`}
                />
              </span>
              <span className="text-xs font-bold uppercase">Use strong acid</span>
            </label>
          </div>
          <hr className="my-8 border-border" />
          <div className="space-y-2">
            <span className="block font-mono text-[10px] uppercase text-muted-foreground">
              Solution pH
            </span>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div
                className={`h-2 rounded-full ${phColor}`}
                style={{ width: `${(ph / 14) * 100}%` }}
              />
            </div>
            <span className="font-mono text-2xl font-bold">{ph.toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

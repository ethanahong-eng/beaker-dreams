import { useMemo, useState } from "react";

// A macro-scale cost-benefit simulation: how much SO2 a coal-fired power
// plant's smokestack releases, what a flue-gas desulfurization (FGD)
// "scrubber" costs to run, and what that spending is actually buying —
// framed as one chemical reaction turning unwanted SO2 into inert gypsum,
// weighed against the atmospheric chemistry (SO2 -> SO3 -> H2SO4) that
// happens to whatever SO2 the scrubber doesn't catch. Dollar figures are
// illustrative teaching estimates, not a specific plant's real economics
// — the point is the shape of the tradeoff, not a precise number.

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

const fmtTons = (n: number) => `${n.toFixed(0)} t/day`;

export function EmissionsScrubbingSim() {
  const [emissionRate, setEmissionRate] = useState(250);
  const [efficiency, setEfficiency] = useState(90);
  const [scrubCostPerTon, setScrubCostPerTon] = useState(900);
  const [externalityPerTon, setExternalityPerTon] = useState(6000);

  const derived = useMemo(() => {
    const removed = emissionRate * (efficiency / 100);
    const released = emissionRate - removed;
    const dailyScrubCost = removed * scrubCostPerTon;
    const dailyAvoided = removed * externalityPerTon;
    const dailyNet = dailyAvoided - dailyScrubCost;
    return { removed, released, dailyScrubCost, dailyAvoided, dailyNet };
  }, [emissionRate, efficiency, scrubCostPerTon, externalityPerTon]);

  const chartMax = Math.max(
    derived.dailyScrubCost,
    derived.dailyAvoided,
    Math.abs(derived.dailyNet),
    1,
  );
  const baseline = 50;
  const maxBar = 44;
  const barHeight = (v: number) => (Math.abs(v) / chartMax) * maxBar;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Two reactions, one smokestack
          </h3>
          <svg viewBox="0 0 320 150" className="h-auto w-full">
            <defs>
              <polygon id="arrowhead-muted" points="0 0, 6 3, 0 6" fill="var(--muted-foreground)" />
              <polygon id="arrowhead-accent" points="0 0, 6 3, 0 6" fill="var(--accent)" />
            </defs>

            {/* Unscrubbed path: SO2 -> SO3 -> H2SO4 (acid rain) */}
            <text x="4" y="16" className="font-mono text-[9px]" fill="var(--muted-foreground)">
              RELEASED, {fmtTons(derived.released)}
            </text>
            <rect x="4" y="24" width="60" height="28" rx="4" fill="none" stroke="var(--border)" />
            <text
              x="34"
              y="42"
              textAnchor="middle"
              fill="var(--foreground)"
              className="text-[11px] font-bold"
            >
              SO₂
            </text>
            <line
              x1="66"
              y1="38"
              x2="104"
              y2="38"
              stroke="var(--muted-foreground)"
              strokeWidth="1.5"
            />
            <use href="#arrowhead-muted" x="102" y="35" />
            <text
              x="85"
              y="30"
              textAnchor="middle"
              className="font-mono text-[7px]"
              fill="var(--muted-foreground)"
            >
              +O₂
            </text>
            <rect x="110" y="24" width="60" height="28" rx="4" fill="none" stroke="var(--border)" />
            <text
              x="140"
              y="42"
              textAnchor="middle"
              fill="var(--foreground)"
              className="text-[11px] font-bold"
            >
              SO₃
            </text>
            <line
              x1="172"
              y1="38"
              x2="210"
              y2="38"
              stroke="var(--muted-foreground)"
              strokeWidth="1.5"
            />
            <use href="#arrowhead-muted" x="208" y="35" />
            <text
              x="191"
              y="30"
              textAnchor="middle"
              className="font-mono text-[7px]"
              fill="var(--muted-foreground)"
            >
              +H₂O
            </text>
            <rect
              x="216"
              y="24"
              width="100"
              height="28"
              rx="4"
              fill="none"
              stroke="var(--destructive, #ef4444)"
            />
            <text
              x="266"
              y="42"
              textAnchor="middle"
              fill="var(--destructive, #ef4444)"
              className="text-[11px] font-bold"
            >
              H₂SO₄ (acid rain)
            </text>

            <line x1="4" y1="66" x2="316" y2="66" stroke="var(--border)" strokeDasharray="2 3" />

            {/* Scrubbed path: SO2 + CaCO3 + O2 + H2O -> gypsum + CO2 */}
            <text x="4" y="86" className="font-mono text-[9px]" fill="var(--accent)">
              CAPTURED, {fmtTons(derived.removed)}
            </text>
            <rect x="4" y="94" width="60" height="28" rx="4" fill="none" stroke="var(--border)" />
            <text
              x="34"
              y="112"
              textAnchor="middle"
              fill="var(--foreground)"
              className="text-[11px] font-bold"
            >
              SO₂
            </text>
            <line x1="66" y1="108" x2="104" y2="108" stroke="var(--accent)" strokeWidth="1.5" />
            <use href="#arrowhead-accent" x="102" y="105" />
            <text
              x="85"
              y="100"
              textAnchor="middle"
              className="font-mono text-[7px]"
              fill="var(--accent)"
            >
              +CaCO₃, O₂, H₂O
            </text>
            <rect
              x="110"
              y="94"
              width="100"
              height="28"
              rx="4"
              fill="none"
              stroke="var(--accent)"
            />
            <text
              x="160"
              y="108"
              textAnchor="middle"
              fill="var(--accent)"
              className="text-[10px] font-bold"
            >
              CaSO₄·2H₂O
            </text>
            <text
              x="160"
              y="118"
              textAnchor="middle"
              fill="var(--muted-foreground)"
              className="text-[8px]"
            >
              (gypsum, solid)
            </text>
            <line x1="216" y1="108" x2="254" y2="108" stroke="var(--accent)" strokeWidth="1.5" />
            <use href="#arrowhead-accent" x="252" y="105" />
            <rect x="258" y="94" width="58" height="28" rx="4" fill="none" stroke="var(--border)" />
            <text
              x="287"
              y="112"
              textAnchor="middle"
              fill="var(--foreground)"
              className="text-[11px] font-bold"
            >
              CO₂
            </text>
          </svg>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Every ton of SO₂ a scrubber captures never gets the chance to react with atmospheric
            water into sulfuric acid — instead it reacts with limestone slurry to make solid gypsum,
            a real construction material, plus CO₂. The scrubber doesn't stop the chemistry; it
            redirects it.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Daily cost vs. avoided damage
          </h3>
          <svg viewBox="0 0 100 60" className="h-40 w-full">
            <line
              x1="0"
              y1={baseline}
              x2="100"
              y2={baseline}
              stroke="var(--border)"
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x="12"
              y={baseline - barHeight(derived.dailyScrubCost)}
              width="16"
              height={barHeight(derived.dailyScrubCost)}
              fill="var(--foreground)"
              opacity="0.55"
            />
            <text
              x="20"
              y={baseline + 8}
              textAnchor="middle"
              className="font-mono text-[5px]"
              fill="var(--muted-foreground)"
            >
              Scrub cost
            </text>
            <rect
              x="42"
              y={baseline - barHeight(derived.dailyAvoided)}
              width="16"
              height={barHeight(derived.dailyAvoided)}
              fill="var(--accent)"
            />
            <text
              x="50"
              y={baseline + 8}
              textAnchor="middle"
              className="font-mono text-[5px]"
              fill="var(--muted-foreground)"
            >
              Damage avoided
            </text>
            <rect
              x="72"
              y={derived.dailyNet >= 0 ? baseline - barHeight(derived.dailyNet) : baseline}
              width="16"
              height={barHeight(derived.dailyNet)}
              fill={derived.dailyNet >= 0 ? "rgb(34, 197, 94)" : "var(--destructive, #ef4444)"}
            />
            <text
              x="80"
              y={baseline + 8}
              textAnchor="middle"
              className="font-mono text-[5px]"
              fill="var(--muted-foreground)"
            >
              Net benefit
            </text>
          </svg>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-mono text-lg font-bold">{fmtMoney(derived.dailyScrubCost)}</div>
              <div className="text-[10px] uppercase text-muted-foreground">per day, scrubbing</div>
            </div>
            <div>
              <div className="font-mono text-lg font-bold text-accent">
                {fmtMoney(derived.dailyAvoided)}
              </div>
              <div className="text-[10px] uppercase text-muted-foreground">
                per day, avoided damage
              </div>
            </div>
            <div>
              <div
                className={`font-mono text-lg font-bold ${derived.dailyNet >= 0 ? "text-[rgb(34,197,94)]" : "text-destructive"}`}
              >
                {fmtMoney(derived.dailyNet)}
              </div>
              <div className="text-[10px] uppercase text-muted-foreground">
                per day, net ({fmtMoney(derived.dailyNet * 365)}/yr)
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest">
            Plant controls
          </h3>
          <div className="space-y-8">
            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Stack SO₂ emission rate</span>
                <span className="font-mono text-accent">{fmtTons(emissionRate)}</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                value={emissionRate}
                aria-label="Stack SO2 emission rate"
                onChange={(e) => setEmissionRate(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
            </div>
            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Scrubber efficiency</span>
                <span className="font-mono text-accent">{efficiency}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={98}
                value={efficiency}
                aria-label="Scrubber efficiency"
                onChange={(e) => setEfficiency(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                Real wet-limestone scrubbers top out around 95–98% — some SO₂ always slips through.
              </p>
            </div>
            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Scrubbing cost</span>
                <span className="font-mono text-accent">${scrubCostPerTon}/ton</span>
              </div>
              <input
                type="range"
                min={400}
                max={2000}
                step={50}
                value={scrubCostPerTon}
                aria-label="Scrubbing cost per ton removed"
                onChange={(e) => setScrubCostPerTon(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
            </div>
            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Estimated damage avoided</span>
                <span className="font-mono text-accent">${externalityPerTon}/ton</span>
              </div>
              <input
                type="range"
                min={2000}
                max={12000}
                step={250}
                value={externalityPerTon}
                aria-label="Estimated health and acid rain damage cost avoided per ton"
                onChange={(e) => setExternalityPerTon(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                An illustrative estimate of the health and environmental cost of a ton of SO₂ that
                reaches the atmosphere — real figures vary widely by region and study.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">
            Scrubbing isn't free, and it's never total — but because sulfuric acid's damage (crop
            loss, respiratory illness, corroded infrastructure) usually costs society far more per
            ton than the scrubber does, running one is a net win almost everywhere on this slider,
            not just at the extremes.
          </p>
          <div className="font-mono text-xs text-accent">— Cost-benefit analysis</div>
        </div>
      </aside>
    </div>
  );
}

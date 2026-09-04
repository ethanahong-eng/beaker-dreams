import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  initialDomains,
  relaxStep,
  maxDisplacement,
  electronGeometryName,
  molecularGeometryName,
  bondAngleFromDomains,
  DEFAULT_LONE_PAIR_WEIGHT,
  type Domain,
} from "@/lib/vsepr";
import {
  HYBRID_TYPES,
  HYBRID_ORDER,
  ORBITAL_ENERGY,
  hybridEnergy,
  type HybridType,
} from "@/lib/hybridization";
import { rotate3d } from "@/lib/project3d";
import { AxisGizmo } from "@/components/AxisGizmo";

export function HybridizationSim() {
  const [hybridType, setHybridType] = useState<HybridType>("sp3");
  const [lonePairs, setLonePairs] = useState(0);
  const [lonePairWeight, setLonePairWeight] = useState(DEFAULT_LONE_PAIR_WEIGHT);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [yaw, setYaw] = useState(0.6);
  const [pitch, setPitch] = useState(0.3);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const info = HYBRID_TYPES[hybridType];
  const bondingCount = info.domains - lonePairs;

  // Changing hybridization type changes how many total domains there are
  // to split between bonds and lone pairs, so clamp rather than let the
  // lone pair count outrun the new (possibly smaller) total.
  useEffect(() => {
    setLonePairs((l) => Math.min(l, info.domains - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hybridType]);

  // Same electron-domain repulsion physics as the VSEPR builder -- this
  // view is deliberately abstract (generic bonding/lone spheres, not real
  // atoms) since hybridization is a property of the central atom's
  // orbitals, not of which specific atoms happen to be attached.
  useEffect(() => {
    let raf = 0;
    let current = initialDomains(bondingCount, lonePairs);
    setDomains(current);
    const step = () => {
      const next = relaxStep(current, 0.06, lonePairWeight);
      const delta = maxDisplacement(current, next);
      current = next;
      setDomains(current);
      if (delta > 0.0005) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [bondingCount, lonePairs, lonePairWeight]);

  const molecularName = molecularGeometryName(bondingCount, lonePairs);
  const electronName = electronGeometryName(bondingCount, lonePairs);
  const angle = bondAngleFromDomains(domains);

  const project = (d: Domain) => {
    const [x1, y1, z2] = rotate3d(d.pos, yaw, pitch);
    const scale = 1 / (2 - z2 * 0.6);
    return { x: x1 * scale, y: y1 * scale, z: z2, scale };
  };
  const projected = domains.map((d, i) => ({ d, i, p: project(d) })).sort((a, b) => a.p.z - b.p.z);

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    setYaw((y) => y + dx * 0.01);
    setPitch((p) => Math.max(-1.4, Math.min(1.4, p - dy * 0.01)));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const leftoverNote =
    info.leftoverP > 0
      ? `${info.leftoverP} unhybridized p orbital${info.leftoverP === 1 ? "" : "s"} stay pure — that's exactly what forms the π bond(s) in a double or triple bond, and why they can't rotate freely.`
      : info.leftoverD > 0
        ? `${info.leftoverD} d orbitals stay unhybridized here — the ${info.label} set only promotes as many as it needs to reach ${info.domains} equivalent directions.`
        : `Every available p orbital goes into the mix — sp³ has no leftover p orbital, which is why every bond off a saturated carbon is a single bond.`;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Hybridization
          </span>
          <p className="text-2xl font-bold">
            {info.label}
            <span className="text-accent"> · </span>
            {molecularName !== "—" ? molecularName : electronName}
          </p>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <svg
            viewBox="0 0 300 300"
            className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <circle cx="150" cy="150" r="14" fill="var(--foreground)" />
            {projected.map(({ d, i, p }) => {
              const x = 150 + p.x * 110;
              const y = 150 + p.y * 110;
              const r = 8 * p.scale;
              if (d.kind === "bond") {
                return (
                  <g key={i}>
                    <line
                      x1="150"
                      y1="150"
                      x2={x}
                      y2={y}
                      stroke="var(--muted-foreground)"
                      strokeWidth={2 * p.scale}
                    />
                    <circle cx={x} cy={y} r={r} fill="var(--accent)" />
                  </g>
                );
              }
              const perpX = -(y - 150) / 110;
              const perpY = (x - 150) / 110;
              return (
                <g key={i}>
                  <circle
                    cx={x + perpX * 5}
                    cy={y + perpY * 5}
                    r={r * 0.55}
                    fill="rgba(148, 163, 184, 0.8)"
                  />
                  <circle
                    cx={x - perpX * 5}
                    cy={y - perpY * 5}
                    r={r * 0.55}
                    fill="rgba(148, 163, 184, 0.8)"
                  />
                </g>
              );
            })}
            <AxisGizmo yaw={yaw} pitch={pitch} cx={40} cy={40} radius={22} />
          </svg>
          <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Drag to rotate
          </p>
        </div>

        <EnergyDiagram hybridType={hybridType} />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Hybridization
            </span>
            <span className="font-mono text-base font-bold text-accent">{info.label}</span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Electron geometry
            </span>
            <span className="font-mono text-base font-bold">{electronName}</span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Molecular shape
            </span>
            <span className="font-mono text-base font-bold">{molecularName}</span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Bond angle
            </span>
            <span className="font-mono text-base font-bold">
              {angle ? `${angle.toFixed(1)}°` : "—"}
            </span>
          </div>
        </div>
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest">
            Hybridization type
          </h3>
          <div className="space-y-2">
            {HYBRID_ORDER.map((t) => (
              <button
                key={t}
                onClick={() => setHybridType(t)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                  hybridType === t
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:bg-secondary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold">{HYBRID_TYPES[t].label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {HYBRID_TYPES[t].domains} domains
                  </span>
                </div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {HYBRID_TYPES[t].example}
                </div>
              </button>
            ))}
          </div>

          <hr className="my-6 border-border" />

          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between text-xs font-medium">
                <span>Lone pairs</span>
                <span className="font-mono text-accent">{lonePairs}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setLonePairs((l) => Math.max(0, l - 1))}
                  disabled={lonePairs <= 0}
                  className="flex-1 rounded-lg border border-border py-2 text-sm font-bold transition-colors hover:bg-secondary disabled:opacity-30"
                >
                  −
                </button>
                <button
                  onClick={() => setLonePairs((l) => Math.min(info.domains - 1, l + 1))}
                  disabled={lonePairs >= info.domains - 1}
                  className="flex-1 rounded-lg border border-border py-2 text-sm font-bold transition-colors hover:bg-secondary disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                Same {info.domains} {info.label} orbitals, different split — 0 lone pairs gives{" "}
                {molecularGeometryName(info.domains, 0)}, more lone pairs bends it from there.
              </p>
            </div>

            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Lone pair repulsion strength</span>
                <span className="font-mono text-accent">{lonePairWeight.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min={1}
                max={2.5}
                step={0.1}
                value={lonePairWeight}
                onChange={(e) => setLonePairWeight(Number(e.target.value))}
                aria-label="Lone pair repulsion strength"
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">{leftoverNote}</p>
          <div className="font-mono text-xs text-accent">— Orbital hybridization</div>
        </div>
      </aside>
    </div>
  );
}

const Y_S = 185;
const Y_P = 115;
const ENERGY_SLOPE = (Y_P - Y_S) / (ORBITAL_ENERGY.p - ORBITAL_ENERGY.s);
function energyToY(e: number): number {
  return Y_S + ENERGY_SLOPE * (e - ORBITAL_ENERGY.s);
}
const Y_D = energyToY(ORBITAL_ENERGY.d);

const P_X = [120, 158, 196];
const D_X = [256, 292, 328, 364, 400];

type Slot = { id: string; kind: "s" | "p" | "d"; x: number; index: number };

// Every orbital slot keeps one fixed x position for its whole lifetime;
// only its y (atomic height, or the shared hybrid height) and color
// change when the hybridization type changes. That's what makes picking a
// new type read as orbitals sliding into (or back out of) the merged
// level, instead of the diagram just swapping to a different static
// picture.
function EnergyDiagram({ hybridType }: { hybridType: HybridType }) {
  const info = HYBRID_TYPES[hybridType];
  const showD = info.dCount > 0 || info.leftoverD > 0;
  const hybridY = energyToY(hybridEnergy(info));

  const slots: Slot[] = [
    { id: "s", kind: "s", x: 60, index: 0 },
    ...P_X.map((x, i) => ({ id: `p${i}`, kind: "p" as const, x, index: i })),
    ...(showD ? D_X.map((x, i) => ({ id: `d${i}`, kind: "d" as const, x, index: i })) : []),
  ];

  const isParticipating = (slot: Slot) => {
    if (slot.kind === "s") return true;
    if (slot.kind === "p") return slot.index < info.pCount;
    return slot.index < info.dCount;
  };

  const participatingXs = slots.filter(isParticipating).map((s) => s.x);
  const hybLineX1 = Math.min(...participatingXs) - 20;
  const hybLineX2 = Math.max(...participatingXs) + 20;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Energy-level diagram
        </h3>
        <span className="font-mono text-[10px] text-muted-foreground">
          1 s + {info.pCount} p{info.dCount > 0 ? ` + ${info.dCount} d` : ""} → {info.domains}{" "}
          {info.label} orbitals
        </span>
      </div>
      <svg viewBox="0 0 440 210" className="h-[180px] w-full">
        <line x1="20" y1={Y_S} x2="420" y2={Y_S} stroke="var(--border)" strokeDasharray="3 4" />
        <text x="6" y={Y_S + 4} fontSize="11" fill="var(--muted-foreground)" fontFamily="monospace">
          s
        </text>
        <line x1="20" y1={Y_P} x2="420" y2={Y_P} stroke="var(--border)" strokeDasharray="3 4" />
        <text x="6" y={Y_P + 4} fontSize="11" fill="var(--muted-foreground)" fontFamily="monospace">
          p
        </text>
        {showD && (
          <>
            <line x1="20" y1={Y_D} x2="420" y2={Y_D} stroke="var(--border)" strokeDasharray="3 4" />
            <text
              x="6"
              y={Y_D + 4}
              fontSize="11"
              fill="var(--muted-foreground)"
              fontFamily="monospace"
            >
              d
            </text>
          </>
        )}

        <line
          x1={hybLineX1}
          x2={hybLineX2}
          y1={hybridY}
          y2={hybridY}
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeDasharray="2 3"
          style={{ transition: "y1 0.6s ease, y2 0.6s ease, x1 0.6s ease, x2 0.6s ease" }}
        />

        {slots.map((slot) => {
          const participating = isParticipating(slot);
          const y = participating ? hybridY : energyToY(ORBITAL_ENERGY[slot.kind]);
          return (
            <line
              key={slot.id}
              x1={slot.x - 14}
              x2={slot.x + 14}
              y1={y}
              y2={y}
              stroke={participating ? "var(--accent)" : "var(--muted-foreground)"}
              strokeWidth={4}
              strokeLinecap="round"
              style={{ transition: "y1 0.6s ease, y2 0.6s ease, stroke 0.4s ease" }}
            />
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          {info.label} hybrid orbitals
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--muted-foreground)" }}
          />
          Unhybridized
        </span>
      </div>
    </div>
  );
}

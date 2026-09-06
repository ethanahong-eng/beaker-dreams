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
import { HYBRID_TYPES, HYBRID_ORDER, type HybridType, type HybridInfo } from "@/lib/hybridization";
import { rotate3d } from "@/lib/project3d";
import { AxisGizmo } from "@/components/AxisGizmo";
import { Math as MathBlock } from "@/components/Math";

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
              const dist = Math.hypot(x - 150, y - 150) || 1;
              const angleDeg = (Math.atan2(y - 150, x - 150) * 180) / Math.PI;
              // Every domain, bonding or lone, is drawn as an actual hybrid
              // orbital lobe -- a big lobe pointing outward and a small
              // tail lobe on the opposite side of the nucleus -- instead
              // of an abstract dot, since that's what a hybrid orbital
              // actually looks like.
              const lobeLen = dist * 0.5;
              const lobeCx = 150 + ((x - 150) / dist) * lobeLen;
              const lobeCy = 150 + ((y - 150) / dist) * lobeLen;
              const tailLen = dist * 0.16;
              const tailCx = 150 - ((x - 150) / dist) * tailLen;
              const tailCy = 150 - ((y - 150) / dist) * tailLen;
              const tailR = Math.max(3, tailLen * 0.75);
              if (d.kind === "bond") {
                const termR = 8 * p.scale;
                return (
                  <g key={i}>
                    <circle cx={tailCx} cy={tailCy} r={tailR} fill="var(--accent)" opacity={0.55} />
                    <ellipse
                      cx={lobeCx}
                      cy={lobeCy}
                      rx={lobeLen}
                      ry={lobeLen * 0.42}
                      transform={`rotate(${angleDeg} ${lobeCx} ${lobeCy})`}
                      fill="var(--accent)"
                      opacity={0.85}
                    />
                    {/* The attached atom's own orbital (e.g. hydrogen's 1s)
                        overlapping the hybrid lobe's tip -- that overlap
                        region is the bond. */}
                    <circle
                      cx={x}
                      cy={y}
                      r={termR}
                      fill="rgba(148, 163, 184, 0.95)"
                      stroke="var(--card)"
                      strokeWidth={1}
                    />
                  </g>
                );
              }
              return (
                <g key={i}>
                  <circle cx={tailCx} cy={tailCy} r={tailR} fill="rgba(148, 163, 184, 0.7)" />
                  <ellipse
                    cx={lobeCx}
                    cy={lobeCy}
                    rx={lobeLen}
                    ry={lobeLen * 0.42}
                    transform={`rotate(${angleDeg} ${lobeCx} ${lobeCy})`}
                    fill="rgba(148, 163, 184, 0.7)"
                  />
                </g>
              );
            })}
            <AxisGizmo yaw={yaw} pitch={pitch} cx={40} cy={40} radius={22} />
          </svg>
          <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Drag to rotate · bonds form where lobes overlap
          </p>
        </div>

        <OrbitalMixingDiagram hybridType={hybridType} />

        <OrbitalOverlapDiagram defaultHybridType={hybridType} />

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

// Real orbital shapes instead of an abstract energy ladder: a gray sphere
// for s, gray dumbbells for p (a symmetric two-lobe shape), and -- after
// mixing -- teal hybrid lobes, each one asymmetric (a big lobe pointing
// where the bond forms, a small tail lobe behind the nucleus), arranged
// radially the way the reference textbook diagrams draw them.

function SOrbital({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={15} fill="rgba(148, 163, 184, 0.9)" />;
}

function POrbital({ cx, cy, dim = false }: { cx: number; cy: number; dim?: boolean }) {
  return (
    <g opacity={dim ? 0.4 : 1}>
      <ellipse cx={cx} cy={cy - 16} rx={11} ry={17} fill="rgba(148, 163, 184, 0.9)" />
      <ellipse cx={cx} cy={cy + 16} rx={11} ry={17} fill="rgba(148, 163, 184, 0.9)" />
      <circle cx={cx} cy={cy} r={2.5} fill="var(--foreground)" />
    </g>
  );
}

function DOrbital({ cx, cy, dim = false }: { cx: number; cy: number; dim?: boolean }) {
  return (
    <g opacity={dim ? 0.35 : 0.85}>
      <ellipse
        cx={cx}
        cy={cy}
        rx={10}
        ry={18}
        transform={`rotate(45 ${cx} ${cy})`}
        fill="rgba(148, 163, 184, 0.85)"
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={10}
        ry={18}
        transform={`rotate(-45 ${cx} ${cy})`}
        fill="rgba(148, 163, 184, 0.85)"
      />
      <circle cx={cx} cy={cy} r={2.5} fill="var(--foreground)" />
    </g>
  );
}

function HybridLobe({ cx, cy, angleDeg }: { cx: number; cy: number; angleDeg: number }) {
  const rad = (angleDeg * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);
  const bigLen = 46;
  const lobeCx = cx + ux * bigLen * 0.5;
  const lobeCy = cy + uy * bigLen * 0.5;
  return (
    <g>
      <circle cx={cx - ux * 8} cy={cy - uy * 8} r={7} fill="var(--accent)" opacity={0.6} />
      <ellipse
        cx={lobeCx}
        cy={lobeCy}
        rx={bigLen * 0.5}
        ry={bigLen * 0.24}
        transform={`rotate(${angleDeg} ${lobeCx} ${lobeCy})`}
        fill="var(--accent)"
      />
    </g>
  );
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// A single mixing hybrid, drawn as two orbitals crossfading into one: the
// gray parent p-lobe pair (front toward the bond axis, back away from it)
// shrinks and fades out while the teal hybrid shape -- a big constructive
// lobe on the same front side plus a small destructive-interference tail
// on the back side -- grows and fades in. Same-side addition (front) makes
// the wave taller there; opposite-side subtraction (back) makes it nearly
// cancel, which is *why* the tail is small instead of another full lobe.
function MixingHybridLobe({
  cx,
  cy,
  angleDeg,
  t,
}: {
  cx: number;
  cy: number;
  angleDeg: number;
  t: number;
}) {
  const rad = (angleDeg * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);

  const pLobeLen = 34;
  const pLobeWidth = 11;
  const bigLen = 46;

  const frontLen = lerp(pLobeLen, bigLen, t);
  const frontWidth = lerp(pLobeWidth, bigLen * 0.24, t);
  const frontCx = cx + ux * frontLen * 0.5;
  const frontCy = cy + uy * frontLen * 0.5;

  const backLen = lerp(pLobeLen, bigLen * 0.35, t);
  const backWidth = lerp(pLobeWidth, bigLen * 0.17, t);
  const backCx = cx - ux * backLen * 0.5;
  const backCy = cy - uy * backLen * 0.5;

  return (
    <g>
      <ellipse
        cx={frontCx}
        cy={frontCy}
        rx={frontLen * 0.5}
        ry={frontWidth}
        transform={`rotate(${angleDeg} ${frontCx} ${frontCy})`}
        fill="rgba(148, 163, 184, 0.9)"
        opacity={1 - t}
      />
      <ellipse
        cx={backCx}
        cy={backCy}
        rx={backLen * 0.5}
        ry={backWidth}
        transform={`rotate(${angleDeg} ${backCx} ${backCy})`}
        fill="rgba(148, 163, 184, 0.9)"
        opacity={1 - t}
      />
      <ellipse
        cx={frontCx}
        cy={frontCy}
        rx={frontLen * 0.5}
        ry={frontWidth}
        transform={`rotate(${angleDeg} ${frontCx} ${frontCy})`}
        fill="var(--accent)"
        opacity={t * 0.85}
      />
      <circle
        cx={backCx}
        cy={backCy}
        r={Math.max(3, backLen * 0.22)}
        fill="var(--accent)"
        opacity={t * 0.55}
      />
    </g>
  );
}

function OrbitalMixingDiagram({ hybridType }: { hybridType: HybridType }) {
  const info = HYBRID_TYPES[hybridType];
  const sCharacter = sCharacterOf(info);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const dirRef = useRef(1);

  useEffect(() => {
    setT(0);
    dirRef.current = 1;
  }, [hybridType]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const HOLD_MS = 700;
    let holdUntil = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (now < holdUntil) {
        raf = requestAnimationFrame(tick);
        return;
      }
      setT((prev) => {
        const next = prev + dirRef.current * 0.35 * dt;
        if (next >= 1) {
          holdUntil = now + HOLD_MS;
          dirRef.current = -1;
          return 1;
        }
        if (next <= 0) {
          holdUntil = now + HOLD_MS;
          dirRef.current = 1;
          return 0;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, hybridType]);

  const before: Array<{ kind: "s" | "p" | "d" }> = [
    { kind: "s" },
    ...Array.from({ length: info.pCount }, () => ({ kind: "p" as const })),
    ...Array.from({ length: info.dCount }, () => ({ kind: "d" as const })),
  ];
  const spacing = 56;
  const startX = 40;
  const rowY = 95;
  const lastBeforeX = startX + (before.length - 1) * spacing;

  const arrowX1 = lastBeforeX + 40;
  const arrowX2 = 300;
  const clusterCx = 375;
  const clusterCy = rowY;
  const angles = Array.from({ length: info.domains }, (_, i) => -90 + (360 / info.domains) * i);
  const beforeOpacity = 1 - 0.85 * t;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Orbital mixing
        </h3>
        <span className="font-mono text-[10px] text-muted-foreground">
          1 s + {info.pCount} p{info.dCount > 0 ? ` + ${info.dCount} d` : ""} → {info.domains}{" "}
          {info.label} hybrid orbitals
        </span>
      </div>
      <svg viewBox="0 0 460 190" className="h-[180px] w-full">
        <g opacity={beforeOpacity}>
          {before.map((orb, i) => {
            const cx = startX + i * spacing;
            if (orb.kind === "s") return <SOrbital key={i} cx={cx} cy={rowY} />;
            if (orb.kind === "p") return <POrbital key={i} cx={cx} cy={rowY} />;
            return <DOrbital key={i} cx={cx} cy={rowY} />;
          })}
        </g>
        <text
          x={startX + (lastBeforeX - startX) / 2}
          y={rowY + 60}
          textAnchor="middle"
          fontSize="10"
          fill="var(--muted-foreground)"
          fontFamily="monospace"
        >
          atomic orbitals
        </text>

        <line
          x1={arrowX1}
          y1={rowY}
          x2={arrowX2}
          y2={rowY}
          stroke="var(--muted-foreground)"
          strokeWidth={2}
        />
        <polygon
          points={`${arrowX2},${rowY - 6} ${arrowX2 + 12},${rowY} ${arrowX2},${rowY + 6}`}
          fill="var(--muted-foreground)"
        />
        <text
          x={(arrowX1 + arrowX2) / 2}
          y={rowY - 12}
          textAnchor="middle"
          fontSize="9"
          fill="var(--muted-foreground)"
          fontFamily="monospace"
        >
          mixing: {(t * 100).toFixed(0)}%
        </text>

        {angles.map((a, i) => (
          <MixingHybridLobe key={i} cx={clusterCx} cy={clusterCy} angleDeg={a} t={t} />
        ))}
        <circle cx={clusterCx} cy={clusterCy} r={lerp(4, 4, t)} fill="var(--foreground)" />
        <circle
          cx={clusterCx}
          cy={clusterCy}
          r={lerp(13, 0, t)}
          fill="rgba(148, 163, 184, 0.9)"
          opacity={1 - t}
        />
        <text
          x={clusterCx}
          y={rowY + 60}
          textAnchor="middle"
          fontSize="10"
          fill="var(--accent)"
          fontFamily="monospace"
        >
          {info.label} hybrid orbitals
        </text>
      </svg>

      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(t * 100)}
        onChange={(e) => {
          setPlaying(false);
          setT(Number(e.target.value) / 100);
        }}
        aria-label="Orbital mixing progress"
        className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
      />
      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="rounded-full border border-border px-3 py-1 font-mono text-[10px] font-bold uppercase transition-colors hover:bg-secondary"
        >
          {playing ? "Pause" : "Play"} mixing
        </button>
        {(info.leftoverP > 0 || info.leftoverD > 0) && (
          <p className="font-mono text-[10px] text-muted-foreground">
            {info.leftoverP > 0
              ? `${info.leftoverP} p orbital${info.leftoverP === 1 ? "" : "s"}`
              : `${info.leftoverD} d orbital${info.leftoverD === 1 ? "" : "s"}`}{" "}
            stay pure — not shown, since they never enter the mix.
          </p>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background p-3">
        <MathBlock
          tex={`\\psi_{\\text{hybrid}} = \\sqrt{\\tfrac{1}{${info.domains}}}\\,\\phi_s \\;\\pm\\; \\sqrt{\\tfrac{${info.domains - 1}}{${info.domains}}}\\,\\phi_p`}
        />
      </div>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
        A hybrid isn't a new orbital drawn from scratch — it's a weighted sum of the atom's own s
        and p wavefunctions ({(sCharacter * 100).toFixed(0)}% s character here). Where the + sign
        adds constructively (the front, toward the bond) the lobe grows; where it's effectively
        subtracted (the back) the wave nearly cancels, leaving the small tail. That's the "+" and
        the front/back asymmetry above, not two independent choices.
      </p>
    </div>
  );
}

// A single hybrid orbital's shape is genuinely a function of its s
// character: a hybrid mixes 1 s orbital with `pCount` (+ dCount) p/d
// orbitals, so the s orbital's share of the mix -- and therefore how
// spherical vs. directional the resulting lobe looks -- is exactly
// 1 / domains. sp is half s character (short, fat, the most s-like);
// sp3d2 is one-sixth s character (long, thin, the most p-like). That
// same ratio drives both the lobe length and width below, so a sigma
// bond built from two different hybrid types visibly looks different,
// not just labeled differently.
function sCharacterOf(info: HybridInfo): number {
  return 1 / info.domains;
}

function BondingLobe({
  cx,
  cy,
  pointRight,
  sCharacter,
}: {
  cx: number;
  cy: number;
  pointRight: boolean;
  sCharacter: number;
}) {
  const dir = pointRight ? 1 : -1;
  const len = 30 + (1 - sCharacter) * 34;
  const width = 9 + sCharacter * 22;
  const lobeCx = cx + dir * len * 0.5;
  const tailR = Math.max(5, len * 0.14);
  return (
    <g>
      <circle cx={cx - dir * tailR * 1.2} cy={cy} r={tailR} fill="var(--accent)" opacity={0.55} />
      <ellipse cx={lobeCx} cy={cy} rx={len * 0.5} ry={width} fill="var(--accent)" opacity={0.85} />
      <circle cx={cx} cy={cy} r={5} fill="var(--foreground)" />
    </g>
  );
}

// The second, independently-adjustable atom this diagram adds: picking a
// hybridization for each side and watching their lobes reach toward one
// another is literally what "two orbitals combine into a sigma bond"
// looks like -- the shaded lens where they meet is the shared electron
// density a real bond is made of, and it visibly widens or narrows as
// either side's s character changes.
function OrbitalOverlapDiagram({ defaultHybridType }: { defaultHybridType: HybridType }) {
  const [typeA, setTypeA] = useState<HybridType>(defaultHybridType);
  const [typeB, setTypeB] = useState<HybridType>("sp3");

  const infoA = HYBRID_TYPES[typeA];
  const infoB = HYBRID_TYPES[typeB];
  const sA = sCharacterOf(infoA);
  const sB = sCharacterOf(infoB);

  const cxA = 130;
  const cxB = 330;
  const cy = 80;
  const lenA = 30 + (1 - sA) * 34;
  const lenB = 30 + (1 - sB) * 34;
  const overlapMidX = cxA + lenA + (cxB - lenB - (cxA + lenA)) / 2;
  const overlapWidth = Math.max(6, (cxA + lenA - (cxB - lenB)) / 2 + 16);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Two orbitals combining into a bond
        </h3>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
          <select
            value={typeA}
            onChange={(e) => setTypeA(e.target.value as HybridType)}
            aria-label="Atom A hybridization"
            className="rounded border border-border bg-background px-2 py-1 text-accent"
          >
            {HYBRID_ORDER.map((t) => (
              <option key={t} value={t}>
                {HYBRID_TYPES[t].label}
              </option>
            ))}
          </select>
          <span className="text-muted-foreground">+</span>
          <select
            value={typeB}
            onChange={(e) => setTypeB(e.target.value as HybridType)}
            aria-label="Atom B hybridization"
            className="rounded border border-border bg-background px-2 py-1 text-accent"
          >
            {HYBRID_ORDER.map((t) => (
              <option key={t} value={t}>
                {HYBRID_TYPES[t].label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <svg viewBox="0 0 460 160" className="h-[150px] w-full">
        <ellipse
          cx={overlapMidX}
          cy={cy}
          rx={overlapWidth}
          ry={16 + (sA + sB) * 14}
          fill="var(--accent)"
          opacity={0.28}
        />
        <BondingLobe cx={cxA} cy={cy} pointRight sCharacter={sA} />
        <BondingLobe cx={cxB} cy={cy} pointRight={false} sCharacter={sB} />
        <text
          x={overlapMidX}
          y={cy - 34}
          textAnchor="middle"
          fontSize="10"
          fill="var(--accent)"
          fontFamily="monospace"
        >
          σ bond (shared density)
        </text>
        <text
          x={cxA}
          y={cy + 44}
          textAnchor="middle"
          fontSize="10"
          fill="var(--muted-foreground)"
          fontFamily="monospace"
        >
          {infoA.label} · {(sA * 100).toFixed(0)}% s
        </text>
        <text
          x={cxB}
          y={cy + 44}
          textAnchor="middle"
          fontSize="10"
          fill="var(--muted-foreground)"
          fontFamily="monospace"
        >
          {infoB.label} · {(sB * 100).toFixed(0)}% s
        </text>
      </svg>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
        More s character makes a lobe shorter and fatter (more spherical, like sp's 50% s); more p
        character makes it longer and thinner (more directional, like sp³d²'s ~17% s). A bond forms
        exactly where the two lobes' electron density overlaps head-on — the shaded lens above.
      </p>
    </div>
  );
}

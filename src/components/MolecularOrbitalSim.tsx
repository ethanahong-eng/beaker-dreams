import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ELEMENTS,
  buildMODiagram,
  sampleMOPoints,
  type Element,
  type MOLevel,
  type MOPoint,
} from "@/lib/mo";
import { rotate3d, vLength, vScale, type Vec3 } from "@/lib/project3d";
import { AxisGizmo } from "@/components/AxisGizmo";

const POINT_COUNT = 1200;

function elementOrbitalRows(el: Element): { label: string; energy: number }[] {
  if (el.period === 1) return [{ label: "1s", energy: el.vsie["1s"] ?? 0 }];
  return [
    { label: "2p", energy: el.vsie["2p"] ?? 0 },
    { label: "2s", energy: el.vsie["2s"] ?? 0 },
  ];
}

export function MolecularOrbitalSim() {
  const [symA, setSymA] = useState("N");
  const [symB, setSymB] = useState("N");
  const [bondLength, setBondLength] = useState(2.2);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSecond, setShowSecond] = useState(false);
  const [yaw, setYaw] = useState(0.6);
  const [pitch, setPitch] = useState(0.3);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const elA = ELEMENTS.find((e) => e.symbol === symA)!;
  const elB = ELEMENTS.find((e) => e.symbol === symB)!;

  const diagram = useMemo(() => buildMODiagram(elA, elB, bondLength), [elA, elB, bondLength]);

  const selected: MOLevel = useMemo(() => {
    const found = selectedId ? diagram.levels.find((l) => l.id === selectedId) : undefined;
    return found ?? diagram.levels.find((l) => l.electrons > 0) ?? diagram.levels[0]!;
  }, [diagram, selectedId]);

  // Sampled client-side only, in an effect rather than during render: the
  // Monte Carlo draw is randomized, so computing it during SSR would bake
  // in one set of points that the client's own hydration pass would then
  // recompute differently, tripping a hydration mismatch.
  const [points, setPoints] = useState<MOPoint[]>([]);
  useEffect(() => {
    setPoints(
      sampleMOPoints(
        selected,
        diagram.posA,
        diagram.posB,
        POINT_COUNT,
        showSecond && !!selected.kindA2,
      ),
    );
  }, [selected, diagram, showSecond]);
  const boundingRadius = useMemo(
    () => Math.max(1.5, ...points.map((p) => vLength(p.pos as Vec3))),
    [points],
  );

  const project = (pos: Vec3) => {
    const norm = vScale(pos, 1 / (boundingRadius * 1.2));
    const [x, y, z] = rotate3d(norm, yaw, pitch);
    return { x, y, z };
  };
  const projected = points
    .map((p) => ({ ...p, proj: project(p.pos as Vec3) }))
    .sort((a, b) => a.proj.z - b.proj.z);

  const nucleiProjected = [diagram.posA, diagram.posB].map((p) => project(p as Vec3));

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

  const selectLevel = (id: string) => {
    setSelectedId(id);
    setShowSecond(false);
  };

  // Positioned by rank, not literal energy value: a 2s-based level always
  // sits tens of eV below any 2p-based one, so a to-scale axis would
  // crush every level anyone actually wants to compare (the sigma/pi
  // ordering near the top) into a few illegible pixels. Real textbook MO
  // diagrams have the same problem and solve it the same way -- spacing
  // reflects relative order, not literal energy gaps.
  const rankEntries: { key: string; energy: number }[] = [
    ...diagram.levels.map((l) => ({ key: l.id, energy: l.energy })),
    ...elementOrbitalRows(elA).map((r) => ({ key: `A-${r.label}`, energy: r.energy })),
    ...elementOrbitalRows(elB).map((r) => ({ key: `B-${r.label}`, energy: r.energy })),
  ].sort((a, b) => a.energy - b.energy);
  const rankOf = new Map(rankEntries.map((e, i) => [e.key, i]));
  const yOf = (key: string) => 20 + (1 - (rankOf.get(key) ?? 0) / (rankEntries.length - 1)) * 260;
  const aoKeyForLevel = (level: MOLevel, side: "A" | "B"): string => {
    const kind = side === "A" ? level.kindA : level.kindB;
    const label = kind === "1s" ? "1s" : kind === "2s" ? "2s" : "2p";
    return `${side}-${label}`;
  };

  const diagramWidth = 460;
  const colA = 70;
  const colMO = 230;
  const colB = 390;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              MO diagram
            </h3>
            <span className="font-mono text-[10px] text-muted-foreground">
              Bond order {diagram.bondOrder.toFixed(1)} · {diagram.totalElectrons} valence e⁻
            </span>
          </div>
          <svg viewBox={`0 0 ${diagramWidth} 300`} className="h-[300px] w-full">
            {elementOrbitalRows(elA).map((r) => (
              <g key={r.label}>
                <line
                  x1={colA - 22}
                  y1={yOf(`A-${r.label}`)}
                  x2={colA + 22}
                  y2={yOf(`A-${r.label}`)}
                  stroke="var(--muted-foreground)"
                  strokeWidth={2}
                />
                <text
                  x={colA}
                  y={yOf(`A-${r.label}`) - 6}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="monospace"
                  fill="var(--muted-foreground)"
                >
                  {elA.symbol} {r.label}
                </text>
              </g>
            ))}
            {elementOrbitalRows(elB).map((r) => (
              <g key={r.label}>
                <line
                  x1={colB - 22}
                  y1={yOf(`B-${r.label}`)}
                  x2={colB + 22}
                  y2={yOf(`B-${r.label}`)}
                  stroke="var(--muted-foreground)"
                  strokeWidth={2}
                />
                <text
                  x={colB}
                  y={yOf(`B-${r.label}`) - 6}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="monospace"
                  fill="var(--muted-foreground)"
                >
                  {elB.symbol} {r.label}
                </text>
              </g>
            ))}
            {diagram.levels.map((level) => {
              const y = yOf(level.id);
              const isSelected = level.id === selected.id;
              const color =
                level.bonding === "bonding"
                  ? "var(--accent)"
                  : level.bonding === "antibonding"
                    ? "#ef4444"
                    : "var(--muted-foreground)";
              return (
                <g key={level.id}>
                  {level.bonding !== "nonbonding" && (
                    <>
                      <line
                        x1={colA + 22}
                        y1={yOf(aoKeyForLevel(level, "A"))}
                        x2={colMO - (level.degeneracy === 2 ? 30 : 20)}
                        y2={y}
                        stroke="var(--border)"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1={colB - 22}
                        y1={yOf(aoKeyForLevel(level, "B"))}
                        x2={colMO + (level.degeneracy === 2 ? 30 : 20)}
                        y2={y}
                        stroke="var(--border)"
                        strokeDasharray="2 2"
                      />
                    </>
                  )}
                  {Array.from({ length: level.degeneracy }, (_, i) => i).map((i) => {
                    const cx = colMO + (level.degeneracy === 2 ? (i === 0 ? -30 : 30) : 0);
                    return (
                      <line
                        key={i}
                        x1={cx - 20}
                        y1={y}
                        x2={cx + 20}
                        y2={y}
                        stroke={color}
                        strokeWidth={isSelected ? 4 : 2.5}
                        onClick={() => selectLevel(level.id)}
                        className="cursor-pointer"
                      />
                    );
                  })}
                  {(() => {
                    // Hund's rule: spread electrons singly across the
                    // degenerate slots before pairing any of them up.
                    const slots = level.degeneracy === 2 ? [0, 0] : [0];
                    let remaining = level.electrons;
                    for (let pass = 0; pass < 2 && remaining > 0; pass++) {
                      for (let i = 0; i < slots.length && remaining > 0; i++) {
                        if (slots[i] === pass) {
                          slots[i] = pass + 1;
                          remaining--;
                        }
                      }
                    }
                    return slots.map((n, i) => {
                      const cx = colMO + (level.degeneracy === 2 ? (i === 0 ? -30 : 30) : 0);
                      const arrows: string[] = n === 1 ? ["↑"] : n === 2 ? ["↑", "↓"] : [];
                      return arrows.map((a, k) => (
                        <text
                          key={k}
                          x={cx - 5 + k * 10}
                          y={y - 5}
                          textAnchor="middle"
                          fontSize="12"
                          fill="var(--foreground)"
                        >
                          {a}
                        </text>
                      ));
                    });
                  })()}
                  <text
                    x={colMO}
                    y={y + (level.degeneracy === 2 ? 16 : 14)}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="monospace"
                    fill={color}
                  >
                    {level.label}
                  </text>
                </g>
              );
            })}
          </svg>
          {diagram.spMixingApplied && (
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              s–p mixing applied: for Z ≤ 7, π(2p) sits below σ(2p) — the empirical ordering
              correction, not derived from a full 2s/2p secular treatment here.
            </p>
          )}
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
            Click a level to see that molecular orbital in 3D. Dashed lines trace which atomic
            orbitals combined to form it, exactly like a textbook MO diagram.
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
            {projected.map((p, i) => {
              const x = 150 + p.proj.x * 130;
              const y = 150 + p.proj.y * 130;
              const depthScale = 1 / (2 - p.proj.z * 0.6);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={1.4 * depthScale}
                  fill={p.sign === 1 ? "var(--accent)" : "#3b82f6"}
                  opacity={0.75}
                />
              );
            })}
            {nucleiProjected.map((p, i) => (
              <circle
                key={i}
                cx={150 + p.x * 130}
                cy={150 + p.y * 130}
                r={4}
                fill="var(--foreground)"
              />
            ))}
            <AxisGizmo yaw={yaw} pitch={pitch} cx={40} cy={40} radius={22} />
          </svg>
          <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Drag to rotate · each dot is a real sample of |ψ_MO|²
          </p>
          <p className="pointer-events-none absolute right-3 top-3 font-mono text-[10px] uppercase tracking-widest text-accent">
            {selected.label}
          </p>
        </div>
        {selected.kindA2 && (
          <div className="flex overflow-hidden rounded-full border border-border text-[10px] font-bold uppercase w-fit">
            <button
              onClick={() => setShowSecond(false)}
              className={`px-3 py-1 transition-colors ${!showSecond ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`}
            >
              {selected.kindA.replace(/z|x|y$/, "x")}-based
            </button>
            <button
              onClick={() => setShowSecond(true)}
              className={`px-3 py-1 transition-colors ${showSecond ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`}
            >
              {selected.kindA2.replace(/z|x|y$/, "y")}-based
            </button>
          </div>
        )}
      </div>

      <aside className="space-y-6 lg:col-span-5">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest">
            Pick two atoms
          </h3>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
                Atom A
              </label>
              <select
                value={symA}
                onChange={(e) => setSymA(e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-2 font-mono text-sm text-accent"
              >
                {ELEMENTS.map((e) => (
                  <option key={e.symbol} value={e.symbol}>
                    {e.symbol} — {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
                Atom B
              </label>
              <select
                value={symB}
                onChange={(e) => setSymB(e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-2 font-mono text-sm text-accent"
              >
                {ELEMENTS.map((e) => (
                  <option key={e.symbol} value={e.symbol}>
                    {e.symbol} — {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-2 flex justify-between text-xs font-medium">
            <span>Bond length</span>
            <span className="font-mono text-accent">{bondLength.toFixed(1)} a₀</span>
          </div>
          <input
            type="range"
            min={1.2}
            max={5}
            step={0.1}
            value={bondLength}
            onChange={(e) => setBondLength(Number(e.target.value))}
            aria-label="Bond length"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
          />
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            Real equilibrium bond lengths vary by element pair and come from minimizing total energy
            — not modeled here. Drag to see how overlap (and the bonding/antibonding split) changes
            with distance instead.
          </p>

          <hr className="my-6 border-border" />

          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="font-mono text-xl font-bold text-accent">
                {diagram.bondOrder.toFixed(1)}
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">
                Bond order
              </div>
            </div>
            <div>
              <div className="font-mono text-xl font-bold text-accent">
                {diagram.totalElectrons}
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">
                Valence electrons
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">
            Each atomic orbital energy above (the two side columns) comes from real valence
            ionization data; the mixing between a symmetry-matched pair is found by numerically
            integrating their overlap and solving the resulting 2×2 secular equation — the standard
            extended-Hückel approach, not a hand-drawn diagram. Same-sign overlap lowers the
            combination's energy into a bonding orbital; opposite-sign overlap raises it into an
            antibonding one, with a node between the nuclei exactly where the wavefunctions cancel.
          </p>
          <div className="font-mono text-xs text-accent">— Molecular orbital theory</div>
        </div>
      </aside>
    </div>
  );
}

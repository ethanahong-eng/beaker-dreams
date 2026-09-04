import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  ELEMENTS,
  DEFAULT_LONE_PAIR_WEIGHT,
  computeLonePairs as legacyComputeLonePairs,
  electronGeometryName,
  molecularGeometryName,
  shuffledDeck,
  type ElementSymbol,
  type MoleculeTarget,
} from "@/lib/vsepr";
import {
  ATOM_CHOICES,
  MAX_ATOMS,
  neighborsOf,
  bondBetween,
  lonePairsOf,
  bondKey,
  tryAddAtom,
  tryChangeBondOrder,
  isRemovable,
  removeAtom,
  formulaOfGraph,
  type AtomId,
  type MoleculeAtom,
  type MoleculeBond,
  type BondOrder,
} from "@/lib/molecule";
import { embedMolecule, type EmbeddedAtom } from "@/lib/embed";
import { HYBRID_TYPES } from "@/lib/hybridization";
import {
  rotate3d,
  vAdd,
  vSub,
  vScale,
  vDot,
  vLength,
  vNormalize,
  type Vec3,
} from "@/lib/project3d";
import { AxisGizmo } from "@/components/AxisGizmo";

type Tool = "add" | "bondOrder" | "remove" | "angle" | "torsion";

function hybridLabelForDomains(n: number): string {
  const found = Object.values(HYBRID_TYPES).find((h) => h.domains === n);
  return found?.label ?? "—";
}

function angleBetween(a: Vec3, b: Vec3): number {
  const d = Math.max(-1, Math.min(1, vDot(vNormalize(a), vNormalize(b))));
  return (Math.acos(d) * 180) / Math.PI;
}

// The trimmed atom toolkit doesn't include every element the legacy
// single-center deck was written against (Be, B, and Xe dropped out) --
// filter those targets out rather than leave Challenge mode asking for a
// molecule the toolkit has no way to place.
const BUILDABLE_ELEMENTS = new Set<ElementSymbol>(ATOM_CHOICES);
function isBuildableTarget(t: MoleculeTarget): boolean {
  return BUILDABLE_ELEMENTS.has(t.central) && t.terminals.every((e) => BUILDABLE_ELEMENTS.has(e));
}
function buildableDeck(): MoleculeTarget[] {
  return shuffledDeck().filter(isBuildableTarget);
}

export function VseprBuilder() {
  const [atoms, setAtoms] = useState<MoleculeAtom[]>([]);
  const [bonds, setBonds] = useState<MoleculeBond[]>([]);
  const [rootId, setRootId] = useState<AtomId>(0);
  const [selectedAtom, setSelectedAtom] = useState<AtomId | null>(null);
  const [tool, setTool] = useState<Tool>("add");
  const [newBondOrder, setNewBondOrder] = useState<BondOrder>(1);
  const [torsions, setTorsions] = useState<Map<string, number>>(new Map());
  const [torsionBond, setTorsionBond] = useState<{ a: AtomId; b: AtomId } | null>(null);
  const [angleSelection, setAngleSelection] = useState<AtomId[]>([]);
  const [lonePairWeight, setLonePairWeight] = useState(DEFAULT_LONE_PAIR_WEIGHT);
  const [rejectMsg, setRejectMsg] = useState<string | null>(null);
  const rejectTimerRef = useRef<number | null>(null);

  const [yaw, setYaw] = useState(0.6);
  const [pitch, setPitch] = useState(0.3);
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef<{ x: number; y: number; dragging: boolean; pointerId: number } | null>(
    null,
  );

  const [mode, setMode] = useState<"practice" | "challenge">("practice");
  const [deck, setDeck] = useState<MoleculeTarget[]>(() => buildableDeck());
  const [deckIndex, setDeckIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [checked, setChecked] = useState<boolean | null>(null);

  const target = deck[deckIndex % deck.length]!;
  const effectiveRoot = atoms.some((a) => a.id === rootId) ? rootId : (atoms[0]?.id ?? 0);
  const hasMolecule = atoms.length > 0;

  const flashReject = (reason: string) => {
    setRejectMsg(reason);
    if (rejectTimerRef.current) window.clearTimeout(rejectTimerRef.current);
    rejectTimerRef.current = window.setTimeout(() => setRejectMsg(null), 3800);
  };

  const embedded = useMemo<Map<AtomId, EmbeddedAtom>>(() => {
    if (!hasMolecule) return new Map();
    return embedMolecule(atoms, bonds, effectiveRoot, (key) => torsions.get(key), lonePairWeight);
  }, [atoms, bonds, effectiveRoot, torsions, lonePairWeight, hasMolecule]);

  const { centroid, boundingRadius } = useMemo(() => {
    const positions = [...embedded.values()].map((e) => e.pos as Vec3);
    if (positions.length === 0) return { centroid: [0, 0, 0] as Vec3, boundingRadius: 0.6 };
    const sum = positions.reduce((acc, p) => vAdd(acc, p), [0, 0, 0] as Vec3);
    const c = vScale(sum, 1 / positions.length);
    const radius = Math.max(0.6, ...positions.map((p) => vLength(vSub(p, c))));
    return { centroid: c, boundingRadius: radius };
  }, [embedded]);

  const project = (posGlobal: Vec3) => {
    const centered = vSub(posGlobal, centroid);
    const norm = vScale(centered, 1 / (boundingRadius + 0.55));
    const [x1, y1, z2] = rotate3d(norm, yaw, pitch);
    const scale = zoom / (2 - z2 * 0.6);
    return { x: x1 * scale, y: y1 * scale, z: z2, scale };
  };

  // Pointer capture is deferred until the pointer has actually moved past a
  // small threshold, rather than grabbed on every pointerdown. Capturing
  // immediately would retarget the click event to the SVG itself on a plain
  // tap (per the Pointer Events spec), which would make it impossible to
  // ever click an atom or bond -- every tap would look identical to a
  // zero-distance drag on the background.
  const DRAG_THRESHOLD = 4;
  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    dragRef.current = { x: e.clientX, y: e.clientY, dragging: false, pointerId: e.pointerId };
  };
  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      drag.dragging = true;
      e.currentTarget.setPointerCapture(drag.pointerId);
    }
    drag.x = e.clientX;
    drag.y = e.clientY;
    setYaw((y) => y + dx * 0.01);
    setPitch((p) => Math.max(-1.4, Math.min(1.4, p - dy * 0.01)));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };
  const onWheel = (e: ReactWheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.4, Math.min(3, z * (1 - e.deltaY * 0.001))));
  };

  const resetMolecule = (starter: MoleculeAtom[] = []) => {
    setAtoms(starter);
    setBonds([]);
    setRootId(starter[0]?.id ?? 0);
    setSelectedAtom(starter[0]?.id ?? null);
    setTorsions(new Map());
    setTorsionBond(null);
    setAngleSelection([]);
    setRejectMsg(null);
    setChecked(null);
  };

  const attemptAdd = (element: ElementSymbol) => {
    const result = tryAddAtom(
      atoms,
      bonds,
      hasMolecule ? selectedAtom : null,
      element,
      newBondOrder,
    );
    if (!result.ok) {
      flashReject(result.reason);
      return;
    }
    setAtoms(result.atoms);
    setBonds(result.bonds);
    if (result.newId !== undefined) setSelectedAtom(result.newId);
    setRejectMsg(null);
    setChecked(null);
  };

  const cycleBondOrder = (a: AtomId, b: AtomId) => {
    const existing = bondBetween(bonds, a, b);
    if (!existing) return;
    const nextOrder = ((existing.order % 3) + 1) as BondOrder;
    const result = tryChangeBondOrder(atoms, bonds, a, b, nextOrder);
    if (!result.ok) {
      flashReject(result.reason);
      return;
    }
    setBonds(result.bonds);
    setRejectMsg(null);
    setChecked(null);
  };

  const attemptRemove = (id: AtomId) => {
    if (!isRemovable(bonds, atoms, id)) {
      flashReject("Only an atom with a single bond (a leaf) can be removed here.");
      return;
    }
    const result = removeAtom(atoms, bonds, id);
    setAtoms(result.atoms);
    setBonds(result.bonds);
    if (selectedAtom === id) setSelectedAtom(result.atoms[0]?.id ?? null);
    setChecked(null);
  };

  const onAtomClick = (id: AtomId) => {
    if (tool === "remove") {
      attemptRemove(id);
      return;
    }
    if (tool === "angle") {
      setAngleSelection((sel) => {
        if (sel.length >= 3) return [id];
        if (sel[sel.length - 1] === id) return sel;
        return [...sel, id];
      });
      return;
    }
    setSelectedAtom(id);
  };

  const onBondClick = (a: AtomId, b: AtomId) => {
    if (tool === "bondOrder") {
      cycleBondOrder(a, b);
      return;
    }
    if (tool === "torsion") {
      setTorsionBond({ a, b });
      return;
    }
  };

  const setTool_ = (t: Tool) => {
    setTool(t);
    setAngleSelection([]);
    setTorsionBond(null);
    setRejectMsg(null);
  };

  const startChallenge = () => {
    setMode("challenge");
    setDeck(buildableDeck());
    setDeckIndex(0);
    setScore(0);
    setAttempts(0);
    setTool_("add");
    resetMolecule([]);
  };

  const checkAnswer = () => {
    const root = atoms.find(
      (a) =>
        a.element === target.central && neighborsOf(bonds, a.id).length === target.terminals.length,
    );
    const others = root ? atoms.filter((a) => a.id !== root.id) : [];
    const shapeMatches =
      !!root &&
      atoms.length === 1 + target.terminals.length &&
      others.every(
        (a) => neighborsOf(bonds, a.id).length === 1 && bondBetween(bonds, a.id, root.id),
      );
    const gotElements = shapeMatches ? [...others.map((a) => a.element)].sort() : [];
    const wantElements = [...target.terminals].sort();
    const compositionMatches =
      shapeMatches &&
      gotElements.length === wantElements.length &&
      gotElements.every((e, i) => e === wantElements[i]);
    const expectedLone = legacyComputeLonePairs(target.central, target.terminals);
    const actualLone = root ? lonePairsOf(atoms, bonds, root.id) : null;
    const correct = compositionMatches && actualLone === expectedLone;
    setChecked(correct);
    setAttempts((a) => a + 1);
    if (correct) setScore((sc) => sc + 1);
  };

  const nextMolecule = () => {
    setDeckIndex((i) => i + 1);
    resetMolecule([]);
  };

  const selectedInfo = useMemo(() => {
    if (selectedAtom === null) return null;
    const atom = atoms.find((a) => a.id === selectedAtom);
    if (!atom) return null;
    const degree = neighborsOf(bonds, atom.id).length;
    const lone = degree > 0 ? lonePairsOf(atoms, bonds, atom.id) : null;
    return { atom, degree, lone };
  }, [atoms, bonds, selectedAtom]);

  const measuredAngle =
    angleSelection.length === 3
      ? (() => {
          const [a, b, c] = angleSelection;
          if (!bondBetween(bonds, a!, b!) || !bondBetween(bonds, b!, c!)) return null;
          const eb = embedded.get(b!);
          const ea = embedded.get(a!);
          const ec = embedded.get(c!);
          if (!eb || !ea || !ec) return null;
          return angleBetween(vSub(ea.pos, eb.pos), vSub(ec.pos, eb.pos));
        })()
      : null;

  const formula = hasMolecule ? formulaOfGraph(atoms) : null;
  const atomLimitReached = atoms.length >= MAX_ATOMS;

  // --- Rendering -----------------------------------------------------
  const projectedAtoms = atoms.map((atom) => {
    const emb = embedded.get(atom.id);
    const pos: Vec3 = emb ? (emb.pos as Vec3) : [0, 0, 0];
    return { atom, emb, p: project(pos) };
  });
  const byId = new Map(projectedAtoms.map((pa) => [pa.atom.id, pa]));

  type Item = { z: number; key: string; node: ReactNode };
  const items: Item[] = [];

  for (const bond of bonds) {
    const pa = byId.get(bond.a);
    const pb = byId.get(bond.b);
    if (!pa || !pb) continue;
    const x1 = 150 + pa.p.x * 110;
    const y1 = 150 + pa.p.y * 110;
    const x2 = 150 + pb.p.x * 110;
    const y2 = 150 + pb.p.y * 110;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const perpX = -dy / len;
    const perpY = dx / len;
    // Keep the invisible click target away from both endpoints -- otherwise
    // it overlaps the atoms' own hit-circles right where bonds meet them,
    // and whichever happens to paint on top that frame steals the click.
    const inset = Math.min(18, len / 3);
    const hitX1 = x1 + (dx / len) * inset;
    const hitY1 = y1 + (dy / len) * inset;
    const hitX2 = x2 - (dx / len) * inset;
    const hitY2 = y2 - (dy / len) * inset;
    const offsets = bond.order === 1 ? [0] : bond.order === 2 ? [-2.6, 2.6] : [-4.5, 0, 4.5];
    const isTorsionSelected =
      torsionBond && bondKey(torsionBond.a, torsionBond.b) === bondKey(bond.a, bond.b);
    items.push({
      z: (pa.p.z + pb.p.z) / 2,
      key: `bond-${bond.a}-${bond.b}`,
      node: (
        <g
          key={`bond-${bond.a}-${bond.b}`}
          onClick={() => onBondClick(bond.a, bond.b)}
          className={tool === "bondOrder" || tool === "torsion" ? "cursor-pointer" : ""}
          data-bond-a={bond.a}
          data-bond-b={bond.b}
        >
          <line
            x1={hitX1}
            y1={hitY1}
            x2={hitX2}
            y2={hitY2}
            stroke="transparent"
            strokeWidth={16}
            style={{ pointerEvents: "all" }}
          />
          {offsets.map((off, i) => (
            <line
              key={i}
              x1={x1 + perpX * off}
              y1={y1 + perpY * off}
              x2={x2 + perpX * off}
              y2={y2 + perpY * off}
              stroke={isTorsionSelected ? "var(--accent)" : "var(--muted-foreground)"}
              strokeWidth={isTorsionSelected ? 3 : 2}
              style={{ pointerEvents: "none" }}
            />
          ))}
        </g>
      ),
    });
  }

  for (const { atom, emb, p } of projectedAtoms) {
    const info = ELEMENTS[atom.element];
    const x = 150 + p.x * 110;
    const y = 150 + p.y * 110;
    const r = info.radius * 0.85 * p.scale;
    const isSelected = selectedAtom === atom.id;
    const isAngleSelected = angleSelection.includes(atom.id);
    items.push({
      z: p.z,
      key: `atom-${atom.id}`,
      node: (
        <g
          key={`atom-${atom.id}`}
          onClick={() => onAtomClick(atom.id)}
          className="cursor-pointer"
          data-atom-id={atom.id}
        >
          {(isSelected || isAngleSelected) && (
            <circle
              cx={x}
              cy={y}
              r={r + 5}
              fill="none"
              stroke={isAngleSelected ? "var(--accent)" : "var(--foreground)"}
              strokeWidth={2}
              strokeDasharray={isAngleSelected ? "3 3" : undefined}
            />
          )}
          <circle
            cx={x}
            cy={y}
            r={Math.max(r + 5, 12)}
            fill="transparent"
            style={{ pointerEvents: "all" }}
          />
          <circle cx={x} cy={y} r={r} fill={info.color} stroke="var(--card)" strokeWidth={1} />
        </g>
      ),
    });

    if (emb) {
      emb.loneDirs.forEach((dir, i) => {
        const lonePos = vAdd(emb.pos as Vec3, vScale(dir as Vec3, 0.32));
        const lp = project(lonePos);
        const lx = 150 + lp.x * 110;
        const ly = 150 + lp.y * 110;
        const perpX = -(ly - y) / 30;
        const perpY = (lx - x) / 30;
        items.push({
          z: lp.z,
          key: `lone-${atom.id}-${i}`,
          node: (
            <g key={`lone-${atom.id}-${i}`}>
              <circle
                cx={lx + perpX * 4}
                cy={ly + perpY * 4}
                r={3.4 * lp.scale}
                fill="rgba(148, 163, 184, 0.8)"
              />
              <circle
                cx={lx - perpX * 4}
                cy={ly - perpY * 4}
                r={3.4 * lp.scale}
                fill="rgba(148, 163, 184, 0.8)"
              />
            </g>
          ),
        });
      });
    }
  }
  items.sort((a, b) => a.z - b.z);

  const usedElements = [...new Set(atoms.map((a) => a.element))];

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {hasMolecule ? "Building" : "Pick an atom to place first"}
          </span>
          {formula && <p className="text-2xl font-bold">{formula}</p>}
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <svg
            viewBox="0 0 300 300"
            className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onWheel={onWheel}
          >
            {items.map((it) => it.node)}
            <AxisGizmo yaw={yaw} pitch={pitch} cx={40} cy={40} radius={22} />
          </svg>
          <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Drag to rotate · scroll to zoom
          </p>
          {!hasMolecule && (
            <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Click an atom in the toolbox to place the first one
            </p>
          )}
          {tool === "angle" && (
            <p className="pointer-events-none absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-widest text-accent">
              {measuredAngle !== null
                ? `Angle: ${measuredAngle.toFixed(1)}°`
                : `Click ${3 - angleSelection.length} more bonded atom${3 - angleSelection.length === 1 ? "" : "s"} in a row`}
            </p>
          )}
        </div>

        {hasMolecule && (
          <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {usedElements.map((el) => (
              <span key={el} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: ELEMENTS[el].color }}
                />
                {ELEMENTS[el].name}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Atoms used
            </span>
            <span className="font-mono text-base font-bold">
              {atoms.length} / {MAX_ATOMS}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Selected atom
            </span>
            <span className="font-mono text-base font-bold text-accent">
              {selectedInfo ? ELEMENTS[selectedInfo.atom.element].name : "—"}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Local geometry
            </span>
            <span className="font-mono text-base font-bold">
              {selectedInfo && selectedInfo.lone !== null
                ? selectedInfo.degree <= 1
                  ? "Terminal atom"
                  : molecularGeometryName(selectedInfo.degree, selectedInfo.lone)
                : selectedInfo && selectedInfo.degree === 0
                  ? "Not bonded yet"
                  : "Incomplete"}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Local hybridization
            </span>
            <span className="font-mono text-base font-bold">
              {selectedInfo && selectedInfo.lone !== null
                ? hybridLabelForDomains(selectedInfo.degree + selectedInfo.lone)
                : "—"}
            </span>
          </div>
        </div>

        {selectedInfo && selectedInfo.lone !== null && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Electron geometry at {ELEMENTS[selectedInfo.atom.element].name}:{" "}
            <span className="text-accent">
              {electronGeometryName(selectedInfo.degree, selectedInfo.lone)}
            </span>{" "}
            ({selectedInfo.degree} bonding + {selectedInfo.lone} lone)
          </p>
        )}
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest">Mode</h3>
            <div className="flex overflow-hidden rounded-full border border-border text-[10px] font-bold uppercase">
              <button
                onClick={() => setMode("practice")}
                className={`px-3 py-1 transition-colors ${mode === "practice" ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`}
              >
                Practice
              </button>
              <button
                onClick={startChallenge}
                className={`px-3 py-1 transition-colors ${mode === "challenge" ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`}
              >
                Challenge
              </button>
            </div>
          </div>

          {mode === "challenge" && (
            <div className="mb-6 rounded-lg border border-border p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Build this molecule
              </p>
              <p className="mt-1 text-2xl font-bold">{target.formula}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Score: {score} / {attempts}
              </p>
              {checked === null ? (
                <button
                  onClick={checkAnswer}
                  className="mt-4 w-full rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent"
                >
                  Check answer
                </button>
              ) : (
                <>
                  <p
                    className={`mt-3 font-mono text-xs uppercase tracking-widest ${checked ? "text-accent" : "text-destructive"}`}
                  >
                    {checked
                      ? "Correct!"
                      : `Not quite — try again with ${target.formula}'s exact atoms.`}
                  </p>
                  <button
                    onClick={nextMolecule}
                    className="mt-3 w-full rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-accent"
                  >
                    Next molecule
                  </button>
                </>
              )}
            </div>
          )}

          <h4 className="mb-3 text-xs font-medium">Tools</h4>
          <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
            <ToolButton label="Add" active={tool === "add"} onClick={() => setTool_("add")} />
            <ToolButton
              label="π/σ bonds"
              active={tool === "bondOrder"}
              onClick={() => setTool_("bondOrder")}
            />
            <ToolButton
              label="Remove"
              active={tool === "remove"}
              onClick={() => setTool_("remove")}
            />
            <ToolButton label="Angle" active={tool === "angle"} onClick={() => setTool_("angle")} />
            <ToolButton
              label="Rotate"
              active={tool === "torsion"}
              onClick={() => setTool_("torsion")}
            />
          </div>

          {tool === "add" && (
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-medium">
                  <span>Bond order for new atom</span>
                  <span className="font-mono text-accent">
                    {newBondOrder === 1
                      ? "single (σ)"
                      : newBondOrder === 2
                        ? "double (σ+π)"
                        : "triple (σ+2π)"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {([1, 2, 3] as BondOrder[]).map((o) => (
                    <button
                      key={o}
                      onClick={() => setNewBondOrder(o)}
                      className={`flex-1 rounded-lg border py-2 text-xs font-bold transition-colors ${
                        newBondOrder === o
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {o === 1 ? "—" : o === 2 ? "=" : "≡"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-3 text-xs font-medium">
                  {hasMolecule ? "Attach to the selected atom" : "Place the first atom"}
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {ATOM_CHOICES.map((el) => (
                    <ElementTile
                      key={el}
                      el={el}
                      onClick={() => attemptAdd(el)}
                      disabled={atomLimitReached}
                    />
                  ))}
                </div>
                {atomLimitReached && (
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    {MAX_ATOMS}-atom limit reached — remove a leaf atom to add a different one.
                  </p>
                )}
              </div>
            </div>
          )}

          {tool === "bondOrder" && (
            <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
              Click a bond in the 3D view to cycle it single → double → triple → single. Each click
              adds or removes a π bond on top of the always-present σ bond, as long as both atoms
              still have the valence electrons for it.
            </p>
          )}

          {tool === "remove" && (
            <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
              Click an atom with only one bond to remove it. Interior atoms are protected so
              removing one never splits the molecule in two.
            </p>
          )}

          {tool === "angle" && (
            <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
              Click three bonded atoms in a row — A, then B, then C — to measure the real A–B–C
              angle from the built structure.
            </p>
          )}

          {tool === "torsion" && (
            <div className="space-y-3">
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                Click a bond to select it, then rotate everything on one side of it around that bond
                axis — the one thing VSEPR alone can't decide, which is why real molecules have
                distinct staggered and eclipsed conformations.
              </p>
              {torsionBond && (
                <div>
                  <div className="mb-2 flex justify-between text-xs font-medium">
                    <span>Torsion angle</span>
                    <span className="font-mono text-accent">
                      {(
                        ((torsions.get(bondKey(torsionBond.a, torsionBond.b)) ?? Math.PI / 3) *
                          180) /
                        Math.PI
                      ).toFixed(0)}
                      °
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={5}
                    value={
                      ((torsions.get(bondKey(torsionBond.a, torsionBond.b)) ?? Math.PI / 3) * 180) /
                      Math.PI
                    }
                    onChange={(e) => {
                      const key = bondKey(torsionBond.a, torsionBond.b);
                      const next = new Map(torsions);
                      next.set(key, (Number(e.target.value) * Math.PI) / 180);
                      setTorsions(next);
                    }}
                    aria-label="Torsion angle"
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
                  />
                </div>
              )}
            </div>
          )}

          {rejectMsg && (
            <p className="mt-4 font-mono text-[11px] leading-relaxed text-destructive">
              {rejectMsg}
            </p>
          )}

          <hr className="my-6 border-border" />

          <div className="space-y-6">
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
            <button
              onClick={() => resetMolecule()}
              className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-accent"
            >
              Reset molecule
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">
            Every atom in the structure relaxes its own electron domains independently — a chain
            isn't one shape, it's several VSEPR centers stitched together bond by bond. What VSEPR
            can't pin down is the twist around each bond; that's a real, separate degree of freedom,
            which is why it's its own tool instead of a fixed answer.
          </p>
          <div className="font-mono text-xs text-accent">— VSEPR theory, chained</div>
        </div>
      </aside>
    </div>
  );
}

function ToolButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors ${
        active ? "border-accent bg-accent/10 text-accent" : "border-border hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}

function ElementTile({
  el,
  onClick,
  disabled,
}: {
  el: ElementSymbol;
  onClick: () => void;
  disabled?: boolean;
}) {
  const info = ELEMENTS[el];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={info.name}
      aria-label={info.name}
      className="flex flex-col items-center gap-1 rounded-lg border border-border py-2 text-xs font-bold transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
    >
      <span className="h-3 w-3 rounded-full" style={{ background: info.color }} />
      {el}
    </button>
  );
}

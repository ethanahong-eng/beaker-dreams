import {
  useEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  initialDomainsWithElements,
  relaxStep,
  maxDisplacement,
  electronGeometryName,
  molecularGeometryName,
  bondAngleFromDomains,
  computeLonePairs,
  tryAttach,
  formulaOf,
  sameComposition,
  shuffledDeck,
  ELEMENTS,
  CENTRAL_CANDIDATES,
  TERMINAL_CANDIDATES,
  TERMINAL_BOND_COST,
  DEFAULT_LONE_PAIR_WEIGHT,
  type Domain,
  type ElementSymbol,
  type MoleculeTarget,
} from "@/lib/vsepr";
import { rotate3d } from "@/lib/project3d";
import { AxisGizmo } from "@/components/AxisGizmo";

const DEFAULT_CENTRAL: ElementSymbol = "C";
const DEFAULT_TERMINALS: ElementSymbol[] = ["H", "H", "H", "H"];

export function VseprBuilder() {
  const [central, setCentral] = useState<ElementSymbol>(DEFAULT_CENTRAL);
  const [terminals, setTerminals] = useState<ElementSymbol[]>(DEFAULT_TERMINALS);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [yaw, setYaw] = useState(0.6);
  const [pitch, setPitch] = useState(0.3);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const [mode, setMode] = useState<"practice" | "challenge">("practice");
  const [deck, setDeck] = useState<MoleculeTarget[]>(() => shuffledDeck());
  const [deckIndex, setDeckIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [checked, setChecked] = useState<boolean | null>(null);

  const [rejectMsg, setRejectMsg] = useState<string | null>(null);
  const rejectTimerRef = useRef<number | null>(null);
  const [dropHover, setDropHover] = useState(false);
  const [lonePairWeight, setLonePairWeight] = useState(DEFAULT_LONE_PAIR_WEIGHT);

  const target = deck[deckIndex % deck.length]!;
  const centralInfo = ELEMENTS[central];
  const hasMolecule = terminals.length > 0;
  const lonePairsRaw = computeLonePairs(central, terminals);
  // An odd number of electrons left over means the structure isn't
  // finished pairing up yet (e.g. carbon after one or three chlorines) --
  // that's "incomplete," not invalid, so it still renders (with a
  // provisional 0 lone pairs) rather than blocking the build.
  const isIncomplete = hasMolecule && lonePairsRaw === null;
  const lonePairs = lonePairsRaw ?? 0;
  const totalDomains = terminals.length + lonePairs;

  // Reinitialize on a fresh sphere layout and relax toward the repulsion
  // minimum whenever the central atom or its attached terminals change,
  // animating the settle.
  useEffect(() => {
    if (!hasMolecule) {
      setDomains([]);
      return;
    }
    let raf = 0;
    let current = initialDomainsWithElements(terminals, lonePairs);
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
  }, [central, terminals, lonePairs, hasMolecule, lonePairWeight]);

  useEffect(() => {
    return () => {
      if (rejectTimerRef.current) window.clearTimeout(rejectTimerRef.current);
    };
  }, []);

  const molecularName = molecularGeometryName(terminals.length, lonePairs);
  const electronName = electronGeometryName(terminals.length, lonePairs);
  const angle = bondAngleFromDomains(domains);
  const formula = hasMolecule ? formulaOf(central, terminals) : null;

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

  const flashReject = (reason: string) => {
    setRejectMsg(reason);
    if (rejectTimerRef.current) window.clearTimeout(rejectTimerRef.current);
    rejectTimerRef.current = window.setTimeout(() => setRejectMsg(null), 3500);
  };

  // The one gate on everything a user can build: try the attachment, and
  // if plain valence-electron bookkeeping says it isn't legal (the octet
  // rule, an odd leftover electron, more domains than the atom can hold),
  // refuse the drop and say exactly which rule it broke.
  const attemptAttach = (el: ElementSymbol) => {
    const result = tryAttach(central, terminals, el);
    if (!result.ok) {
      flashReject(result.reason);
      return;
    }
    setRejectMsg(null);
    setTerminals((t) => [...t, el]);
    setChecked(null);
  };

  const removeTerminalAt = (index: number) => {
    setTerminals((t) => t.filter((_, i) => i !== index));
    setChecked(null);
  };

  const selectCentral = (el: ElementSymbol) => {
    setCentral(el);
    setTerminals([]);
    setRejectMsg(null);
    setChecked(null);
  };

  const onTileDragStart = (e: ReactDragEvent<HTMLButtonElement>, el: ElementSymbol) => {
    e.dataTransfer.setData("text/plain", el);
    e.dataTransfer.effectAllowed = "copy";
  };
  const onDropZoneOver = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDropHover(true);
  };
  const onDropZoneLeave = () => setDropHover(false);
  const onDropZoneDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropHover(false);
    const el = e.dataTransfer.getData("text/plain") as ElementSymbol;
    if (el && ELEMENTS[el]) attemptAttach(el);
  };

  const startChallenge = () => {
    setMode("challenge");
    setDeck(shuffledDeck());
    setDeckIndex(0);
    setScore(0);
    setAttempts(0);
    setRejectMsg(null);
    setCentral("C");
    setTerminals([]);
  };

  const checkAnswer = () => {
    const correct = central === target.central && sameComposition(terminals, target.terminals);
    setChecked(correct);
    setAttempts((a) => a + 1);
    if (correct) setScore((sc) => sc + 1);
  };

  const nextMolecule = () => {
    setDeckIndex((i) => i + 1);
    setChecked(null);
    setRejectMsg(null);
    setCentral("C");
    setTerminals([]);
  };

  const usedElements = hasMolecule ? [central, ...new Set(terminals)] : [central];

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {hasMolecule ? "Building" : "Pick a central atom, then attach terminal atoms"}
          </span>
          {formula && <p className="text-2xl font-bold">{formula}</p>}
          {isIncomplete && (
            <p className="mt-1 text-xs text-muted-foreground">
              Not a finished structure yet — {centralInfo.name} has an electron left unpaired.
              Attach one more bond to complete it.
            </p>
          )}
        </div>

        <div
          onDragOver={onDropZoneOver}
          onDragLeave={onDropZoneLeave}
          onDrop={onDropZoneDrop}
          className={`relative aspect-[16/10] overflow-hidden rounded-xl border bg-card shadow-sm transition-colors ${
            dropHover ? "border-accent ring-2 ring-accent/40" : "border-border"
          }`}
        >
          <svg
            viewBox="0 0 300 300"
            className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <circle cx="150" cy="150" r={centralInfo.radius} fill={centralInfo.color} />
            {projected.map(({ d, i, p }) => {
              const x = 150 + p.x * 110;
              const y = 150 + p.y * 110;
              if (d.kind === "bond") {
                const el = d.element!;
                const info = ELEMENTS[el];
                const r = info.radius * 0.75 * p.scale;
                const isDouble = TERMINAL_BOND_COST[el] === 2;
                const perpX = -(y - 150) / 110;
                const perpY = (x - 150) / 110;
                return (
                  <g key={i} onClick={() => removeTerminalAt(i)} className="cursor-pointer">
                    {isDouble ? (
                      <>
                        <line
                          x1={150 + perpX * 2.5}
                          y1={150 + perpY * 2.5}
                          x2={x + perpX * 2.5}
                          y2={y + perpY * 2.5}
                          stroke="var(--muted-foreground)"
                          strokeWidth={1.6 * p.scale}
                        />
                        <line
                          x1={150 - perpX * 2.5}
                          y1={150 - perpY * 2.5}
                          x2={x - perpX * 2.5}
                          y2={y - perpY * 2.5}
                          stroke="var(--muted-foreground)"
                          strokeWidth={1.6 * p.scale}
                        />
                      </>
                    ) : (
                      <line
                        x1="150"
                        y1="150"
                        x2={x}
                        y2={y}
                        stroke="var(--muted-foreground)"
                        strokeWidth={2 * p.scale}
                      />
                    )}
                    {/* Padded, invisible hit target -- the visible atom is
                        often small at the back of the sphere, so relying on
                        the painted circle alone makes "click to remove"
                        unreliably fiddly to actually land. */}
                    <circle
                      cx={x}
                      cy={y}
                      r={Math.max(r + 6, 10)}
                      fill="transparent"
                      style={{ pointerEvents: "all" }}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={r}
                      fill={info.color}
                      stroke="var(--card)"
                      strokeWidth={1}
                    />
                  </g>
                );
              }
              const r = 8 * p.scale;
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
            Drag to rotate · click an atom to remove it
          </p>
          {!hasMolecule && (
            <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Drop or click a terminal atom to begin
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
                {el === central ? " (central)" : ""}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Electron geometry
            </span>
            <span className="font-mono text-base font-bold">
              {isIncomplete ? "Incomplete" : hasMolecule ? electronName : "—"}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Molecular shape
            </span>
            <span className="font-mono text-base font-bold text-accent">
              {isIncomplete ? "Incomplete" : hasMolecule ? molecularName : "—"}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Narrowest bond angle
            </span>
            <span className="font-mono text-base font-bold">
              {angle && !isIncomplete ? `${angle.toFixed(1)}°` : "—"}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Domains used
            </span>
            <span className="font-mono text-base font-bold">
              {totalDomains} / {centralInfo.maxDomains}
              <span className="ml-1 font-normal text-muted-foreground">
                ({isIncomplete ? "pending" : `${lonePairs} lone`})
              </span>
            </span>
          </div>
        </div>
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

          <div className="space-y-5">
            <div>
              <h4 className="mb-3 text-xs font-medium">Central atom</h4>
              <div className="grid grid-cols-5 gap-2">
                {CENTRAL_CANDIDATES.map((el) => (
                  <ElementTile
                    key={el}
                    el={el}
                    selected={el === central}
                    onClick={() => selectCentral(el)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-medium">Terminal atoms — drag or click to attach</h4>
              <div className="grid grid-cols-4 gap-2">
                {TERMINAL_CANDIDATES.map((el) => (
                  <ElementTile
                    key={el}
                    el={el}
                    draggable
                    onDragStart={(e) => onTileDragStart(e, el)}
                    onClick={() => attemptAttach(el)}
                  />
                ))}
              </div>
              {rejectMsg && (
                <p className="mt-3 font-mono text-[11px] leading-relaxed text-destructive">
                  {rejectMsg}
                </p>
              )}
            </div>

            {hasMolecule && (
              <div>
                <h4 className="mb-3 text-xs font-medium">Attached</h4>
                <div className="flex flex-wrap gap-2">
                  {terminals.map((el, i) => (
                    <button
                      key={`${el}-${i}`}
                      onClick={() => removeTerminalAt(i)}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium transition-colors hover:border-destructive hover:text-destructive"
                      aria-label={`Remove ${ELEMENTS[el].name}`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: ELEMENTS[el].color }}
                      />
                      {el}
                      <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                1.0× treats lone pairs like bonding pairs, no compression. Push it higher and watch
                bond angles squeeze further than real chemistry (~1.2×) ever needs to.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">
            Every attachment is checked the way a chemist would: count the central atom's valence
            electrons, subtract one pair per bond, and whatever's left becomes lone pairs. Run out
            of electrons or push past the octet's domain limit and the atom won't drop — the same
            rule that gives XeF₂ three lone pairs and refuses a 5th bond on carbon. An odd electron
            in between is just unfinished, not illegal — one more bond pairs it up.
          </p>
          <div className="font-mono text-xs text-accent">— VSEPR theory</div>
        </div>
      </aside>
    </div>
  );
}

function ElementTile({
  el,
  selected,
  draggable,
  onClick,
  onDragStart,
}: {
  el: ElementSymbol;
  selected?: boolean;
  draggable?: boolean;
  onClick: () => void;
  onDragStart?: (e: ReactDragEvent<HTMLButtonElement>) => void;
}) {
  const info = ELEMENTS[el];
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      title={info.name}
      aria-label={info.name}
      className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-xs font-bold transition-colors ${
        selected ? "border-accent bg-accent/10 text-accent" : "border-border hover:bg-secondary"
      } ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <span className="h-3 w-3 rounded-full" style={{ background: info.color }} />
      {el}
    </button>
  );
}

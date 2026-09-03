import { useEffect, useState, type PointerEvent as ReactPointerEvent, useRef } from "react";
import {
  initialDomains,
  relaxStep,
  maxDisplacement,
  electronGeometryName,
  molecularGeometryName,
  bondAngleFromDomains,
  shuffledDeck,
  type Domain,
  type MoleculeTarget,
} from "@/lib/vsepr";

const MAX_DOMAINS = 6;

export function VseprBuilder() {
  const [bonding, setBonding] = useState(4);
  const [lone, setLone] = useState(0);
  const [domains, setDomains] = useState<Domain[]>(() => initialDomains(4, 0));
  const [yaw, setYaw] = useState(0.6);
  const [pitch, setPitch] = useState(0.3);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const [mode, setMode] = useState<"practice" | "challenge">("practice");
  const [deck, setDeck] = useState<MoleculeTarget[]>(() => shuffledDeck());
  const [deckIndex, setDeckIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [checked, setChecked] = useState<boolean | null>(null);

  const target = deck[deckIndex % deck.length]!;

  // Reinitialize on a fresh sphere layout and relax toward the repulsion
  // minimum whenever the domain counts change, animating the settle.
  useEffect(() => {
    let raf = 0;
    let current = initialDomains(bonding, lone);
    setDomains(current);
    const step = () => {
      const next = relaxStep(current, 0.06);
      const delta = maxDisplacement(current, next);
      current = next;
      setDomains(current);
      if (delta > 0.0005) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [bonding, lone]);

  const total = bonding + lone;
  const molecularName = molecularGeometryName(bonding, lone);
  const electronName = electronGeometryName(bonding, lone);
  const angle = bondAngleFromDomains(domains);

  const project = (d: Domain) => {
    const [x0, y0, z0] = d.pos;
    const x1 = x0 * Math.cos(yaw) + z0 * Math.sin(yaw);
    const z1 = -x0 * Math.sin(yaw) + z0 * Math.cos(yaw);
    const y1 = y0 * Math.cos(pitch) - z1 * Math.sin(pitch);
    const z2 = y0 * Math.sin(pitch) + z1 * Math.cos(pitch);
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
    setPitch((p) => Math.max(-1.4, Math.min(1.4, p + dy * 0.01)));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const setCounts = (b: number, l: number) => {
    setBonding(Math.max(0, Math.min(MAX_DOMAINS, b)));
    setLone(Math.max(0, Math.min(MAX_DOMAINS - Math.max(0, Math.min(MAX_DOMAINS, b)), l)));
    setChecked(null);
  };

  const startChallenge = () => {
    setMode("challenge");
    setDeck(shuffledDeck());
    setDeckIndex(0);
    setScore(0);
    setAttempts(0);
    setCounts(2, 0);
  };

  const checkAnswer = () => {
    const correct = bonding === target.bonding && lone === target.lone;
    setChecked(correct);
    setAttempts((a) => a + 1);
    if (correct) setScore((sc) => sc + 1);
  };

  const nextMolecule = () => {
    setDeckIndex((i) => i + 1);
    setCounts(2, 0);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
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
          </svg>
          <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Drag to rotate
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
            <span className="font-mono text-base font-bold text-accent">{molecularName}</span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Narrowest bond angle
            </span>
            <span className="font-mono text-base font-bold">
              {angle ? `${angle.toFixed(1)}°` : "—"}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <span className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
              Domains used
            </span>
            <span className="font-mono text-base font-bold">
              {total} / {MAX_DOMAINS}
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
                      : `Not quite — ${target.centralAtom} needs ${target.bonding} bonding pair${target.bonding === 1 ? "" : "s"} and ${target.lone} lone pair${target.lone === 1 ? "" : "s"}.`}
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

          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between text-xs font-medium">
                <span>Bonding pairs</span>
                <span className="font-mono text-accent">{bonding}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCounts(bonding - 1, lone)}
                  disabled={bonding <= 0}
                  className="flex-1 rounded-lg border border-border py-2 text-sm font-bold transition-colors hover:bg-secondary disabled:opacity-30"
                >
                  −
                </button>
                <button
                  onClick={() => setCounts(bonding + 1, lone)}
                  disabled={total >= MAX_DOMAINS}
                  className="flex-1 rounded-lg border border-border py-2 text-sm font-bold transition-colors hover:bg-secondary disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between text-xs font-medium">
                <span>Lone pairs</span>
                <span className="font-mono text-accent">{lone}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCounts(bonding, lone - 1)}
                  disabled={lone <= 0}
                  className="flex-1 rounded-lg border border-border py-2 text-sm font-bold transition-colors hover:bg-secondary disabled:opacity-30"
                >
                  −
                </button>
                <button
                  onClick={() => setCounts(bonding, lone + 1)}
                  disabled={total >= MAX_DOMAINS}
                  className="flex-1 rounded-lg border border-border py-2 text-sm font-bold transition-colors hover:bg-secondary disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">
            Lone pairs repel more strongly than bonding pairs, which is why they push bonding pairs
            closer together — this is simulated directly, not looked up, which is why water's angle
            settles near the real 104.5° instead of the ideal 109.5°.
          </p>
          <div className="font-mono text-xs text-accent">— VSEPR theory</div>
        </div>
      </aside>
    </div>
  );
}

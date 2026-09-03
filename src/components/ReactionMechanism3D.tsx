import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { rotate3d, type Vec3 } from "@/lib/project3d";

// SN2 substitution, Br- + CH3Cl -> CH3Br + Cl-, staged as an explicit
// keyframe animation rather than a physics simulation: the geometry of a
// backside attack (and the inversion it produces) is exact and well known,
// so hand-authoring it is both simpler and more faithful than trying to
// derive it from a force model.
const DEG = Math.PI / 180;
const FAR = 220; // nucleophile's starting distance
const BOND = 45; // a formed single bond
const DEPARTED = 300; // leaving group's final distance

type Outcome = "reacted" | "bounced-angle" | "bounced-speed";

function smoothstep(x: number) {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
}

function determineOutcome(speed: number, angleOffset: number): Outcome {
  if (angleOffset > 35) return "bounced-angle";
  if (speed < 55) return "bounced-speed";
  return "reacted";
}

function hydrogens(theta: number): Vec3[] {
  const rH = 40;
  return [0, 1, 2].map((k) => {
    const phi = (k * 120 + 30) * DEG;
    return [
      rH * Math.sin(theta) * Math.cos(phi),
      rH * Math.sin(theta) * Math.sin(phi),
      rH * Math.cos(theta),
    ] as Vec3;
  });
}

function computeScene(t: number, outcome: Outcome, angleOffsetDeg: number) {
  if (outcome === "reacted") {
    // Umbrella inversion: H's swing from pointing away from the leaving
    // group (109.5 deg from +z), through planar at the transition state
    // (90 deg, t=0.5), to pointing away from the new bond (70.5 deg).
    const theta = (109.5 - 39 * t) * DEG;
    const zBr = -FAR + (FAR - BOND) * smoothstep(t / 0.6);
    const zCl = t < 0.5 ? BOND : BOND + (DEPARTED - BOND) * smoothstep((t - 0.5) / 0.5);
    return {
      C: [0, 0, 0] as Vec3,
      H: hydrogens(theta),
      Cl: [0, 0, zCl] as Vec3,
      Br: [0, 0, zBr] as Vec3,
      bondCl: Math.max(0, Math.min(1, 1 - (zCl - BOND) / (DEPARTED - BOND))),
      bondBr: Math.max(0, Math.min(1, 1 - (-zBr - BOND) / (FAR - BOND))),
    };
  }

  // Failure: the nucleophile approaches, gets only as close as its
  // trajectory/energy allows, then recedes back out. Nothing else about
  // the molecule moves, since no reaction actually starts.
  const closest = outcome === "bounced-angle" ? 95 : 130;
  const dir: Vec3 = [Math.sin(angleOffsetDeg * DEG), 0, -Math.cos(angleOffsetDeg * DEG)];
  const p =
    t < 0.5
      ? FAR - (FAR - closest) * smoothstep(t / 0.5)
      : closest + (FAR - closest) * smoothstep((t - 0.5) / 0.5);
  return {
    C: [0, 0, 0] as Vec3,
    H: hydrogens(109.5 * DEG),
    Cl: [0, 0, BOND] as Vec3,
    Br: [dir[0] * p, dir[1] * p, dir[2] * p] as Vec3,
    bondCl: 1,
    bondBr: Math.max(0, Math.min(1, 1 - (p - BOND) / (FAR - BOND))),
  };
}

function caption(t: number, outcome: Outcome) {
  if (outcome === "bounced-angle") {
    return t < 0.5
      ? "Bromide approaches from the wrong side..."
      : "Blocked by the hydrogens — it bounces off without reacting. Attack only works from directly opposite the leaving group.";
  }
  if (outcome === "bounced-speed") {
    return t < 0.5
      ? "Bromide drifts in too slowly to overcome the energy barrier..."
      : "It never gets close enough to react and drifts back apart.";
  }
  if (t < 0.35)
    return "Bromide approaches from directly behind the chlorine — the only angle that works.";
  if (t < 0.65) return "Transition state: the C–Cl bond is breaking as the C–Br bond forms.";
  return "Chloride leaves. The carbon's arrangement has flipped inside out — this is the SN2 mechanism.";
}

const CENTER = 175;
const FOCAL = 800;

export function ReactionMechanism3D() {
  const [speed, setSpeed] = useState(80);
  const [angleOffset, setAngleOffset] = useState(0);
  const [yaw, setYaw] = useState(0.5);
  const [pitch, setPitch] = useState(0.2);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>("reacted");
  const startRef = useRef<number | null>(null);

  const play = () => {
    setOutcome(determineOutcome(speed, angleOffset));
    startRef.current = null;
    setT(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const DURATION = 3600;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const next = Math.min(1, (now - startRef.current) / DURATION);
      setT(next);
      if (next < 1) raf = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => {
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scene = computeScene(t, outcome, angleOffset);

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
    setPitch((p) => Math.max(-1.3, Math.min(1.3, p + dy * 0.01)));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const project = (pos: Vec3) => {
    const [x1, y1, z2] = rotate3d(pos, yaw, pitch);
    const s = FOCAL / (FOCAL - z2);
    return { x: CENTER + x1 * s, y: CENTER + y1 * s, z: z2, s };
  };

  const atoms = [
    { key: "C", pos: scene.C, color: "rgba(15, 23, 42, 0.92)", r: 12 },
    ...scene.H.map((p, i) => ({ key: `H${i}`, pos: p, color: "rgba(148, 163, 184, 0.9)", r: 6 })),
    { key: "Cl", pos: scene.Cl, color: "rgba(234, 179, 8, 0.92)", r: 9 },
    { key: "Br", pos: scene.Br, color: "rgba(14, 165, 233, 0.92)", r: 9 },
  ].map((a) => ({ ...a, proj: project(a.pos) }));
  atoms.sort((a, b) => a.proj.z - b.proj.z);

  const cProj = project(scene.C);
  const clProj = project(scene.Cl);
  const brProj = project(scene.Br);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <svg
            viewBox="0 0 350 350"
            className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <line
              x1={cProj.x}
              y1={cProj.y}
              x2={clProj.x}
              y2={clProj.y}
              stroke="rgba(234, 179, 8, 0.85)"
              strokeWidth={3}
              strokeOpacity={scene.bondCl}
            />
            <line
              x1={cProj.x}
              y1={cProj.y}
              x2={brProj.x}
              y2={brProj.y}
              stroke="rgba(14, 165, 233, 0.85)"
              strokeWidth={3}
              strokeOpacity={scene.bondBr}
            />
            {scene.H.map((h, i) => {
              const hp = project(h);
              return (
                <line
                  key={`bond-h${i}`}
                  x1={cProj.x}
                  y1={cProj.y}
                  x2={hp.x}
                  y2={hp.y}
                  stroke="rgba(148, 163, 184, 0.6)"
                  strokeWidth={2}
                />
              );
            })}
            {atoms.map((a) => (
              <circle key={a.key} cx={a.proj.x} cy={a.proj.y} r={a.r * a.proj.s} fill={a.color} />
            ))}
          </svg>
          <p className="pointer-events-none absolute bottom-3 left-3 right-3 font-mono text-xs text-muted-foreground">
            {caption(t, outcome)}
          </p>
          <p className="pointer-events-none absolute right-3 top-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Drag to rotate
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgb(15, 23, 42)" }} />
            Carbon
          </span>
          <span className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "rgb(148, 163, 184)" }}
            />
            Hydrogen
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgb(234, 179, 8)" }} />
            Chlorine (leaving group)
          </span>
          <span className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "rgb(14, 165, 233)" }}
            />
            Bromide (nucleophile)
          </span>
        </div>
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest">
            Collision parameters
          </h3>
          <div className="space-y-8">
            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Approach speed</span>
                <span className="font-mono text-accent">{speed}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={speed}
                aria-label="Approach speed"
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                Below ~55, the ion never carries enough energy to reach bonding distance.
              </p>
            </div>
            <div>
              <div className="mb-3 flex justify-between text-xs font-medium">
                <span>Attack angle off backside</span>
                <span className="font-mono text-accent">{angleOffset}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={90}
                value={angleOffset}
                aria-label="Attack angle off backside"
                onChange={(e) => setAngleOffset(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
              />
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                Past ~35°, the hydrogens block the approach entirely.
              </p>
            </div>
            <button
              onClick={play}
              disabled={playing}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              {playing ? "Playing…" : "Replay"}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">
            This is why SN2 reactions invert configuration — the nucleophile can only attack from
            directly opposite the leaving group, so bonding on one side forces the other three
            groups to flip through like an umbrella catching the wind.
          </p>
          <div className="font-mono text-xs text-accent">— Backside attack</div>
        </div>
      </aside>
    </div>
  );
}

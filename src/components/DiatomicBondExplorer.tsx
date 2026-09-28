import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ELEMENTS,
  axialExtents,
  buildMolecule,
  coeffs,
  cosSpace,
  hund,
  nodeX,
  partnersOf,
  profile,
  psi,
  type DiatomicElement,
  type MOLevelSpec,
  type Molecule,
} from "@/lib/diatomic";
import { rotate3d, type Vec3 } from "@/lib/project3d";
import { AxisGizmo } from "@/components/AxisGizmo";

/**
 * Diatomic Bond Explorer.
 *
 * Pick any two main-group elements that form a tabulated diatomic and watch
 * the bond assemble: the two atoms approach, their valence functions overlap
 * into a sigma molecular orbital, and the electron density settles -- shifted
 * toward the more electronegative partner when they differ.
 *
 * Rendered as projected SVG rather than WebGL, matching every other 3D view on
 * this site (the orbital cloud, the mechanism explorer, the equilibrium scene)
 * so it needs no new dependency and inherits the page's own theme.
 *
 * The sigma isosurface is the one piece that looks like it should need a mesh
 * and does not. It is a surface of revolution about the internuclear axis, so
 * it has a single profile rho(x), and a surface of revolution presents that
 * same profile as its silhouette from every direction -- only the on-screen
 * width of the offset changes with the viewing angle, by one factor computed
 * once per frame. So the whole orbital draws as two mirrored polylines.
 */

const CLOUD_POINTS = 1100;
const FORM_SECONDS = 5;
const VIEW = 300; // viewBox is VIEW x VIEW

type CloudPoint = { pos: Vec3; w: number };

/** Sample |psi_sigma|^2 by rejection, with an exponential radial proposal. */
function sampleCloud(
  count: number,
  R: number,
  cA: number,
  cB: number,
  kA: number,
  kB: number,
  rand: () => number,
): CloudPoint[] {
  const out: CloudPoint[] = [];
  // Weight each centre by how much density it carries, so the proposal is not
  // wasted on the wrong atom for a strongly polar bond.
  const wA = (cA * cA) / kA ** 3;
  const wB = (cB * cB) / kB ** 3;
  let peak = 0;
  for (let i = 0; i <= 40; i++) {
    const x = -R / 2 + (R * i) / 40;
    peak = Math.max(peak, Math.abs(psi(x, 0, R, cA, cB, kA, kB, 1)));
  }
  peak = Math.max(peak, 1e-6);
  let guard = 0;
  while (out.length < count && guard < count * 300) {
    guard++;
    const onA = rand() < wA / (wA + wB);
    const k = onA ? kA : kB;
    // Gamma(3)-ish radius: three exponentials, which matches how a 1s-like
    // density actually falls off far better than a single exponential.
    const r =
      -(Math.log(rand() || 1e-12) + Math.log(rand() || 1e-12) + Math.log(rand() || 1e-12)) /
      (2 * k);
    const u = 2 * rand() - 1;
    const phi = 2 * Math.PI * rand();
    const s = Math.sqrt(Math.max(0, 1 - u * u));
    const px = r * s * Math.cos(phi) + (onA ? -1 : 1) * (R / 2);
    const py = r * s * Math.sin(phi);
    const pz = r * u;
    const rho = Math.hypot(py, pz);
    const v = Math.abs(psi(px, rho, R, cA, cB, kA, kB, 1));
    if (rand() * peak > v) continue;
    out.push({ pos: [px, py, pz], w: v });
  }
  return out;
}

function easeInOut(u: number): number {
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

const MO_COLOR = {
  bonding_sigma: "var(--fig-2)",
  bonding_pi: "var(--fig-3)",
  antibonding: "var(--fig-1)",
  nonbonding: "var(--muted-foreground)",
} as const;

function levelColor(l: MOLevelSpec): string {
  if (l.sign < 0) return MO_COLOR.antibonding;
  if (l.sign === 0) return MO_COLOR.nonbonding;
  return l.kind === "pi" ? MO_COLOR.bonding_pi : MO_COLOR.bonding_sigma;
}

export function DiatomicBondExplorer() {
  const [selA, setSelA] = useState<string>("H");
  const [pendingA, setPendingA] = useState<string | null>(null);
  const [selB, setSelB] = useState<string>("H");
  const [yaw, setYaw] = useState(0.5);
  const [pitch, setPitch] = useState(0.28);
  const [showCloud, setShowCloud] = useState(true);
  const [showSigma, setShowSigma] = useState(true);
  const [showPi, setShowPi] = useState(true);
  const [showAnti, setShowAnti] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [t, setT] = useState(0);
  const [replayAt, setReplayAt] = useState(0);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const mol: Molecule = useMemo(
    () => buildMolecule(selA, selB) ?? buildMolecule("H", "H")!,
    [selA, selB],
  );

  // Animation clock. Runs client-side only, so the server render is the
  // settled molecule at t = 0 rather than a random frame.
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      setT((performance.now() - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [replayAt, selA, selB]);

  useEffect(() => {
    if (!autoRotate) return;
    let raf = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      setYaw((y) => y + dt * 0.22);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoRotate]);

  const forming = t < FORM_SECONDS;
  const u = easeInOut(Math.min(t / (FORM_SECONDS - 0.5), 1));
  // Start far apart, ease to the equilibrium length, then breathe gently.
  const rStart = mol.r + 1.9 * mol.r;
  const R = forming
    ? rStart + (mol.r - rStart) * u
    : mol.r * (1 + 0.02 * Math.sin((t - FORM_SECONDS) * 2 * Math.PI * 0.55));
  const pol = mol.polarity * (forming ? u : 1);
  const [cA, cB] = coeffs(pol);

  // Scene scale, fixed from the settled molecule so it does not jump as the
  // bond forms.
  const scale = useMemo(() => {
    const [cA0, cB0] = coeffs(mol.polarity);
    const [xL, xR] = axialExtents(mol.r, cA0, cB0, mol.kA, mol.kB, 1);
    const span = Math.max(xR - xL, mol.r * 2.6);
    return (VIEW * 0.78) / span;
  }, [mol]);

  const cloud = useMemo(() => {
    const [cA0, cB0] = coeffs(mol.polarity);
    // Deterministic: a seeded generator, so server and client agree and a
    // re-render never reshuffles the cloud.
    let seed = 0x2f6e2b1 ^ (mol.A.Z * 73856093) ^ (mol.B.Z * 19349663);
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    return sampleCloud(CLOUD_POINTS, mol.r, cA0, cB0, mol.kA, mol.kB, rand);
  }, [mol]);

  const prof = useMemo(() => {
    const [xL, xR] = axialExtents(R, cA, cB, mol.kA, mol.kB, 1);
    return profile(cosSpace(xL, xR, 120), R, cA, cB, mol.kA, mol.kB, 1);
  }, [R, cA, cB, mol.kA, mol.kB]);

  const antiProf = useMemo(() => {
    if (!showAnti) return null;
    const [xL, xR] = axialExtents(R, cA, cB, mol.kA, mol.kB, -1);
    const xn = nodeX(R, cA, cB, mol.kA, mol.kB);
    return {
      left: profile(cosSpace(xL, xn, 70), R, cA, cB, mol.kA, mol.kB, -1),
      right: profile(cosSpace(xn, xR, 70), R, cA, cB, mol.kA, mol.kB, -1),
      xn,
    };
  }, [showAnti, R, cA, cB, mol.kA, mol.kB]);

  /* ---- projection ---- */
  const C = VIEW / 2;
  const proj = (p: Vec3) => {
    const [x, y, z] = rotate3d(p, yaw, pitch);
    return { x: C + x * scale, y: C - y * scale, z };
  };
  // Rotated basis. The internuclear axis is +x; the offset directions that
  // build the surface of revolution are +y and +z.
  const ex = rotate3d([1, 0, 0], yaw, pitch);
  const ey = rotate3d([0, 1, 0], yaw, pitch);
  const ez = rotate3d([0, 0, 1], yaw, pitch);
  // Screen-space perpendicular to the projected axis.
  const axLen = Math.hypot(ex[0], ex[1]) || 1e-6;
  const nx = -ex[1] / axLen;
  const ny = ex[0] / axLen;
  // How wide a unit offset circle appears along that perpendicular: the
  // envelope of the projected circle, which is the same for every x.
  const offW = Math.hypot(ey[0] * nx + ey[1] * ny, ez[0] * nx + ez[1] * ny);

  const silhouette = (pts: { x: number; rho: number }[]) => {
    if (pts.length === 0) return "";
    const top = pts.map((p) => {
      const c = proj([p.x, 0, 0]);
      return `${(c.x + p.rho * scale * offW * nx).toFixed(2)},${(c.y - p.rho * scale * offW * ny * -1).toFixed(2)}`;
    });
    const bot = [...pts].reverse().map((p) => {
      const c = proj([p.x, 0, 0]);
      return `${(c.x - p.rho * scale * offW * nx).toFixed(2)},${(c.y + p.rho * scale * offW * ny * -1).toFixed(2)}`;
    });
    return `M${top.join(" L")} L${bot.join(" L")} Z`;
  };

  const nucRadius = (el: DiatomicElement) =>
    Math.max(7, (5.2 + 2.4 * Math.sqrt(el.Z)) * (scale / 90));

  // Element tints run from near-white (hydrogen) to mid-tone, so one fixed
  // label colour is illegible on half of them. Take the ink from the tint's
  // own luminance instead.
  const labelInk = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55
      ? "var(--foreground)"
      : "var(--card)";
  };
  const pA = proj([-R / 2, 0, 0]);
  const pB = proj([R / 2, 0, 0]);

  const piVisible = showPi && mol.nPi > 0 && !forming;
  const piLobes = useMemo(() => {
    if (mol.nPi === 0) return [];
    const dirs: Vec3[] =
      mol.nPi >= 2
        ? [
            [0, 1, 0],
            [0, -1, 0],
            [0, 0, 1],
            [0, 0, -1],
          ]
        : [
            [0, 1, 0],
            [0, -1, 0],
          ];
    return dirs;
  }, [mol.nPi]);

  const projectedCloud = useMemo(() => {
    if (!showCloud) return [];
    return cloud.map((p) => ({ ...p, pr: proj(p.pos) })).sort((a, b) => a.pr.z - b.pr.z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloud, showCloud, yaw, pitch, scale]);

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
    setAutoRotate(false);
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

  /* ---- element picker ---- */
  const choosing = pendingA !== null;
  const allowed = choosing ? partnersOf(pendingA) : null;
  const pick = (sym: string) => {
    const el = ELEMENTS[sym];
    if (!el || el.en == null) return;
    if (!choosing) {
      setPendingA(sym);
      return;
    }
    if (allowed?.has(sym)) {
      setSelA(pendingA);
      setSelB(sym);
      setPendingA(null);
      setReplayAt((n) => n + 1);
    }
  };

  const caption = forming
    ? t < 2.2
      ? `${mol.A.sym}· + ·${mol.B.sym} — approaching`
      : mol.type === "ionic"
        ? `electron density transfers ${mol.dEN > 0 ? `${mol.A.sym} → ${mol.B.sym}` : `${mol.B.sym} → ${mol.A.sym}`}`
        : `valence orbitals overlap → σ${mol.nPi ? " + π" : ""} bond`
    : `${mol.formula} · ${mol.type} · bond order ${mol.bondOrder}`;

  const neg = mol.dEN > 0 ? mol.B : mol.A;
  const moDisagrees = mol.moBondOrder !== mol.bondOrder;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-7">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Diatomic molecule
          </span>
          <p className="text-2xl font-bold">
            {mol.formula}{" "}
            <span className="text-base font-normal text-muted-foreground">
              {mol.homonuclear ? `${mol.A.name} · homonuclear` : `${mol.A.name} + ${mol.B.name}`}
            </span>
          </p>
        </div>

        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            role="img"
            aria-label={`Three-dimensional view of ${mol.formula}: two nuclei joined by a sigma molecular orbital, with the electron density ${mol.type === "nonpolar covalent" ? "shared equally" : `shifted toward ${neg.sym}`}. Bond length ${mol.r.toFixed(3)} angstroms, bond order ${mol.bondOrder}.`}
          >
            {/* internuclear axis */}
            <line
              x1={proj([-R / 2 - mol.r * 0.55, 0, 0]).x}
              y1={proj([-R / 2 - mol.r * 0.55, 0, 0]).y}
              x2={proj([R / 2 + mol.r * 0.55, 0, 0]).x}
              y2={proj([R / 2 + mol.r * 0.55, 0, 0]).y}
              stroke="var(--fig-axis)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />

            {/* sigma* antibonding, drawn under the bonding surface */}
            {antiProf && (
              <g>
                <path
                  d={silhouette(antiProf.left)}
                  fill="var(--fig-1)"
                  opacity={0.2}
                  stroke="var(--fig-1)"
                  strokeWidth={1}
                />
                <path
                  d={silhouette(antiProf.right)}
                  fill="var(--fig-2)"
                  opacity={0.2}
                  stroke="var(--fig-2)"
                  strokeWidth={1}
                />
                <ellipse
                  cx={proj([antiProf.xn, 0, 0]).x}
                  cy={proj([antiProf.xn, 0, 0]).y}
                  rx={Math.max(2, 0.9 * scale * offW)}
                  ry={Math.max(2, 0.9 * scale * Math.abs(ex[2]) + 1)}
                  transform={`rotate(${(Math.atan2(ny, nx) * 180) / Math.PI} ${proj([antiProf.xn, 0, 0]).x} ${proj([antiProf.xn, 0, 0]).y})`}
                  fill="none"
                  stroke="var(--fig-1)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.7}
                />
              </g>
            )}

            {/* pi lobes */}
            {piVisible &&
              piLobes.map((d, i) => {
                const off: Vec3 = [0, d[1] * mol.A.rc * 0.95, d[2] * mol.A.rc * 0.95];
                const c = proj(off);
                const along = Math.hypot(ex[0], ex[1]) * scale * (R / 2 + 0.28);
                return (
                  <ellipse
                    key={i}
                    cx={c.x}
                    cy={c.y}
                    rx={Math.max(3, along)}
                    ry={Math.max(3, mol.A.rc * 0.5 * scale * offW)}
                    transform={`rotate(${(Math.atan2(-ex[1], ex[0]) * 180) / Math.PI} ${c.x} ${c.y})`}
                    fill="var(--fig-3)"
                    opacity={0.22}
                    stroke="var(--fig-3)"
                    strokeWidth={1}
                  />
                );
              })}

            {/* sigma bonding isosurface */}
            {showSigma && (
              <path
                d={silhouette(prof)}
                fill="var(--fig-2)"
                opacity={0.17}
                stroke="var(--fig-2)"
                strokeWidth={1.25}
              />
            )}

            {/* electron density */}
            {projectedCloud.map((p, i) => (
              <circle
                key={i}
                cx={p.pr.x}
                cy={p.pr.y}
                r={0.9 / (1.5 - p.pr.z * 0.02)}
                fill="var(--fig-2)"
                opacity={0.5}
              />
            ))}

            {/* nuclei, painted back to front */}
            {(pA.z <= pB.z
              ? [
                  [pA, mol.A],
                  [pB, mol.B],
                ]
              : [
                  [pB, mol.B],
                  [pA, mol.A],
                ]
            ).map(([p, el], i) => {
              const pt = p as { x: number; y: number; z: number };
              const e = el as DiatomicElement;
              return (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r={nucRadius(e)} fill={e.color} />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={nucRadius(e)}
                    fill="none"
                    stroke="var(--foreground)"
                    strokeWidth={0.75}
                    opacity={0.35}
                  />
                  <text
                    x={pt.x}
                    y={pt.y + 3.5}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={700}
                    fill={labelInk(e.color)}
                  >
                    {e.sym}
                  </text>
                </g>
              );
            })}

            <AxisGizmo yaw={yaw} pitch={pitch} cx={34} cy={34} radius={19} />
          </svg>
          <p className="pointer-events-none absolute bottom-3 left-3 right-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {caption}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Toggle
            checked={showCloud}
            onChange={setShowCloud}
            color="var(--fig-2)"
            label="Density |ψ|²"
          />
          <Toggle
            checked={showSigma}
            onChange={setShowSigma}
            color="var(--fig-2)"
            label="σ bonding"
          />
          <Toggle
            checked={showPi}
            onChange={setShowPi}
            color="var(--fig-3)"
            label={`π bond${mol.nPi > 1 ? `s ×${mol.nPi}` : ""}`}
            disabled={mol.nPi === 0}
          />
          <Toggle
            checked={showAnti}
            onChange={setShowAnti}
            color="var(--fig-1)"
            label="σ* antibonding"
          />
          <Toggle
            checked={autoRotate}
            onChange={setAutoRotate}
            color="var(--muted-foreground)"
            label="Auto-rotate"
          />
          <button
            onClick={() => setReplayAt((n) => n + 1)}
            className="rounded-full border border-border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-secondary"
          >
            Replay bond formation
          </button>
        </div>
        <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
          Schematic two-centre LCAO model: the orbital is built from two Slater-like atomic
          functions whose decay is set by each element&apos;s covalent radius, drawn at a fixed |ψ|
          contour. Nuclei are enlarged and the vibration is exaggerated. Bond length, bond energy
          and bond order are measured gas-phase values, not model output.
        </p>
      </div>

      <aside className="space-y-5 lg:col-span-5">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-1 font-mono text-xs font-bold uppercase tracking-widest">
            {choosing ? "Pick a partner" : "Choose two elements"}
          </h3>
          <p className="mb-3 font-mono text-[10px] text-muted-foreground">
            {choosing
              ? `${ELEMENTS[pendingA]!.name} + … · ${allowed?.size ?? 0} option${allowed?.size === 1 ? "" : "s"}`
              : `showing ${mol.formula} — click an element to start a new bond`}
          </p>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 3 }).flatMap((_, r) =>
              Array.from({ length: 8 }).map((__, c) => {
                const row = r + 1;
                const col = c + 1;
                const el = Object.values(ELEMENTS).find((x) => x.row === row && x.col === col);
                if (!el) return <div key={`${row}-${col}`} />;
                const noble = el.en == null;
                const off = noble || (choosing && !allowed?.has(el.sym));
                const isA = !choosing && el.sym === selA;
                const isB = !choosing && el.sym === selB && selB !== selA;
                const isPending = choosing && el.sym === pendingA;
                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => pick(el.sym)}
                    disabled={off}
                    title={
                      noble ? `${el.name} — noble gas, forms no stable diatomic here` : el.name
                    }
                    className={`rounded border px-0.5 py-1 text-[10px] font-bold leading-none transition-colors ${
                      isPending || isA || isB
                        ? "border-accent bg-accent/10 text-accent"
                        : off
                          ? "border-border/50 text-muted-foreground/40"
                          : "border-border hover:bg-secondary"
                    }`}
                  >
                    {el.sym}
                    <span className="mt-0.5 block font-mono text-[7px] font-normal opacity-60">
                      {el.Z}
                    </span>
                  </button>
                );
              }),
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <Fact
              k="Bond length rₑ"
              v={`${mol.r.toFixed(3)} Å`}
              sub={`${Math.round(mol.r * 100)} pm`}
            />
            <Fact k="Bond energy D₀" v={`${mol.D} kJ/mol`} />
            <Fact
              k="Bond order"
              v={String(mol.bondOrder)}
              sub={moDisagrees ? `simple MO filling gives ${mol.moBondOrder}` : undefined}
            />
            <Fact k="Point group" v={mol.pointGroup} sub="linear" />
            <Fact k="Bond type" v={mol.type} />
            <Fact
              k="ΔEN (Pauling)"
              v={Math.abs(mol.dEN).toFixed(2)}
              sub={mol.type === "nonpolar covalent" ? "shared equally" : `δ− on ${neg.sym}`}
            />
            <Fact
              k="Valence e⁻"
              v={String(mol.A.ve + mol.B.ve)}
              sub={mol.unpaired ? `${mol.unpaired} unpaired — paramagnetic` : "all paired"}
            />
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest">
            Valence MO diagram
          </h3>
          <MODiagramView mol={mol} />
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
            <LegendDot color={MO_COLOR.bonding_sigma} label="σ bonding" />
            <LegendDot color={MO_COLOR.bonding_pi} label="π bonding" />
            <LegendDot color={MO_COLOR.antibonding} label="antibonding" />
            <LegendDot color={MO_COLOR.nonbonding} label="nonbonding" />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Fact({ k, v, sub }: { k: string; v: string; sub?: string | undefined }) {
  return (
    <div>
      <dt className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">{k}</dt>
      <dd className="font-bold">{v}</dd>
      {sub && <dd className="font-mono text-[9px] text-muted-foreground">{sub}</dd>}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-sm border" style={{ borderColor: color }} />
      {label}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  color,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  color: string;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-2 ${disabled ? "opacity-35" : "cursor-pointer"}`}
      title={disabled ? "This molecule has no π bond" : undefined}
    >
      <input
        type="checkbox"
        checked={checked && !disabled}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 rounded-sm border"
        style={{ borderColor: color, background: checked && !disabled ? color : "transparent" }}
      />
      {label}
    </label>
  );
}

/** Atomic orbitals on each side, molecular orbitals in the middle. */
function MODiagramView({ mol }: { mol: Molecule }) {
  const { diagram: d, A, B } = mol;
  const N = d.levels.length;
  const W = 260;
  const gap = 26;
  const top = 18;
  const H = top + (N - 1) * gap + 26;
  const yOf = (i: number) => top + (N - 1 - i) * gap;

  const box = (filled: number, x: number, y: number, color: string, key: string) => (
    <g key={key}>
      <rect
        x={x}
        y={y - 6}
        width={15}
        height={12}
        rx={2}
        fill="none"
        stroke={color}
        strokeWidth={1.25}
      />
      <text x={x + 7.5} y={y + 3.5} textAnchor="middle" fontSize={8} className="fill-foreground">
        {filled === 2 ? "↑↓" : filled === 1 ? "↑" : ""}
      </text>
    </g>
  );

  const boxes = (e: number, g: number, x0: number, y: number, color: string, key: string) =>
    hund(e, g).map((f, i) => box(f, x0 + i * 18, y, color, `${key}-${i}`));

  // Atomic-orbital columns. Their vertical placement is indicative only --
  // this diagram shows which orbitals combine and how the result fills, not
  // measured orbital energies.
  const aoRows = (X: DiatomicElement) => {
    const sE = X.sym === "H" ? 1 : Math.min(2, X.ve);
    const pE = X.col >= 3 ? X.ve - 2 : 0;
    const shift = A.sym === B.sym ? 0 : X === d.neg ? -0.35 : 0.35;
    const rows: { nm: string; g: number; e: number; i: number }[] = [
      { nm: `${X.row}s`, g: 1, e: sE, i: 0.6 + shift },
    ];
    if (X.col >= 3) rows.push({ nm: `${X.row}p`, g: 3, e: pE, i: N - 2.2 + shift });
    return rows;
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Valence molecular orbital diagram for ${mol.formula}: ${d.levels.map((l) => `${l.name} holding ${l.e} electrons`).join(", ")}. Bond order ${d.bondOrder}.`}
    >
      <text x={14} y={10} fontSize={8} fontWeight={700} className="fill-muted-foreground">
        {A.sym}
      </text>
      <text
        x={W / 2}
        y={10}
        textAnchor="middle"
        fontSize={8}
        fontWeight={700}
        className="fill-muted-foreground"
      >
        {mol.formula}
      </text>
      <text
        x={W - 14}
        y={10}
        textAnchor="end"
        fontSize={8}
        fontWeight={700}
        className="fill-muted-foreground"
      >
        {B.sym}
      </text>

      {aoRows(A).flatMap((o) => [
        ...boxes(o.e, o.g, 6, yOf(o.i), "var(--border)", `ao-a-${o.nm}`),
        <text
          key={`ao-a-l-${o.nm}`}
          x={6}
          y={yOf(o.i) + 15}
          fontSize={7}
          className="fill-muted-foreground"
        >
          {o.nm}
        </text>,
      ])}

      {d.levels.map((l, i) => {
        const w = l.g * 15 + (l.g - 1) * 3;
        const x0 = W / 2 - w / 2;
        return (
          <g key={l.name}>
            {boxes(l.e, l.g, x0, yOf(i), levelColor(l), `mo-${l.name}`)}
            <text x={x0 + w + 5} y={yOf(i) + 3} fontSize={7.5} fill={levelColor(l)}>
              {l.name}
            </text>
          </g>
        );
      })}

      {aoRows(B).flatMap((o) => [
        ...boxes(
          o.e,
          o.g,
          W - 6 - (o.g * 15 + (o.g - 1) * 3),
          yOf(o.i),
          "var(--border)",
          `ao-b-${o.nm}`,
        ),
        <text
          key={`ao-b-l-${o.nm}`}
          x={W - 6}
          y={yOf(o.i) + 15}
          textAnchor="end"
          fontSize={7}
          className="fill-muted-foreground"
        >
          {o.nm}
        </text>,
      ])}
    </svg>
  );
}

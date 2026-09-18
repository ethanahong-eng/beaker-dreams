import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ORBITALS,
  rMaxFor,
  wavefunctionAlongProbe,
  radialDistribution,
  radialNodeRadii,
  sampleOrbitalPoints,
  sectionPlaneFor,
  wavefunctionTex,
  type Orientation,
  type OrbitalPoint,
} from "@/lib/orbitals";
import { rotate3d, vLength, vScale, type Vec3 } from "@/lib/project3d";
import { AxisGizmo } from "@/components/AxisGizmo";
import { Math as MathBlock } from "@/components/Math";
import { OrbitalCrossSection } from "@/components/OrbitalCrossSection";
import { OrbitalPolarPlot } from "@/components/OrbitalPolarPlot";

const SUBSCRIPT_DIGITS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"] as const;

const POINT_COUNT = 1400;
const GRAPH_SAMPLES = 240;

type GraphMode = "wave" | "distribution" | "section" | "polar";

const GRAPH_MODES: { key: GraphMode; pill: string; heading: string }[] = [
  { key: "wave", pill: "ψ(r)", heading: "Wavefunction along the lobe axis" },
  { key: "distribution", pill: "r²R(r)²", heading: "Radial distribution function" },
  { key: "section", pill: "ψ slice", heading: "Cross-section of ψ through the nucleus" },
  { key: "polar", pill: "Y(θ,φ)", heading: "Angular factor, radius divided out" },
];

export function OrbitalSim() {
  const [orbitalIndex, setOrbitalIndex] = useState(0);
  const [orientation, setOrientation] = useState<Orientation>(ORBITALS[0]!.orientations[0]!.key);
  const [graphMode, setGraphMode] = useState<GraphMode>("wave");
  const [yaw, setYaw] = useState(0.6);
  const [pitch, setPitch] = useState(0.3);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const spec = ORBITALS[orbitalIndex]!;
  const radialNodes = spec.n - spec.l - 1;
  const angularNodes = spec.l;

  const selectOrbital = (i: number) => {
    setOrbitalIndex(i);
    setOrientation(ORBITALS[i]!.orientations[0]!.key);
  };

  // Real samples drawn from the electron's actual |psi|^2 probability
  // density -- an honest Monte Carlo electron cloud, not a fixed lobe
  // shape stood in for it. Sampled in an effect (client-side only) rather
  // than during render: baking a random draw into the server-rendered
  // HTML would never match the client's own re-draw and trip a hydration
  // mismatch. The dependency list is the orbital and nothing else, so
  // dragging to rotate re-projects the existing points instead of drawing
  // a whole new cloud on every pointer move.
  const [points, setPoints] = useState<OrbitalPoint[]>([]);
  useEffect(() => {
    setPoints(sampleOrbitalPoints(spec.n, spec.l, orientation, POINT_COUNT));
  }, [spec.n, spec.l, orientation]);
  const boundingRadius = useMemo(
    () => Math.max(0.6, ...points.map((p) => vLength(p.pos as Vec3))),
    [points],
  );

  const projected = useMemo(() => {
    const inv = 1 / (boundingRadius * 1.2);
    return points
      .map((p) => {
        const [x, y, z] = rotate3d(vScale(p.pos as Vec3, inv), yaw, pitch);
        return { sign: p.sign, x, y, z };
      })
      .sort((a, b) => a.z - b.z);
  }, [points, boundingRadius, yaw, pitch]);

  // Which plane to slice: derived from the orientation's own angular
  // structure rather than a hand-kept table (see sectionPlaneFor). Cached
  // per orientation in the library, so this reference is stable and the
  // canvas below does not repaint on every re-render.
  const plane = sectionPlaneFor(orientation);
  const nodeRadii = radialNodeRadii(spec.n, spec.l);
  const tex = wavefunctionTex(spec.n, spec.l, orientation);

  // The graph: either the signed wavefunction along the orbital's lobe
  // axis (a real line-plot through the nucleus, mirrored left/right since
  // that's a genuine physical direction), or the radial distribution
  // function, plotted one-sided from the nucleus outward the way it's
  // always drawn -- mirroring it would make a zero-radial-node orbital's
  // single real hump look like two, which isn't what its nodes say.
  const halfWidth = rMaxFor(spec.n) * 0.55;
  const xMin = graphMode === "wave" ? -halfWidth : 0;
  const xMax = halfWidth;
  const isLineGraph = graphMode === "wave" || graphMode === "distribution";
  const graphPoints = useMemo(() => {
    const pts: { t: number; v: number }[] = [];
    if (!isLineGraph) return pts;
    for (let i = 0; i <= GRAPH_SAMPLES; i++) {
      const t = xMin + ((xMax - xMin) * i) / GRAPH_SAMPLES;
      const v =
        graphMode === "wave"
          ? wavefunctionAlongProbe(spec.n, spec.l, orientation, t)
          : radialDistribution(spec.n, spec.l, t);
      pts.push({ t, v });
    }
    return pts;
  }, [spec.n, spec.l, orientation, graphMode, isLineGraph, xMin, xMax]);

  const maxAbsV = Math.max(...graphPoints.map((p) => Math.abs(p.v)), 1e-9);
  const graphW = 460;
  const graphH = 200;
  const padX = 24;
  const padY = 16;
  const plotW = graphW - padX * 2;
  const plotH = graphH - padY * 2;
  const xOf = (t: number) => padX + ((t - xMin) / (xMax - xMin)) * plotW;
  const yOf = (v: number) => {
    if (graphMode === "wave") return padY + plotH / 2 - (v / maxAbsV) * (plotH / 2);
    return padY + plotH - (v / maxAbsV) * plotH;
  };
  const graphPath = graphPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.t).toFixed(2)},${yOf(p.v).toFixed(2)}`)
    .join(" ");
  const zeroY = graphMode === "wave" ? padY + plotH / 2 : padY + plotH;
  // Every radius where R(r) crosses zero, on both sides of the nucleus for
  // the signed plot since the node is a whole sphere, not a point.
  const nodeMarks = isLineGraph
    ? nodeRadii.flatMap((r) => (graphMode === "wave" ? [-r, r] : [r])).filter((t) => t <= xMax)
    : [];

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

  const orientationLabel = spec.orientations.find((o) => o.key === orientation)?.label ?? spec.name;
  const heading = GRAPH_MODES.find((m) => m.key === graphMode)?.heading ?? "";
  const caption = {
    wave: "Plotted along the orbital's own lobe axis, through the nucleus. A sign change away from the center is a radial node (R(r) crossing zero, dashed above); an odd-l orbital also flips sign right at the nucleus from angular parity alone, while an even-l orbital with l>0 just touches zero there without flipping, since R(r) itself vanishes at r=0 whenever l>0.",
    distribution:
      "The probability of finding the electron in a thin shell at distance r from the nucleus — always positive, and zero exactly at r=0 because the shell's own volume vanishes there. The dashed lines are the radial nodes, found by solving R(r)=0 numerically; each one separates two humps, so the number of humps is always one more than the number of nodes.",
    section:
      "Signed ψ on a flat cut through the nucleus, so lobe phase and angular nodes are directly visible: the sharp colour boundaries are surfaces where ψ changes sign. Brightness follows |ψ|^0.4 rather than |ψ|, because ψ near the nucleus is orders of magnitude larger than out in the lobes and a linear scale would leave everything but the core black. The plane is picked as whichever cut through the nucleus this orbital has the most sign changes in — a coordinate plane for most of them, but 4fxyz vanishes identically on all three, so it gets a diagonal one.",
    polar:
      "The angular factor Y(θ,φ) on its own, with the radial factor divided out entirely: distance from the center is |Y| in that direction, colour is its sign. Every place the curve pinches back to the nucleus is an angular node — a direction the electron is never found in, no matter how far out you look. Nothing here has a size in bohr; multiplying these lobes by R(r) is what turns them into the cloud below.",
  }[graphMode];

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Hydrogen-like orbital
          </span>
          <p className="text-2xl font-bold">{orientationLabel}</p>
        </div>

        {tex && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              The wavefunction itself
            </h3>
            <MathBlock tex={tex} />
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
              In atomic units (a₀ = 1, Z = 1), so r is in bohr. The left factor is the radial
              function R{SUBSCRIPT_DIGITS[spec.n] ?? ""}
              {SUBSCRIPT_DIGITS[spec.l] ?? ""}(r) — it fixes how far out the electron sits and where
              the spherical nodes fall; the right factor is the real spherical harmonic Y(θ,φ) — it
              fixes the lobe pattern and the phase. Every curve and every dot on this page is this
              exact expression evaluated, not a shape fitted to it.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {heading}
            </h3>
            <div className="flex overflow-hidden rounded-full border border-border text-[10px] font-bold uppercase">
              {GRAPH_MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setGraphMode(m.key)}
                  className={`px-3 py-1 transition-colors ${graphMode === m.key ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`}
                >
                  {m.pill}
                </button>
              ))}
            </div>
          </div>

          {isLineGraph && (
            <>
              <svg viewBox={`0 0 ${graphW} ${graphH}`} className="h-[180px] w-full">
                <line
                  x1={padX}
                  y1={zeroY}
                  x2={graphW - padX}
                  y2={zeroY}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <line
                  x1={xOf(0)}
                  y1={padY}
                  x2={xOf(0)}
                  y2={graphH - padY}
                  stroke="var(--border)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                {nodeMarks.map((t) => (
                  <g key={t}>
                    <line
                      x1={xOf(t)}
                      y1={padY}
                      x2={xOf(t)}
                      y2={graphH - padY}
                      stroke="var(--muted-foreground)"
                      strokeWidth={1}
                      strokeOpacity={0.55}
                      strokeDasharray="2 4"
                    />
                    <text
                      x={xOf(t)}
                      y={padY - 4}
                      fontSize={8}
                      textAnchor="middle"
                      fill="var(--muted-foreground)"
                      fontFamily="ui-monospace, monospace"
                    >
                      {Math.abs(t).toFixed(1)}
                    </text>
                  </g>
                ))}
                <path d={graphPath} fill="none" stroke="var(--accent)" strokeWidth={2} />
              </svg>
              <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
                {graphMode === "wave" ? (
                  <>
                    <span>−{halfWidth.toFixed(0)} a₀</span>
                    <span>nucleus</span>
                    <span>+{halfWidth.toFixed(0)} a₀</span>
                  </>
                ) : (
                  <>
                    <span>nucleus (r = 0)</span>
                    <span />
                    <span>r = +{halfWidth.toFixed(0)} a₀</span>
                  </>
                )}
              </div>
            </>
          )}

          {graphMode === "section" && (
            <OrbitalCrossSection
              n={spec.n}
              l={spec.l}
              orientation={orientation}
              plane={plane}
              extent={halfWidth}
            />
          )}

          {graphMode === "polar" && <OrbitalPolarPlot orientation={orientation} plane={plane} />}

          <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
            {caption}
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
              const x = 150 + p.x * 130;
              const y = 150 + p.y * 130;
              const depthScale = 1 / (2 - p.z * 0.6);
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
            <circle cx={150} cy={150} r={3} fill="var(--foreground)" />
            <AxisGizmo yaw={yaw} pitch={pitch} cx={40} cy={40} radius={22} />
          </svg>
          <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Drag to rotate · each dot is a real sample of |ψ|²
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent)" }} />
            Positive phase
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
            Negative phase
          </span>
        </div>
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest">Orbital</h3>
          <div className="mb-6 grid grid-cols-5 gap-2">
            {ORBITALS.map((o, i) => (
              <button
                key={o.name}
                onClick={() => selectOrbital(i)}
                className={`rounded-lg border px-2 py-2 text-xs font-bold transition-colors ${
                  i === orbitalIndex
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {o.name}
              </button>
            ))}
          </div>

          {spec.orientations.length > 1 && (
            <>
              <h4 className="mb-3 text-xs font-medium">Which real orbital</h4>
              <div className="mb-6 flex flex-wrap gap-2">
                {spec.orientations.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setOrientation(o.key)}
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase transition-colors ${
                      orientation === o.key
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}

          <hr className="my-6 border-border" />

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="font-mono text-xl font-bold text-accent">{radialNodes}</div>
              <div className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">
                Radial nodes
              </div>
            </div>
            <div>
              <div className="font-mono text-xl font-bold text-accent">{angularNodes}</div>
              <div className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">
                Angular nodes
              </div>
            </div>
            <div>
              <div className="font-mono text-xl font-bold text-accent">{spec.n - 1}</div>
              <div className="mt-1 font-mono text-[9px] uppercase text-muted-foreground">
                Total nodes
              </div>
            </div>
          </div>
          {nodeRadii.length > 0 && (
            <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted-foreground">
              R(r) = 0 at r = {nodeRadii.map((r) => r.toFixed(2)).join(", ")} a₀
            </p>
          )}
        </div>

        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">
            Every dot above is drawn from the orbital's real probability density, not a fixed
            boundary shape — sampled by inverting the radial distribution's cumulative probability
            for distance, then rejection-sampling the angular part against |Y(θ,φ)|². Radial nodes
            (from R(r) crossing zero) and angular nodes (from Y crossing zero) always sum to n − 1,
            exactly as the lesson states.
          </p>
          <div className="font-mono text-xs text-accent">— Hydrogen-like orbitals</div>
        </div>
      </aside>
    </div>
  );
}

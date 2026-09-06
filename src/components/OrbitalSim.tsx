import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  ORBITALS,
  rMaxFor,
  wavefunctionAlongProbe,
  radialDistribution,
  sampleOrbitalPoints,
  type Orientation,
} from "@/lib/orbitals";
import { rotate3d, vLength, vScale, type Vec3 } from "@/lib/project3d";
import { AxisGizmo } from "@/components/AxisGizmo";

const POINT_COUNT = 1400;
const GRAPH_SAMPLES = 240;

type GraphMode = "wave" | "distribution";

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
  // shape stood in for it.
  const points = useMemo(
    () => sampleOrbitalPoints(spec.n, spec.l, orientation, POINT_COUNT),
    [spec.n, spec.l, orientation],
  );
  const boundingRadius = useMemo(
    () => Math.max(0.6, ...points.map((p) => vLength(p.pos as Vec3))),
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

  // The graph: either the signed wavefunction along the orbital's lobe
  // axis (a real line-plot through the nucleus, mirrored left/right since
  // that's a genuine physical direction), or the radial distribution
  // function, plotted one-sided from the nucleus outward the way it's
  // always drawn -- mirroring it would make a zero-radial-node orbital's
  // single real hump look like two, which isn't what its nodes say.
  const halfWidth = rMaxFor(spec.n) * 0.55;
  const xMin = graphMode === "wave" ? -halfWidth : 0;
  const xMax = halfWidth;
  const graphPoints = useMemo(() => {
    const pts: { t: number; v: number }[] = [];
    for (let i = 0; i <= GRAPH_SAMPLES; i++) {
      const t = xMin + ((xMax - xMin) * i) / GRAPH_SAMPLES;
      const v =
        graphMode === "wave"
          ? wavefunctionAlongProbe(spec.n, spec.l, orientation, t)
          : radialDistribution(spec.n, spec.l, t);
      pts.push({ t, v });
    }
    return pts;
  }, [spec.n, spec.l, orientation, graphMode, xMin, xMax]);

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

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Hydrogen-like orbital
          </span>
          <p className="text-2xl font-bold">{orientationLabel}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {graphMode === "wave"
                ? "Wavefunction along the lobe axis"
                : "Radial distribution function"}
            </h3>
            <div className="flex overflow-hidden rounded-full border border-border text-[10px] font-bold uppercase">
              <button
                onClick={() => setGraphMode("wave")}
                className={`px-3 py-1 transition-colors ${graphMode === "wave" ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`}
              >
                ψ(r)
              </button>
              <button
                onClick={() => setGraphMode("distribution")}
                className={`px-3 py-1 transition-colors ${graphMode === "distribution" ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`}
              >
                r²R(r)²
              </button>
            </div>
          </div>
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
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
            {graphMode === "wave"
              ? "Plotted along the orbital's own lobe axis, through the nucleus. A sign change away from the center is a radial node (R(r) crossing zero); an odd-l orbital also flips sign right at the nucleus from angular parity alone, while an even-l orbital with l>0 just touches zero there without flipping, since R(r) itself vanishes at r=0 whenever l>0."
              : "The probability of finding the electron in a thin shell at distance r from the nucleus — always positive, and zero exactly at r=0 because the shell's own volume vanishes there. Each additional hump beyond the first is one more radial node."}
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
          <div className="mb-6 grid grid-cols-4 gap-2">
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

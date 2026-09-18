import { useMemo } from "react";
import { angularInPlane, type Orientation, type SectionPlane } from "@/lib/orbitals";

const SAMPLES = 720;
const SIZE = 260;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 104;

type Lobe = { sign: 1 | -1; fill: string; stroke: string };

// The angular factor on its own: distance from the centre is |Y| in that
// direction, so this is the orbital's shape with the radial factor divided
// out entirely. Pure function of (orientation, plane) -- no randomness, no
// DOM -- so it renders identically on the server and the client.
export function OrbitalPolarPlot({
  orientation,
  plane,
}: {
  orientation: Orientation;
  plane: SectionPlane;
}) {
  const { lobes, peak } = useMemo(() => {
    // One full period, with no duplicated endpoint -- the wrap-around is
    // handled by starting the walk at a node below, so a lobe that happens
    // to straddle alpha = 0 is drawn as the one lobe it is instead of being
    // sliced in half at an arbitrary place.
    const values: number[] = [];
    let max = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const v = angularInPlane(orientation, plane, (2 * Math.PI * i) / SAMPLES);
      values.push(v);
      if (Math.abs(v) > max) max = Math.abs(v);
    }
    const tol = max * 1e-9;
    const scale = max > 0 ? R / max : 0;
    const signOf = (v: number): 0 | 1 | -1 => (v > tol ? 1 : v < -tol ? -1 : 0);
    const point = (i: number, v: number) => {
      const alpha = (2 * Math.PI * i) / SAMPLES;
      const rad = Math.abs(v) * scale;
      return `${(CX + rad * Math.cos(alpha)).toFixed(2)},${(CY - rad * Math.sin(alpha)).toFixed(2)}`;
    };

    const out: (Lobe & { fillPath: string; strokePath: string })[] = [];
    const colorFor = (sign: 1 | -1) => (sign === 1 ? "var(--accent)" : "#3b82f6");

    // An s orbital never changes sign, so it has no node to break the curve
    // at: it is one closed circle, and pinching it to the nucleus the way a
    // lobe is pinched would be a lie about its shape.
    const first = signOf(values[0] ?? 0);
    if (first !== 0 && values.every((v) => signOf(v) === first)) {
      const poly = values.map((v, i) => point(i, v)).join(" L");
      out.push({
        sign: first,
        fill: colorFor(first),
        stroke: colorFor(first),
        fillPath: `M${poly} Z`,
        strokePath: `M${poly} Z`,
      });
      return { lobes: out, peak: max };
    }

    // Each run of one sign is one lobe, and a lobe ends where Y crosses (or
    // touches) zero -- that crossing IS an angular node, so these are the
    // orbital's real lobes and not a drawing convention.
    const emit = (sign: 1 | -1, pts: string[]) => {
      if (pts.length < 2) return;
      const poly = pts.join(" L");
      out.push({
        sign,
        fill: colorFor(sign),
        stroke: colorFor(sign),
        // The filled shape closes through the nucleus, which is where the
        // lobe genuinely ends; the stroked outline does not, so no spurious
        // radius line is drawn.
        fillPath: `M${CX},${CY} L${poly} Z`,
        strokePath: `M${poly}`,
      });
    };

    // Start the walk at a node, so no run is split by the seam.
    let origin = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const prev = signOf(values[(i + SAMPLES - 1) % SAMPLES] ?? 0);
      if (signOf(values[i] ?? 0) !== prev) {
        origin = i;
        break;
      }
    }

    let runSign: 0 | 1 | -1 = 0;
    let runPts: string[] = [];
    for (let j = 0; j <= SAMPLES; j++) {
      const idx = (origin + j) % SAMPLES;
      const v = values[idx] ?? 0;
      const sign = signOf(v);
      if (runSign !== 0 && sign !== runSign) {
        runPts.push(point(idx, 0));
        emit(runSign, runPts);
        runPts = [];
        runSign = 0;
      }
      // The extra step past one full turn exists only to close the run that
      // wraps the seam; starting another one there would draw a sliver.
      if (j === SAMPLES) break;
      if (sign === 0) {
        runSign = 0;
        continue;
      }
      if (runSign !== sign) runPts = [point(idx, 0)];
      runPts.push(point(idx, v));
      runSign = sign;
    }
    if (runSign !== 0) emit(runSign, runPts);
    return { lobes: out, peak: max };
  }, [orientation, plane]);

  return (
    <div className="mx-auto w-full max-w-[300px]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full">
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="2 4"
        />
        <line x1={CX - R - 12} y1={CY} x2={CX + R + 12} y2={CY} stroke="var(--border)" />
        <line x1={CX} y1={CY - R - 12} x2={CX} y2={CY + R + 12} stroke="var(--border)" />
        {lobes.map((lobe, i) => (
          <path key={`f${i}`} d={lobe.fillPath} fill={lobe.fill} fillOpacity={0.16} stroke="none" />
        ))}
        {lobes.map((lobe, i) => (
          <path
            key={`s${i}`}
            d={lobe.strokePath}
            fill="none"
            stroke={lobe.stroke}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        ))}
        <circle cx={CX} cy={CY} r={2.5} fill="var(--foreground)" />
        <text
          x={SIZE - 4}
          y={CY - 5}
          fontSize={9}
          textAnchor="end"
          fill="var(--muted-foreground)"
          fontFamily="ui-monospace, monospace"
        >
          {plane.uLabel}
        </text>
        <text
          x={CX + 5}
          y={11}
          fontSize={9}
          fill="var(--muted-foreground)"
          fontFamily="ui-monospace, monospace"
        >
          {plane.vLabel}
        </text>
      </svg>
      <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">
        outer ring = |Y|max = {peak.toFixed(3)} · {plane.label}
      </p>
    </div>
  );
}

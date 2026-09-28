import { Axes, Figure, Note, SeriesLabel, pathFrom, type FigureDef } from "./Figure";

/**
 * Diagrams for the Atomic Structure & Orbitals lessons. Keys are referenced
 * from the lesson data by the `figure` field on a theory block; see Figure.tsx
 * for the contract.
 */

// Plot box shared by the charts below, in viewBox units.
const PX = 46,
  PY = 14,
  PW = 380,
  PH = 150;

/**
 * The central point of the "where is the electron" section: |psi|^2 and the
 * radial distribution answer two different questions and peak in different
 * places. Both curves are the exact hydrogen 1s solution in atomic units --
 * psi = e^-r up to normalization, so |psi|^2 = e^-2r and the shell
 * probability is 4r^2 e^-2r, which peaks at exactly r = 1 a0.
 */
function RadialVsDensity() {
  const rMax = 5;
  const N = 160;
  const density: { x: number; y: number }[] = [];
  const shell: { x: number; y: number }[] = [];
  // Each curve is scaled to its own peak: they are different quantities with
  // different units, so a shared vertical scale would be meaningless. The
  // axis is therefore labelled "relative to each curve's own maximum" and
  // carries no numbers -- the shape and the peak location are the point.
  for (let i = 0; i <= N; i++) {
    const r = (rMax * i) / N;
    const d = Math.exp(-2 * r); // peaks at r = 0, value 1
    const s = 4 * r * r * Math.exp(-2 * r); // peaks at r = 1, value 4e^-2
    density.push({ x: PX + (r / rMax) * PW, y: PY + PH - d * PH });
    shell.push({ x: PX + (r / rMax) * PW, y: PY + PH - (s / (4 * Math.exp(-2))) * PH });
  }
  const xOf = (r: number) => PX + (r / rMax) * PW;

  return (
    <Figure
      viewBox="0 0 450 210"
      alt="Two curves for the hydrogen 1s orbital. The probability density curve is highest at the nucleus and falls away smoothly. The radial distribution curve starts at zero, rises to a peak at one Bohr radius, and then falls, showing that the most likely distance from the nucleus is not zero."
      caption="Hydrogen 1s. Density |ψ|² is greatest at the nucleus; the shell probability 4πr²|ψ|² is zero there and peaks at r = 1 a₀ — the Bohr radius, recovered from the wave model."
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        xLabel="distance from nucleus r (a₀)"
        xTicks={[0, 1, 2, 3, 4, 5].map((v) => ({ at: v / rMax, label: String(v) }))}
      />
      <text
        x={-(PY + PH / 2)}
        y={PX - 30}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        relative to each curve&apos;s own peak
      </text>

      <path d={pathFrom(density)} fill="none" stroke="var(--fig-1)" strokeWidth={2} />
      <path d={pathFrom(shell)} fill="none" stroke="var(--fig-2)" strokeWidth={2} />

      {/* The peak is the finding, so it gets a mark and a label. */}
      <line
        x1={xOf(1)}
        y1={PY}
        x2={xOf(1)}
        y2={PY + PH}
        stroke="var(--fig-2)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <circle cx={xOf(1)} cy={PY} r={3.5} fill="var(--fig-2)" />
      <Note x={xOf(1)} y={PY + PH + 30}>
        r = 1 a₀
      </Note>

      <SeriesLabel x={xOf(1.35)} y={PY + 34} color="var(--fig-1)">
        |ψ|² at a point
      </SeriesLabel>
      <SeriesLabel x={xOf(2.1)} y={PY + 70} color="var(--fig-2)">
        4πr²|ψ|² in a shell
      </SeriesLabel>
    </Figure>
  );
}

export const atomicFigures = {
  "radial-vs-density": RadialVsDensity,
} satisfies Record<string, FigureDef>;

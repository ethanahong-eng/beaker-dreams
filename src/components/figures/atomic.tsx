import { ArrowDefs, Axes, Figure, Note, SeriesLabel, pathFrom, type FigureDef } from "./Figure";
import { radialDistribution, radialNodeRadii, radialWavefunction } from "@/lib/orbitals";

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

/* --------------------------------------------------------------------- */
/* 01 · Beyond Bohr: The Quantum Atom                                     */
/* --------------------------------------------------------------------- */

// Hydrogen's ground-state binding energy computed with the reduced mass of
// the electron-proton pair. This is the value that reproduces the measured
// Balmer wavelengths to four figures; the infinite-nucleus Rydberg energy
// (13.6057 eV) misses Ha by about 0.4 nm.
const R_H_EV = 13.5984;
const HC_EV_NM = 1239.8419;

/** Balmer series, n -> 2: lambda = hc / (R_H (1/4 - 1/n^2)). */
const BALMER_LINES = [3, 4, 5, 6].map((n) => ({
  n,
  nm: HC_EV_NM / (R_H_EV * (1 / 4 - 1 / (n * n))),
}));

/**
 * The first failure of the classical atom, drawn on one axis. A spiralling
 * electron radiates at its orbital frequency, and that frequency climbs
 * continuously as the orbit shrinks, so the prediction is a smear. Hydrogen
 * gives four lines in the visible and nothing in between. The line positions
 * are the Balmer wavelengths computed above, not placed by eye.
 */
function HydrogenLinesVsContinuum() {
  const L0 = 380;
  const L1 = 700;
  const x0 = 46;
  const w = 380;
  const y0 = 70;
  const h = 95;
  const xOf = (nm: number) => x0 + ((nm - L0) / (L1 - L0)) * w;

  return (
    <Figure
      viewBox="0 0 450 215"
      alt="One wavelength axis from 380 to 700 nanometres. The classical prediction is a continuous band spanning the whole range, while hydrogen actually emits four isolated sharp lines at 410, 434, 486 and 656 nanometres with nothing at all between them."
      caption="Balmer wavelengths computed from Eₙ = −13.6 eV/n², λ = hc/(E₂ − Eₙ). A decaying classical orbit would sweep through every wavelength on the way in; hydrogen emits four and then stops."
    >
      <Note x={x0} y={15} anchor="start">
        CLASSICAL SPIRAL — every wavelength, sliding continuously
      </Note>
      <rect x={x0} y={21} width={w} height={17} fill="var(--fig-grid)" />

      <Note x={x0} y={61} anchor="start">
        HYDROGEN — four lines, and nothing between them
      </Note>
      <Axes
        x={x0}
        y={y0}
        w={w}
        h={h}
        xLabel="wavelength (nm)"
        xTicks={[400, 450, 500, 550, 600, 650, 700].map((v) => ({
          at: (v - L0) / (L1 - L0),
          label: String(v),
        }))}
      />
      {BALMER_LINES.map((b) => {
        const x = xOf(b.nm);
        const ty = y0 + h - 5;
        return (
          <g key={b.n}>
            <line x1={x} y1={y0} x2={x} y2={y0 + h} stroke="var(--fig-2)" strokeWidth={2} />
            <text
              x={x + 4}
              y={ty}
              transform={`rotate(-90 ${(x + 4).toFixed(2)} ${ty})`}
              className="fill-foreground"
              fontSize={9}
            >
              {`${b.nm.toFixed(0)} nm · n=${b.n}→2`}
            </text>
          </g>
        );
      })}
    </Figure>
  );
}

// Ring geometry for the de Broglie panels, in viewBox units.
const RING_R = 52;
const RING_AMP = 14;

/**
 * One electron wave wrapped around a circular orbit: the radial displacement
 * is r(t) = R + A sin(cycles * t), sampled over the turn [tStart, tEnd].
 * A whole number of cycles returns to its starting phase after one lap; a
 * half-integer returns inverted, which is the whole point of the figure.
 */
function ringWavePath(cx: number, cy: number, cycles: number, tStart: number, tEnd: number) {
  const N = 300;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= N; i++) {
    const t = tStart + ((tEnd - tStart) * i) / N;
    const r = RING_R + RING_AMP * Math.sin(cycles * t);
    pts.push({ x: cx + r * Math.cos(t), y: cy - r * Math.sin(t) });
  }
  return pathFrom(pts);
}

/**
 * Why quantization is not a decree. If the electron is a wave travelling the
 * orbit, only circumferences holding a whole number of wavelengths survive;
 * everything else interferes itself away. 2*pi*r = n*lambda with lambda = h/p
 * rearranges directly to Bohr's mvr = n*hbar.
 */
function DeBroglieStandingWave() {
  const cxA = 114;
  const cxB = 336;
  const cy = 98;

  return (
    <Figure
      viewBox="0 0 450 235"
      alt="Two ring diagrams. On the left an electron wave that fits exactly four wavelengths around the circumference meets itself in phase and survives as a standing wave. On the right a wave of four and a half wavelengths comes back inverted after one lap, so the second lap cancels the first and no such orbit exists."
      caption="2πr = nλ with λ = h/p rearranges to mvr = nħ — Bohr's quantization condition derived from a wave rather than asserted. Any confined wave has discrete modes; this is the atom's version of a guitar string."
    >
      {/* Bare orbit for reference, kept as recessive furniture. */}
      {[cxA, cxB].map((cx) => (
        <circle
          key={`orbit${cx}`}
          cx={cx}
          cy={cy}
          r={RING_R}
          fill="none"
          stroke="var(--fig-grid)"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
      ))}

      {/* Left: four wavelengths, closes on itself. */}
      <path
        d={ringWavePath(cxA, cy, 4, 0, 2 * Math.PI)}
        fill="none"
        stroke="var(--fig-2)"
        strokeWidth={2}
      />
      {/* Right: four and a half, so lap two is the inverse of lap one. */}
      <path
        d={ringWavePath(cxB, cy, 4.5, 0, 2 * Math.PI)}
        fill="none"
        stroke="var(--fig-1)"
        strokeWidth={2}
      />
      <path
        d={ringWavePath(cxB, cy, 4.5, 2 * Math.PI, 4 * Math.PI)}
        fill="none"
        stroke="var(--fig-1)"
        strokeWidth={1.4}
        strokeDasharray="4 3"
      />

      {[cxA, cxB].map((cx) => (
        <circle key={`nuc${cx}`} cx={cx} cy={cy} r={2.5} fill="var(--fig-axis)" />
      ))}

      <Note x={cxA} y={20}>
        2πr = 4λ
      </Note>
      <Note x={cxB} y={20}>
        2πr = 4.5λ
      </Note>

      <text x={cxA} y={196} textAnchor="middle" className="fill-foreground" fontSize={11}>
        closes on itself
      </text>
      <text x={cxA} y={212} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        a standing wave — this is the state n = 4
      </text>
      <text x={cxB} y={196} textAnchor="middle" className="fill-foreground" fontSize={11}>
        cancels itself
      </text>
      <text x={cxB} y={212} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        lap two (dashed) arrives inverted — no such state
      </text>
    </Figure>
  );
}

const HARTREE_EV = 27.211386;
/** Confinement kinetic energy from Δp ≳ ħ/r: p²/2m = ħ²/2mr² = 13.61 eV/r². */
const confinementEV = (r: number) => (0.5 / (r * r)) * HARTREE_EV;
/** Coulomb attraction −e²/4πε₀r = −27.21 eV/r, in atomic units −1/r. */
const coulombEV = (r: number) => (-1 / r) * HARTREE_EV;

/**
 * The trade the prose asserts, computed. Uncertainty turns confinement into an
 * energy cost that blows up as 1/r², while the Coulomb reward only deepens as
 * 1/r, so the sum has a genuine minimum. Minimising 1/2r² − 1/r in atomic
 * units gives r = 1 a₀ exactly and E = −0.5 hartree = −13.6 eV exactly: the
 * size and the binding energy of hydrogen, out of a one-line estimate.
 */
function UncertaintySizeTradeoff() {
  const PX2 = 50;
  const PY2 = 14;
  const PW2 = 372;
  const PH2 = 180;
  const rLo = 0.33;
  const rHi = 5;
  const eLo = -40;
  const eHi = 40;
  const xOf = (r: number) => PX2 + ((r - rLo) / (rHi - rLo)) * PW2;
  const yOf = (e: number) => PY2 + PH2 - ((e - eLo) / (eHi - eLo)) * PH2;

  const kinetic: { x: number; y: number }[] = [];
  const coulomb: { x: number; y: number }[] = [];
  const total: { x: number; y: number }[] = [];
  const N = 240;
  for (let i = 0; i <= N; i++) {
    const r = rLo + ((rHi - rLo) * i) / N;
    kinetic.push({ x: xOf(r), y: yOf(confinementEV(r)) });
    coulomb.push({ x: xOf(r), y: yOf(coulombEV(r)) });
    total.push({ x: xOf(r), y: yOf(confinementEV(r) + coulombEV(r)) });
  }
  // The minimum is analytic, not searched for: d/dr (1/2r² − 1/r) = 0 at r = 1.
  const rMin = 1;
  const eMin = confinementEV(rMin) + coulombEV(rMin);

  return (
    <Figure
      viewBox="0 0 450 240"
      alt="Three energy curves against distance from the nucleus. Confinement kinetic energy rises steeply as one over r squared, Coulomb attraction deepens only as minus one over r, and their sum falls to a single minimum of minus 13.6 electronvolts at exactly one Bohr radius before rising again."
      caption="Δx·Δp ≥ ħ/2 makes squeezing expensive: kinetic cost 13.6 eV/r² against Coulomb reward −27.2 eV/r. The sum bottoms out at r = 1 a₀ and E = −13.6 eV — hydrogen's size and binding energy from the trade alone."
    >
      <defs>
        <clipPath id="fig-uncertainty-clip">
          <rect x={PX2} y={PY2} width={PW2} height={PH2} />
        </clipPath>
      </defs>
      <Axes
        x={PX2}
        y={PY2}
        w={PW2}
        h={PH2}
        xLabel="distance from nucleus r (a₀)"
        yLabel="energy (eV)"
        xTicks={[1, 2, 3, 4, 5].map((v) => ({ at: (v - rLo) / (rHi - rLo), label: String(v) }))}
        yTicks={[-40, -20, 0, 20, 40].map((v) => ({
          at: (v - eLo) / (eHi - eLo),
          label: v === 0 ? "0" : String(v),
        }))}
      />

      <g clipPath="url(#fig-uncertainty-clip)">
        <path d={pathFrom(kinetic)} fill="none" stroke="var(--fig-1)" strokeWidth={2} />
        <path d={pathFrom(coulomb)} fill="none" stroke="var(--fig-2)" strokeWidth={2} />
        <path d={pathFrom(total)} fill="none" stroke="var(--fig-3)" strokeWidth={2.4} />
      </g>

      {/* The minimum is the finding, so it is marked twice over. */}
      <line
        x1={xOf(rMin)}
        y1={PY2}
        x2={xOf(rMin)}
        y2={yOf(eMin)}
        stroke="var(--fig-3)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <circle cx={xOf(rMin)} cy={yOf(eMin)} r={3.5} fill="var(--fig-3)" />
      <Note x={xOf(rMin)} y={yOf(eMin) - 8}>
        {`${eMin.toFixed(1)} eV`}
      </Note>
      <Note x={xOf(rMin)} y={PY2 + PH2 + 30}>
        r = a₀
      </Note>

      {/* Leader lines let each label sit in clear space and still point at
          its own curve, so nothing is identified by hue alone. */}
      <line
        x1={xOf(2.2) + 3}
        y1={58}
        x2={xOf(2.2) + 3}
        y2={yOf(confinementEV(2.2)) - 4}
        stroke="var(--fig-1)"
        strokeWidth={1}
      />
      <SeriesLabel x={xOf(2.2)} y={52} color="var(--fig-1)">
        confinement ħ²/2mr²
      </SeriesLabel>

      <line
        x1={xOf(1.45) + 3}
        y1={172}
        x2={xOf(1.45) + 3}
        y2={yOf(coulombEV(1.45)) + 4}
        stroke="var(--fig-2)"
        strokeWidth={1}
      />
      <SeriesLabel x={xOf(1.45)} y={180} color="var(--fig-2)">
        Coulomb −e²/4πε₀r
      </SeriesLabel>

      <line
        x1={xOf(1.75) + 3}
        y1={120}
        x2={xOf(1.75) + 3}
        y2={yOf(confinementEV(1.75) + coulombEV(1.75)) - 4}
        stroke="var(--fig-3)"
        strokeWidth={1}
      />
      <SeriesLabel x={xOf(1.75)} y={114} color="var(--fig-3)">
        their sum
      </SeriesLabel>
    </Figure>
  );
}

/**
 * Radius enclosing 90% of the hydrogen 1s radial probability, integrated
 * numerically from the same radialDistribution the rest of the site uses.
 * This is the contour the familiar orbital pictures are drawn at, so the
 * figure below can show where that boundary actually falls rather than
 * drawing a circle wherever it looks tidy.
 */
const R90_1S = (() => {
  const dr = 0.002;
  const steps = 6000;
  let total = 0;
  for (let i = 1; i <= steps; i++) total += radialDistribution(1, 0, i * dr) * dr;
  let acc = 0;
  for (let i = 1; i <= steps; i++) {
    acc += radialDistribution(1, 0, i * dr) * dr;
    if (acc / total >= 0.9) return i * dr;
  }
  return steps * dr;
})();

/**
 * The single clearest image of what changed in 1926: a definite track at a
 * definite radius, against a probability density with no track at all. The
 * cloud is not stylized -- every ring's opacity is |psi_1s(r)|^2 relative to
 * its value at the nucleus, so the gradient IS the data.
 */
function BohrVsQuantumAtom() {
  const A0 = 20; // pixels per Bohr radius, shared by both panels
  const cxA = 115;
  const cxB = 335;
  const cy = 112;
  const rings = 56;
  const rOuter = 4; // a0
  const psi0 = radialWavefunction(1, 0, 0);

  return (
    <Figure
      viewBox="0 0 450 250"
      alt="Side by side. The Bohr atom is two sharp circles with the electron sitting at a definite point on one of them. The quantum atom is a smooth probability cloud that is densest at the nucleus and has no track anywhere, yet its most probable shell falls at the same one Bohr radius as Bohr's first orbit."
      caption="Left: fixed orbits at r = n²a₀, a definite position and speed. Right: |ψ₁ₛ|² as a density ramp, with the 90% contour that orbital pictures are drawn at. Same most probable radius, no trajectory."
    >
      {/* --- Bohr --- */}
      {[1, 4].map((n2) => (
        <circle
          key={`bohr${n2}`}
          cx={cxA}
          cy={cy}
          r={n2 * A0}
          fill="none"
          stroke="var(--fig-1)"
          strokeWidth={1.5}
        />
      ))}
      <circle cx={cxA} cy={cy} r={3} fill="var(--fig-axis)" />
      <circle
        cx={cxA + A0 * Math.cos(-0.9)}
        cy={cy + A0 * Math.sin(-0.9)}
        r={4}
        fill="var(--fig-1)"
      />
      <circle
        cx={cxA + 4 * A0 * Math.cos(2.5)}
        cy={cy + 4 * A0 * Math.sin(2.5)}
        r={4}
        fill="var(--fig-1)"
      />
      <Note x={cxA} y={22}>
        BOHR 1913
      </Note>
      <text x={cxA} y={212} textAnchor="middle" className="fill-foreground" fontSize={11}>
        an orbit at r = n²a₀
      </text>
      <text x={cxA} y={228} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        a definite place, a definite speed
      </text>

      {/* --- Quantum: |psi|^2 drawn as concentric strokes of the real density --- */}
      {Array.from({ length: rings }, (_, i) => {
        const r = ((i + 0.5) * rOuter) / rings;
        const amp = radialWavefunction(1, 0, r) / psi0;
        return (
          <circle
            key={`cloud${i}`}
            cx={cxB}
            cy={cy}
            r={r * A0}
            fill="none"
            stroke="var(--fig-2)"
            strokeWidth={(rOuter / rings) * A0 + 0.5}
            strokeOpacity={amp * amp}
          />
        );
      })}
      <circle
        cx={cxB}
        cy={cy}
        r={R90_1S * A0}
        fill="none"
        stroke="var(--fig-2)"
        strokeWidth={1.2}
        strokeDasharray="4 3"
      />
      <circle
        cx={cxB}
        cy={cy}
        r={A0}
        fill="none"
        stroke="var(--fig-3)"
        strokeWidth={1.2}
        strokeDasharray="2 2"
      />
      <Note x={cxB} y={22}>
        QUANTUM
      </Note>
      <Note x={cxB + R90_1S * A0 + 4} y={cy - R90_1S * A0 + 4} anchor="start">
        90% contour
      </Note>
      <text x={cxB} y={212} textAnchor="middle" className="fill-foreground" fontSize={11}>
        a density, not a path
      </text>
      <text x={cxB} y={228} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        dotted ring: most probable shell, still r = a₀
      </text>
    </Figure>
  );
}

/* --------------------------------------------------------------------- */
/* 02 · The Schrödinger Equation & the Hydrogen Atom                      */
/* --------------------------------------------------------------------- */

/**
 * Where the three quantum numbers come from. Not a chart -- the content here
 * is a dependency structure, so it is drawn as one: the spherical symmetry of
 * the potential licenses the product ansatz, the product splits the equation
 * in two, and each half contributes its own integers under its own
 * admissibility condition. The separation constant is drawn as the bridge it
 * is, because it is the one piece of the angular problem that survives into
 * the radial one.
 */
function SchrodingerSeparation() {
  const boxes = [
    {
      key: "radial",
      x: 20,
      accent: "var(--fig-1)",
      lines: [
        { t: "RADIAL   R(r)", size: 10, bold: true },
        { t: "must stay normalizable as r → ∞", size: 9, bold: false },
        { t: "⇒ n = 1, 2, 3, …  with n > l", size: 9.5, bold: false },
        { t: "⇒ Eₙ = −13.6 eV / n²", size: 9.5, bold: false },
      ],
    },
    {
      key: "angular",
      x: 260,
      accent: "var(--fig-2)",
      lines: [
        { t: "ANGULAR   Y(θ,φ)", size: 10, bold: true },
        { t: "single-valued in φ, finite at poles", size: 9, bold: false },
        { t: "⇒ l = 0, 1, … , n−1", size: 9.5, bold: false },
        { t: "⇒ mₗ = −l, … , +l", size: 9.5, bold: false },
      ],
    },
  ];

  return (
    <Figure
      viewBox="0 0 460 246"
      alt="A flow diagram. Because the Coulomb potential depends only on r, the wavefunction factorises into a radial part times an angular part. The radial half must stay normalizable, which forces n to be a positive integer greater than l and fixes the energy; the angular half must be single-valued and finite, which forces l and m sub l. A bridge marked l times l plus one links the two halves."
      caption="Separation of variables is licensed by rotational symmetry, not convenience. Each quantum number is the price of one admissibility condition — and the constant l(l+1) is what the angular half charges the radial half."
    >
      <ArrowDefs id="fig-sep-arrow" color="var(--fig-axis)" />

      <rect
        x={100}
        y={14}
        width={260}
        height={36}
        rx={6}
        fill="var(--card)"
        stroke="var(--border)"
      />
      <text x={230} y={30} textAnchor="middle" className="fill-foreground" fontSize={11}>
        Ĥψ = Eψ
      </text>
      <text x={230} y={43} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        V depends on r alone, so Ĥ is rotationally symmetric
      </text>

      <line
        x1={230}
        y1={50}
        x2={230}
        y2={64}
        stroke="var(--fig-axis)"
        strokeWidth={1.2}
        markerEnd="url(#fig-sep-arrow)"
      />

      <rect
        x={145}
        y={66}
        width={170}
        height={26}
        rx={6}
        fill="var(--card)"
        stroke="var(--border)"
      />
      <text x={230} y={83} textAnchor="middle" className="fill-foreground" fontSize={11}>
        ψ(r,θ,φ) = R(r) · Y(θ,φ)
      </text>

      <line x1={230} y1={92} x2={230} y2={104} stroke="var(--fig-axis)" strokeWidth={1.2} />
      <line x1={110} y1={104} x2={350} y2={104} stroke="var(--fig-axis)" strokeWidth={1.2} />
      {[110, 350].map((x) => (
        <line
          key={`drop${x}`}
          x1={x}
          y1={104}
          x2={x}
          y2={122}
          stroke="var(--fig-axis)"
          strokeWidth={1.2}
          markerEnd="url(#fig-sep-arrow)"
        />
      ))}

      {boxes.map((b) => (
        <g key={b.key}>
          <rect
            x={b.x}
            y={124}
            width={180}
            height={78}
            rx={6}
            fill="var(--card)"
            stroke="var(--border)"
          />
          <rect x={b.x} y={124} width={3.5} height={78} fill={b.accent} />
          {b.lines.map((ln, i) => (
            <text
              key={ln.t}
              x={b.x + 13}
              y={142 + i * 17}
              className={i === 1 ? "fill-muted-foreground" : "fill-foreground"}
              fontSize={ln.size}
              fontWeight={ln.bold ? 600 : 400}
            >
              {ln.t}
            </text>
          ))}
        </g>
      ))}

      {/* The separation constant is the only thing crossing between the two. */}
      <line
        x1={200}
        y1={166}
        x2={260}
        y2={166}
        stroke="var(--fig-axis)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <text x={230} y={160} textAnchor="middle" className="fill-foreground" fontSize={9.5}>
        l(l+1)
      </text>

      <Note x={230} y={222}>
        the separation constant l(l+1) crosses into the radial equation
      </Note>
      <Note x={230} y={236}>
        as a centrifugal barrier — which is why higher l sits farther out
      </Note>
    </Figure>
  );
}

const SUBSHELL_LETTER = ["s", "p", "d", "f"];

/**
 * n → l → mₗ, and 2n² falling out of the count rather than being quoted.
 * One box per allowed mₗ, so the number of orbitals in a shell is something
 * the reader counts rather than takes on trust; the capacity column is just
 * two electrons per box.
 */
function QuantumNumberTree() {
  const ROW_H = 26;
  const groups = [1, 2, 3].map((n) => ({
    n,
    rows: Array.from({ length: n }, (_, l) => l),
  }));
  // Rows are laid out group by group with a gap between shells.
  let y = 54;
  const placed = groups.map((g) => {
    const rowYs = g.rows.map((_, i) => y + i * ROW_H);
    y += g.rows.length * ROW_H + 20;
    return { ...g, rowYs };
  });

  return (
    <Figure
      viewBox="0 0 360 252"
      alt="A tree of allowed quantum numbers. Shell n equals one permits only l equals zero, one orbital and two electrons. Shell n equals two permits l equals zero and one, four orbitals and eight electrons. Shell n equals three permits l equals zero, one and two, nine orbitals and eighteen electrons, so each shell holds n squared orbitals and 2n squared electrons."
      caption="l runs 0 to n−1 and mₗ runs −l to +l, both forced by admissibility rather than convention. Counting the boxes gives n² orbitals per shell and, at two electrons each, 2n² — the width of the periodic table's blocks."
    >
      <Note x={24} y={24}>
        n
      </Note>
      <Note x={48} y={24} anchor="start">
        l (subshell)
      </Note>
      <Note x={112} y={24} anchor="start">
        orbitals, one box per mₗ
      </Note>
      <Note x={244} y={24} anchor="start">
        capacity
      </Note>

      {placed.map((g) => {
        const first = g.rowYs[0]!;
        const last = g.rowYs[g.rowYs.length - 1]!;
        const mid = (first + last) / 2;
        const orbitals = g.n * g.n;
        return (
          <g key={g.n}>
            <line
              x1={38}
              y1={first - 12}
              x2={38}
              y2={last + 12}
              stroke="var(--fig-grid)"
              strokeWidth={1.5}
            />
            <text
              x={24}
              y={mid + 4}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={12}
              fontWeight={600}
            >
              {g.n}
            </text>
            {g.rows.map((l, i) => (
              <g key={l}>
                <text
                  x={48}
                  y={g.rowYs[i]! + 4}
                  className="fill-foreground"
                  fontSize={9.5}
                >{`l = ${l}   ${SUBSHELL_LETTER[l]}`}</text>
                {Array.from({ length: 2 * l + 1 }, (_, k) => (
                  <rect
                    key={k}
                    x={112 + k * 19}
                    y={g.rowYs[i]! - 8}
                    width={15}
                    height={16}
                    rx={2}
                    fill="var(--card)"
                    stroke="var(--fig-2)"
                    strokeWidth={1.2}
                  />
                ))}
              </g>
            ))}
            <text
              x={244}
              y={mid + 4}
              className="fill-foreground"
              fontSize={9.5}
            >{`${orbitals} → ${2 * orbitals} e⁻`}</text>
          </g>
        );
      })}
    </Figure>
  );
}

// Subshell colours, reused by the level diagram so s, p and d keep one
// identity across both of its panels. Each segment is also labelled, so the
// hue is reinforcement rather than the only channel.
const SUBSHELL_COLOR = ["var(--fig-1)", "var(--fig-2)", "var(--fig-3)"];

/**
 * Hydrogen's accidental degeneracy, and its removal. The left panel's levels
 * are the exact Eₙ = −R_H/n² on a real eV scale, which is what makes the
 * flatness of each shell a measured fact rather than a drawing choice. The
 * right panel is deliberately unscaled: the size of the splitting depends on
 * the atom, but the s < p < d order does not.
 */
function HydrogenDegeneracySplit() {
  const yTop = 34;
  const yBot = 192;
  const eFloor = -14;
  const yOf = (e: number) => yTop + ((0 - e) / -eFloor) * (yBot - yTop);
  // Schematic offsets for the right-hand panel, in pixels: s drops, d rises.
  const SPLIT = [13, 0, -13];
  const colX = [64, 106, 148];
  const shells = [1, 2, 3].map((n) => ({ n, e: -R_H_EV / (n * n) }));

  const segments = (dx: number, split: boolean) =>
    shells.flatMap((s) =>
      Array.from({ length: s.n }, (_, l) => {
        const y = yOf(s.e) + (split && s.n > 1 ? SPLIT[l]! : 0);
        const x = colX[l]! + dx;
        return (
          <g key={`${dx}-${s.n}-${l}`}>
            <line x1={x} y1={y} x2={x + 34} y2={y} stroke={SUBSHELL_COLOR[l]} strokeWidth={2.5} />
            <text
              x={x + 17}
              y={y - 5}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={9.5}
            >
              {`${s.n}${SUBSHELL_LETTER[l]}`}
            </text>
          </g>
        );
      }),
    );

  return (
    <Figure
      viewBox="0 0 450 238"
      alt="Two energy-level panels. In hydrogen the 2s and 2p levels lie at exactly the same energy and so do 3s, 3p and 3d, because the energy depends only on n. In any atom with more than one electron those levels separate, with s always below p and p below d."
      caption="Hydrogen's l-degeneracy is special to a pure 1/r potential. Screening by other electrons destroys it, and the s < p < d ordering that survives is what the whole of electron configuration is built on."
    >
      <Note x={125} y={14}>
        HYDROGEN — exact
      </Note>
      <Note x={321} y={14}>
        MANY-ELECTRON — schematic
      </Note>

      {/* Left axis: a real eV scale, so the flat shells are a measurement. */}
      <line
        x1={58}
        y1={yTop - 6}
        x2={58}
        y2={yBot + 4}
        stroke="var(--fig-axis)"
        strokeWidth={1.5}
      />
      {[0, -R_H_EV / 4, -R_H_EV].map((e) => (
        <g key={e}>
          <line x1={53} y1={yOf(e)} x2={58} y2={yOf(e)} stroke="var(--fig-axis)" strokeWidth={1} />
          <text
            x={49}
            y={yOf(e) + 3}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {e === 0 ? "0" : `−${(-e).toFixed(2)}`}
          </text>
        </g>
      ))}
      <text
        x={-(yTop + (yBot - yTop) / 2)}
        y={16}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        energy (eV)
      </text>
      {segments(0, false)}

      {/* Right panel: same geometry, no scale -- only the order is claimed. */}
      <line
        x1={254}
        y1={yTop - 6}
        x2={254}
        y2={yBot + 4}
        stroke="var(--fig-axis)"
        strokeWidth={1.5}
      />
      {segments(196, true)}

      <Note x={225} y={222}>
        right-hand splitting is schematic; only the order s &lt; p &lt; d is universal
      </Note>
    </Figure>
  );
}

/* --------------------------------------------------------------------- */
/* 03 · Orbital Shapes: s, p, d, f and Nodal Structure                    */
/* --------------------------------------------------------------------- */

/** Radius of the outermost maximum of r²R², used to size the nodeless panels. */
function radialPeakRadius(n: number, l: number): number {
  const steps = 4000;
  const rMax = 4 * n * n;
  let best = 0;
  let bestV = -1;
  for (let i = 1; i <= steps; i++) {
    const r = (rMax * i) / steps;
    const v = radialDistribution(n, l, r);
    if (v > bestV) {
      bestV = v;
      best = r;
    }
  }
  return best;
}

/**
 * Each panel is scaled to its own orbital, so the node radii shown are the
 * real roots of R_nl from radialNodeRadii -- 3s really does put one node deep
 * inside and one far out -- but the disks are not comparable in size to one
 * another. That is the right trade here: the figure is about counting.
 */
const NODE_PANELS = [
  { n: 2, l: 0 },
  { n: 2, l: 1 },
  { n: 3, l: 0 },
  { n: 3, l: 1 },
  { n: 3, l: 2 },
].map(({ n, l }) => {
  const nodes = radialNodeRadii(n, l);
  const outer = nodes.length > 0 ? nodes[nodes.length - 1]! : radialPeakRadius(n, l);
  return {
    n,
    l,
    nodes,
    scale: outer * 1.25,
    // l = 1 shows its nodal plane edge-on as one line; l = 2 (taking dxy)
    // shows two perpendicular planes, which in this slice are two lines.
    angles: l === 0 ? [] : l === 1 ? [0] : [45, 135],
  };
});

function OrbitalNodeMap() {
  const R = 32;
  const cy = 84;
  const xs = [62, 148, 234, 320, 406];

  return (
    <Figure
      viewBox="0 0 460 208"
      alt="Five slices through orbitals. 2s has one spherical node and no plane; 2p has one plane and no sphere; 3s has two spheres; 3p has one plane and one sphere; 3d has two planes. In every case the angular count l and the radial count n minus l minus one add up to n minus one."
      caption="Angular nodes come from Y and number l; radial nodes come from R and number n−l−1. Sphere radii are the real roots of R_nl, though each panel is scaled to its own orbital."
    >
      <Note x={230} y={16}>
        angular nodes (l) + radial nodes (n − l − 1) = n − 1
      </Note>

      {NODE_PANELS.map((p, i) => {
        const cx = xs[i]!;
        return (
          <g key={`${p.n}${p.l}`}>
            <circle
              cx={cx}
              cy={cy}
              r={R}
              fill="var(--card)"
              stroke="var(--border)"
              strokeWidth={1}
            />
            {p.nodes.map((rn) => (
              <circle
                key={rn}
                cx={cx}
                cy={cy}
                r={(rn / p.scale) * R}
                fill="none"
                stroke="var(--fig-1)"
                strokeWidth={1.4}
                strokeDasharray="3 2.5"
              />
            ))}
            {p.angles.map((deg) => {
              const a = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={cx - R * Math.cos(a)}
                  y1={cy - R * Math.sin(a)}
                  x2={cx + R * Math.cos(a)}
                  y2={cy + R * Math.sin(a)}
                  stroke="var(--fig-2)"
                  strokeWidth={1.4}
                  strokeDasharray="3 2.5"
                />
              );
            })}
            <circle cx={cx} cy={cy} r={2} fill="var(--fig-axis)" />
            <text
              x={cx}
              y={136}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={11}
              fontWeight={600}
            >
              {`${p.n}${SUBSHELL_LETTER[p.l]}`}
            </text>
            <text x={cx} y={152} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
              {`${p.l} + ${p.n - p.l - 1} = ${p.n - 1}`}
            </text>
          </g>
        );
      })}

      <SeriesLabel x={96} y={188} color="var(--fig-2)">
        angular node (plane)
      </SeriesLabel>
      <SeriesLabel x={256} y={188} color="var(--fig-1)">
        radial node (sphere)
      </SeriesLabel>
    </Figure>
  );
}

/** Fraction of an orbital's radial probability lying inside a given radius. */
function probabilityInside(n: number, l: number, rCut: number): number {
  const dr = 0.001;
  let acc = 0;
  for (let i = 1; i <= rCut / dr; i++) acc += radialDistribution(n, l, i * dr) * dr;
  return acc;
}

// Everything the penetration panels need, evaluated once from the exact
// hydrogen radial functions. The three subshells are normalized to the same
// total probability, so a single shared vertical scale is meaningful and the
// curves can honestly be compared height for height.
const PEN = [0, 1, 2].map((l) => ({
  l,
  color: SUBSHELL_COLOR[l]!,
  inside: probabilityInside(3, l, 1),
  samples: Array.from({ length: 241 }, (_, i) => {
    const r = (24 * i) / 240;
    return { r, v: radialDistribution(3, l, r) };
  }),
}));
const PEN_MAX = Math.max(...PEN.flatMap((p) => p.samples.map((s) => s.v)));

/**
 * The actual reason for ns < np < nd. Drawn as small multiples rather than
 * three overlaid curves: the outer maxima of 3s, 3p and 3d sit at nearly the
 * same height and within a few a₀ of each other, so an overlay buries the one
 * thing that matters -- the small inner lobes that reach inside the core.
 * Each panel carries the integrated probability inside 1 a₀, which is where
 * the eightfold and thousandfold differences actually live.
 */
function PenetrationSubshells() {
  const x0 = 50;
  const w = 372;
  const h = 76;
  const tops = [16, 100, 184];
  const rMax = 24;
  const xOf = (r: number) => x0 + (r / rMax) * w;
  const yOf = (v: number, top: number) => top + h - (v / PEN_MAX) * h;

  return (
    <Figure
      viewBox="0 0 450 300"
      alt="Three stacked panels of the 3s, 3p and 3d radial distributions on one shared scale. All three have their main peak around ten Bohr radii, but only 3s has a lobe inside one Bohr radius, holding about one percent of its density there against 0.13 percent for 3p and almost nothing for 3d."
      caption="Computed from the exact hydrogen R₃ₗ. Near the nucleus R ∝ r^l, so the centrifugal barrier empties the core of 3p and 3d; 3s keeps a lobe there, feels the unscreened nucleus, and drops in energy."
    >
      {/* The core strip is the whole argument, so it runs through all three. */}
      <rect
        x={xOf(0)}
        y={tops[0]!}
        width={xOf(1) - xOf(0)}
        height={tops[2]! + h - tops[0]!}
        fill="var(--fig-grid)"
      />
      <Note x={xOf(1) + 5} y={12} anchor="start">
        r &lt; 1 a₀ — inside the core, where the nucleus is barely screened
      </Note>

      <text
        x={-(tops[0]! + (tops[2]! + h - tops[0]!) / 2)}
        y={16}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        radial distribution r²R², one shared scale
      </text>

      {PEN.map((p, i) => {
        const top = tops[i]!;
        const pts = p.samples.map((s) => ({ x: xOf(s.r), y: yOf(s.v, top) }));
        return (
          <g key={p.l}>
            <line x1={x0} y1={top} x2={x0} y2={top + h} stroke="var(--fig-axis)" strokeWidth={1} />
            <line
              x1={x0}
              y1={top + h}
              x2={x0 + w}
              y2={top + h}
              stroke="var(--fig-axis)"
              strokeWidth={1.2}
            />
            <path
              d={pathFrom(pts, { toY: top + h })}
              fill={p.color}
              fillOpacity={0.12}
              stroke="none"
            />
            <path d={pathFrom(pts)} fill="none" stroke={p.color} strokeWidth={1.8} />
            <text
              x={74}
              y={top + 15}
              className="fill-foreground"
              fontSize={11}
              fontWeight={600}
            >{`3${SUBSHELL_LETTER[p.l]}`}</text>
            <text
              x={416}
              y={top + 15}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {`${(p.inside * 100).toFixed(p.inside < 0.001 ? 3 : 2)}% of it inside 1 a₀`}
            </text>
          </g>
        );
      })}

      {/* Point at the 3s inner lobe: it is 10 px tall and easy to miss. */}
      <line x1={104} y1={70} x2={70} y2={79} stroke="var(--fig-1)" strokeWidth={1} />
      <Note x={108} y={73} anchor="start">
        this lobe is the penetration
      </Note>

      {[0, 4, 8, 12, 16, 20, 24].map((v) => (
        <text
          key={v}
          x={xOf(v)}
          y={tops[2]! + h + 14}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={9}
        >
          {v}
        </text>
      ))}
      <text
        x={x0 + w / 2}
        y={tops[2]! + h + 30}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={10}
      >
        distance from nucleus r (a₀)
      </text>
    </Figure>
  );
}

/* --------------------------------------------------------------------- */
/* 04 · Electron Configurations & Periodic Trends                         */
/* --------------------------------------------------------------------- */

/** One electron in an orbital box. Direction carries the spin, not hue alone. */
function SpinArrow({ x, y, up }: { x: number; y: number; up: boolean }) {
  // Spin is a signed quantity, so it wears the diverging pair rather than two
  // categorical series -- and the arrow direction, not the hue, is the encoding.
  const color = up ? "var(--fig-pos)" : "var(--fig-neg)";
  const tail = up ? y + 8 : y - 8;
  const tip = up ? y - 8 : y + 8;
  const back = up ? tip + 4 : tip - 4;
  return (
    <g>
      <line x1={x} y1={tail} x2={x} y2={tip} stroke={color} strokeWidth={1.6} />
      <path
        d={`M${x - 3},${back} L${x},${tip} L${x + 3},${back}`}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
      />
    </g>
  );
}

/** An orbital drawn as a box holding zero, one or two spin arrows. */
function OrbitalBox({ x, y, spins }: { x: number; y: number; spins: ("up" | "down")[] }) {
  const w = 30;
  const h = 26;
  const cy = y + h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} fill="var(--card)" stroke="var(--border)" />
      {spins.map((s, i) => (
        <SpinArrow
          key={`${s}${i}`}
          x={x + w / 2 + (spins.length === 2 ? (i === 0 ? -6 : 6) : 0)}
          y={cy}
          up={s === "up"}
        />
      ))}
    </g>
  );
}

// The Aufbau chart's cells, as they are conventionally drawn.
const AUFBAU_CELLS = [
  ...[1, 2, 3, 4, 5, 6, 7].map((n) => ({ n, l: 0 })),
  ...[2, 3, 4, 5, 6, 7].map((n) => ({ n, l: 1 })),
  ...[3, 4, 5, 6].map((n) => ({ n, l: 2 })),
  ...[4, 5].map((n) => ({ n, l: 3 })),
];
// Filling order is n + l ascending, ties broken by smaller n -- the Madelung
// rule the diagonals are a picture of, so the sequence printed beside the
// grid is generated from the same rule rather than typed out.
const AUFBAU_ORDER = [...AUFBAU_CELLS].sort((a, b) => a.n + a.l - (b.n + b.l) || a.n - b.n);

function AufbauDiagonalRule() {
  const colX = [80, 138, 196, 254];
  const rowY = (n: number) => 48 + (n - 1) * 27;
  // One arrow per n + l group, running from its highest-l cell down-left.
  const groups = new Map<number, { n: number; l: number }[]>();
  for (const c of AUFBAU_CELLS) {
    const k = c.n + c.l;
    groups.set(k, [...(groups.get(k) ?? []), c]);
  }
  const arrows = [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([k, cells]) => {
      const hi = cells.reduce((m, c) => (c.l > m.l ? c : m), cells[0]!);
      const lo = cells.reduce((m, c) => (c.l < m.l ? c : m), cells[0]!);
      return {
        k,
        x1: colX[hi.l]! + 15,
        y1: rowY(hi.n) - 10,
        x2: colX[lo.l]! - 15,
        y2: rowY(lo.n) + 10,
      };
    });
  const orderLines = Array.from({ length: 4 }, (_, i) =>
    AUFBAU_ORDER.slice(i * 5, i * 5 + 5)
      .map((c) => `${c.n}${SUBSHELL_LETTER[c.l]}`)
      .join("  "),
  ).filter((s) => s.length > 0);

  return (
    <Figure
      viewBox="0 0 450 240"
      alt="The Aufbau grid with subshells in columns s, p, d and f and shells in rows. Arrows run diagonally down and to the left, each one following a constant value of n plus l, and reading them in turn gives the filling order 1s, 2s, 2p, 3s, 3p, 4s, 3d and onwards."
      caption="Each diagonal is one value of n + l, taken in order of increasing n. That single rule puts 4s before 3d and 6s before 4f, and reproduces the block structure of the periodic table."
    >
      <ArrowDefs id="fig-aufbau-arrow" color="var(--fig-1)" />

      {colX.map((x, l) => (
        <Note key={l} x={x} y={30}>
          {SUBSHELL_LETTER[l]!}
        </Note>
      ))}
      {arrows.map((a) => (
        <line
          key={a.k}
          x1={a.x1}
          y1={a.y1}
          x2={a.x2}
          y2={a.y2}
          stroke="var(--fig-1)"
          strokeWidth={1.2}
          markerEnd="url(#fig-aufbau-arrow)"
        />
      ))}

      {AUFBAU_CELLS.map((c) => (
        <text
          key={`${c.n}-${c.l}`}
          x={colX[c.l]!}
          y={rowY(c.n) + 4}
          textAnchor="middle"
          className="fill-foreground"
          fontSize={11}
        >
          {`${c.n}${SUBSHELL_LETTER[c.l]}`}
        </text>
      ))}

      <Note x={300} y={44} anchor="start">
        read out in order
      </Note>
      {orderLines.map((line, i) => (
        <text key={line} x={300} y={62 + i * 18} className="fill-foreground" fontSize={9.5}>
          {line}
        </text>
      ))}
    </Figure>
  );
}

/**
 * Hund's rule with the exchange bookkeeping made explicit. The two rows hold
 * the same three electrons in the same three degenerate orbitals; the only
 * difference is how many pairs of them are parallel, which is what exchange
 * energy is paid on.
 */
function HundsRuleBoxes() {
  const xs = [150, 188, 226];
  return (
    <Figure
      viewBox="0 0 450 205"
      alt="Two ways of putting three electrons into the three 2p orbitals. Spread out with parallel spins there are three pairs of parallel electrons and no shared orbital; pairing two of them early leaves only one parallel pair and adds a repulsion between the two electrons now sharing an orbital."
      caption="Hund's rule is not a preference for tidiness. Every pair of same-spin electrons in different orbitals is stabilized by an exchange term K, and spreading out maximizes how many such pairs exist."
    >
      <Note x={24} y={40} anchor="start">
        GROUND STATE — nitrogen 2p³
      </Note>
      {xs.map((x) => (
        <OrbitalBox key={`a${x}`} x={x} y={48} spins={["up"]} />
      ))}
      <text x={286} y={58} className="fill-foreground" fontSize={10} fontWeight={600}>
        3 same-spin pairs
      </text>
      <text x={286} y={72} className="fill-muted-foreground" fontSize={9}>
        no orbital shared, S = 3/2
      </text>

      <Note x={24} y={116} anchor="start">
        SAME ELECTRONS, PAIRED TOO EARLY
      </Note>
      <OrbitalBox x={xs[0]!} y={124} spins={["up", "down"]} />
      <OrbitalBox x={xs[1]!} y={124} spins={["up"]} />
      <OrbitalBox x={xs[2]!} y={124} spins={[]} />
      <text x={286} y={134} className="fill-foreground" fontSize={10} fontWeight={600}>
        1 same-spin pair
      </text>
      <text x={286} y={148} className="fill-muted-foreground" fontSize={9}>
        plus one pairing repulsion to pay
      </text>

      <Note x={225} y={188}>
        exchange energy rewards each pair of parallel spins, so they spread out before pairing
      </Note>
    </Figure>
  );
}

// Period 3, with Slater's rules run on the valence electron of each atom:
// S = 0.35 x (others in the 3s,3p group) + 0.85 x 8 (the n = 2 shell)
// + 1.00 x 2 (the 1s pair). First ionization energies are measured values.
const PERIOD_3 = [
  { sym: "Na", z: 11, ie: 496 },
  { sym: "Mg", z: 12, ie: 738 },
  { sym: "Al", z: 13, ie: 578 },
  { sym: "Si", z: 14, ie: 786 },
  { sym: "P", z: 15, ie: 1012 },
  { sym: "S", z: 16, ie: 1000 },
  { sym: "Cl", z: 17, ie: 1251 },
].map((e) => ({ ...e, zeff: e.z - (0.35 * (e.z - 11) + 0.85 * 8 + 1.0 * 2) }));

/**
 * Two stacked panels rather than one chart with two axes. The top is a clean
 * computed staircase -- Slater's rules give exactly +0.65 per step across the
 * period, since each added proton is offset by 0.35 of shielding. The bottom
 * is what is actually measured, and it is not a staircase: aluminium and
 * sulfur both fall below their left-hand neighbour. Putting them one above
 * the other is the point, because the mismatch is the finding.
 */
function SlaterZeffPeriod3() {
  const x0 = 54;
  const w = 368;
  const h = 92;
  const topY = 24;
  const botY = 170;
  const xOf = (i: number) => x0 + ((i + 0.5) * w) / PERIOD_3.length;
  const yZ = (v: number) => topY + h - (v / 7) * h;
  const yI = (v: number) => botY + h - ((v - 400) / 900) * h;

  return (
    <Figure
      viewBox="0 0 450 288"
      alt="Two stacked panels across period 3 from sodium to chlorine. Effective nuclear charge from Slater's rules climbs in perfectly even steps from 2.20 to 6.10, while the measured first ionization energy climbs overall but drops at aluminium and again at sulfur."
      caption="Slater gives exactly +0.65 per element: one more proton, 0.35 of it shielded. Ionization energy tracks that rise but dips at Al and S — a subshell change and a first electron pair, neither visible in Zeff."
    >
      {PERIOD_3.map((e, i) => (
        <line
          key={e.sym}
          x1={xOf(i)}
          y1={topY}
          x2={xOf(i)}
          y2={topY + h}
          stroke="var(--fig-grid)"
          strokeWidth={1}
        />
      ))}
      <Axes
        x={x0}
        y={topY}
        w={w}
        h={h}
        yLabel="Zeff (Slater)"
        yTicks={[0, 2, 4, 6].map((v) => ({ at: v / 7, label: String(v) }))}
      />
      <path
        d={pathFrom(PERIOD_3.map((e, i) => ({ x: xOf(i), y: yZ(e.zeff) })))}
        fill="none"
        stroke="var(--fig-1)"
        strokeWidth={2}
      />
      {PERIOD_3.map((e, i) => (
        <circle key={e.sym} cx={xOf(i)} cy={yZ(e.zeff)} r={3} fill="var(--fig-1)" />
      ))}
      <Note x={xOf(0)} y={yZ(PERIOD_3[0]!.zeff) + 16}>
        {PERIOD_3[0]!.zeff.toFixed(2)}
      </Note>
      <Note x={xOf(6)} y={yZ(PERIOD_3[6]!.zeff) + 16}>
        {PERIOD_3[6]!.zeff.toFixed(2)}
      </Note>
      <Note x={xOf(3)} y={40}>
        every step is +0.65
      </Note>

      <Axes
        x={x0}
        y={botY}
        w={w}
        h={h}
        yLabel="first IE (kJ/mol)"
        xTicks={PERIOD_3.map((e, i) => ({ at: (i + 0.5) / PERIOD_3.length, label: e.sym }))}
        yTicks={[500, 700, 900, 1100, 1300].map((v) => ({
          at: (v - 400) / 900,
          label: String(v),
        }))}
      />
      <path
        d={pathFrom(PERIOD_3.map((e, i) => ({ x: xOf(i), y: yI(e.ie) })))}
        fill="none"
        stroke="var(--fig-2)"
        strokeWidth={2}
      />
      {PERIOD_3.map((e, i) => (
        <circle key={e.sym} cx={xOf(i)} cy={yI(e.ie)} r={3} fill="var(--fig-2)" />
      ))}
      <Note x={xOf(2)} y={yI(578) + 16}>
        3p begins
      </Note>
      <Note x={xOf(5)} y={yI(1000) + 16}>
        first 3p pair
      </Note>
    </Figure>
  );
}

/** Every unordered pair drawn from n items -- the exchange pair count, n(n−1)/2. */
function pairsOf(n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) out.push([i, j]);
  return out;
}

/**
 * The chromium anomaly as an arithmetic problem rather than a slogan. Each
 * arc is one pair of parallel 3d electrons, and the count is the thing the
 * prose asks the reader to believe: four parallel electrons make six pairs,
 * five make ten. The arcs are generated from pairsOf, so the drawing cannot
 * disagree with the number printed beside it.
 */
function ExchangeEnergyChromium() {
  const dX = [96, 132, 168, 204, 240];
  const sX = 300;
  const rows = [
    { key: "d4", y: 40, filled: 4, s4: ["up", "down"] as ("up" | "down")[], label: "[Ar] 3d⁴4s²" },
    { key: "d5", y: 150, filled: 5, s4: ["up"] as ("up" | "down")[], label: "[Ar] 3d⁵4s¹" },
  ];

  return (
    <Figure
      viewBox="0 0 450 262"
      alt="Two chromium configurations with an arc drawn for every pair of parallel 3d electrons. The expected 3d⁴4s² arrangement has four parallel d electrons and therefore six such pairs; the observed 3d⁵4s¹ has five and therefore ten, while also breaking up the doubly occupied 4s orbital."
      caption="Six pairs against ten: the promotion buys four extra exchange terms K, plus five more counting the now-parallel 4s electron, and unpairs the 4s orbital — for the cost of one small 4s→3d gap."
    >
      <Note x={168} y={28}>
        3d
      </Note>
      <Note x={sX + 15} y={28}>
        4s
      </Note>

      {rows.map((row) => {
        const top = row.y + 26;
        return (
          <g key={row.key}>
            <text x={20} y={row.y + 17} className="fill-foreground" fontSize={10} fontWeight={600}>
              {row.label}
            </text>
            {dX.map((x, i) => (
              <OrbitalBox key={x} x={x} y={row.y} spins={i < row.filled ? ["up"] : []} />
            ))}
            <OrbitalBox x={sX} y={row.y} spins={row.s4} />
            {pairsOf(row.filled).map(([i, j]) => {
              const xi = dX[i]! + 15;
              const xj = dX[j]! + 15;
              const dip = top + 12 + 9 * (j - i);
              return (
                <path
                  key={`${i}-${j}`}
                  d={`M${xi},${top} Q${(xi + xj) / 2},${dip} ${xj},${top}`}
                  fill="none"
                  stroke="var(--fig-3)"
                  strokeWidth={1}
                />
              );
            })}
            <text x={352} y={row.y + 12} className="fill-foreground" fontSize={11} fontWeight={600}>
              {`${(row.filled * (row.filled - 1)) / 2} pairs`}
            </text>
            <text x={352} y={row.y + 26} className="fill-muted-foreground" fontSize={9}>
              {`worth ${(row.filled * (row.filled - 1)) / 2}K`}
            </text>
          </g>
        );
      })}
      <text x={352} y={190} className="fill-muted-foreground" fontSize={9}>
        (+5 with the 4s)
      </text>

      <Note x={225} y={248}>
        four extra same-spin pairs, and the 4s pair broken up, for one small 4s→3d step
      </Note>
    </Figure>
  );
}

// Schematic only: the numbers below are not computed orbital energies. What
// is real, and what the figure claims, is the shape -- 3d starts above 4s in
// potassium, contracts and falls steeply as Z rises, and has crossed below 4s
// by scandium, while 4s barely moves. Hence no vertical scale.
const CROSSOVER_ELEMENTS = ["K", "Ca", "Sc", "Ti", "V", "Cr", "Mn"];
const e4s = (i: number) => -0.2 - 0.03 * i;
const e3d = (i: number) => 0.13 - 0.25 * i;

function FourSThreeDCrossover() {
  const x0 = 56;
  const w = 366;
  const y0 = 18;
  const h = 150;
  const eTop = 0.22;
  const eBot = -1.45;
  const xOf = (i: number) => x0 + ((i + 0.5) * w) / CROSSOVER_ELEMENTS.length;
  const yOf = (e: number) => y0 + ((eTop - e) / (eTop - eBot)) * h;
  const idx = CROSSOVER_ELEMENTS.map((_, i) => i);
  // e4s and e3d are straight lines, so they cross where they are equal.
  const cross = (0.13 + 0.2) / (0.25 - 0.03);

  return (
    <Figure
      viewBox="0 0 450 224"
      alt="A schematic of how the 4s and 3d orbital energies move across the first transition series. The 3d level starts above 4s at potassium, falls steeply as the nuclear charge rises, and has dropped below 4s by scandium, while the 4s level barely moves at all."
      caption="Orbital energies are not fixed properties of an element. 3d contracts and plunges as Z rises; 4s does not. Filling still starts at 4s because total energy, not one-electron energy, decides — and ionization empties 4s first."
    >
      <Axes
        x={x0}
        y={y0}
        w={w}
        h={h}
        yLabel="orbital energy (no scale)"
        xTicks={CROSSOVER_ELEMENTS.map((s, i) => ({
          at: (i + 0.5) / CROSSOVER_ELEMENTS.length,
          label: s,
        }))}
      />
      <line
        x1={xOf(cross)}
        y1={y0}
        x2={xOf(cross)}
        y2={y0 + h}
        stroke="var(--fig-axis)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <Note x={xOf(cross)} y={12}>
        3d crosses below 4s here
      </Note>

      <path
        d={pathFrom(idx.map((i) => ({ x: xOf(i), y: yOf(e4s(i)) })))}
        fill="none"
        stroke="var(--fig-1)"
        strokeWidth={2}
      />
      <path
        d={pathFrom(idx.map((i) => ({ x: xOf(i), y: yOf(e3d(i)) })))}
        fill="none"
        stroke="var(--fig-2)"
        strokeWidth={2}
      />
      <SeriesLabel x={xOf(4)} y={yOf(e4s(4)) - 8} color="var(--fig-1)">
        4s — diffuse, barely moves
      </SeriesLabel>
      <SeriesLabel x={xOf(3.4)} y={yOf(e3d(4)) + 16} color="var(--fig-2)">
        3d — compact, falls fast
      </SeriesLabel>

      <Note x={225} y={206}>
        ionization still empties 4s first — it is the outermost, most diffuse orbital
      </Note>
    </Figure>
  );
}

export const atomicFigures = {
  "radial-vs-density": RadialVsDensity,
  "hydrogen-lines-vs-continuum": HydrogenLinesVsContinuum,
  "de-broglie-standing-wave": DeBroglieStandingWave,
  "uncertainty-size-tradeoff": UncertaintySizeTradeoff,
  "bohr-vs-quantum-atom": BohrVsQuantumAtom,
  "schrodinger-separation": SchrodingerSeparation,
  "quantum-number-tree": QuantumNumberTree,
  "hydrogen-degeneracy-split": HydrogenDegeneracySplit,
  "orbital-node-map": OrbitalNodeMap,
  "penetration-subshells": PenetrationSubshells,
  "aufbau-diagonal-rule": AufbauDiagonalRule,
  "hunds-rule-boxes": HundsRuleBoxes,
  "slater-zeff-period3": SlaterZeffPeriod3,
  "exchange-energy-chromium": ExchangeEnergyChromium,
  "four-s-three-d-crossover": FourSThreeDCrossover,
} satisfies Record<string, FigureDef>;

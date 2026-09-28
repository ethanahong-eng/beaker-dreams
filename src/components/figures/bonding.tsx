import { ArrowDefs, Axes, Figure, Note, SeriesLabel, pathFrom, type FigureDef } from "./Figure";

/**
 * Diagrams for the Chemical Bonding unit — bond types and electronegativity,
 * molecular orbital theory, polarity, intermolecular forces, Lewis structures
 * and resonance. Keys are referenced from the lesson data by the `figure`
 * field on a theory block; see Figure.tsx for the contract.
 *
 * Every number here is either a tabulated literature value quoted by the
 * lesson prose, or is computed in this file from a closed-form expression:
 * the LCAO 1s densities, the Lennard-Jones potential, the Hückel ring
 * eigenvalues, the ionic-limit dipole μ = e·d, and the least-squares trend
 * lines through the hydride boiling points. Nothing is drawn "about right".
 */

/* ---------------------------------------------------------------------- */
/* Local helpers. This unit draws energy ladders, upright bars, spin        */
/* arrows and Lewis dots over and over, so they live here once.            */
/* ---------------------------------------------------------------------- */

/** A horizontal energy-level rule — the unit of every ladder below. */
function Level({
  x1,
  x2,
  y,
  color = "currentColor",
  width = 2,
  dashed,
}: {
  x1: number;
  x2: number;
  y: number;
  color?: string;
  width?: number;
  dashed?: boolean;
}) {
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dashed ? "4 3" : undefined}
    />
  );
}

/**
 * Electrons drawn as spin arrows sitting on a level. Two electrons in one
 * orbital are anti-parallel; a single electron is drawn up, which is how
 * Hund's rule fills a degenerate pair.
 */
function Spins({ x, y, kind }: { x: number; y: number; kind: "up" | "down" | "updown" }) {
  const glyphs = kind === "updown" ? ["↑", "↓"] : kind === "up" ? ["↑"] : ["↓"];
  return (
    <g>
      {glyphs.map((g, i) => (
        <text
          key={g}
          x={x + (glyphs.length === 2 ? (i === 0 ? -4.5 : 4.5) : 0)}
          y={y + 4.5}
          textAnchor="middle"
          className="fill-foreground"
          fontSize={12}
        >
          {g}
        </text>
      ))}
    </g>
  );
}

/** Upright bar for the small bar charts. */
function VBar({
  x,
  w,
  yTop,
  yBase,
  color,
  opacity = 1,
}: {
  x: number;
  w: number;
  yTop: number;
  yBase: number;
  color: string;
  opacity?: number;
}) {
  return (
    <rect
      x={x - w / 2}
      y={yTop}
      width={w}
      height={Math.max(0, yBase - yTop)}
      fill={color}
      opacity={opacity}
    />
  );
}

/** A lone pair, drawn as the two dots a Lewis structure uses. */
function Pair({
  x,
  y,
  angle = 0,
  color = "currentColor",
}: {
  x: number;
  y: number;
  /** Degrees, measured from the +x axis; the pair lies across this direction. */
  angle?: number;
  color?: string;
}) {
  const a = ((angle + 90) * Math.PI) / 180;
  const dx = 2.6 * Math.cos(a);
  const dy = 2.6 * Math.sin(a);
  return (
    <g fill={color}>
      <circle cx={x + dx} cy={y + dy} r={1.6} />
      <circle cx={x - dx} cy={y - dy} r={1.6} />
    </g>
  );
}

/* ====================================================================== */
/* 05 — Bond Types & Electronegativity                                     */
/* ====================================================================== */

const EN_MAX = 3.3;
const enX = (d: number) => 44 + (d / EN_MAX) * 376;

/**
 * Real bonds placed on one electronegativity-difference axis. The point the
 * prose makes is that the 0.4 and 1.7 cutoffs are guides rather than
 * boundaries, so the figure deliberately puts AlCl₃ and HF — 0.23 apart, one
 * on each side of the 1.7 line, both molecular — next to each other.
 */
function IonicCovalentContinuum() {
  const marks = [
    { label: "Cl–Cl", d: 0.0, row: 0 },
    { label: "C–H", d: 0.35, row: 1 },
    { label: "H–Cl", d: 0.96, row: 0 },
    { label: "Al–Cl", d: 1.55, row: 1 },
    { label: "H–F", d: 1.78, row: 0 },
    { label: "Na–Cl", d: 2.23, row: 1 },
    { label: "Cs–F", d: 3.19, row: 0 },
  ];
  const rowY = [62, 88];
  const axisY = 118;

  return (
    <Figure
      viewBox="0 0 450 182"
      alt="Real bonds placed along a single electronegativity-difference axis from zero to 3.2. The conventional cutoffs at 0.4 and 1.7 are drawn as dashed lines, and aluminium chloride at 1.55 sits just below the ionic cutoff while hydrogen fluoride at 1.78 sits just above it, yet both are molecular substances rather than ionic solids, showing the cutoff is not a real boundary."
      caption="One axis, not two boxes. The dashed cutoffs are conventions: AlCl₃ (ΔEN 1.55) and HF (1.78) straddle the ionic line and are both molecular."
    >
      {/* Region dividers, recessive: they are conventions, not data. */}
      {[0.4, 1.7].map((d) => (
        <line
          key={d}
          x1={enX(d)}
          y1={34}
          x2={enX(d)}
          y2={axisY}
          stroke="var(--fig-grid)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      ))}
      <Note x={enX(0.2)} y={30}>
        nonpolar
      </Note>
      <Note x={enX(1.05)} y={30}>
        polar covalent
      </Note>
      <Note x={enX(2.5)} y={30}>
        usually called ionic
      </Note>

      {/* The axis itself, with the compounds hanging off it. */}
      <line
        x1={enX(0)}
        y1={axisY}
        x2={enX(EN_MAX)}
        y2={axisY}
        stroke="var(--fig-axis)"
        strokeWidth={1.5}
      />
      {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((t) => (
        <g key={t}>
          <line
            x1={enX(t)}
            y1={axisY}
            x2={enX(t)}
            y2={axisY + 4}
            stroke="var(--fig-axis)"
            strokeWidth={1}
          />
          <text
            x={enX(t)}
            y={axisY + 15}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {t.toFixed(1)}
          </text>
        </g>
      ))}
      <text
        x={enX(EN_MAX / 2)}
        y={axisY + 30}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={10}
      >
        electronegativity difference ΔEN
      </text>

      {marks.map((m) => (
        <g key={m.label}>
          <line
            x1={enX(m.d)}
            y1={rowY[m.row]! + 5}
            x2={enX(m.d)}
            y2={axisY - 4}
            stroke="var(--fig-grid)"
            strokeWidth={1}
          />
          <circle cx={enX(m.d)} cy={axisY} r={3.5} fill="var(--fig-1)" />
          <text
            x={enX(m.d)}
            y={rowY[m.row]}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={10}
            fontWeight={600}
          >
            {m.label}
          </text>
          <text
            x={enX(m.d)}
            y={rowY[m.row]! + 11}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {m.d.toFixed(2)}
          </text>
        </g>
      ))}

      {/* The finding: two neighbours on opposite sides of the cutoff. */}
      <path
        d={`M${enX(1.55)},${axisY + 34} L${enX(1.55)},${axisY + 39} L${enX(1.78)},${axisY + 39} L${enX(1.78)},${axisY + 34}`}
        fill="none"
        stroke="var(--fig-2)"
        strokeWidth={1.2}
      />
      <text x={232} y={axisY + 52} textAnchor="middle" className="fill-foreground" fontSize={9}>
        both are molecular substances — the line between them decides nothing
      </text>
    </Figure>
  );
}

/**
 * Lattice energy against z₊z₋/r₀, the whole content of the Born–Landé
 * expression once the Madelung constant and Born exponent are absorbed into
 * the slope. Six 1:1 alkali halides set the line; MgO, with four times the
 * charge product, sits four times out along it. Charge is the dominant
 * variable because it enters as a product and r₀ only as a reciprocal.
 */
function LatticeCoulomb() {
  const salts = [
    { f: "CsI", u: 600, r: 0.395, z: 1 },
    { f: "KBr", u: 689, r: 0.33, z: 1 },
    { f: "KCl", u: 715, r: 0.315, z: 1 },
    { f: "NaCl", u: 787, r: 0.282, z: 1 },
    { f: "NaF", u: 923, r: 0.231, z: 1 },
    { f: "LiF", u: 1030, r: 0.201, z: 1 },
    { f: "MgO", u: 3795, r: 0.212, z: 4 },
  ].map((s) => ({ ...s, x: s.z / s.r }));

  const PX = 56,
    PY = 14,
    PW = 364,
    PH = 142;
  const XMAX = 20,
    YMAX = 4000;
  const px = (x: number) => PX + (x / XMAX) * PW;
  const py = (u: number) => PY + PH - (u / YMAX) * PH;

  // Slope fitted to the singly charged salts only, then extended: the point
  // is whether the 2+/2− oxide falls on the same line, so it must not help
  // set it.
  const ones = salts.filter((s) => s.z === 1);
  const slope = ones.reduce((a, s) => a + s.u / s.x, 0) / ones.length;
  const lineEndX = Math.min(XMAX, YMAX / slope);

  const labelled = new Set(["CsI", "LiF", "NaCl", "MgO"]);

  return (
    <Figure
      viewBox="0 0 450 210"
      alt="Lattice energy plotted against the charge product divided by the interionic distance. Six alkali halides fall on a straight line through the origin at the left of the plot, and magnesium oxide, whose charge product is four times larger, sits far out along the same line near 3800 kilojoules per mole, showing that charge rather than ion size dominates lattice energy."
      caption="Born–Landé in one line: U rises with z₊z₋/r₀. The six 1:1 halides span a factor of two; doubling both charges takes MgO five times further."
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        xLabel="z₊z₋ / r₀  (nm⁻¹)"
        yLabel="lattice energy (kJ/mol)"
        xTicks={[0, 5, 10, 15, 20].map((v) => ({ at: v / XMAX, label: String(v) }))}
        yTicks={[0, 1000, 2000, 3000, 4000].map((v) => ({ at: v / YMAX, label: String(v) }))}
      />
      <line
        x1={px(0)}
        y1={py(0)}
        x2={px(lineEndX)}
        y2={py(lineEndX * slope)}
        stroke="var(--fig-2)"
        strokeWidth={1.2}
        strokeDasharray="5 4"
      />
      {salts.map((s) => (
        <g key={s.f}>
          <circle cx={px(s.x)} cy={py(s.u)} r={3.6} fill="var(--fig-1)" />
          {labelled.has(s.f) && (
            <text
              x={px(s.x) + (s.f === "MgO" ? -8 : 7)}
              y={py(s.u) + (s.f === "CsI" ? 12 : 3)}
              textAnchor={s.f === "MgO" ? "end" : "start"}
              className="fill-foreground"
              fontSize={9}
              fontWeight={600}
            >
              {s.f}
            </text>
          )}
        </g>
      ))}
      <SeriesLabel x={px(6)} y={py(2700)} color="var(--fig-2)">
        proportional to z₊z₋/r₀
      </SeriesLabel>
      <Note x={px(4.6)} y={py(250)} anchor="start">
        six 1:1 alkali halides
      </Note>
    </Figure>
  );
}

/**
 * The Born–Haber cycle for NaCl with the measured legs, and underneath it the
 * arithmetic that rules NaCl₂ out. The second ionization energy of sodium is
 * plotted against the largest lattice energy a real 2+ chloride achieves, so
 * the shortfall is visible rather than asserted.
 */
function BornHaberNaCl() {
  const yE = (E: number) => 172 - (E + 450) * 0.12;
  // Six levels, left to right: elements, Na(g), Na⁺(g), + Cl(g), ion pair, solid.
  const energies = [0, 107, 603, 725, 376, -411];
  const xs = [60, 120, 188, 256, 324, 392, 450];
  const steps = [
    { n: 1, v: "+107" },
    { n: 2, v: "+496" },
    { n: 3, v: "+122" },
    { n: 4, v: "−349" },
    { n: 5, v: "−787" },
  ];

  const bx = (kJ: number) => 150 + (kJ / 5000) * 290;

  return (
    <Figure
      viewBox="0 0 460 312"
      alt="An energy staircase for sodium chloride starting from the elements at zero, climbing 107 to sublime sodium, 496 to ionize it, 122 to break half a chlorine molecule, dropping 349 for the electron affinity of chlorine to reach plus 376, and then falling 787 to the measured formation enthalpy of minus 411. Below, two bars on one scale show the second ionization energy of sodium at 4562 kilojoules per mole against the 2526 available from the lattice energy of a real doubly charged chloride."
      caption="Hess's law closes the loop: every leg but the last is measurable, so the lattice enthalpy must be −787 kJ/mol. The same arithmetic kills NaCl₂ — 4562 kJ/mol for the second electron, and no lattice repays it."
    >
      <ArrowDefs id="bh-arrow" color="var(--fig-axis)" />

      {/* Energy axis for the cycle. */}
      <line x1={52} y1={22} x2={52} y2={175} stroke="var(--fig-axis)" strokeWidth={1.5} />
      {[800, 400, 0, -400].map((v) => (
        <g key={v}>
          <line x1={48} y1={yE(v)} x2={52} y2={yE(v)} stroke="var(--fig-axis)" strokeWidth={1} />
          <text
            x={45}
            y={yE(v) + 3}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {v > 0 ? `+${v}` : v}
          </text>
        </g>
      ))}
      <text
        x={-99}
        y={16}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        kJ/mol from the elements
      </text>
      <Level x1={52} x2={450} y={yE(0)} color="var(--fig-grid)" width={1} dashed />

      {energies.map((E, i) => (
        <Level key={i} x1={xs[i]!} x2={xs[i + 1]!} y={yE(E)} color="var(--fig-1)" width={2} />
      ))}
      {energies.slice(0, 5).map((E, i) => (
        <g key={`s${i}`}>
          <line
            x1={xs[i + 1]}
            y1={yE(E)}
            x2={xs[i + 1]}
            y2={yE(energies[i + 1]!)}
            stroke="var(--fig-axis)"
            strokeWidth={1.2}
            markerEnd="url(#bh-arrow)"
          />
          <text
            x={xs[i + 1]! + 4}
            y={(yE(E) + yE(energies[i + 1]!)) / 2 + 3}
            className="fill-foreground"
            fontSize={9}
            fontWeight={600}
          >
            {`${steps[i]!.n}  ${steps[i]!.v}`}
          </text>
        </g>
      ))}

      <text x={62} y={130} className="fill-muted-foreground" fontSize={9}>
        Na(s) + ½Cl₂(g)
      </text>
      <text x={326} y={88} className="fill-muted-foreground" fontSize={9}>
        Na⁺(g) + Cl⁻(g), +376
      </text>
      <text
        x={450}
        y={182}
        textAnchor="end"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        NaCl(s), ΔH°f = −411
      </text>
      <Note x={250} y={200}>
        1 sublime Na · 2 ionize Na · 3 break ½Cl–Cl · 4 add e⁻ to Cl · 5 form the lattice
      </Note>

      {/* Second panel: the same units, a scale four times longer. */}
      <line x1={40} y1={214} x2={450} y2={214} stroke="var(--fig-grid)" strokeWidth={1} />
      <text x={40} y={230} className="fill-foreground" fontSize={10} fontWeight={600}>
        Why not NaCl₂?
      </text>
      <rect x={bx(0)} y={240} width={bx(4562) - bx(0)} height={13} fill="var(--fig-1)" />
      <rect x={bx(0)} y={264} width={bx(2526) - bx(0)} height={13} fill="var(--fig-3)" />
      <text x={146} y={250} textAnchor="end" className="fill-foreground" fontSize={9}>
        cost: IE₂ of Na
      </text>
      <text x={146} y={274} textAnchor="end" className="fill-foreground" fontSize={9}>
        payback: MgCl₂ lattice
      </text>
      <text x={bx(4562) + 5} y={250} className="fill-foreground" fontSize={9} fontWeight={600}>
        4562
      </text>
      <text x={bx(2526) + 5} y={274} className="fill-foreground" fontSize={9} fontWeight={600}>
        2526
      </text>
      <line x1={bx(0)} y1={284} x2={bx(5000)} y2={284} stroke="var(--fig-axis)" strokeWidth={1} />
      {[0, 2000, 4000].map((v) => (
        <text
          key={v}
          x={bx(v)}
          y={296}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={9}
        >
          {v}
        </text>
      ))}
      <Note x={bx(5000)} y={296} anchor="end">
        kJ/mol
      </Note>
    </Figure>
  );
}

/**
 * The four successive C–H bond dissociation energies of methane against the
 * tabulated mean. They sum to the atomization enthalpy of 1663 kJ/mol, so the
 * mean is 416 — a number that is not any of the four bonds it averages.
 */
function MethaneBondEnergies() {
  const bde = [
    { label: "CH₄ → CH₃", v: 439 },
    { label: "CH₃ → CH₂", v: 462 },
    { label: "CH₂ → CH", v: 424 },
    { label: "CH → C", v: 338 },
  ];
  const total = bde.reduce((a, b) => a + b.v, 0);
  const mean = total / bde.length;

  const PX = 50,
    PY = 16,
    PW = 370,
    PH = 136,
    YMAX = 500;
  const py = (v: number) => PY + PH - (v / YMAX) * PH;
  const cx = (i: number) => PX + (PW * (i + 0.5)) / bde.length;

  return (
    <Figure
      viewBox="0 0 450 212"
      alt="Four bars showing the successive carbon–hydrogen bond dissociation energies of methane: 439, 462, 424 and 338 kilojoules per mole. A dashed line at 416 marks the tabulated mean, and no individual bar sits on it, with the last bond more than 75 kilojoules per mole below the mean."
      caption="The four C–H bonds of methane cost 439, 462, 424 and 338 kJ/mol. They sum to 1663; the tabulated mean of 416 is a number no single bond has."
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        yLabel="bond dissociation energy (kJ/mol)"
        yTicks={[0, 100, 200, 300, 400, 500].map((v) => ({ at: v / YMAX, label: String(v) }))}
      />
      {bde.map((b, i) => (
        <g key={b.label}>
          <VBar x={cx(i)} w={46} yTop={py(b.v)} yBase={py(0)} color="var(--fig-1)" />
          <text
            x={cx(i)}
            y={py(b.v) - 5}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={9}
            fontWeight={600}
          >
            {b.v}
          </text>
          <text
            x={cx(i)}
            y={py(0) + 14}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {b.label}
          </text>
        </g>
      ))}
      <Level x1={PX} x2={PX + PW} y={py(mean)} color="var(--fig-2)" width={1.4} dashed />
      <SeriesLabel x={PX + PW - 116} y={py(mean) - 7} color="var(--fig-2)">
        tabulated mean 416
      </SeriesLabel>
      <Note x={PX + PW / 2} y={PY + PH + 32}>
        total atomization enthalpy {total} kJ/mol
      </Note>
    </Figure>
  );
}

/**
 * Bond-enthalpy bookkeeping done as an energy diagram rather than a sum, for
 * H₂ + Cl₂ → 2 HCl. Breaking everything first is a fiction — the reaction does
 * not go through free atoms — but it is a legitimate Hess's-law path, and
 * drawing it that way is what makes "broken minus formed" obviously a
 * state-function argument.
 */
function BondEnthalpyBookkeeping() {
  const yE = (E: number) => 176 - (E + 250) * 0.15;
  const levels = [0, 436, 679, -183];
  const xs = [56, 146, 224, 302, 424];
  const steps = [
    { v: "+436", what: "break H–H" },
    { v: "+243", what: "break Cl–Cl" },
    { v: "−862", what: "form 2 H–Cl" },
  ];

  return (
    <Figure
      viewBox="0 0 450 212"
      alt="An energy diagram for hydrogen plus chlorine forming hydrogen chloride. From the reactants at zero the path climbs 436 to break the hydrogen–hydrogen bond and a further 243 to break chlorine–chlorine, reaching free atoms at 679, then drops 862 as two hydrogen chloride bonds form, landing at minus 183 kilojoules per mole against a measured minus 185."
      caption="Bonds broken up, bonds formed down. The estimate lands at −183 kJ/mol against a measured −185 — close, because these bonds are near their tabulated averages."
    >
      <ArrowDefs id="eb-arrow" color="var(--fig-axis)" />
      <line x1={48} y1={24} x2={48} y2={178} stroke="var(--fig-axis)" strokeWidth={1.5} />
      {[750, 500, 250, 0, -250].map((v) => (
        <g key={v}>
          <line x1={44} y1={yE(v)} x2={48} y2={yE(v)} stroke="var(--fig-axis)" strokeWidth={1} />
          <text
            x={41}
            y={yE(v) + 3}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {v}
          </text>
        </g>
      ))}
      <text
        x={-101}
        y={14}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        kJ/mol
      </text>
      <Level x1={48} x2={430} y={yE(0)} color="var(--fig-grid)" width={1} dashed />

      {levels.map((E, i) => (
        <Level key={i} x1={xs[i]!} x2={xs[i + 1]!} y={yE(E)} color="var(--fig-1)" width={2} />
      ))}
      {levels.slice(0, 3).map((E, i) => (
        <g key={`s${i}`}>
          <line
            x1={xs[i + 1]}
            y1={yE(E)}
            x2={xs[i + 1]}
            y2={yE(levels[i + 1]!)}
            stroke="var(--fig-axis)"
            strokeWidth={1.2}
            markerEnd="url(#eb-arrow)"
          />
          <text
            x={xs[i + 1]! + 5}
            y={(yE(E) + yE(levels[i + 1]!)) / 2}
            className="fill-foreground"
            fontSize={9}
            fontWeight={600}
          >
            {steps[i]!.v}
          </text>
          <text
            x={xs[i + 1]! + 5}
            y={(yE(E) + yE(levels[i + 1]!)) / 2 + 10}
            className="fill-muted-foreground"
            fontSize={9}
          >
            {steps[i]!.what}
          </text>
        </g>
      ))}
      <text x={58} y={yE(0) + 14} className="fill-muted-foreground" fontSize={9}>
        H₂ + Cl₂
      </text>
      <text x={226} y={yE(679) - 8} className="fill-muted-foreground" fontSize={9}>
        2 H· + 2 Cl· (free atoms)
      </text>
      <text
        x={424}
        y={yE(-183) - 8}
        textAnchor="end"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        2 HCl, ΔH ≈ −183
      </text>
      <Note x={424} y={yE(-183) + 14} anchor="end">
        measured −185 kJ/mol
      </Note>
    </Figure>
  );
}

/* ====================================================================== */
/* 07 — Molecular Orbital Theory                                           */
/* ====================================================================== */

/**
 * The foundational LCAO picture, computed rather than sketched. Two hydrogen
 * 1s orbitals at R = 2.5 a₀ are combined in and out of phase with the correct
 * normalization ψ± = (φ_A ± φ_B)/√(2(1 ± S)), and the resulting one-electron
 * densities are plotted against the density the same electron would have if
 * the two atoms did not interact, (φ_A² + φ_B²)/2. On that fair comparison the
 * in-phase combination genuinely piles density into the internuclear region
 * and the out-of-phase one empties it, which is the whole claim.
 */
const OVERLAP = (() => {
  const R = 2.5; // internuclear separation, bohr
  const S = Math.exp(-R) * (1 + R + (R * R) / 3); // exact 1s–1s overlap integral
  const nPlus = 1 / Math.sqrt(2 * (1 + S));
  const nMinus = 1 / Math.sqrt(2 * (1 - S));
  const phi = (x: number, x0: number) => Math.exp(-Math.abs(x - x0)) / Math.sqrt(Math.PI);

  const xs: number[] = [];
  for (let i = 0; i <= 240; i++) xs.push(-4 + (8 * i) / 240);

  const sample = (sign: 1 | -1) =>
    xs.map((x) => {
      const a = phi(x, -R / 2);
      const b = phi(x, R / 2);
      const psi = (sign === 1 ? nPlus : nMinus) * (a + sign * b);
      return { x, mo: psi * psi, free: (a * a + b * b) / 2 };
    });

  const bonding = sample(1);
  const antibonding = sample(-1);
  const yMax = Math.max(...[...bonding, ...antibonding].flatMap((p) => [p.mo, p.free]));
  const mid = bonding[120]!; // x = 0, the midpoint
  return { R, bonding, antibonding, yMax, midRatio: mid.mo / mid.free };
})();

function PhaseOverlap() {
  const W = 184,
    BASE = 205,
    TOP = 108;
  const cols = [
    { L: 40, data: OVERLAP.bonding, title: "σ — combined in phase", phases: ["+", "+"] as const },
    {
      L: 246,
      data: OVERLAP.antibonding,
      title: "σ* — combined out of phase",
      phases: ["+", "−"] as const,
    },
  ];
  const sx = (L: number, x: number) => L + ((x + 4) / 8) * W;
  const sy = (v: number) => BASE - (v / OVERLAP.yMax) * (BASE - TOP);

  return (
    <Figure
      viewBox="0 0 460 254"
      alt="Two panels comparing the electron density of the in-phase and out-of-phase combinations of two hydrogen 1s orbitals against the density of two non-interacting atoms. In the in-phase sigma orbital the density between the nuclei is about 1.4 times the non-interacting value, while in the out-of-phase sigma-star orbital the density falls to exactly zero at a node midway between the nuclei and piles up outside them instead."
      caption="Same two atomic orbitals, two signs. In phase the electron is drawn into the region between the nuclei; out of phase a node sits there and the electron is pushed outside."
    >
      {cols.map((c, ci) => {
        const nucL = sx(c.L, -OVERLAP.R / 2);
        const nucR = sx(c.L, OVERLAP.R / 2);
        return (
          <g key={c.title}>
            <text
              x={c.L + W / 2}
              y={26}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={10}
              fontWeight={600}
            >
              {c.title}
            </text>

            {/* The two atomic orbitals and their relative phase. */}
            {[nucL, nucR].map((nx, i) => (
              <g key={nx}>
                <circle
                  cx={nx}
                  cy={62}
                  r={16}
                  fill={c.phases[i] === "+" ? "var(--fig-pos)" : "var(--fig-neg)"}
                  opacity={0.2}
                />
                <circle
                  cx={nx}
                  cy={62}
                  r={16}
                  fill="none"
                  stroke={c.phases[i] === "+" ? "var(--fig-pos)" : "var(--fig-neg)"}
                  strokeWidth={1.2}
                />
                <text
                  x={nx}
                  y={66}
                  textAnchor="middle"
                  className="fill-foreground"
                  fontSize={12}
                  fontWeight={600}
                >
                  {c.phases[i]}
                </text>
              </g>
            ))}

            {/* Densities. The dashed reference is the same electron shared by
                two atoms that are not interacting at all. */}
            <path
              d={pathFrom(c.data.map((p) => ({ x: sx(c.L, p.x), y: sy(p.free) })))}
              fill="none"
              stroke="var(--fig-2)"
              strokeWidth={1.2}
              strokeDasharray="4 3"
            />
            <path
              d={pathFrom(
                c.data.map((p) => ({ x: sx(c.L, p.x), y: sy(p.mo) })),
                { toY: BASE },
              )}
              fill="var(--fig-1)"
              opacity={0.16}
            />
            <path
              d={pathFrom(c.data.map((p) => ({ x: sx(c.L, p.x), y: sy(p.mo) })))}
              fill="none"
              stroke="var(--fig-1)"
              strokeWidth={2}
            />

            <line
              x1={c.L}
              y1={BASE}
              x2={c.L + W}
              y2={BASE}
              stroke="var(--fig-axis)"
              strokeWidth={1.5}
            />
            {[nucL, nucR].map((nx) => (
              <g key={`n${nx}`}>
                <line
                  x1={nx}
                  y1={BASE}
                  x2={nx}
                  y2={BASE + 5}
                  stroke="var(--fig-axis)"
                  strokeWidth={1}
                />
                <text
                  x={nx}
                  y={BASE + 16}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={9}
                >
                  nucleus
                </text>
              </g>
            ))}

            {ci === 0 ? (
              <g>
                <line
                  x1={(nucL + nucR) / 2}
                  y1={sy(c.data[120]!.mo)}
                  x2={(nucL + nucR) / 2}
                  y2={sy(c.data[120]!.free)}
                  stroke="var(--fig-1)"
                  strokeWidth={1.2}
                />
                <text
                  x={(nucL + nucR) / 2}
                  y={sy(c.data[120]!.mo) - 8}
                  textAnchor="middle"
                  className="fill-foreground"
                  fontSize={9}
                  fontWeight={600}
                >
                  {`${OVERLAP.midRatio.toFixed(2)}× the free-atom density`}
                </text>
              </g>
            ) : (
              <g>
                <line
                  x1={(nucL + nucR) / 2}
                  y1={TOP}
                  x2={(nucL + nucR) / 2}
                  y2={BASE}
                  stroke="var(--fig-neg)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <text
                  x={(nucL + nucR) / 2}
                  y={TOP - 4}
                  textAnchor="middle"
                  className="fill-foreground"
                  fontSize={9}
                  fontWeight={600}
                >
                  node: density exactly zero
                </text>
              </g>
            )}
          </g>
        );
      })}

      <SeriesLabel x={44} y={244} color="var(--fig-1)">
        electron density in the MO
      </SeriesLabel>
      <SeriesLabel x={232} y={244} color="var(--fig-2)">
        same electron, atoms not interacting
      </SeriesLabel>
    </Figure>
  );
}

/**
 * The two period-2 orderings side by side. Energies are deliberately drawn
 * without a numeric axis: the ordering is the content, and the actual splittings
 * differ from molecule to molecule. N₂ is filled on the mixed side and O₂ on the
 * unmixed side, which is exactly where the crossover falls.
 */
function SpMixing() {
  const half = 27,
    pairHalf = 21,
    pairGap = 9;

  type Lvl = { key: string; y: number; label: string; kind: "single" | "pair"; fill: string[] };
  const left: Lvl[] = [
    { key: "s2s", y: 202, label: "σ 2s", kind: "single", fill: ["updown"] },
    { key: "ss2s", y: 176, label: "σ* 2s", kind: "single", fill: ["updown"] },
    { key: "p2p", y: 136, label: "π 2p", kind: "pair", fill: ["updown", "updown"] },
    { key: "s2p", y: 114, label: "σ 2p", kind: "single", fill: ["updown"] },
    { key: "ps2p", y: 74, label: "π* 2p", kind: "pair", fill: [] },
    { key: "ss2p", y: 50, label: "σ* 2p", kind: "single", fill: [] },
  ];
  const right: Lvl[] = [
    { key: "s2s", y: 202, label: "σ 2s", kind: "single", fill: ["updown"] },
    { key: "ss2s", y: 176, label: "σ* 2s", kind: "single", fill: ["updown"] },
    { key: "s2p", y: 140, label: "σ 2p", kind: "single", fill: ["updown"] },
    { key: "p2p", y: 118, label: "π 2p", kind: "pair", fill: ["updown", "updown"] },
    { key: "ps2p", y: 74, label: "π* 2p", kind: "pair", fill: ["up", "up"] },
    { key: "ss2p", y: 50, label: "σ* 2p", kind: "single", fill: [] },
  ];

  const column = (cx: number, levels: Lvl[], labelSide: "left" | "right") =>
    levels.map((l) => {
      const nodes =
        l.kind === "single"
          ? [cx]
          : [cx - pairHalf / 2 - pairGap / 2 - 5, cx + pairHalf / 2 + pairGap / 2 + 5];
      const w = l.kind === "single" ? half : pairHalf / 2 + 5;
      return (
        <g key={l.key}>
          {nodes.map((nx, i) => (
            <g key={nx}>
              <Level x1={nx - w} x2={nx + w} y={l.y} color="var(--fig-axis)" width={2} />
              {l.fill[i] && <Spins x={nx} y={l.y} kind={l.fill[i] as "up" | "down" | "updown"} />}
            </g>
          ))}
          <text
            x={labelSide === "left" ? cx - half - 8 : cx + half + 8}
            y={l.y + 3}
            textAnchor={labelSide === "left" ? "end" : "start"}
            className="fill-muted-foreground"
            fontSize={9}
          >
            {l.label}
          </text>
        </g>
      );
    });

  return (
    <Figure
      viewBox="0 0 460 256"
      alt="Two molecular orbital ladders side by side. On the left, for boron through nitrogen, s–p mixing pushes the sigma 2p level above the degenerate pi 2p pair, so nitrogen's highest occupied orbital is sigma. On the right, for oxygen and fluorine, the larger 2s–2p gap suppresses the mixing and sigma 2p sits below pi 2p, which leaves oxygen with two unpaired electrons in the pi-star pair."
      caption="One swap, two diagrams. The 2s–2p gap is small at the left of period 2, so σ2p is pushed above π2p; by oxygen the gap is large and the ordering reverts."
    >
      <ArrowDefs id="spm-arrow" color="var(--fig-2)" />
      <text
        x={130}
        y={24}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        Li₂ … N₂ — small 2s–2p gap
      </text>
      <Note x={130} y={37}>
        s–p mixing, π below σ
      </Note>
      <text
        x={330}
        y={24}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        O₂, F₂ — large 2s–2p gap
      </text>
      <Note x={330} y={37}>
        mixing negligible, σ below π
      </Note>

      {column(130, left, "left")}
      {column(330, right, "right")}

      {/* The swap itself. */}
      <line
        x1={168}
        y1={114}
        x2={292}
        y2={140}
        stroke="var(--fig-2)"
        strokeWidth={1.2}
        strokeDasharray="4 3"
        markerEnd="url(#spm-arrow)"
      />
      <text
        x={230}
        y={122}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        σ2p drops
      </text>

      <text
        x={130}
        y={228}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        N₂, 10 valence e⁻
      </text>
      <Note x={130} y={241}>
        HOMO is σ — confirmed by PES
      </Note>
      <text
        x={330}
        y={228}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        O₂, 12 valence e⁻
      </text>
      <Note x={330} y={241}>
        two unpaired electrons in π*
      </Note>
    </Figure>
  );
}

/**
 * Bond order against bond length for the oxygen series. Four species built
 * from the same pair of atoms, differing only in how many electrons sit in the
 * antibonding π*, and the bond length tracks the count monotonically. No
 * localized dot structure produces the sequence.
 */
function BondOrderSeries() {
  const pts = [
    { f: "O₂²⁻", bo: 1.0, d: 149, note: "peroxide" },
    { f: "O₂⁻", bo: 1.5, d: 133, note: "superoxide" },
    { f: "O₂", bo: 2.0, d: 121, note: "" },
    { f: "O₂⁺", bo: 2.5, d: 112, note: "" },
  ];
  const PX = 56,
    PY = 16,
    PW = 360,
    PH = 134;
  const X0 = 0.75,
    X1 = 2.75,
    Y0 = 100,
    Y1 = 160;
  const px = (v: number) => PX + ((v - X0) / (X1 - X0)) * PW;
  const py = (v: number) => PY + PH - ((v - Y0) / (Y1 - Y0)) * PH;

  return (
    <Figure
      viewBox="0 0 450 212"
      alt="Bond length plotted against bond order for peroxide, superoxide, dioxygen and the dioxygenyl cation. As electrons are removed from the antibonding pi-star orbital the bond order rises from 1 to 2.5 and the bond length falls monotonically from 149 to 112 picometres, a straight-line relationship across four species built from the same two atoms."
      caption="Removing π* electrons raises bond order and shortens the bond: 149 → 133 → 121 → 112 pm. Bond order is a predictive quantity, not a label."
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        xLabel="bond order = ½(bonding − antibonding electrons)"
        yLabel="bond length (pm)"
        xTicks={[1.0, 1.5, 2.0, 2.5].map((v) => ({
          at: (v - X0) / (X1 - X0),
          label: v.toFixed(1),
        }))}
        yTicks={[100, 120, 140, 160].map((v) => ({ at: (v - Y0) / (Y1 - Y0), label: String(v) }))}
      />
      <path
        d={pathFrom(pts.map((p) => ({ x: px(p.bo), y: py(p.d) })))}
        fill="none"
        stroke="var(--fig-1)"
        strokeWidth={1.4}
      />
      {pts.map((p) => (
        <g key={p.f}>
          <circle cx={px(p.bo)} cy={py(p.d)} r={4} fill="var(--fig-1)" />
          <text
            x={px(p.bo) + 8}
            y={py(p.d) - 2}
            className="fill-foreground"
            fontSize={10}
            fontWeight={600}
          >
            {p.f}
          </text>
          <text x={px(p.bo) + 8} y={py(p.d) + 9} className="fill-muted-foreground" fontSize={9}>
            {`${p.d} pm`}
          </text>
        </g>
      ))}
    </Figure>
  );
}

/**
 * The decisive test. A Lewis structure for O₂ pairs every electron and so
 * predicts a diamagnetic molecule; filling the MO ladder by Hund's rule leaves
 * two parallel electrons in the degenerate π*, which is what liquid oxygen
 * sticking to a magnet actually shows. Both give bond order 2.
 */
function O2Paramagnetism() {
  const cx = 330,
    half = 27,
    pairHalf = 21;
  const levels = [
    { key: "s2s", y: 198, label: "σ 2s", pair: false, fill: ["updown"] },
    { key: "ss2s", y: 174, label: "σ* 2s", pair: false, fill: ["updown"] },
    { key: "s2p", y: 148, label: "σ 2p", pair: false, fill: ["updown"] },
    { key: "p2p", y: 126, label: "π 2p", pair: true, fill: ["updown", "updown"] },
    { key: "ps2p", y: 84, label: "π* 2p", pair: true, fill: ["up", "up"] },
    { key: "ss2p", y: 58, label: "σ* 2p", pair: false, fill: [] },
  ];

  return (
    <Figure
      viewBox="0 0 460 250"
      alt="On the left the Lewis structure of oxygen, with a double bond and two lone pairs on each atom, in which every electron is paired so the molecule is predicted to be diamagnetic. On the right the molecular orbital ladder for the same molecule, where Hund's rule puts two electrons singly and in parallel into the degenerate pi-star pair, predicting paramagnetism while still giving bond order two. Liquid oxygen is in fact attracted to a magnet."
      caption="Same molecule, same bond order of 2, opposite magnetic prediction. Liquid O₂ clings to a magnet, so the localized picture is not merely coarser here — it is wrong."
    >
      {/* Lewis structure: every electron paired. */}
      <text
        x={118}
        y={26}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        Lewis structure
      </text>
      <text x={84} y={124} textAnchor="middle" className="fill-foreground" fontSize={19}>
        O
      </text>
      <text x={152} y={124} textAnchor="middle" className="fill-foreground" fontSize={19}>
        O
      </text>
      <line x1={98} y1={113} x2={138} y2={113} stroke="currentColor" strokeWidth={1.6} />
      <line x1={98} y1={121} x2={138} y2={121} stroke="currentColor" strokeWidth={1.6} />
      <Pair x={84} y={96} angle={0} />
      <Pair x={66} y={118} angle={90} />
      <Pair x={152} y={96} angle={0} />
      <Pair x={170} y={118} angle={90} />
      <Note x={118} y={152}>
        8 lone-pair + 4 bonding electrons
      </Note>
      <text
        x={118}
        y={172}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        all paired
      </text>
      <text x={118} y={186} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        predicts diamagnetic
      </text>
      <text
        x={118}
        y={206}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        bond order 2 ✓
      </text>

      <line x1={222} y1={40} x2={222} y2={214} stroke="var(--fig-grid)" strokeWidth={1} />

      {/* MO ladder: the π* pair is where the two pictures part company. */}
      <text
        x={cx}
        y={26}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        molecular orbitals
      </text>
      <rect x={cx - 44} y={72} width={88} height={24} rx={4} fill="var(--fig-1)" opacity={0.14} />
      {levels.map((l) => {
        const nodes = l.pair ? [cx - 21, cx + 21] : [cx];
        const w = l.pair ? pairHalf / 2 + 5 : half;
        return (
          <g key={l.key}>
            {nodes.map((nx, i) => (
              <g key={nx}>
                <Level x1={nx - w} x2={nx + w} y={l.y} color="var(--fig-axis)" width={2} />
                {l.fill[i] && <Spins x={nx} y={l.y} kind={l.fill[i] as "up" | "down" | "updown"} />}
              </g>
            ))}
            <text x={cx + 50} y={l.y + 3} className="fill-muted-foreground" fontSize={9}>
              {l.label}
            </text>
          </g>
        );
      })}
      <text
        x={cx - 52}
        y={80}
        textAnchor="end"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        two unpaired,
      </text>
      <text
        x={cx - 52}
        y={91}
        textAnchor="end"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        spins parallel
      </text>
      <text
        x={cx}
        y={228}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        bond order (8 − 4)/2 = 2 ✓
      </text>
      <text x={cx} y={241} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        predicts paramagnetic — and it is
      </text>
    </Figure>
  );
}

/* ====================================================================== */
/* 09 — Molecular Polarity                                                 */
/* ====================================================================== */

/**
 * The single clearest figure on the topic: the same two polar bonds, two
 * geometries, opposite answers. Drawn at the real angles — 180° for CO₂ and
 * 104.5° for water — with the bond dipoles as arrows pointing toward δ− and
 * the resultant drawn only where there is one.
 */
function DipoleVectors() {
  const oX = 340,
    oY = 60;
  // Half-angle 52.25° puts the two O–H bonds 104.5° apart.
  const dy = 38;
  const dx = dy * Math.tan((52.25 * Math.PI) / 180);
  const h1 = { x: oX - dx, y: oY + dy };
  const h2 = { x: oX + dx, y: oY + dy };
  /** A point a fraction t of the way from p toward the oxygen. */
  const toward = (p: { x: number; y: number }, t: number) => ({
    x: p.x + (oX - p.x) * t,
    y: p.y + (oY - p.y) * t,
  });

  return (
    <Figure
      viewBox="0 0 460 210"
      alt="Carbon dioxide drawn linear with its two carbon–oxygen bond dipoles pointing in exactly opposite directions so their vector sum is zero and the measured dipole moment is zero, beside water drawn bent at 104.5 degrees where the two oxygen–hydrogen bond dipoles point partly the same way, add to a resultant along the bisector, and give a measured moment of 1.85 debye."
      caption="Two polar bonds either way. At 180° the vectors cancel exactly and μ = 0; at 104.5° they add along the bisector to a measured 1.85 D, with the lone pairs pointing the same way."
    >
      <ArrowDefs id="dv-bond" color="var(--fig-1)" />
      <ArrowDefs id="dv-net" color="currentColor" />

      <text
        x={130}
        y={26}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        CO₂ — linear, 180°
      </text>
      <text
        x={340}
        y={26}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        H₂O — bent, 104.5°
      </text>

      {/* CO₂: the two arrows are the two bonds, drawn pointing at the δ− oxygens. */}
      <text x={82} y={85} textAnchor="middle" className="fill-foreground" fontSize={15}>
        O
      </text>
      <text x={130} y={85} textAnchor="middle" className="fill-foreground" fontSize={15}>
        C
      </text>
      <text x={178} y={85} textAnchor="middle" className="fill-foreground" fontSize={15}>
        O
      </text>
      <line
        x1={120}
        y1={80}
        x2={94}
        y2={80}
        stroke="var(--fig-1)"
        strokeWidth={1.8}
        markerEnd="url(#dv-bond)"
      />
      <line
        x1={140}
        y1={80}
        x2={166}
        y2={80}
        stroke="var(--fig-1)"
        strokeWidth={1.8}
        markerEnd="url(#dv-bond)"
      />
      <Note x={130} y={104}>
        equal, opposite, collinear
      </Note>
      <circle cx={130} cy={128} r={7} fill="none" stroke="currentColor" strokeWidth={1.4} />
      <line x1={125} y1={133} x2={135} y2={123} stroke="currentColor" strokeWidth={1.4} />
      <text
        x={130}
        y={155}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={11}
        fontWeight={600}
      >
        μ = 0 D
      </text>
      <Note x={130} y={169}>
        an experimental zero
      </Note>

      <line x1={240} y1={40} x2={240} y2={176} stroke="var(--fig-grid)" strokeWidth={1} />

      {/* Water: same arrows, different angle, so they no longer cancel. */}
      <text x={oX} y={oY + 6} textAnchor="middle" className="fill-foreground" fontSize={15}>
        O
      </text>
      <text
        x={h1.x - 4}
        y={h1.y + 12}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={13}
      >
        H
      </text>
      <text
        x={h2.x + 4}
        y={h2.y + 12}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={13}
      >
        H
      </text>
      <Pair x={oX - 9} y={oY - 18} angle={0} color="var(--fig-2)" />
      <Pair x={oX + 9} y={oY - 18} angle={0} color="var(--fig-2)" />
      <line
        x1={toward(h1, 0.12).x}
        y1={toward(h1, 0.12).y}
        x2={toward(h1, 0.78).x}
        y2={toward(h1, 0.78).y}
        stroke="var(--fig-1)"
        strokeWidth={1.8}
        markerEnd="url(#dv-bond)"
      />
      <line
        x1={toward(h2, 0.12).x}
        y1={toward(h2, 0.12).y}
        x2={toward(h2, 0.78).x}
        y2={toward(h2, 0.78).y}
        stroke="var(--fig-1)"
        strokeWidth={1.8}
        markerEnd="url(#dv-bond)"
      />
      <line
        x1={oX}
        y1={oY + 58}
        x2={oX}
        y2={oY + 14}
        stroke="currentColor"
        strokeWidth={2.4}
        markerEnd="url(#dv-net)"
      />
      <text
        x={oX}
        y={oY + 76}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={11}
        fontWeight={600}
      >
        μ = 1.85 D
      </text>
      <Note x={oX} y={oY + 90}>
        lone pairs reinforce it
      </Note>

      <SeriesLabel x={54} y={196} color="var(--fig-1)">
        bond dipole, pointing at δ−
      </SeriesLabel>
      <SeriesLabel x={258} y={196} color="currentColor">
        vector sum for the molecule
      </SeriesLabel>
    </Figure>
  );
}

/**
 * Ammonia against nitrogen trifluoride: the pair that separates bond polarity
 * from molecular polarity. NF₃ has the more polar bonds and almost no moment,
 * because the bond dipoles run the other way and fight the lone pair instead of
 * joining it. Only the two net moments are drawn to scale — the split between
 * the bond and lone-pair contributions is model-dependent, so those arrows are
 * schematic and carry no length claim.
 */
function AmmoniaVsNitrogenTrifluoride() {
  const panels = [
    {
      cx: 122,
      centre: "N",
      outer: "H",
      dEN: "N–H, ΔEN 0.84",
      toward: "bond dipoles point up, toward N",
      mu: 1.47,
      bondUp: true,
    },
    {
      cx: 330,
      centre: "N",
      outer: "F",
      dEN: "N–F, ΔEN 0.94",
      toward: "bond dipoles point down, toward F",
      mu: 0.23,
      bondUp: false,
    },
  ];
  const scale = 46; // px per debye, shared by both panels

  return (
    <Figure
      viewBox="0 0 460 244"
      alt="Ammonia and nitrogen trifluoride are both trigonal pyramidal with a lone pair on nitrogen, but nitrogen trifluoride has the more polar bonds and the far smaller dipole moment. In ammonia the three bond dipoles point up toward nitrogen and reinforce the lone-pair moment, giving 1.47 debye; in nitrogen trifluoride they point down toward the fluorines and oppose it, leaving only 0.23 debye."
      caption="NF₃ has the more polar bonds (ΔEN 0.94 against 0.84) and one sixth the moment: its bond dipoles oppose the lone pair instead of reinforcing it."
    >
      <ArrowDefs id="nf-bond" color="var(--fig-1)" />
      <ArrowDefs id="nf-lp" color="var(--fig-2)" />
      <ArrowDefs id="nf-net" color="currentColor" />

      {panels.map((p) => {
        const nY = 96;
        const outers = [
          { x: p.cx - 46, y: 146 },
          { x: p.cx - 2, y: 158 },
          { x: p.cx + 46, y: 146 },
        ];
        return (
          <g key={p.cx}>
            <text
              x={p.cx}
              y={26}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={11}
              fontWeight={600}
            >
              {p.outer === "H" ? "NH₃" : "NF₃"}
            </text>
            <Note x={p.cx} y={39}>
              {p.dEN}
            </Note>

            <Pair x={p.cx} y={nY - 18} angle={90} color="var(--fig-2)" />
            <text x={p.cx} y={nY + 5} textAnchor="middle" className="fill-foreground" fontSize={14}>
              {p.centre}
            </text>
            {outers.map((o) => (
              <g key={o.x}>
                <line
                  x1={p.cx}
                  y1={nY + 8}
                  x2={o.x}
                  y2={o.y - 9}
                  stroke="var(--fig-grid)"
                  strokeWidth={1.4}
                />
                <text x={o.x} y={o.y} textAnchor="middle" className="fill-foreground" fontSize={12}>
                  {p.outer}
                </text>
                {/* Direction only: these arrows are not drawn to scale. */}
                <line
                  x1={p.bondUp ? o.x * 0.72 + p.cx * 0.28 : p.cx * 0.72 + o.x * 0.28}
                  y1={
                    p.bondUp
                      ? (o.y - 9) * 0.72 + (nY + 8) * 0.28
                      : (nY + 8) * 0.72 + (o.y - 9) * 0.28
                  }
                  x2={p.bondUp ? p.cx * 0.86 + o.x * 0.14 : o.x * 0.86 + p.cx * 0.14}
                  y2={
                    p.bondUp
                      ? (nY + 8) * 0.86 + (o.y - 9) * 0.14
                      : (o.y - 9) * 0.86 + (nY + 8) * 0.14
                  }
                  stroke="var(--fig-1)"
                  strokeWidth={1.5}
                  markerEnd="url(#nf-bond)"
                />
              </g>
            ))}
            <line
              x1={p.cx}
              y1={nY - 26}
              x2={p.cx}
              y2={nY - 46}
              stroke="var(--fig-2)"
              strokeWidth={1.5}
              markerEnd="url(#nf-lp)"
            />
            <Note x={p.cx + 8} y={nY - 40} anchor="start">
              lone pair
            </Note>

            {/* Only this arrow is to scale, and both panels share the scale. */}
            <line
              x1={p.cx + 92}
              y1={178}
              x2={p.cx + 92}
              y2={178 - p.mu * scale}
              stroke="currentColor"
              strokeWidth={2.6}
              markerEnd="url(#nf-net)"
            />
            <text
              x={p.cx + 92}
              y={194}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={10}
              fontWeight={600}
            >
              {`μ = ${p.mu.toFixed(2)} D`}
            </text>
            <text
              x={p.cx}
              y={214}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {p.toward}
            </text>
          </g>
        );
      })}
      <SeriesLabel x={54} y={234} color="var(--fig-1)">
        bond dipoles (direction only)
      </SeriesLabel>
      <SeriesLabel x={256} y={234} color="currentColor">
        measured moment, to scale
      </SeriesLabel>
    </Figure>
  );
}

/**
 * Percent ionic character straight from the definition: the measured moment
 * against the moment the same bond would have if one whole electron had moved
 * the full bond length. μ_ionic = e·d is computed here from the bond length,
 * using 4.803 D per ångström, so the two bars in each pair are the same
 * quantity and the ratio is readable off the drawing.
 */
function PercentIonicCharacter() {
  const hx = [
    { f: "H–I", d: 1.609, mu: 0.448 },
    { f: "H–Br", d: 1.414, mu: 0.827 },
    { f: "H–Cl", d: 1.275, mu: 1.08 },
    { f: "H–F", d: 0.917, mu: 1.82 },
  ].map((b) => {
    const ionic = 4.80324 * b.d; // one electronic charge across the bond length
    return { ...b, ionic, pct: (100 * b.mu) / ionic };
  });

  const PX = 54,
    PY = 16,
    PW = 366,
    PH = 132,
    YMAX = 8;
  const py = (v: number) => PY + PH - (v / YMAX) * PH;
  const cx = (i: number) => PX + (PW * (i + 0.5)) / hx.length;

  return (
    <Figure
      viewBox="0 0 450 214"
      alt="For each hydrogen halide, a tall outlined bar gives the dipole moment the bond would have if one electron were transferred completely across it, and a shorter filled bar gives the measured moment. The filled fraction rises from 5.8 percent in hydrogen iodide through 12.2 and 17.6 percent to 41.3 percent in hydrogen fluoride, a steady climb with no step anywhere that would mark a boundary between covalent and ionic."
      caption="Measured moment as a fraction of the full-transfer limit e·d. Ionic character climbs 5.8 → 41.3% across the series, continuously — there is no boundary to find."
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        yLabel="dipole moment (D)"
        yTicks={[0, 2, 4, 6, 8].map((v) => ({ at: v / YMAX, label: String(v) }))}
      />
      {hx.map((b, i) => (
        <g key={b.f}>
          <rect
            x={cx(i) - 23}
            y={py(b.ionic)}
            width={46}
            height={py(0) - py(b.ionic)}
            fill="var(--fig-2)"
            opacity={0.14}
          />
          <rect
            x={cx(i) - 23}
            y={py(b.ionic)}
            width={46}
            height={py(0) - py(b.ionic)}
            fill="none"
            stroke="var(--fig-2)"
            strokeWidth={1.2}
          />
          <VBar x={cx(i)} w={46} yTop={py(b.mu)} yBase={py(0)} color="var(--fig-1)" />
          <text
            x={cx(i)}
            y={py(b.ionic) - 6}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={10}
            fontWeight={600}
          >
            {`${b.pct.toFixed(1)}%`}
          </text>
          <text
            x={cx(i)}
            y={py(0) + 14}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {b.f}
          </text>
        </g>
      ))}
      <SeriesLabel x={PX + 8} y={PY + 16} color="var(--fig-2)">
        full transfer, e·d
      </SeriesLabel>
      <SeriesLabel x={PX + 8} y={PY + 32} color="var(--fig-1)">
        measured moment
      </SeriesLabel>
    </Figure>
  );
}

/**
 * Seven measured dipole moments sorted by whether symmetry forces the sum to
 * zero. The three on the left are not "nearly nonpolar" — their moments are
 * measured zeros, which is what makes symmetry a shortcut rather than an
 * approximation.
 */
function ShapeDecidesPolarity() {
  const mols = [
    { f: "CO₂", mu: 0, sym: true },
    { f: "BF₃", mu: 0, sym: true },
    { f: "CCl₄", mu: 0, sym: true },
    { f: "CHCl₃", mu: 1.04, sym: false },
    { f: "NH₃", mu: 1.47, sym: false },
    { f: "CH₂Cl₂", mu: 1.6, sym: false },
    { f: "H₂O", mu: 1.85, sym: false },
  ];
  const PX = 54,
    PY = 22,
    PW = 366,
    PH = 124,
    YMAX = 2;
  const py = (v: number) => PY + PH - (v / YMAX) * PH;
  const cx = (i: number) => PX + (PW * (i + 0.5)) / mols.length;

  return (
    <Figure
      viewBox="0 0 450 214"
      alt="Measured dipole moments for seven molecules. Carbon dioxide, boron trifluoride and carbon tetrachloride all measure exactly zero because every bond dipole has a partner pointing the opposite way, while chloroform, ammonia, dichloromethane and water, whose symmetry is broken by an odd outer atom or a lone pair, measure 1.04, 1.47, 1.60 and 1.85 debye."
      caption="All seven are built from polar bonds. The three on the left measure zero — symmetry, not weak bonds, is what cancels them."
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        yLabel="measured dipole moment (D)"
        yTicks={[0, 0.5, 1, 1.5, 2].map((v) => ({ at: v / YMAX, label: v.toFixed(1) }))}
      />
      {mols.map((m, i) => (
        <g key={m.f}>
          <VBar
            x={cx(i)}
            w={34}
            yTop={m.mu === 0 ? py(0) - 2 : py(m.mu)}
            yBase={py(0)}
            color={m.sym ? "var(--fig-2)" : "var(--fig-1)"}
          />
          <text
            x={cx(i)}
            y={(m.mu === 0 ? py(0) - 2 : py(m.mu)) - 5}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={9}
            fontWeight={600}
          >
            {m.mu.toFixed(2)}
          </text>
          <text
            x={cx(i)}
            y={py(0) + 14}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {m.f}
          </text>
        </g>
      ))}
      <path
        d={`M${PX + 4},${PY + PH + 22} L${PX + 4},${PY + PH + 27} L${cx(2) + 20},${PY + PH + 27} L${cx(2) + 20},${PY + PH + 22}`}
        fill="none"
        stroke="var(--fig-2)"
        strokeWidth={1.2}
      />
      <path
        d={`M${cx(3) - 20},${PY + PH + 22} L${cx(3) - 20},${PY + PH + 27} L${PX + PW},${PY + PH + 27} L${PX + PW},${PY + PH + 22}`}
        fill="none"
        stroke="var(--fig-1)"
        strokeWidth={1.2}
      />
      <Note x={(PX + cx(2) + 24) / 2} y={PY + PH + 40}>
        symmetric — every dipole has a partner
      </Note>
      <Note x={(cx(3) - 20 + PX + PW) / 2} y={PY + PH + 40}>
        odd outer atom or a lone pair
      </Note>
    </Figure>
  );
}

/* ====================================================================== */
/* 10 — Intermolecular Forces                                              */
/* ====================================================================== */

/**
 * Dispersion tracks polarizability, not mass. The noble gases make the first
 * half of the point — boiling point climbs with α across a factor of twenty —
 * and the pentane isomers make the second, since they have identical mass and
 * near-identical polarizability and still differ by 27 K.
 */
function DispersionAndPolarizability() {
  const gases = [
    { f: "He", a: 0.2, bp: 4.2 },
    { f: "Ne", a: 0.4, bp: 27 },
    { f: "Ar", a: 1.64, bp: 87 },
    { f: "Kr", a: 2.48, bp: 120 },
    { f: "Xe", a: 4.04, bp: 165 },
  ];
  const PX = 46,
    PY = 16,
    PW = 216,
    PH = 132;
  const AMAX = 4.5,
    BMAX = 180;
  const px = (a: number) => PX + (a / AMAX) * PW;
  const py = (b: number) => PY + PH - (b / BMAX) * PH;

  return (
    <Figure
      viewBox="0 0 460 226"
      alt="On the left, noble gas boiling points rise steadily with polarizability, from helium at 0.20 cubic ångströms and 4 kelvin to xenon at 4.04 and 165 kelvin. On the right, the two pentane isomers have the same formula, the same mass and nearly the same polarizability, yet the extended n-pentane chain boils 27 kelvin higher than the compact near-spherical neopentane, because an extended chain touches its neighbours along its whole length."
      caption="Polarizability is the variable, not mass: the noble gases climb with α, and two C₅H₁₂ isomers of identical mass differ by 27 K on shape alone."
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        xLabel="polarizability α (Å³)"
        yLabel="boiling point (K)"
        xTicks={[0, 1, 2, 3, 4].map((v) => ({ at: v / AMAX, label: String(v) }))}
        yTicks={[0, 60, 120, 180].map((v) => ({ at: v / BMAX, label: String(v) }))}
      />
      <path
        d={pathFrom(gases.map((g) => ({ x: px(g.a), y: py(g.bp) })))}
        fill="none"
        stroke="var(--fig-1)"
        strokeWidth={1.4}
      />
      {gases.map((g) => (
        <g key={g.f}>
          <circle cx={px(g.a)} cy={py(g.bp)} r={3.6} fill="var(--fig-1)" />
          <text
            x={px(g.a) + (g.f === "Xe" ? -6 : 6)}
            y={py(g.bp) + (g.f === "Xe" ? 12 : -5)}
            textAnchor={g.f === "Xe" ? "end" : "start"}
            className="fill-foreground"
            fontSize={9}
            fontWeight={600}
          >
            {g.f}
          </text>
        </g>
      ))}

      <line x1={292} y1={20} x2={292} y2={178} stroke="var(--fig-grid)" strokeWidth={1} />
      <text
        x={378}
        y={26}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        Same mass, different shape
      </text>

      {/* n-pentane: an extended chain, drawn as the zig-zag it is. */}
      <path
        d="M318,66 L332,58 L346,66 L360,58 L374,66"
        fill="none"
        stroke="var(--fig-2)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <line
        x1={314}
        y1={74}
        x2={378}
        y2={74}
        stroke="var(--fig-2)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <text x={396} y={66} className="fill-foreground" fontSize={9} fontWeight={600}>
        n-pentane
      </text>
      <text x={396} y={77} className="fill-muted-foreground" fontSize={9}>
        309 K
      </text>
      <Note x={346} y={90}>
        touches along its length
      </Note>

      {/* Neopentane: compact, so contact is a point. */}
      <g stroke="var(--fig-3)" strokeWidth={2} strokeLinecap="round">
        <line x1={346} y1={128} x2={346} y2={112} />
        <line x1={346} y1={128} x2={346} y2={144} />
        <line x1={346} y1={128} x2={330} y2={128} />
        <line x1={346} y1={128} x2={362} y2={128} />
      </g>
      <circle
        cx={346}
        cy={128}
        r={19}
        fill="none"
        stroke="var(--fig-3)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <text x={396} y={124} className="fill-foreground" fontSize={9} fontWeight={600}>
        neopentane
      </text>
      <text x={396} y={135} className="fill-muted-foreground" fontSize={9}>
        283 K
      </text>
      <Note x={346} y={164}>
        touches at a point
      </Note>
      <Note x={378} y={186}>
        both C₅H₁₂, M = 72.15, α within 2%
      </Note>
    </Figure>
  );
}

/**
 * The Lennard-Jones potential for argon, computed from
 * V(r) = 4ε[(σ/r)¹² − (σ/r)⁶] with the literature parameters ε/k_B = 119.8 K
 * and σ = 0.3405 nm. Both terms are drawn separately so the r⁻⁶ attraction —
 * the part that is Keesom, Debye and London all together — can be seen
 * reaching much further than the r⁻¹² wall.
 */
const LJ = (() => {
  const sigma = 0.3405; // nm
  const eps = (119.8 * 8.314) / 1000; // kJ/mol
  const rMin = Math.pow(2, 1 / 6) * sigma;
  const pts: { r: number; v: number; att: number; rep: number }[] = [];
  for (let i = 0; i <= 320; i++) {
    const r = 0.3 + (0.65 * i) / 320;
    const s6 = Math.pow(sigma / r, 6);
    pts.push({ r, v: 4 * eps * (s6 * s6 - s6), att: -4 * eps * s6, rep: 4 * eps * s6 * s6 });
  }
  return { sigma, eps, rMin, pts };
})();

function LennardJones() {
  const PX = 52,
    PY = 14,
    PW = 364,
    PH = 150;
  const R0 = 0.3,
    R1 = 0.95,
    V0 = -1.4,
    V1 = 2.0;
  const px = (r: number) => PX + ((r - R0) / (R1 - R0)) * PW;
  const py = (v: number) => PY + PH - ((v - V0) / (V1 - V0)) * PH;
  const clip = (sel: (p: (typeof LJ.pts)[number]) => number) =>
    LJ.pts.filter((p) => sel(p) <= V1 && sel(p) >= V0).map((p) => ({ x: px(p.r), y: py(sel(p)) }));

  return (
    <Figure
      viewBox="0 0 450 236"
      alt="The Lennard-Jones potential for argon, with its repulsive r to the minus twelve term and attractive r to the minus six term drawn separately. The total curve crosses zero at sigma, 0.34 nanometres, falls to a minimum one epsilon deep at 0.382 nanometres, and then decays; the attractive term alone is still appreciable well beyond the minimum while the repulsive term has already vanished, which is why the attraction sets the range and the repulsion sets the size."
      caption="Argon, from V(r) = 4ε[(σ/r)¹² − (σ/r)⁶] with ε/k_B = 119.8 K and σ = 0.3405 nm. The r⁻⁶ attraction reaches; the r⁻¹² wall does not."
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        xLabel="separation r (nm)"
        yLabel="potential energy (kJ/mol)"
        xTicks={[0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((v) => ({
          at: (v - R0) / (R1 - R0),
          label: v.toFixed(1),
        }))}
        yTicks={[-1, 0, 1, 2].map((v) => ({ at: (v - V0) / (V1 - V0), label: String(v) }))}
      />
      <Level x1={PX} x2={PX + PW} y={py(0)} color="var(--fig-grid)" width={1} />
      <path
        d={pathFrom(clip((p) => p.rep))}
        fill="none"
        stroke="var(--fig-3)"
        strokeWidth={1.2}
        strokeDasharray="4 3"
      />
      <path
        d={pathFrom(clip((p) => p.att))}
        fill="none"
        stroke="var(--fig-2)"
        strokeWidth={1.2}
        strokeDasharray="4 3"
      />
      <path d={pathFrom(clip((p) => p.v))} fill="none" stroke="var(--fig-1)" strokeWidth={2} />

      <line
        x1={px(LJ.sigma)}
        y1={py(0)}
        x2={px(LJ.sigma)}
        y2={py(-LJ.eps)}
        stroke="var(--fig-axis)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <circle cx={px(LJ.rMin)} cy={py(-LJ.eps)} r={3.5} fill="var(--fig-1)" />
      <Note x={px(LJ.sigma) - 2} y={py(0) - 6} anchor="end">
        σ, V = 0
      </Note>
      <text
        x={px(LJ.rMin) + 8}
        y={py(-LJ.eps) + 4}
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        {`r_min = 2^(1/6)σ = ${LJ.rMin.toFixed(3)} nm, depth ε`}
      </text>

      <SeriesLabel x={px(0.62)} y={py(1.5)} color="var(--fig-3)">
        repulsion, r⁻¹²
      </SeriesLabel>
      <SeriesLabel x={px(0.62)} y={py(1.1)} color="var(--fig-2)">
        attraction, r⁻⁶
      </SeriesLabel>
      <SeriesLabel x={px(0.62)} y={py(0.7)} color="var(--fig-1)">
        total
      </SeriesLabel>
      <Note x={PX + PW / 2} y={PY + PH + 50}>
        doubling r cuts the r⁻⁶ attraction 64-fold
      </Note>
    </Figure>
  );
}

/**
 * Why water beats HF beats NH₃, when an individual H···F bond is the stronger
 * one. A hydrogen-bonded network needs donors and acceptors in matched
 * numbers, so the smaller of the two counts is what each molecule can
 * actually use.
 */
function HydrogenBondCounting() {
  const cols = [
    {
      cx: 86,
      name: "H₂O",
      donors: 2,
      acceptors: 2,
      perMolecule: "≈ 2",
      bp: "+100 °C",
      verdict: "matched — a full 3-D network",
    },
    {
      cx: 230,
      name: "HF",
      donors: 1,
      acceptors: 3,
      perMolecule: "≈ 1",
      bp: "+20 °C",
      verdict: "donor-limited — chains only",
    },
    {
      cx: 374,
      name: "NH₃",
      donors: 3,
      acceptors: 1,
      perMolecule: "≈ 1",
      bp: "−33 °C",
      verdict: "acceptor-limited — chains only",
    },
  ];

  return (
    <Figure
      viewBox="0 0 460 244"
      alt="Water, hydrogen fluoride and ammonia compared by how many hydrogen-bond donors and acceptors each molecule carries. Water has two of each and sustains about two hydrogen bonds per molecule, giving a three-dimensional network and a boiling point of 100 degrees; hydrogen fluoride has one donor and three acceptors and ammonia three donors and one acceptor, so both are capped at about one and boil at 20 and minus 33 degrees. The smaller of the two counts, not the strength of a single bond, sets the ranking."
      caption="An H···F bond is stronger than an H···O one, yet water boils 80 °C higher. Donors and acceptors have to be matched, and only water matches them."
    >
      {cols.map((c) => (
        <g key={c.name}>
          <text
            x={c.cx}
            y={26}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={12}
            fontWeight={600}
          >
            {c.name}
          </text>

          {/* Central atom with its donors below and acceptor pairs above. */}
          <text x={c.cx} y={70} textAnchor="middle" className="fill-foreground" fontSize={14}>
            {c.name === "H₂O" ? "O" : c.name === "HF" ? "F" : "N"}
          </text>
          {Array.from({ length: c.donors }, (_, i) => {
            const spread = c.donors === 1 ? [0] : c.donors === 2 ? [-22, 22] : [-26, 0, 26];
            const dx = spread[i]!;
            return (
              <g key={`d${i}`}>
                <line
                  x1={c.cx}
                  y1={76}
                  x2={c.cx + dx}
                  y2={92}
                  stroke="var(--fig-grid)"
                  strokeWidth={1.3}
                />
                <circle cx={c.cx + dx} cy={98} r={7} fill="var(--fig-pos)" opacity={0.2} />
                <text
                  x={c.cx + dx}
                  y={101}
                  textAnchor="middle"
                  className="fill-foreground"
                  fontSize={9}
                  fontWeight={600}
                >
                  H
                </text>
              </g>
            );
          })}
          {Array.from({ length: c.acceptors }, (_, i) => {
            const spread = c.acceptors === 1 ? [0] : c.acceptors === 2 ? [-9, 9] : [-16, 0, 16];
            return (
              <Pair key={`a${i}`} x={c.cx + spread[i]!} y={50} angle={0} color="var(--fig-neg)" />
            );
          })}

          <text x={c.cx} y={130} textAnchor="middle" className="fill-foreground" fontSize={9}>
            {`${c.donors} donor${c.donors > 1 ? "s" : ""} · ${c.acceptors} acceptor${c.acceptors > 1 ? "s" : ""}`}
          </text>
          <text
            x={c.cx}
            y={150}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={10}
            fontWeight={600}
          >
            {`${c.perMolecule} H-bonds each`}
          </text>
          <text x={c.cx} y={166} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
            {c.verdict}
          </text>
          <text
            x={c.cx}
            y={192}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={12}
            fontWeight={600}
          >
            {c.bp}
          </text>
        </g>
      ))}
      <line x1={40} y1={206} x2={440} y2={206} stroke="var(--fig-grid)" strokeWidth={1} />
      <SeriesLabel x={62} y={228} color="var(--fig-pos)">
        donor: H on N, O or F
      </SeriesLabel>
      <SeriesLabel x={250} y={228} color="var(--fig-neg)">
        acceptor: an available lone pair
      </SeriesLabel>
    </Figure>
  );
}

/**
 * The classic anomaly plot, as four small multiples rather than four
 * overlapping series — the palette stops at three, and separating the groups
 * makes the shared shape easier to read anyway. The dashed line in each panel
 * is a least-squares fit through periods 3 to 5 only, extended back to period
 * 2, so the size of each jump is measured against the trend rather than
 * asserted.
 */
const HYDRIDES = [
  { group: "group 14 — the control", control: true, bp: [-162, -112, -88, -52], first: "CH₄" },
  { group: "group 15", control: false, bp: [-33, -88, -62, -17], first: "NH₃" },
  { group: "group 16", control: false, bp: [100, -60, -41, -2], first: "H₂O" },
  { group: "group 17", control: false, bp: [20, -85, -67, -35], first: "HF" },
].map((g) => {
  // Fit y = m·x + c to periods 3, 4, 5 (indices 1..3) and extrapolate to period 2.
  const xs = [3, 4, 5];
  const ys = g.bp.slice(1);
  const xm = 4;
  const ym = ys.reduce((a, b) => a + b, 0) / 3;
  const m =
    xs.reduce((a, x, i) => a + (x - xm) * (ys[i]! - ym), 0) /
    xs.reduce((a, x) => a + (x - xm) ** 2, 0);
  const at = (p: number) => ym + m * (p - xm);
  return { ...g, at, jump: g.bp[0]! - at(2) };
});

function HydrideBoilingPoints() {
  const YMIN = -220,
    YMAX = 130;
  const panels = [
    { x: 52, y: 34 },
    { x: 286, y: 34 },
    { x: 52, y: 184 },
    { x: 286, y: 184 },
  ];
  const PW = 160,
    PH = 100;
  const px = (x0: number, period: number) => x0 + ((period - 2) / 3) * PW;
  const py = (y0: number, bp: number) => y0 + PH - ((bp - YMIN) / (YMAX - YMIN)) * PH;

  return (
    <Figure
      viewBox="0 0 460 326"
      alt="Four small panels of hydride boiling points against period. Group 14 rises smoothly from methane at minus 162 through to stannane at minus 52 and needs no explanation. In groups 15, 16 and 17 the heavier hydrides follow the same rising trend, but the first-row member sits far above the line extrapolated through them: ammonia by about 90 degrees, hydrogen fluoride by about 130, and water by about 190, which is the order water, then hydrogen fluoride, then ammonia."
      caption="Only the first member of each group breaks the trend, and only where hydrogen bonding is possible. Water sits furthest above its own extrapolated line, then HF, then NH₃."
    >
      {HYDRIDES.map((g, gi) => {
        const { x, y } = panels[gi]!;
        const color = g.control ? "var(--fig-2)" : "var(--fig-1)";
        const pts = g.bp.map((bp, i) => ({ x: px(x, i + 2), y: py(y, bp) }));
        const bottomRow = gi >= 2;
        return (
          <g key={g.group}>
            <text x={x} y={y - 10} className="fill-foreground" fontSize={10} fontWeight={600}>
              {g.group}
            </text>
            <line x1={x} y1={y} x2={x} y2={y + PH} stroke="var(--fig-axis)" strokeWidth={1.2} />
            <line
              x1={x}
              y1={y + PH}
              x2={x + PW}
              y2={y + PH}
              stroke="var(--fig-axis)"
              strokeWidth={1.2}
            />
            <line
              x1={x}
              y1={py(y, 0)}
              x2={x + PW}
              y2={py(y, 0)}
              stroke="var(--fig-grid)"
              strokeWidth={1}
            />
            {gi % 2 === 0 &&
              [-200, -100, 0, 100].map((v) => (
                <text
                  key={v}
                  x={x - 5}
                  y={py(y, v) + 3}
                  textAnchor="end"
                  className="fill-muted-foreground"
                  fontSize={9}
                >
                  {v}
                </text>
              ))}
            {bottomRow &&
              [2, 3, 4, 5].map((p) => (
                <text
                  key={p}
                  x={px(x, p)}
                  y={y + PH + 13}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={9}
                >
                  {p}
                </text>
              ))}

            {/* Trend through periods 3–5, extended back to period 2. */}
            <line
              x1={px(x, 2)}
              y1={py(y, g.at(2))}
              x2={px(x, 5)}
              y2={py(y, g.at(5))}
              stroke={color}
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <path d={pathFrom(pts.slice(1))} fill="none" stroke={color} strokeWidth={1.6} />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 4 : 3} fill={color} />
            ))}
            {!g.control && (
              <line
                x1={px(x, 2)}
                y1={py(y, g.bp[0]!)}
                x2={px(x, 2)}
                y2={py(y, g.at(2))}
                stroke={color}
                strokeWidth={1.2}
              />
            )}
            <text
              x={px(x, 2) + 7}
              y={py(y, g.bp[0]!) + 3}
              className="fill-foreground"
              fontSize={9}
              fontWeight={600}
            >
              {`${g.first} ${g.bp[0]! > 0 ? "+" : ""}${g.bp[0]}`}
            </text>
          </g>
        );
      })}
      <Note x={169} y={314}>
        period
      </Note>
      <Note x={52} y={314} anchor="start">
        boiling point (°C)
      </Note>
      <Note x={403} y={314}>
        period
      </Note>
    </Figure>
  );
}

/**
 * The three intermolecular forces on one energy scale, with a covalent bond
 * drawn on the same axis above so the order-of-magnitude gap is visible rather
 * than stated. The lower panel is the same axis zoomed by a factor of eleven.
 */
function ImfStrengthLadder() {
  const aX = (kJ: number) => 60 + (kJ / 500) * 380;
  const bX = (kJ: number) => 120 + (kJ / 45) * 320;
  const bands = [
    { label: "London dispersion", lo: 0.05, hi: 40, y: 140, color: "var(--fig-1)" },
    { label: "dipole–dipole", lo: 5, hi: 25, y: 160, color: "var(--fig-2)" },
    { label: "hydrogen bonding", lo: 5, hi: 30, y: 180, color: "var(--fig-3)" },
  ];

  return (
    <Figure
      viewBox="0 0 460 262"
      alt="An energy scale in kilojoules per mole. On the full scale every intermolecular force fits inside the first 40 units, vaporizing a mole of water costs 41, and breaking a single oxygen–hydrogen covalent bond costs 464, more than ten times the whole intermolecular range. Zoomed in, London dispersion spans 0.05 to 40, dipole–dipole 5 to 25 and hydrogen bonding 5 to 30, with the hydrogen bond in liquid water at about 20 and in the hydrogen fluoride dimer at 29."
      caption="Every intermolecular force fits in the first 8% of the top axis; one O–H bond fills the rest. Boiling rearranges the first kind and leaves the second untouched."
    >
      <text x={40} y={26} className="fill-foreground" fontSize={10} fontWeight={600}>
        Full scale
      </text>
      <rect
        x={aX(0)}
        y={40}
        width={aX(40) - aX(0)}
        height={11}
        fill="var(--fig-1)"
        opacity={0.45}
      />
      <line x1={aX(41)} y1={36} x2={aX(41)} y2={56} stroke="var(--fig-2)" strokeWidth={1.6} />
      <line x1={aX(464)} y1={36} x2={aX(464)} y2={56} stroke="currentColor" strokeWidth={1.8} />
      <Note x={aX(40) + 6} y={34} anchor="start">
        all IMFs ≤ 40
      </Note>
      <text x={aX(41) + 6} y={68} className="fill-muted-foreground" fontSize={9}>
        vaporize water, 41
      </text>
      <text
        x={aX(464)}
        y={30}
        textAnchor="end"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        one O–H bond, 464
      </text>
      <line x1={aX(0)} y1={78} x2={aX(500)} y2={78} stroke="var(--fig-axis)" strokeWidth={1.2} />
      {[0, 100, 200, 300, 400, 500].map((v) => (
        <g key={v}>
          <line x1={aX(v)} y1={78} x2={aX(v)} y2={82} stroke="var(--fig-axis)" strokeWidth={1} />
          <text x={aX(v)} y={92} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
            {v}
          </text>
        </g>
      ))}

      {/* The zoom, drawn as a zoom so the two scales cannot be confused. */}
      <line x1={aX(0)} y1={100} x2={bX(0)} y2={130} stroke="var(--fig-grid)" strokeWidth={1} />
      <line x1={aX(45)} y1={100} x2={bX(45)} y2={130} stroke="var(--fig-grid)" strokeWidth={1} />
      <text x={40} y={114} className="fill-foreground" fontSize={10} fontWeight={600}>
        First 45 kJ/mol, enlarged
      </text>
      {bands.map((b) => (
        <g key={b.label}>
          <rect
            x={bX(b.lo)}
            y={b.y}
            width={bX(b.hi) - bX(b.lo)}
            height={12}
            fill={b.color}
            opacity={0.5}
          />
          <rect
            x={bX(b.lo)}
            y={b.y}
            width={bX(b.hi) - bX(b.lo)}
            height={12}
            fill="none"
            stroke={b.color}
            strokeWidth={1.2}
          />
          <text
            x={114}
            y={b.y + 9}
            textAnchor="end"
            className="fill-foreground"
            fontSize={9}
            fontWeight={600}
          >
            {b.label}
          </text>
        </g>
      ))}
      <circle cx={bX(20)} cy={186} r={3.4} fill="currentColor" />
      <circle cx={bX(29)} cy={186} r={3.4} fill="currentColor" />
      <text x={bX(30) + 8} y={189} className="fill-muted-foreground" fontSize={9}>
        water 20 · HF dimer 29
      </text>
      <line x1={bX(0)} y1={206} x2={bX(45)} y2={206} stroke="var(--fig-axis)" strokeWidth={1.2} />
      {[0, 10, 20, 30, 40].map((v) => (
        <g key={v}>
          <line x1={bX(v)} y1={206} x2={bX(v)} y2={210} stroke="var(--fig-axis)" strokeWidth={1} />
          <text
            x={bX(v)}
            y={220}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {v}
          </text>
        </g>
      ))}
      <Note x={250} y={240}>
        kJ/mol. Between molecules of similar size the order holds;
      </Note>
      <Note x={250} y={254}>
        for large molecules dispersion is usually the largest term
      </Note>
    </Figure>
  );
}

/* ====================================================================== */
/* 11 — Lewis Structures & Formal Charge                                   */
/* ====================================================================== */

/**
 * The three ways the octet count comes out wrong, drawn as counts rather than
 * as violations. Eight is just what four valence orbitals hold; boron stops
 * short of it, nitric oxide has an odd number of electrons to start with, and
 * sulfur is not limited to four orbitals at all.
 */
function OctetExceptions() {
  const sf6 = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3;
    return { x: 374 + 34 * Math.cos(a), y: 86 + 34 * Math.sin(a) };
  });

  return (
    <Figure
      viewBox="0 0 460 212"
      alt="Three central atoms with electron counts that are not eight. Boron trifluoride leaves only six electrons around boron, which is why it is a strong Lewis acid; nitric oxide has eleven valence electrons in total so one must remain unpaired no matter how the structure is drawn; and sulfur hexafluoride puts twelve around sulfur, which only period 3 and heavier central atoms can do."
      caption="Eight is the capacity of one s and three p orbitals, nothing more. Boron stops at six, an odd electron count cannot pair, and period-3 centres are not capped at four orbitals."
    >
      {/* BF3 — short of an octet. */}
      <text
        x={86}
        y={26}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={11}
        fontWeight={600}
      >
        BF₃
      </text>
      <circle cx={86} cy={86} r={16} fill="var(--fig-1)" opacity={0.14} />
      <text x={86} y={91} textAnchor="middle" className="fill-foreground" fontSize={14}>
        B
      </text>
      {[
        { x: 86, y: 44 },
        { x: 50, y: 116 },
        { x: 122, y: 116 },
      ].map((f) => (
        <g key={`${f.x}`}>
          <line x1={86} y1={86} x2={f.x} y2={f.y} stroke="currentColor" strokeWidth={1.4} />
          <circle cx={f.x} cy={f.y} r={10} fill="var(--card)" />
          <text x={f.x} y={f.y + 4} textAnchor="middle" className="fill-foreground" fontSize={12}>
            F
          </text>
        </g>
      ))}
      <text
        x={86}
        y={154}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        6 electrons around B
      </text>
      <text x={86} y={170} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        electron-deficient:
      </text>
      <text x={86} y={182} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        a strong Lewis acid
      </text>

      {/* NO — an odd electron count. */}
      <text
        x={230}
        y={26}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={11}
        fontWeight={600}
      >
        NO
      </text>
      <text x={212} y={91} textAnchor="middle" className="fill-foreground" fontSize={14}>
        N
      </text>
      <text x={252} y={91} textAnchor="middle" className="fill-foreground" fontSize={14}>
        O
      </text>
      <line x1={222} y1={82} x2={242} y2={82} stroke="currentColor" strokeWidth={1.4} />
      <line x1={222} y1={90} x2={242} y2={90} stroke="currentColor" strokeWidth={1.4} />
      <Pair x={212} y={68} angle={0} />
      <Pair x={252} y={68} angle={0} />
      <Pair x={268} y={86} angle={90} />
      <circle cx={196} cy={86} r={2.4} fill="var(--fig-1)" />
      <text
        x={190}
        y={68}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        1 e⁻
      </text>
      <text
        x={230}
        y={154}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        11 valence electrons
      </text>
      <text x={230} y={170} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        odd, so one cannot pair
      </text>
      <text x={230} y={182} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        — a persistent radical
      </text>

      {/* SF6 — more than eight. */}
      <text
        x={374}
        y={26}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={11}
        fontWeight={600}
      >
        SF₆
      </text>
      {sf6.map((f) => (
        <g key={`${f.x.toFixed(1)}`}>
          <line x1={374} y1={86} x2={f.x} y2={f.y} stroke="currentColor" strokeWidth={1.4} />
          <circle cx={f.x} cy={f.y} r={9} fill="var(--card)" />
          <text x={f.x} y={f.y + 4} textAnchor="middle" className="fill-foreground" fontSize={11}>
            F
          </text>
        </g>
      ))}
      <circle cx={374} cy={86} r={15} fill="var(--fig-1)" opacity={0.14} />
      <text x={374} y={91} textAnchor="middle" className="fill-foreground" fontSize={14}>
        S
      </text>
      <text
        x={374}
        y={154}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        12 electrons around S
      </text>
      <text x={374} y={170} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        period 3 and beyond only;
      </text>
      <text x={374} y={182} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        period 2 is capped at 8
      </text>
    </Figure>
  );
}

/**
 * Formal charge and oxidation state are the same bookkeeping done with two
 * different rules for splitting the bonding pairs, so the figure draws the
 * split itself rather than just quoting the answers. Carbon monoxide is the
 * case where the two conventions disagree in sign, and the measured dipole
 * says formal charge has the direction right.
 */
function FormalChargeVsOxidation() {
  const cols = [
    {
      cx: 122,
      title: "Formal charge",
      rule: "split every bonding pair evenly",
      partitionAt: 0,
      c: "−1",
      o: "+1",
      sum: "4 − 2 − 3 = −1   ·   6 − 2 − 3 = +1",
    },
    {
      cx: 336,
      title: "Oxidation state",
      rule: "every pair to the more electronegative atom",
      partitionAt: -28,
      c: "+2",
      o: "−2",
      sum: "all six bonding electrons counted as oxygen’s",
    },
  ];

  return (
    <Figure
      viewBox="0 0 460 250"
      alt="Carbon monoxide with its six bonding electrons partitioned two ways. Splitting each pair evenly, the formal-charge convention, gives carbon minus one and oxygen plus one. Handing every pair to the more electronegative atom, the oxidation-state convention, gives carbon plus two and oxygen minus two. The measured dipole moment of 0.11 debye has its negative end on carbon, the direction formal charge predicts and oxidation state does not."
      caption="Two conventions, opposite signs, one molecule. CO measures 0.11 D with δ− on carbon — the direction the even split predicts."
    >
      <text x={206} y={44} textAnchor="middle" className="fill-foreground" fontSize={16}>
        C
      </text>
      <text x={254} y={44} textAnchor="middle" className="fill-foreground" fontSize={16}>
        O
      </text>
      {[36, 44, 52].map((y) => (
        <line
          key={y}
          x1={218}
          y1={y - 5}
          x2={242}
          y2={y - 5}
          stroke="currentColor"
          strokeWidth={1.3}
        />
      ))}
      <Pair x={190} y={39} angle={90} />
      <Pair x={270} y={39} angle={90} />
      <line x1={30} y1={64} x2={430} y2={64} stroke="var(--fig-grid)" strokeWidth={1} />

      {cols.map((c) => (
        <g key={c.title}>
          <text
            x={c.cx}
            y={88}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={11}
            fontWeight={600}
          >
            {c.title}
          </text>
          <text x={c.cx} y={103} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
            {c.rule}
          </text>

          {/* The six bonding electrons, and the line they are split along. */}
          <text x={c.cx - 46} y={142} textAnchor="middle" className="fill-foreground" fontSize={13}>
            C
          </text>
          <text x={c.cx + 46} y={142} textAnchor="middle" className="fill-foreground" fontSize={13}>
            O
          </text>
          <rect
            x={c.cx - 28}
            y={122}
            width={56}
            height={28}
            rx={3}
            fill="none"
            stroke="var(--fig-grid)"
            strokeWidth={1}
          />
          {[0, 1].map((row) =>
            [-18, 0, 18].map((dx) => (
              <circle
                key={`${row}${dx}`}
                cx={c.cx + dx}
                cy={131 + row * 11}
                r={2.5}
                fill={c.cx + dx < c.cx + c.partitionAt ? "var(--fig-neg)" : "var(--fig-pos)"}
              />
            )),
          )}
          <line
            x1={c.cx + c.partitionAt}
            y1={118}
            x2={c.cx + c.partitionAt}
            y2={154}
            stroke="currentColor"
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />
          <Note x={c.cx} y={166}>
            6 bonding electrons
          </Note>

          <text
            x={c.cx - 46}
            y={192}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={12}
            fontWeight={600}
          >
            {`C ${c.c}`}
          </text>
          <text
            x={c.cx + 46}
            y={192}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={12}
            fontWeight={600}
          >
            {`O ${c.o}`}
          </text>
          <text x={c.cx} y={210} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
            {c.sum}
          </text>
        </g>
      ))}
      <line x1={229} y1={80} x2={229} y2={216} stroke="var(--fig-grid)" strokeWidth={1} />
      <text
        x={230}
        y={238}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        Measured: μ = 0.11 D with the negative end on carbon.
      </text>
    </Figure>
  );
}

/**
 * The replacement for the d-orbital story. Three collinear p orbitals give one
 * bonding, one non-bonding and one antibonding combination; four electrons fill
 * the lower two, which is half a bond per linkage spread over two linkages. The
 * non-bonding pair has no amplitude on the central atom at all, which is why
 * the outer atoms have to be electronegative enough to carry the charge.
 */
function ThreeCentreFourElectron() {
  const atoms = [90, 152, 214];
  const rows = [
    { y: 76, name: "antibonding", phases: [1, -1, 1], centre: true, fill: [] as string[] },
    { y: 134, name: "non-bonding", phases: [1, 0, -1], centre: false, fill: ["updown"] },
    { y: 190, name: "bonding", phases: [1, 1, 1], centre: true, fill: ["updown"] },
  ];
  const lobe = (x: number, y: number, sign: number, side: -1 | 1) => (
    <ellipse
      key={`${x}${side}`}
      cx={x + side * 15}
      cy={y}
      rx={14}
      ry={8}
      fill={sign * side > 0 ? "var(--fig-pos)" : "var(--fig-neg)"}
      opacity={0.55}
    />
  );

  return (
    <Figure
      viewBox="0 0 460 248"
      alt="Three collinear p orbitals combining into one bonding, one non-bonding and one antibonding molecular orbital. Four electrons fill the bonding and non-bonding levels, giving about half a bond per linkage across two linkages, and the non-bonding orbital has zero amplitude on the central atom so its electron pair sits entirely on the two outer atoms."
      caption="The three-centre four-electron bond: long, weak linkages of order about ½, and a non-bonding pair parked on the outer atoms — which is why hypervalency needs F and O."
    >
      <text
        x={152}
        y={24}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        Three collinear p orbitals, e.g. F–Xe–F
      </text>
      {["F", "Xe", "F"].map((a, i) => (
        <text
          key={a + i}
          x={atoms[i]}
          y={46}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={10}
        >
          {a}
        </text>
      ))}

      {rows.map((r) => (
        <g key={r.name}>
          <line x1={62} y1={r.y} x2={242} y2={r.y} stroke="var(--fig-grid)" strokeWidth={1} />
          {atoms.map((ax, i) =>
            r.phases[i] === 0 ? (
              <text
                key={ax}
                x={ax}
                y={r.y + 4}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={10}
              >
                0
              </text>
            ) : (
              <g key={ax}>
                {lobe(ax, r.y, r.phases[i]!, -1)}
                {lobe(ax, r.y, r.phases[i]!, 1)}
              </g>
            ),
          )}
          <text
            x={58}
            y={r.y + 3}
            textAnchor="end"
            className="fill-foreground"
            fontSize={9}
            fontWeight={600}
          >
            {r.name}
          </text>

          {/* The same three orbitals as an energy ladder. */}
          <line
            x1={252}
            y1={r.y}
            x2={296}
            y2={r.y}
            stroke="var(--fig-grid)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <Level x1={300} x2={356} y={r.y} color="var(--fig-axis)" width={2} />
          {r.fill[0] && <Spins x={328} y={r.y} kind="updown" />}
          <text x={364} y={r.y + 3} className="fill-muted-foreground" fontSize={9}>
            {r.fill[0] ? "filled" : "empty"}
          </text>
        </g>
      ))}

      <text
        x={230}
        y={220}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        4 electrons, 2 filled orbitals, 2 linkages → bond order ≈ ½ each
      </text>
      <Note x={230} y={236}>
        the non-bonding pair sits entirely on the outer atoms
      </Note>
    </Figure>
  );
}

/**
 * Formal charge worked all the way through on one skeleton. Both drawings of
 * CO₂ obey the octet rule and both are legal; the arithmetic V − L − B/2 is
 * what separates them, and it separates them on charge separation alone.
 */
function FormalChargeCO2() {
  const structures = [
    {
      cx: 120,
      title: "O=C=O",
      bonds: [2, 2] as const,
      lonePairs: [2, 2] as const,
      charges: ["0", "0", "0"],
      lines: ["each O:  6 − 4 − ½(4) = 0", "C:  4 − 0 − ½(8) = 0"],
      verdict: "no charge separation — preferred",
      good: true,
    },
    {
      cx: 336,
      title: "O≡C–O",
      bonds: [3, 1] as const,
      lonePairs: [1, 3] as const,
      charges: ["+1", "0", "−1"],
      lines: ["≡O:  6 − 2 − ½(6) = +1", "–O:  6 − 6 − ½(2) = −1"],
      verdict: "legal, but it separates charge",
      good: false,
    },
  ];

  return (
    <Figure
      viewBox="0 0 460 254"
      alt="Two Lewis structures for carbon dioxide with the formal charge arithmetic worked out atom by atom. The symmetric double-bonded drawing gives every atom a formal charge of zero. The alternative with one triple and one single bond is equally legal by the octet rule but puts plus one on the triple-bonded oxygen and minus one on the single-bonded one, so the symmetric drawing is preferred."
      caption="Formal charge = V − L − B/2, done for both legal drawings of CO₂. Same skeleton, same octets; the symmetric one separates no charge, so it wins."
    >
      {structures.map((s) => {
        const left = s.cx - 48,
          right = s.cx + 48,
          y = 74;
        return (
          <g key={s.title}>
            <text
              x={s.cx}
              y={30}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={11}
              fontWeight={600}
            >
              {s.title}
            </text>
            {[left, s.cx, right].map((ax, i) => (
              <text
                key={ax}
                x={ax}
                y={y + 5}
                textAnchor="middle"
                className="fill-foreground"
                fontSize={15}
              >
                {i === 1 ? "C" : "O"}
              </text>
            ))}
            {/* Bond lines: one per bond order, stacked. */}
            {([0, 1] as const).map((side) => {
              const n = s.bonds[side];
              const x1 = side === 0 ? left + 12 : s.cx + 12;
              const x2 = side === 0 ? s.cx - 12 : right - 12;
              return Array.from({ length: n }, (_, k) => (
                <line
                  key={`${side}${k}`}
                  x1={x1}
                  y1={y - (n - 1) * 3 + k * 6}
                  x2={x2}
                  y2={y - (n - 1) * 3 + k * 6}
                  stroke="currentColor"
                  strokeWidth={1.3}
                />
              ));
            })}
            {/* Lone pairs, distributed round each oxygen. */}
            {([0, 1] as const).map((side) => {
              const ax = side === 0 ? left : right;
              const slots = [
                { dx: 0, dy: -17, a: 0 },
                { dx: 0, dy: 17, a: 0 },
                { dx: side === 0 ? -17 : 17, dy: 0, a: 90 },
              ];
              return slots
                .slice(0, s.lonePairs[side])
                .map((sl) => (
                  <Pair key={`${side}${sl.dx}${sl.dy}`} x={ax + sl.dx} y={y + sl.dy} angle={sl.a} />
                ));
            })}
            {[left, s.cx, right].map((ax, i) =>
              s.charges[i] === "0" ? null : (
                <text
                  key={`c${ax}`}
                  x={ax + 16}
                  y={y - 16}
                  textAnchor="middle"
                  fill={s.charges[i] === "+1" ? "var(--fig-pos)" : "var(--fig-neg)"}
                  fontSize={11}
                  fontWeight={700}
                >
                  {s.charges[i]}
                </text>
              ),
            )}

            <text x={s.cx} y={150} textAnchor="middle" className="fill-foreground" fontSize={10}>
              {s.lines[0]}
            </text>
            <text x={s.cx} y={166} textAnchor="middle" className="fill-foreground" fontSize={10}>
              {s.lines[1]}
            </text>
            <text
              x={s.cx}
              y={196}
              textAnchor="middle"
              className={s.good ? "fill-foreground" : "fill-muted-foreground"}
              fontSize={10}
              fontWeight={s.good ? 700 : 400}
            >
              {s.verdict}
            </text>
          </g>
        );
      })}
      <line x1={228} y1={24} x2={228} y2={204} stroke="var(--fig-grid)" strokeWidth={1} />
      <Note x={230} y={226}>
        V = free-atom valence electrons · L = lone-pair electrons · B = bonding electrons
      </Note>
      <Note x={230} y={242}>
        formal charges must sum to the overall charge — here, zero both times
      </Note>
    </Figure>
  );
}

/* ====================================================================== */
/* 12 — Resonance & Delocalization                                         */
/* ====================================================================== */

/**
 * The structural evidence, on one scale. In each case the measured bond sits
 * between the localized single and double lengths and every equivalent bond in
 * the species has the same length — which is what rules out a molecule that
 * alternates between contributors.
 */
function ResonanceBondLengths() {
  const rows = [
    { label: "benzene, C–C", dbl: 134, sgl: 154, obs: 139, y: 58 },
    { label: "carbonate, C–O", dbl: 123, sgl: 143, obs: 129, y: 102 },
    { label: "ozone, O–O", dbl: 121, sgl: 148, obs: 128, y: 146 },
  ];
  const X0 = 115,
    X1 = 158;
  const px = (pm: number) => 58 + ((pm - X0) / (X1 - X0)) * 358;

  return (
    <Figure
      viewBox="0 0 450 218"
      alt="Three rows on a shared bond-length scale. In benzene the carbon–carbon bonds measure 139 picometres, between the 134 of a double bond and the 154 of a single one; in carbonate the carbon–oxygen bonds measure 129 against 123 and 143; in ozone the oxygen–oxygen bonds measure 128 against 121 and 148. In every case all the equivalent bonds are identical, which no single localized drawing predicts."
      caption="Every one of these bonds is measured between the localized limits, and all the equivalent bonds within a species are identical. That is the hybrid, not an average over time."
    >
      {rows.map((r, i) => (
        <g key={r.label}>
          <text x={58} y={r.y - 14} className="fill-foreground" fontSize={10} fontWeight={600}>
            {r.label}
          </text>
          <line
            x1={px(r.dbl)}
            y1={r.y}
            x2={px(r.sgl)}
            y2={r.y}
            stroke="var(--fig-grid)"
            strokeWidth={1.5}
          />
          {[r.dbl, r.sgl].map((v) => (
            <line
              key={v}
              x1={px(v)}
              y1={r.y - 6}
              x2={px(v)}
              y2={r.y + 6}
              stroke="var(--fig-2)"
              strokeWidth={1.4}
            />
          ))}
          <circle cx={px(r.obs)} cy={r.y} r={5} fill="var(--fig-1)" />
          <text
            x={px(r.obs)}
            y={r.y - 11}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={10}
            fontWeight={700}
          >
            {r.obs}
          </text>
          {i === 0 && (
            <g>
              <Note x={px(r.dbl)} y={r.y + 18}>
                double
              </Note>
              <Note x={px(r.sgl)} y={r.y + 18}>
                single
              </Note>
            </g>
          )}
        </g>
      ))}
      <line x1={px(X0)} y1={178} x2={px(X1)} y2={178} stroke="var(--fig-axis)" strokeWidth={1.2} />
      {[120, 130, 140, 150].map((v) => (
        <g key={v}>
          <line x1={px(v)} y1={178} x2={px(v)} y2={182} stroke="var(--fig-axis)" strokeWidth={1} />
          <text
            x={px(v)}
            y={192}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {v}
          </text>
        </g>
      ))}
      <text x={237} y={208} textAnchor="middle" className="fill-muted-foreground" fontSize={10}>
        bond length (pm)
      </text>
    </Figure>
  );
}

/**
 * The calorimetric measurement, drawn against the hypothetical it is measured
 * against. Cyclohexene releases 120 kJ/mol on hydrogenation, so three isolated
 * double bonds would release 360; benzene releases 208. The shortfall is energy
 * benzene never had — and, because the reference is a molecule that does not
 * exist, the figure says so rather than presenting one number as definitive.
 */
function DelocalizationEnergy() {
  const yE = (E: number) => 182 - E * 0.38;
  const gap = 360 - 208;

  return (
    <Figure
      viewBox="0 0 450 244"
      alt="An energy diagram with cyclohexane at zero. Three isolated double bonds, a hypothetical cyclohexatriene, would sit 360 kilojoules per mole above it, because hydrogenating one cyclohexene releases 120. Benzene sits only 208 above, so hydrogenating it releases 152 kilojoules per mole less than expected — energy it never had, because its electrons were delocalized from the start."
      caption="Benzene releases 208 kJ/mol on hydrogenation where three isolated C=C would release 360. The 152 kJ/mol shortfall is the delocalization energy — though its size depends on the reference chosen."
    >
      <ArrowDefs id="de-arrow" color="var(--fig-axis)" />
      <line x1={50} y1={26} x2={50} y2={186} stroke="var(--fig-axis)" strokeWidth={1.5} />
      {[0, 100, 200, 300, 400].map((v) => (
        <g key={v}>
          <line x1={46} y1={yE(v)} x2={50} y2={yE(v)} stroke="var(--fig-axis)" strokeWidth={1} />
          <text
            x={43}
            y={yE(v) + 3}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {v}
          </text>
        </g>
      ))}
      <text
        x={-105}
        y={14}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        kJ/mol above cyclohexane
      </text>

      <Level x1={58} x2={200} y={yE(360)} color="var(--fig-2)" width={2} dashed />
      <Level x1={244} x2={392} y={yE(208)} color="var(--fig-1)" width={2} />
      <Level x1={58} x2={392} y={yE(0)} color="currentColor" width={2} />

      <text x={58} y={yE(360) - 8} className="fill-foreground" fontSize={10} fontWeight={600}>
        3 isolated C=C (hypothetical)
      </text>
      <text x={244} y={yE(208) - 8} className="fill-foreground" fontSize={10} fontWeight={600}>
        benzene (real)
      </text>
      <text x={58} y={yE(0) + 15} className="fill-foreground" fontSize={10} fontWeight={600}>
        cyclohexane
      </text>

      <line
        x1={128}
        y1={yE(360)}
        x2={128}
        y2={yE(0)}
        stroke="var(--fig-axis)"
        strokeWidth={1.2}
        markerEnd="url(#de-arrow)"
      />
      <text x={134} y={yE(230)} className="fill-foreground" fontSize={9} fontWeight={600}>
        3 × (−120)
      </text>
      <text x={134} y={yE(200)} className="fill-muted-foreground" fontSize={9}>
        = −360 expected
      </text>
      <line
        x1={318}
        y1={yE(208)}
        x2={318}
        y2={yE(0)}
        stroke="var(--fig-axis)"
        strokeWidth={1.2}
        markerEnd="url(#de-arrow)"
      />
      <text x={324} y={yE(130)} className="fill-foreground" fontSize={9} fontWeight={600}>
        −208
      </text>
      <text x={324} y={yE(100)} className="fill-muted-foreground" fontSize={9}>
        measured
      </text>

      <path
        d={`M${210},${yE(360)} L${218},${yE(360)} L${218},${yE(208)} L${210},${yE(208)}`}
        fill="none"
        stroke="var(--fig-3)"
        strokeWidth={1.4}
      />
      <text x={224} y={yE(288)} className="fill-foreground" fontSize={10} fontWeight={700}>
        {`${gap} kJ/mol`}
      </text>
      <text x={224} y={yE(262)} className="fill-muted-foreground" fontSize={9}>
        benzene never had it
      </text>
      <Note x={225} y={218}>
        the reference is a molecule that does not exist; other reasonable
      </Note>
      <Note x={225} y={232}>
        choices put benzene’s resonance energy anywhere from 90 to 210 kJ/mol
      </Note>
    </Figure>
  );
}

/**
 * Hückel π levels for a ring, computed from the exact eigenvalues
 * E_k = α + 2β·cos(2πk/N). Benzene fills through a complete shell; cyclobutadiene
 * is left with a half-filled degenerate pair, which is the whole content of the
 * 4n + 2 rule.
 */
const RING_LEVELS = (n: number) => {
  const byCoef = new Map<string, number>();
  for (let k = 0; k < n; k++) {
    const raw = 2 * Math.cos((2 * Math.PI * k) / n);
    // Guard against negative zero, which would key a degenerate partner apart.
    const c = Math.abs(raw) < 1e-9 ? 0 : raw;
    const key = c.toFixed(3);
    byCoef.set(key, (byCoef.get(key) ?? 0) + 1);
  }
  return [...byCoef.entries()].map(([c, deg]) => ({ c: Number(c), deg })).sort((a, b) => b.c - a.c);
};

function HuckelLevels() {
  const rings = [
    {
      cx: 136,
      n: 6,
      electrons: 6,
      name: "benzene",
      rule: "6 π electrons = 4n + 2",
      note: "closed shell: 6α + 8β",
    },
    {
      cx: 334,
      n: 4,
      electrons: 4,
      name: "cyclobutadiene",
      rule: "4 π electrons = 4n",
      note: "half-filled pair: two unpaired",
    },
  ];
  const yOf = (c: number) => 126 + c * 34;

  return (
    <Figure
      viewBox="0 0 460 262"
      alt="Hückel pi energy levels for a six-membered and a four-membered ring, computed from alpha plus two beta times the cosine of two pi k over N. Benzene has one lowest level, a degenerate pair above it and a degenerate pair and a top level above that, and its six electrons fill the first three orbitals completely for a closed shell. Cyclobutadiene has one lowest level, a degenerate pair at alpha and a top level, and its four electrons leave the degenerate pair half filled with two unpaired electrons, which is why it is destabilized and distorts."
      caption="The ring level pattern is always one level, then degenerate pairs. Filling it completely takes 2, 6, 10 …; any 4n count strands two electrons in a half-filled pair."
    >
      <Level x1={40} x2={430} y={yOf(0)} color="var(--fig-grid)" width={1} dashed />
      <Note x={40} y={yOf(0) - 5} anchor="start">
        α — an isolated p orbital
      </Note>

      {rings.map((r) => {
        const levels = RING_LEVELS(r.n);
        let left = r.electrons;
        return (
          <g key={r.name}>
            <text
              x={r.cx}
              y={26}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={11}
              fontWeight={600}
            >
              {r.name}
            </text>
            <Note x={r.cx} y={40}>
              {r.rule}
            </Note>
            {levels.map((l) => {
              const nodes = l.deg === 1 ? [r.cx] : [r.cx - 27, r.cx + 27];
              const fills = nodes.map(() => {
                // Fill lowest first; a degenerate pair takes one electron each
                // before either doubles up, which is where the 4n count strands.
                return 0;
              });
              if (l.deg === 1) {
                fills[0] = Math.min(2, left);
                left -= fills[0]!;
              } else {
                const single = Math.min(2, left);
                for (let i = 0; i < single; i++) fills[i] = 1;
                left -= single;
                const extra = Math.min(2, left);
                for (let i = 0; i < extra; i++) fills[i] = 2;
                left -= extra;
              }
              return (
                <g key={l.c}>
                  {nodes.map((nx, i) => (
                    <g key={nx}>
                      <Level
                        x1={nx - 22}
                        x2={nx + 22}
                        y={yOf(l.c)}
                        color="var(--fig-axis)"
                        width={2}
                      />
                      {fills[i] === 2 && <Spins x={nx} y={yOf(l.c)} kind="updown" />}
                      {fills[i] === 1 && <Spins x={nx} y={yOf(l.c)} kind="up" />}
                    </g>
                  ))}
                  <text
                    x={r.cx + 62}
                    y={yOf(l.c) + 3}
                    className="fill-muted-foreground"
                    fontSize={9}
                  >
                    {l.c === 0
                      ? "α"
                      : `α ${l.c > 0 ? "+" : "−"} ${Math.abs(l.c) === 1 ? "" : Math.abs(l.c)}β`}
                  </text>
                </g>
              );
            })}
            <text
              x={r.cx}
              y={236}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={9}
              fontWeight={600}
            >
              {r.note}
            </text>
          </g>
        );
      })}
      <Note x={230} y={254}>
        β is negative, so α + 2β is the lowest level on each ladder
      </Note>
    </Figure>
  );
}

/**
 * The point the prose is emphatic about. Two contributors and the hybrid, with
 * the hybrid marked as the thing that exists: the half-bonds are drawn as a
 * solid plus a dashed line and the terminal charges as ½−, because those are
 * the quantities the measurement returns.
 */
function OzoneHybrid() {
  const panels = [
    { cx: 86, dbl: "left" as const, label: "contributor" },
    { cx: 218, dbl: "right" as const, label: "contributor" },
    { cx: 372, dbl: "hybrid" as const, label: "the molecule" },
  ];

  return (
    <Figure
      viewBox="0 0 460 236"
      alt="Two contributing Lewis structures for ozone, one with the double bond on the left and one with it on the right, joined by a double-headed arrow, and beside them the resonance hybrid in which both bonds are drawn as one and a half bonds and each terminal oxygen carries half a negative charge. Both bonds in real ozone measure 128 picometres, between a 148 picometre single bond and a 121 picometre double bond. The molecule is the hybrid at all times and does not alternate."
      caption="Ozone is the right-hand structure, permanently. The two drawings on the left are components of one description, the way a vector has components — not states the molecule visits."
    >
      <ArrowDefs id="oz-arrow" color="var(--fig-axis)" />
      {panels.map((p) => {
        const oc = { x: p.cx, y: 78 };
        const lo = { x: p.cx - 38, y: 118 };
        const ro = { x: p.cx + 38, y: 118 };
        const bond = (to: { x: number; y: number }, kind: "single" | "double" | "half") => {
          const dx = to.x - oc.x,
            dy = to.y - oc.y;
          const len = Math.hypot(dx, dy);
          const ux = dx / len,
            uy = dy / len;
          const nx = -uy * 2.6,
            ny = ux * 2.6;
          const a = { x: oc.x + ux * 13, y: oc.y + uy * 13 };
          const b = { x: to.x - ux * 13, y: to.y - uy * 13 };
          if (kind === "single")
            return (
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeWidth={1.4} />
            );
          if (kind === "double")
            return (
              <g>
                <line
                  x1={a.x + nx}
                  y1={a.y + ny}
                  x2={b.x + nx}
                  y2={b.y + ny}
                  stroke="currentColor"
                  strokeWidth={1.4}
                />
                <line
                  x1={a.x - nx}
                  y1={a.y - ny}
                  x2={b.x - nx}
                  y2={b.y - ny}
                  stroke="currentColor"
                  strokeWidth={1.4}
                />
              </g>
            );
          return (
            <g>
              <line
                x1={a.x + nx}
                y1={a.y + ny}
                x2={b.x + nx}
                y2={b.y + ny}
                stroke="currentColor"
                strokeWidth={1.4}
              />
              <line
                x1={a.x - nx}
                y1={a.y - ny}
                x2={b.x - nx}
                y2={b.y - ny}
                stroke="currentColor"
                strokeWidth={1.4}
                strokeDasharray="3 3"
              />
            </g>
          );
        };
        const leftKind = p.dbl === "hybrid" ? "half" : p.dbl === "left" ? "double" : "single";
        const rightKind = p.dbl === "hybrid" ? "half" : p.dbl === "right" ? "double" : "single";
        const leftCharge = p.dbl === "hybrid" ? "½−" : p.dbl === "left" ? "" : "−";
        const rightCharge = p.dbl === "hybrid" ? "½−" : p.dbl === "right" ? "" : "−";
        return (
          <g key={p.cx}>
            <Note x={p.cx} y={34}>
              {p.label}
            </Note>
            {bond(lo, leftKind)}
            {bond(ro, rightKind)}
            {[oc, lo, ro].map((a) => (
              <text
                key={`${a.x}${a.y}`}
                x={a.x}
                y={a.y + 5}
                textAnchor="middle"
                className="fill-foreground"
                fontSize={15}
              >
                O
              </text>
            ))}
            <text
              x={oc.x + 13}
              y={oc.y - 10}
              textAnchor="middle"
              fill="var(--fig-pos)"
              fontSize={10}
              fontWeight={700}
            >
              +
            </text>
            {leftCharge && (
              <text
                x={lo.x - 16}
                y={lo.y + 4}
                textAnchor="middle"
                fill="var(--fig-neg)"
                fontSize={10}
                fontWeight={700}
              >
                {leftCharge}
              </text>
            )}
            {rightCharge && (
              <text
                x={ro.x + 16}
                y={ro.y + 4}
                textAnchor="middle"
                fill="var(--fig-neg)"
                fontSize={10}
                fontWeight={700}
              >
                {rightCharge}
              </text>
            )}
          </g>
        );
      })}

      <line
        x1={140}
        y1={98}
        x2={164}
        y2={98}
        stroke="var(--fig-axis)"
        strokeWidth={1.3}
        markerStart="url(#oz-arrow)"
        markerEnd="url(#oz-arrow)"
      />
      <Note x={152} y={88}>
        not a reaction
      </Note>
      <line x1={296} y1={40} x2={296} y2={182} stroke="var(--fig-grid)" strokeWidth={1} />
      <text
        x={372}
        y={152}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={700}
      >
        both bonds 128 pm
      </text>
      <text x={372} y={166} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        single 148, double 121
      </text>
      <text x={152} y={152} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        neither drawing exists on its own
      </text>
      <line x1={30} y1={196} x2={430} y2={196} stroke="var(--fig-grid)" strokeWidth={1} />
      <text
        x={230}
        y={216}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        Ozone is the right-hand structure at all times — nothing flips.
      </text>
      <Note x={230} y={230}>
        the contributors are components of one wavefunction, like the components of one vector
      </Note>
    </Figure>
  );
}

export const bondingFigures = {
  "bond-ionic-covalent-continuum": IonicCovalentContinuum,
  "bond-lattice-coulomb": LatticeCoulomb,
  "bond-born-haber-nacl": BornHaberNaCl,
  "bond-methane-bde": MethaneBondEnergies,
  "bond-enthalpy-bookkeeping": BondEnthalpyBookkeeping,
  "mo-phase-overlap": PhaseOverlap,
  "mo-sp-mixing": SpMixing,
  "mo-bond-order-series": BondOrderSeries,
  "mo-o2-paramagnetism": O2Paramagnetism,
  "polarity-dipole-vectors": DipoleVectors,
  "polarity-nh3-vs-nf3": AmmoniaVsNitrogenTrifluoride,
  "polarity-percent-ionic": PercentIonicCharacter,
  "polarity-shape-decides": ShapeDecidesPolarity,
  "imf-dispersion-polarizability": DispersionAndPolarizability,
  "imf-lennard-jones": LennardJones,
  "imf-hbond-network": HydrogenBondCounting,
  "imf-boiling-points": HydrideBoilingPoints,
  "imf-strength-ladder": ImfStrengthLadder,
  "lewis-octet-exceptions": OctetExceptions,
  "lewis-fc-vs-oxidation": FormalChargeVsOxidation,
  "lewis-3c4e-bond": ThreeCentreFourElectron,
  "lewis-formal-charge-co2": FormalChargeCO2,
  "resonance-bond-lengths": ResonanceBondLengths,
  "resonance-delocalization-energy": DelocalizationEnergy,
  "resonance-huckel-levels": HuckelLevels,
  "resonance-ozone-hybrid": OzoneHybrid,
} satisfies Record<string, FigureDef>;

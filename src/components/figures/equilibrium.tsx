import { ArrowDefs, Axes, Figure, Note, SeriesLabel, pathFrom, type FigureDef } from "./Figure";

/**
 * Diagrams for the equilibrium lessons. Keys are referenced from the lesson data by
 * the `figure` field on a theory block; see Figure.tsx for the contract.
 *
 * Everything numeric in this file is solved, not sketched. The titration curves
 * come out of an exact charge balance solved by bisection on pH; the buffer
 * capacity curve is the closed-form derivative the lesson quotes; the free
 * energy well is the ideal-mixing Gibbs function. Where the prose already
 * states a number, the computed value is checked against it in a comment.
 */

/* ---------------------------------------------------------------------- */
/* Shared solution chemistry. Pure functions of constants, evaluated at     */
/* module load, so every figure below is deterministic.                     */
/* ---------------------------------------------------------------------- */

const KW = 1.0e-14;

/**
 * Bisection on pH for any charge-balance residual that is monotonically
 * decreasing in pH. 90 halvings of the 18-unit bracket is far past double
 * precision, so the answer is the same on every render -- which matters,
 * because these figures server-render and a drifting value would be a
 * hydration mismatch.
 */
function solvePH(residual: (h: number) => number): number {
  let lo = -2,
    hi = 16;
  for (let i = 0; i < 90; i++) {
    const mid = (lo + hi) / 2;
    if (residual(Math.pow(10, -mid)) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * pH during the titration of a monoprotic acid (formal concentration `ca` in
 * `va` mL) with strong base `cb`, after `vb` mL added. No approximations: the
 * residual is the full charge balance
 *
 *   [Na+] + [H3O+] - [OH-] - [A-] = 0,   [A-] = C.Ka/(Ka + [H3O+])
 *
 * so the same expression covers the initial point, the buffer region, the
 * equivalence point and the excess-base tail without special cases. Passing
 * ka = Infinity makes the acid strong ([A-] = C at every pH).
 */
function titrationPH(ka: number, ca: number, va: number, cb: number, vb: number): number {
  const v = va + vb;
  const c = (ca * va) / v;
  const na = (cb * vb) / v;
  const aMinus = Number.isFinite(ka) ? (h: number) => (c * ka) / (ka + h) : () => c;
  return solvePH((h) => na + h - KW / h - aMinus(h));
}

/** Triprotic version of the same charge balance, used for phosphoric acid. */
function triproticPH(
  k: [number, number, number],
  ca: number,
  va: number,
  cb: number,
  vb: number,
): number {
  const [k1, k2, k3] = k;
  const v = va + vb;
  const c = (ca * va) / v;
  const na = (cb * vb) / v;
  return solvePH((h) => {
    const d = h * h * h + k1 * h * h + k1 * k2 * h + k1 * k2 * k3;
    // Average number of protons already removed from each phosphate.
    const nBar = (k1 * h * h + 2 * k1 * k2 * h + 3 * k1 * k2 * k3) / d;
    return na + h - KW / h - c * nBar;
  });
}

/* ---------------------------------------------------------------------- */
/* Thermodynamics                                                           */
/* ---------------------------------------------------------------------- */

/**
 * Entropy made literal. The lesson insists S = k ln W is a *count*, so this
 * figure counts: four labelled particles distributed over two boxes gives
 * 2^4 = 16 arrangements, and every one of them is drawn. The column heights
 * are the multiplicities 1, 4, 6, 4, 1 -- the stack IS the bar chart, so the
 * even split visibly dominates without anyone having to accept "disorder" as
 * an explanation.
 */
const MICROSTATES = Array.from({ length: 16 }, (_, i) =>
  [0, 1, 2, 3].map((bit) => ((i >> bit) & 1) === 1),
);
/** Columns run 4-left down to 0-left, so the plot reads left to right. */
const MACROSTATES = [4, 3, 2, 1, 0].map((nLeft) => ({
  nLeft,
  members: MICROSTATES.filter((m) => m.filter(Boolean).length === nLeft),
}));

function MicrostateCount() {
  const colPitch = 88,
    colX0 = 12;
  const cellW = 14,
    cellH = 11,
    cellGap = 2.5;
  const rowW = 4 * cellW + 3 * cellGap; // 63.5
  const baseY = 134,
    rowPitch = 13.5;

  return (
    <Figure
      viewBox="0 0 450 190"
      alt="All sixteen ways of putting four labelled particles into two boxes, grouped by how many land in the left box. The groups contain 1, 4, 6, 4 and 1 arrangements, so the even two-two split is the most numerous macrostate by a clear margin, and entropy is the logarithm of that count rather than a judgement about tidiness."
      caption="Four particles, two boxes, all 2⁴ = 16 arrangements drawn. W = 1, 4, 6, 4, 1; the even split wins on count alone, and S = k ln W is the logarithm of exactly this number."
    >
      <Note x={12} y={16} anchor="start">
        S = k ln W — W is this count, nothing more
      </Note>
      <Note x={12} y={32} anchor="start">
        each row below is one arrangement of particles 1, 2, 3 and 4
      </Note>
      {/* Legend: the fill state carries left-vs-right, so it is spelled out. */}
      <rect
        x={262}
        y={8}
        width={cellW}
        height={cellH}
        rx={2}
        fill="var(--fig-2)"
        stroke="var(--fig-2)"
        strokeWidth={1}
      />
      <text x={280} y={17} className="fill-muted-foreground" fontSize={9}>
        left box
      </text>
      <rect
        x={330}
        y={8}
        width={cellW}
        height={cellH}
        rx={2}
        fill="none"
        stroke="var(--fig-axis)"
        strokeWidth={1}
      />
      <text x={348} y={17} className="fill-muted-foreground" fontSize={9}>
        right box
      </text>

      {/* The winning macrostate gets a recessive backing panel, not a fourth colour. */}
      <rect
        x={colX0 + 2 * colPitch - 4}
        y={baseY - 6 * rowPitch - 6}
        width={rowW + 8}
        height={6 * rowPitch + 36}
        rx={4}
        fill="var(--fig-grid)"
        fillOpacity={0.45}
      />

      {MACROSTATES.map((macro, ci) => {
        const cx = colX0 + ci * colPitch;
        return (
          <g key={macro.nLeft}>
            {macro.members.map((state, ri) => (
              <g key={ri} transform={`translate(0 ${baseY - (ri + 1) * rowPitch})`}>
                {state.map((inLeft, pi) => (
                  <rect
                    key={pi}
                    x={cx + pi * (cellW + cellGap)}
                    y={0}
                    width={cellW}
                    height={cellH}
                    rx={2}
                    fill={inLeft ? "var(--fig-2)" : "none"}
                    stroke={inLeft ? "var(--fig-2)" : "var(--fig-axis)"}
                    strokeWidth={1}
                  />
                ))}
              </g>
            ))}
            <line
              x1={cx - 3}
              y1={baseY + 1}
              x2={cx + rowW + 3}
              y2={baseY + 1}
              stroke="var(--fig-axis)"
              strokeWidth={1}
            />
            <text
              x={cx + rowW / 2}
              y={baseY + 14}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {macro.nLeft} left · {4 - macro.nLeft} right
            </text>
            <text
              x={cx + rowW / 2}
              y={baseY + 27}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={10}
              fontWeight={600}
            >
              W = {macro.members.length}
            </text>
          </g>
        );
      })}

      <Note x={225} y={184}>
        6 of 16 sit in the middle column — with 10²³ particles that bias is a certainty
      </Note>
    </Figure>
  );
}

/**
 * The four sign combinations of ΔH and ΔS, and what each one means for
 * temperature. The two mixed-sign cells are the interesting ones, so the panel
 * underneath plots the actual crossover for the lesson worked example: ice
 * melting, ΔH = +6.01 kJ/mol and ΔS = +22.0 J/(mol.K), giving
 * 6010/22.0 = 273.2 K -- the melting point recovered from a table.
 */
const ICE_DH = 6.01; // kJ/mol
const ICE_DS = 0.022; // kJ/(mol.K)
const ICE_TCROSS = ICE_DH / ICE_DS; // 273.18 K

function SpontaneityQuadrant() {
  const gx = 62,
    gy = 44,
    gw = 368,
    gh = 172;
  const cw = gw / 2,
    ch = gh / 2;

  const cells = [
    {
      col: 0,
      row: 0,
      tag: "NEVER",
      tagColor: "var(--fig-2)",
      lines: ["ΔG > 0 at every T.", "Both terms oppose.", "The reverse runs instead."],
    },
    {
      col: 1,
      row: 0,
      tag: "HIGH T",
      tagColor: "var(--fig-1)",
      lines: ["Spontaneous above", "T = ΔH/ΔS.", "Ice melting sits here."],
    },
    {
      col: 0,
      row: 1,
      tag: "LOW T",
      tagColor: "var(--fig-1)",
      lines: ["Spontaneous below", "T = ΔH/ΔS.", "NH₃ synthesis sits here."],
    },
    {
      col: 1,
      row: 1,
      tag: "ALL T",
      tagColor: "var(--fig-3)",
      lines: ["ΔG < 0 at every T.", "Both terms favour.", "No crossover exists."],
    },
  ];

  // Lower panel: ΔG(T) = ΔH - T.ΔS for fusion, straight by construction.
  const px = 62,
    py = 254,
    pw = 302,
    ph = 62;
  const tLo = 200,
    tHi = 350,
    gLo = -2,
    gHi = 2;
  const xOfT = (t: number) => px + ((t - tLo) / (tHi - tLo)) * pw;
  const yOfG = (g: number) => py + ph - ((g - gLo) / (gHi - gLo)) * ph;

  return (
    <Figure
      viewBox="0 0 450 354"
      alt="A two by two grid of the sign combinations of enthalpy and entropy change. Opposite signs give an answer that never depends on temperature, spontaneous always or never; matching signs give a crossover temperature equal to delta H over delta S. The panel below plots that crossover for ice melting, where the free energy line crosses zero at 273 kelvin."
      caption="ΔG = ΔH − TΔS. Only the matching-sign quadrants have a crossover, at T = ΔH/ΔS. For fusion of water, 6010 J/mol ÷ 22.0 J mol⁻¹K⁻¹ = 273 K — the melting point from thermodynamic data alone."
    >
      <ArrowDefs id="sq-arrow" />

      {/* Column and row headers: the axes of the table are the two signs. */}
      <Note x={gx + cw / 2} y={gy - 12}>
        ΔS &lt; 0 (fewer arrangements)
      </Note>
      <Note x={gx + cw + cw / 2} y={gy - 12}>
        ΔS &gt; 0 (more arrangements)
      </Note>
      {(
        [
          { cy: gy + ch / 2, sign: "ΔH > 0", word: "endothermic" },
          { cy: gy + ch + ch / 2, sign: "ΔH < 0", word: "exothermic" },
        ] as const
      ).map((r) => (
        <g key={r.word}>
          <text
            x={-r.cy}
            y={gx - 26}
            transform="rotate(-90)"
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
            letterSpacing="0.08em"
          >
            {r.sign}
          </text>
          <text
            x={-r.cy}
            y={gx - 14}
            transform="rotate(-90)"
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {r.word}
          </text>
        </g>
      ))}

      {cells.map((c) => {
        const x = gx + c.col * cw,
          y = gy + c.row * ch;
        return (
          <g key={c.tag}>
            <rect
              x={x}
              y={y}
              width={cw}
              height={ch}
              fill="none"
              stroke="var(--fig-axis)"
              strokeWidth={1}
            />
            <circle cx={x + 12} cy={y + 15} r={3.5} fill={c.tagColor} />
            <text
              x={x + 20}
              y={y + 18}
              className="fill-foreground"
              fontSize={10}
              fontWeight={600}
              letterSpacing="0.06em"
            >
              {c.tag}
            </text>
            {c.lines.map((line, i) => (
              <text
                key={i}
                x={x + 12}
                y={y + 36 + i * 13}
                className="fill-muted-foreground"
                fontSize={9}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {/* Worked crossover. A straight line, because ΔG is linear in T. */}
      <Note x={62} y={228} anchor="start">
        ice → water: ΔH = +6.01 kJ/mol, ΔS = +22.0 J mol⁻¹ K⁻¹
      </Note>
      <Note x={62} y={244} anchor="start">
        ΔG &gt; 0 — ice stable
      </Note>
      <Note x={364} y={244} anchor="end">
        ΔG &lt; 0 — water stable
      </Note>
      <Axes
        x={px}
        y={py}
        w={pw}
        h={ph}
        xLabel="temperature T (K)"
        xTicks={[200, 250, 300, 350].map((t) => ({
          at: (t - tLo) / (tHi - tLo),
          label: String(t),
        }))}
        yTicks={[
          { at: (0 - gLo) / (gHi - gLo), label: "0" },
          { at: 1, label: "+2" },
          { at: 0, label: "−2" },
        ]}
      />
      <text
        x={-(py + ph / 2)}
        y={px - 26}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        ΔG (kJ/mol)
      </text>
      <path
        d={pathFrom([
          { x: xOfT(tLo), y: yOfG(ICE_DH - ICE_DS * tLo) },
          { x: xOfT(tHi), y: yOfG(ICE_DH - ICE_DS * tHi) },
        ])}
        fill="none"
        stroke="var(--fig-1)"
        strokeWidth={2}
      />
      <line
        x1={xOfT(ICE_TCROSS)}
        y1={py}
        x2={xOfT(ICE_TCROSS)}
        y2={py + ph}
        stroke="var(--fig-1)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <circle cx={xOfT(ICE_TCROSS)} cy={yOfG(0)} r={3.5} fill="var(--fig-1)" />
      <text x={374} y={py + 14} className="fill-foreground" fontSize={10} fontWeight={600}>
        T = {ICE_TCROSS.toFixed(0)} K
      </text>
      <text x={374} y={py + 27} className="fill-muted-foreground" fontSize={9}>
        6010
      </text>
      <line x1={374} y1={py + 31} x2={396} y2={py + 31} stroke="var(--fig-axis)" strokeWidth={1} />
      <text x={374} y={py + 41} className="fill-muted-foreground" fontSize={9}>
        22.0
      </text>
    </Figure>
  );
}

/**
 * The figure that joins thermodynamics to equilibrium. Free energy of a
 * reacting mixture A ⇌ B is not a straight line between reactants and
 * products: the entropy of mixing pulls it into a well, and the bottom of the
 * well -- not pure product -- is equilibrium.
 *
 * G(ξ) = ξΔG° + RT[ξ ln ξ + (1−ξ) ln(1−ξ)], so
 * dG/dξ = ΔG° + RT ln(ξ/(1−ξ)) = ΔG° + RT ln Q,
 * which is zero exactly when Q = exp(−ΔG°/RT) = K. Taking K = 10 gives
 * ΔG° = −RT ln 10 = −5.71 kJ/mol at 298 K and ξ_eq = K/(1+K) = 0.909.
 */
const RT_298 = 8.314e-3 * 298.15; // 2.4788 kJ/mol
const WELL_K = 10;
const WELL_DG0 = -RT_298 * Math.log(WELL_K); // -5.708 kJ/mol
const WELL_XEQ = WELL_K / (1 + WELL_K); // 0.9091

function FreeEnergyWell() {
  const gOf = (x: number) => x * WELL_DG0 + RT_298 * (x * Math.log(x) + (1 - x) * Math.log(1 - x));
  const dgOf = (x: number) => WELL_DG0 + RT_298 * Math.log(x / (1 - x));

  const px = 52,
    pw = 348;
  const ay = 26,
    ah = 132; // upper panel: G
  const by = 208,
    bh = 90; // lower panel: dG/dξ
  const gLo = -6.4,
    gHi = 0.6;
  const dLo = -12,
    dHi = 8;
  const xOf = (x: number) => px + x * pw;
  const yG = (g: number) => ay + ah - ((g - gLo) / (gHi - gLo)) * ah;
  const yD = (d: number) => by + bh - ((d - dLo) / (dHi - dLo)) * bh;

  // Endpoints are exact limits (ξ ln ξ → 0); interior is sampled on a fine grid.
  const N = 220;
  const wellPts = [{ x: xOf(0), y: yG(0) }];
  const slopePts: { x: number; y: number }[] = [];
  for (let i = 1; i < N; i++) {
    const x = i / N;
    wellPts.push({ x: xOf(x), y: yG(gOf(x)) });
    const d = dgOf(x);
    if (d > dLo && d < dHi) slopePts.push({ x: xOf(x), y: yD(d) });
  }
  wellPts.push({ x: xOf(1), y: yG(WELL_DG0) });

  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((v) => ({ at: v, label: v.toFixed(2) }));
  // The upper panel shares the lower panel's x axis, so it keeps the gridlines
  // and drops the duplicate numbers.
  const xTicksBare = xTicks.map((t) => ({ at: t.at, label: "" }));

  return (
    <Figure
      viewBox="0 0 450 334"
      alt="Two stacked panels against extent of reaction. The upper panel shows free energy dipping into a well whose minimum lies past the equilibrium composition rather than at pure product. The lower panel shows delta G, the slope of that well, rising through zero at the same composition, where the reaction quotient equals the equilibrium constant."
      caption="G of the mixture against extent for A ⇌ B with K = 10. ΔG = ΔG° + RT ln Q is the slope of the upper curve; it reaches zero at the bottom of the well, where Q = K and ΔG° = −RT ln K = −5.71 kJ/mol."
    >
      <ArrowDefs id="few-arrow" />

      {/* Upper panel: the well itself. */}
      <Axes
        x={px}
        y={ay}
        w={pw}
        h={ah}
        xTicks={xTicksBare}
        yTicks={[0, -2, -4, -6].map((g) => ({
          at: (g - gLo) / (gHi - gLo),
          label: g === 0 ? "0" : `−${Math.abs(g)}`,
        }))}
      />
      <text
        x={-(ay + ah / 2)}
        y={px - 26}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        G of mixture (kJ/mol)
      </text>
      <path d={pathFrom(wellPts)} fill="none" stroke="var(--fig-1)" strokeWidth={2} />

      {/* Straight line from pure reactant to pure product: what ΔG° alone would say. */}
      <path
        d={pathFrom([
          { x: xOf(0), y: yG(0) },
          { x: xOf(1), y: yG(WELL_DG0) },
        ])}
        fill="none"
        stroke="var(--fig-axis)"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <Note x={xOf(0.42)} y={yG(-1.6)} anchor="start">
        ΔG° alone, no mixing
      </Note>

      <line
        x1={xOf(WELL_XEQ)}
        y1={ay}
        x2={xOf(WELL_XEQ)}
        y2={by + bh}
        stroke="var(--fig-grid)"
        strokeWidth={1}
      />
      <circle cx={xOf(WELL_XEQ)} cy={yG(gOf(WELL_XEQ))} r={3.5} fill="var(--fig-1)" />
      <text
        x={xOf(1)}
        y={ay + 14}
        textAnchor="end"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        equilibrium: ξ = 0.909
      </text>
      <Note x={xOf(1)} y={ay + 26} anchor="end">
        bottom of the well — Q = K = 10, ΔG = 0
      </Note>
      <Note x={xOf(0.015)} y={yG(0) - 7} anchor="start">
        pure A
      </Note>
      <Note x={xOf(0.995)} y={yG(-4.9)} anchor="end">
        pure B
      </Note>

      {/* Lower panel: the slope, which is what ΔG actually is. */}
      <Axes
        x={px}
        y={by}
        w={pw}
        h={bh}
        xLabel="extent of reaction ξ  (fraction of A converted to B)"
        xTicks={xTicks}
        yTicks={[5, 0, -5, -10].map((d) => ({
          at: (d - dLo) / (dHi - dLo),
          label: d === 0 ? "0" : d > 0 ? `+${d}` : `−${Math.abs(d)}`,
        }))}
      />
      <text
        x={-(by + bh / 2)}
        y={px - 26}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        ΔG (kJ/mol)
      </text>
      <path d={pathFrom(slopePts)} fill="none" stroke="var(--fig-2)" strokeWidth={2} />
      <circle cx={xOf(WELL_XEQ)} cy={yD(0)} r={3.5} fill="var(--fig-2)" />
      <Note x={xOf(0.05)} y={yD(0) - 10} anchor="start">
        Q &lt; K → ΔG &lt; 0, runs forward
      </Note>
      <Note x={xOf(0.99)} y={by + bh - 10} anchor="end">
        past the crossing Q &gt; K → ΔG &gt; 0, runs back
      </Note>

      <SeriesLabel x={xOf(0.06)} y={yG(-4.4)} color="var(--fig-1)">
        G, the well
      </SeriesLabel>
      <SeriesLabel x={xOf(0.06)} y={by + 16} color="var(--fig-2)">
        ΔG, its slope
      </SeriesLabel>
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */
/* Acids and bases                                                          */
/* ---------------------------------------------------------------------- */

/**
 * Ka·Kb = Kw drawn as one scale read from both ends. The pKa axis runs left to
 * right; the pKb axis underneath runs right to left, so a conjugate pair sits
 * on a single vertical line. Sliding that line right weakens the acid and, by
 * the same motion, strengthens the base -- which is the whole content of the
 * constant product, and is much harder to forget than the algebra.
 */
const CONJUGATE_PAIRS = [
  { pKa: 3.17, acid: "HF", base: "F⁻" }, // Ka = 6.8e-4, the value the AP tier quotes
  { pKa: 4.74, acid: "CH₃COOH", base: "CH₃COO⁻" }, // Ka = 1.8e-5
  { pKa: 7.21, acid: "H₂PO₄⁻", base: "HPO₄²⁻" },
  { pKa: 9.25, acid: "NH₄⁺", base: "NH₃" },
];

function ConjugateSeesaw() {
  const x0 = 46,
    w = 372;
  const railY = 104;
  const xOf = (pKa: number) => x0 + (pKa / 14) * w;

  return (
    <Figure
      viewBox="0 0 450 226"
      alt="One ruler carrying two scales. Read downward it is pKa, running zero to fourteen left to right; read upward it is pKb, running fourteen to zero across the same span. Each conjugate pair therefore sits at a single position, and sliding that position to the right weakens the acid and strengthens its conjugate base by exactly the same amount, because the two numbers must add to fourteen."
      caption="pKa + pKb = 14.00 at 25 °C, which is Ka·Kb = Kw. One mark reads both members of a pair: whatever the acid loses in strength, its conjugate base gains."
    >
      <ArrowDefs id="cs-arrow" />

      <Note x={x0} y={20} anchor="start">
        Ka · Kb = Kw = 1.0 × 10⁻¹⁴
      </Note>
      <Note x={x0 + w} y={20} anchor="end">
        pKa + pKb = 14.00
      </Note>

      <SeriesLabel x={x0} y={44} color="var(--fig-1)">
        acid member, read as pKa
      </SeriesLabel>
      <SeriesLabel x={x0} y={182} color="var(--fig-2)">
        conjugate base, read as pKb
      </SeriesLabel>

      {/* One rail, two scales: pKa above it, pKb below, mirrored. */}
      <line x1={x0} y1={railY} x2={x0 + w} y2={railY} stroke="var(--fig-axis)" strokeWidth={1.5} />
      {[0, 2, 4, 6, 8, 10, 12, 14].map((t) => (
        <g key={t}>
          <line
            x1={xOf(t)}
            y1={railY - 4}
            x2={xOf(t)}
            y2={railY + 4}
            stroke="var(--fig-axis)"
            strokeWidth={1}
          />
          <text
            x={xOf(t)}
            y={railY - 9}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {t}
          </text>
          <text
            x={xOf(t)}
            y={railY + 17}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {14 - t}
          </text>
        </g>
      ))}
      <Note x={x0 - 16} y={railY - 6} anchor="end">
        pKa
      </Note>
      <Note x={x0 - 16} y={railY + 17} anchor="end">
        pKb
      </Note>

      {CONJUGATE_PAIRS.map((p) => {
        const x = xOf(p.pKa);
        return (
          <g key={p.acid}>
            <line
              x1={x}
              y1={railY - 2}
              x2={x}
              y2={railY - 22}
              stroke="var(--fig-1)"
              strokeWidth={1}
            />
            <line
              x1={x}
              y1={railY + 2}
              x2={x}
              y2={railY + 28}
              stroke="var(--fig-2)"
              strokeWidth={1}
            />
            <circle cx={x} cy={railY} r={3.5} fill="var(--fig-1)" />
            <text
              x={x}
              y={railY - 36}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={9}
              fontWeight={600}
            >
              {p.acid}
            </text>
            <text
              x={x}
              y={railY - 26}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {p.pKa.toFixed(2)}
            </text>
            <text
              x={x}
              y={railY + 42}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={9}
              fontWeight={600}
            >
              {p.base}
            </text>
            <text
              x={x}
              y={railY + 52}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {(14 - p.pKa).toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* One direction of travel does both things at once -- that is the point. */}
      <line
        x1={x0 + 82}
        y1={210}
        x2={x0 + w}
        y2={210}
        stroke="var(--fig-axis)"
        strokeWidth={1}
        markerEnd="url(#cs-arrow)"
      />
      <Note x={x0} y={213} anchor="start">
        further right:
      </Note>
      <Note x={x0 + w / 2 + 20} y={202}>
        weaker acid, stronger conjugate base
      </Note>
    </Figure>
  );
}

/**
 * The levelling effect as a window. Water can only hold species whose pKa lies
 * between that of its conjugate acid (H₃O⁺, pKa −1.7) and its conjugate base
 * (H₂O, pKa 15.7). Anything outside is converted on contact, which is why five
 * different mineral acids are one species in aqueous solution, and why an
 * alkyne at pKa 25 cannot be deprotonated in water at all.
 */
const LEVELLING_MARKS: { pKa: number; label: string; kind: "bound" | "in" | "out" }[] = [
  { pKa: -1.7, label: "H₃O⁺", kind: "bound" },
  { pKa: 3.17, label: "HF", kind: "in" },
  { pKa: 9.25, label: "NH₄⁺", kind: "in" },
  { pKa: 15.7, label: "H₂O", kind: "bound" },
  { pKa: 25, label: "HC≡CR", kind: "out" },
  { pKa: 38, label: "NH₃", kind: "out" },
];
const LEVELLING_COLOR = {
  bound: "var(--fig-2)",
  in: "var(--fig-3)",
  out: "var(--fig-1)",
} as const;

function LevellingWindow() {
  const x0 = 34,
    w = 392;
  const lo = -6,
    hi = 40;
  const railY = 84;
  const xOf = (p: number) => x0 + ((p - lo) / (hi - lo)) * w;

  return (
    <Figure
      viewBox="0 0 450 176"
      alt="A pKa axis with a shaded band between minus one point seven and fifteen point seven, the acidity window of water. Five mineral acids all fall below the floor of that band and arrive in solution as one and the same species, so water cannot rank them, while a terminal alkyne at pKa twenty-five and ammonia at pKa thirty-eight fall off the far end, out of reach of any aqueous base."
      caption="Water only resolves acids whose pKa lies between −1.7 (H₃O⁺) and 15.7 (H₂O). Outside that band everything is levelled to one of those two species — a property of the solvent, not of the acids."
    >
      {/* The window is a region, not a series, so it is a wash rather than a mark. */}
      <rect
        x={xOf(-1.7)}
        y={railY - 46}
        width={xOf(15.7) - xOf(-1.7)}
        height={52}
        fill="var(--fig-3)"
        fillOpacity={0.14}
      />
      <Note x={(xOf(-1.7) + xOf(15.7)) / 2} y={railY - 52}>
        acidity window of water
      </Note>

      <line x1={x0} y1={railY} x2={x0 + w} y2={railY} stroke="var(--fig-axis)" strokeWidth={1.5} />
      {[-5, 0, 5, 10, 15, 20, 25, 30, 35, 40].map((t) => (
        <g key={t}>
          <line
            x1={xOf(t)}
            y1={railY}
            x2={xOf(t)}
            y2={railY + 4}
            stroke="var(--fig-axis)"
            strokeWidth={1}
          />
          <text
            x={xOf(t)}
            y={railY + 15}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {t}
          </text>
        </g>
      ))}
      <text
        x={x0 + w / 2}
        y={railY + 31}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={10}
      >
        pKa in water (estimated outside the window)
      </text>

      {LEVELLING_MARKS.map((m, i) => {
        const x = xOf(m.pKa);
        const up = i % 2 === 0 ? 0 : 14;
        const colour = LEVELLING_COLOR[m.kind];
        return (
          <g key={m.label}>
            <line
              x1={x}
              y1={railY - 2}
              x2={x}
              y2={railY - 14 - up}
              stroke={colour}
              strokeWidth={1}
            />
            <circle cx={x} cy={railY} r={3.5} fill={colour} />
            <text
              x={x}
              y={railY - 18 - up}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={9}
              fontWeight={600}
            >
              {m.label}
            </text>
          </g>
        );
      })}

      {/* Everything below the floor arrives as one and the same species. */}
      <line
        x1={xOf(-1.7)}
        y1={railY + 6}
        x2={xOf(-1.7)}
        y2={railY + 34}
        stroke="var(--fig-1)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <text x={x0} y={railY + 56} className="fill-foreground" fontSize={9} fontWeight={600}>
        HCl · HBr · HI · HNO₃ · HClO₄
      </text>
      <text x={x0} y={railY + 68} className="fill-muted-foreground" fontSize={9}>
        all levelled to H₃O⁺
      </text>
      <text
        x={x0 + w}
        y={railY + 56}
        textAnchor="end"
        className="fill-muted-foreground"
        fontSize={9}
      >
        above the ceiling: levelled to OH⁻
      </text>
      <text
        x={x0 + w}
        y={railY + 68}
        textAnchor="end"
        className="fill-muted-foreground"
        fontSize={9}
      >
        needs THF or liquid NH₃
      </text>
    </Figure>
  );
}

/**
 * Strong versus weak, both curves solved from the exact charge balance for
 * 25.00 mL of 0.100 M acid titrated with 0.100 M NaOH. Landmarks the solver
 * reproduces, each one stated in the prose:
 *   strong  pH 1.000 at start, 7.000 at 25.00 mL
 *   weak    pH 2.875 at start -- the lesson quotes 2.87 from the 5% small-x
 *           approximation, which is the same answer either side of a rounding
 *           boundary; 4.745 = pKa at 12.50 mL,
 *           8.722 at 25.00 mL, and identical to the strong curve past it.
 */
const KA_ACETIC = 1.8e-5;
const PKA_ACETIC = -Math.log10(KA_ACETIC); // 4.7447

/** Dense near the equivalence point, sparse elsewhere: the jump is near-vertical. */
const TITRATION_VOLUMES = (() => {
  const vs: number[] = [];
  for (let i = 0; i <= 46; i++) vs.push(i * 0.5); // 0 -> 23 mL
  for (let i = 1; i <= 100; i++) vs.push(23 + i * 0.04); // 23 -> 27 mL
  for (let i = 1; i <= 46; i++) vs.push(27 + i * 0.5); // 27 -> 50 mL
  return vs;
})();

function TitrationStrongVsWeak() {
  const px = 44,
    py = 20,
    pw = 348,
    ph = 168;
  const xOf = (v: number) => px + (v / 50) * pw;
  const yOf = (pH: number) => py + ph - (pH / 14) * ph;
  const curve = (ka: number) =>
    TITRATION_VOLUMES.map((v) => ({ x: xOf(v), y: yOf(titrationPH(ka, 0.1, 25, 0.1, v)) }));

  const strong = curve(Infinity);
  const weak = curve(KA_ACETIC);
  const weakEq = titrationPH(KA_ACETIC, 0.1, 25, 0.1, 25); // 8.722
  const weakStart = titrationPH(KA_ACETIC, 0.1, 25, 0.1, 0); // 2.875

  return (
    <Figure
      viewBox="0 0 450 252"
      alt="Two titration curves for the same amount of acid. The strong acid starts at pH one, stays low, and jumps vertically through pH seven. The weak acid starts near pH three, flattens into a buffer plateau that passes through its pKa of 4.74 at half equivalence, and jumps through a higher equivalence point at pH 8.7 before merging with the strong-acid curve in excess base."
      caption="25.00 mL of 0.100 M acid with 0.100 M NaOH, solved from the exact charge balance — which is why the weak start reads 2.88 where the text’s 5% approximation gives 2.87. Weak acid differs in three ways: higher start, a buffer plateau through pH = pKa at half-equivalence, and an equivalence point above 7 because A⁻ hydrolyses."
    >
      <Axes
        x={px}
        y={py}
        w={pw}
        h={ph}
        xLabel="volume of 0.100 M NaOH added (mL)"
        yLabel="pH"
        xTicks={[0, 12.5, 25, 37.5, 50].map((v) => ({ at: v / 50, label: String(v) }))}
        yTicks={[0, 2, 4, 6, 8, 10, 12, 14].map((p) => ({ at: p / 14, label: String(p) }))}
      />

      {/* Equivalence volume: shared by both curves, so it is drawn once. */}
      <line
        x1={xOf(25)}
        y1={py}
        x2={xOf(25)}
        y2={py + ph}
        stroke="var(--fig-grid)"
        strokeWidth={1}
      />

      <path d={pathFrom(strong)} fill="none" stroke="var(--fig-2)" strokeWidth={2} />
      <path d={pathFrom(weak)} fill="none" stroke="var(--fig-1)" strokeWidth={2} />

      {/* Half-equivalence: the practical way a pKa is measured. */}
      <line
        x1={px}
        y1={yOf(PKA_ACETIC)}
        x2={xOf(12.5)}
        y2={yOf(PKA_ACETIC)}
        stroke="var(--fig-1)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <line
        x1={xOf(12.5)}
        y1={yOf(PKA_ACETIC)}
        x2={xOf(12.5)}
        y2={py + ph}
        stroke="var(--fig-1)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <circle cx={xOf(12.5)} cy={yOf(PKA_ACETIC)} r={3.5} fill="var(--fig-1)" />
      <text
        x={xOf(13.4)}
        y={yOf(PKA_ACETIC) + 12}
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        half-eq: pH = pKa = {PKA_ACETIC.toFixed(2)}
      </text>

      {/* The two equivalence points, the headline difference. Short leaders take
          the labels clear of both curves rather than sitting them on top. */}
      <circle cx={xOf(25)} cy={yOf(weakEq)} r={3.5} fill="var(--fig-1)" />
      <circle cx={xOf(25)} cy={yOf(7)} r={3.5} fill="var(--fig-2)" />
      <line
        x1={xOf(25)}
        y1={yOf(weakEq)}
        x2={xOf(29.5)}
        y2={yOf(weakEq) - 12}
        stroke="var(--fig-1)"
        strokeWidth={1}
      />
      <text
        x={xOf(30.2)}
        y={yOf(weakEq) - 9}
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        weak eq: {weakEq.toFixed(2)}
      </text>
      <line
        x1={xOf(25)}
        y1={yOf(7)}
        x2={xOf(29.5)}
        y2={yOf(7) + 14}
        stroke="var(--fig-2)"
        strokeWidth={1}
      />
      <text x={xOf(30.2)} y={yOf(7) + 17} className="fill-foreground" fontSize={9} fontWeight={600}>
        strong eq: 7.00
      </text>
      <Note x={xOf(25)} y={py - 6}>
        equivalence, 25.00 mL
      </Note>

      {/* Upper left is the one region neither curve visits, so the two direct
          labels live there and carry the starting pH with them. */}
      <SeriesLabel x={xOf(1)} y={yOf(13.2)} color="var(--fig-1)">
        {`weak: acetic acid, starts ${weakStart.toFixed(2)}`}
      </SeriesLabel>
      <SeriesLabel x={xOf(1)} y={yOf(11.8)} color="var(--fig-2)">
        strong: HCl, starts 1.00
      </SeriesLabel>
      <Note x={xOf(25)} y={py + ph + 44}>
        buffer plateau spans roughly 2.5 to 22.5 mL — pKa ± 1
      </Note>
    </Figure>
  );
}

/**
 * Phosphoric acid, same exact treatment extended to three stages.
 * pKa1 2.12, pKa2 7.21, pKa3 12.32, so the solver puts the second
 * half-equivalence (37.5 mL) at pH 7.210 exactly and the first equivalence
 * point at 4.70, against the (pKa1 + pKa2)/2 = 4.67 estimate the prose quotes.
 * The first plateau sits above pKa1 because Ka1 is large enough that the free
 * acid is substantially ionised before any base is added, and the third stage
 * never appears: excess hydroxide swamps it, which is exactly the "lost in the
 * levelling region" the prose describes.
 */
const PHOSPHORIC_PKA: [number, number, number] = [2.12, 7.21, 12.32];
const PHOSPHORIC_KA = PHOSPHORIC_PKA.map((p) => Math.pow(10, -p)) as [number, number, number];

function PolyproticTitration() {
  const px = 44,
    py = 18,
    pw = 342,
    ph = 156;
  const vMax = 80;
  const xOf = (v: number) => px + (v / vMax) * pw;
  const yOf = (pH: number) => py + ph - (pH / 14) * ph;

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 200; i++) {
    const v = (i / 200) * vMax;
    pts.push({ x: xOf(v), y: yOf(triproticPH(PHOSPHORIC_KA, 0.1, 25, 0.1, v)) });
  }
  const eq1 = triproticPH(PHOSPHORIC_KA, 0.1, 25, 0.1, 25); // 4.696
  const eq2 = triproticPH(PHOSPHORIC_KA, 0.1, 25, 0.1, 50); // 9.659

  return (
    <Figure
      viewBox="0 0 450 224"
      alt="The titration curve of phosphoric acid with sodium hydroxide, showing two clear steps and a third that never forms. Horizontal reference lines mark the three pKa values of 2.12, 7.21 and 12.32; the curve passes through the second of them exactly at the second half-equivalence volume, while the third is buried under excess hydroxide near the top of the scale."
      caption="25.00 mL of 0.100 M H₃PO₄ with 0.100 M NaOH. Constants five orders of magnitude apart give two resolved steps; the third equivalence at 75 mL leaves no break because hydroxide already controls the pH there."
    >
      <Axes
        x={px}
        y={py}
        w={pw}
        h={ph}
        xLabel="volume of 0.100 M NaOH added (mL)"
        yLabel="pH"
        xTicks={[0, 25, 50, 75].map((v) => ({ at: v / vMax, label: String(v) }))}
        yTicks={[0, 2, 4, 6, 8, 10, 12, 14].map((p) => ({ at: p / 14, label: String(p) }))}
      />

      {/* The three constants, as levels rather than as a legend. */}
      {PHOSPHORIC_PKA.map((p, i) => (
        <g key={p}>
          <line
            x1={px}
            y1={yOf(p)}
            x2={px + pw}
            y2={yOf(p)}
            stroke="var(--fig-2)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <text
            x={px + pw + 4}
            y={yOf(p) + 3}
            className="fill-foreground"
            fontSize={9}
            fontWeight={600}
          >
            pKa{i + 1}
          </text>
          <text x={px + pw + 4} y={yOf(p) + 13} className="fill-muted-foreground" fontSize={9}>
            {p.toFixed(2)}
          </text>
        </g>
      ))}

      {/* Half-equivalence volumes: where the curve should meet those levels. */}
      {[12.5, 37.5, 62.5].map((v) => (
        <line
          key={v}
          x1={xOf(v)}
          y1={py + ph}
          x2={xOf(v)}
          y2={py + ph - 6}
          stroke="var(--fig-axis)"
          strokeWidth={1}
        />
      ))}
      {[25, 50, 75].map((v) => (
        <line
          key={v}
          x1={xOf(v)}
          y1={py}
          x2={xOf(v)}
          y2={py + ph}
          stroke="var(--fig-grid)"
          strokeWidth={1}
        />
      ))}

      <path d={pathFrom(pts)} fill="none" stroke="var(--fig-1)" strokeWidth={2} />

      <circle cx={xOf(25)} cy={yOf(eq1)} r={3.5} fill="var(--fig-1)" />
      <circle cx={xOf(50)} cy={yOf(eq2)} r={3.5} fill="var(--fig-1)" />
      <circle cx={xOf(37.5)} cy={yOf(PHOSPHORIC_PKA[1])} r={3} fill="var(--fig-2)" />

      {/* Callouts sit in the gap under or beside the curve, never across it. */}
      <line
        x1={xOf(25)}
        y1={yOf(eq1)}
        x2={xOf(27)}
        y2={yOf(4.1)}
        stroke="var(--fig-1)"
        strokeWidth={1}
      />
      <text x={xOf(27.6)} y={yOf(3.5)} className="fill-foreground" fontSize={9} fontWeight={600}>
        1st eq {eq1.toFixed(2)}
      </text>
      <Note x={xOf(27.6)} y={yOf(2.6)} anchor="start">
        ≈ (pKa1+pKa2)/2 = 4.67
      </Note>
      <text
        x={xOf(47)}
        y={yOf(eq2) - 6}
        textAnchor="end"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        2nd eq {eq2.toFixed(2)}
      </text>
      <Note x={xOf(51)} y={yOf(13.4)}>
        3rd equivalence at 75 mL: no break at all
      </Note>

      <Note x={xOf(40)} y={py + ph + 44}>
        half-equivalence at 12.5 / 37.5 / 62.5 mL — the curve meets pKa2 there exactly
      </Note>
    </Figure>
  );
}

/**
 * The pH scale with real things on it, and the log ruler that makes it mean
 * something. The annotated span from lemon juice to black coffee is 2.6 units,
 * which is 10^2.6 ≈ 400-fold in [H₃O⁺] -- the point the prose makes when it
 * says each unit is a factor of ten.
 */
const PH_SUBSTANCES = [
  { pH: 1.5, label: "stomach acid", row: 0 },
  { pH: 2.4, label: "lemon juice", row: 1 },
  { pH: 2.9, label: "vinegar", row: 2 },
  { pH: 5.0, label: "black coffee", row: 3 },
  { pH: 7.0, label: "pure water", row: 0 },
  { pH: 7.4, label: "blood", row: 1 },
  { pH: 8.1, label: "seawater", row: 2 },
  { pH: 11.5, label: "household ammonia", row: 3 },
];

function PHScalePopulated() {
  const x0 = 72,
    w = 352;
  const axisY = 96;
  // Four label rows: eight substances on one ruler will not fit in fewer.
  const rowY = [28, 42, 56, 70];
  const xOf = (p: number) => x0 + (p / 14) * w;
  const factor = Math.pow(10, 5.0 - 2.4); // 398

  return (
    <Figure
      viewBox="0 0 450 182"
      alt="A pH axis from zero to fourteen with eight everyday substances placed on it and the matching hydronium exponent printed underneath. Lemon juice and black coffee are only two and a half units apart on the ruler but differ roughly four hundredfold in hydronium concentration, because every pH unit is one power of ten."
      caption="Each pH unit is one power of ten in [H₃O⁺]. Lemon juice at 2.4 and coffee at 5.0 look close on the ruler; the coffee actually holds about 400 times less hydronium."
    >
      <line x1={x0} y1={axisY} x2={x0 + w} y2={axisY} stroke="var(--fig-axis)" strokeWidth={1.5} />

      {/* Substances above; three label rows so nothing collides. */}
      {PH_SUBSTANCES.map((s) => {
        const x = xOf(s.pH);
        const isNeutral = s.pH === 7.0;
        return (
          <g key={s.label}>
            <line
              x1={x}
              y1={axisY}
              x2={x}
              y2={rowY[s.row]! + 4}
              stroke="var(--fig-grid)"
              strokeWidth={1}
            />
            <circle cx={x} cy={axisY} r={3.5} fill={isNeutral ? "var(--fig-3)" : "var(--fig-1)"} />
            <text
              x={x}
              y={rowY[s.row]!}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={9}
              fontWeight={600}
            >
              {s.label} {s.pH.toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* Two rulers below: pH, then the exponent it is shorthand for. */}
      {[0, 2, 4, 6, 8, 10, 12, 14].map((t) => (
        <g key={t}>
          <line
            x1={xOf(t)}
            y1={axisY}
            x2={xOf(t)}
            y2={axisY + 4}
            stroke="var(--fig-axis)"
            strokeWidth={1}
          />
          <text
            x={xOf(t)}
            y={axisY + 15}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {t}
          </text>
          {t > 0 && (
            <text
              x={xOf(t)}
              y={axisY + 31}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              10⁻{t}
            </text>
          )}
        </g>
      ))}
      <text
        x={x0 - 8}
        y={axisY + 15}
        textAnchor="end"
        className="fill-muted-foreground"
        fontSize={9}
      >
        pH
      </text>
      <text
        x={x0 - 8}
        y={axisY + 31}
        textAnchor="end"
        className="fill-muted-foreground"
        fontSize={9}
      >
        [H₃O⁺] / M
      </text>

      {/* The factor-of-ten point, made concrete on one span. */}
      <line
        x1={xOf(2.4)}
        y1={axisY + 42}
        x2={xOf(2.4)}
        y2={axisY + 52}
        stroke="var(--fig-1)"
        strokeWidth={1}
      />
      <line
        x1={xOf(5.0)}
        y1={axisY + 42}
        x2={xOf(5.0)}
        y2={axisY + 52}
        stroke="var(--fig-1)"
        strokeWidth={1}
      />
      <line
        x1={xOf(2.4)}
        y1={axisY + 52}
        x2={xOf(5.0)}
        y2={axisY + 52}
        stroke="var(--fig-1)"
        strokeWidth={1}
      />
      <text
        x={xOf(3.7)}
        y={axisY + 65}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        2.6 units = {Math.round(factor)}× less H₃O⁺
      </text>
      <Note x={x0 + w} y={axisY + 65} anchor="end">
        neutral is pH 7.00 only at 25 °C
      </Note>
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */
/* Buffers                                                                  */
/* ---------------------------------------------------------------------- */

/**
 * The worked case from the lesson, drawn as the contrast it is. One litre
 * holding 0.100 mol acetic acid and 0.100 mol acetate takes 0.010 mol NaOH and
 * moves 0.09 of a pH unit; the same insult to a litre of water moves it five.
 * Both pH values come from Henderson-Hasselbalch and from pOH respectively,
 * computed here rather than typed in.
 */
const BUF_HA0 = 0.1,
  BUF_A0 = 0.1,
  BUF_NAOH = 0.01;
const BUF_HA1 = BUF_HA0 - BUF_NAOH; // 0.090
const BUF_A1 = BUF_A0 + BUF_NAOH; // 0.110
const BUF_PH0 = PKA_ACETIC + Math.log10(BUF_A0 / BUF_HA0); // 4.745
const BUF_PH1 = PKA_ACETIC + Math.log10(BUF_A1 / BUF_HA1); // 4.831
const WATER_PH1 = 14 + Math.log10(BUF_NAOH); // 12.00

function BufferAbsorbsBase() {
  // Left panel: how the two members of the pair move.
  const bx = 40,
    byTop = 44,
    bh = 132;
  const barW = 26,
    maxMol = 0.13;
  const hOf = (mol: number) => (mol / maxMol) * bh;
  const bars = [
    { x: bx + 6, mol: BUF_HA0, tag: "HA", group: 0 },
    { x: bx + 40, mol: BUF_A0, tag: "A⁻", group: 0 },
    { x: bx + 106, mol: BUF_HA1, tag: "HA", group: 1 },
    { x: bx + 140, mol: BUF_A1, tag: "A⁻", group: 1 },
  ];

  // Right panel: the resulting pH move, on a shared 0-14 axis.
  const ax = 268,
    ay = 44,
    ah = 132;
  const yOf = (pH: number) => ay + ah - (pH / 14) * ah;

  return (
    <Figure
      viewBox="0 0 450 236"
      alt="On the left, adding ten millimoles of sodium hydroxide converts that much acetic acid into acetate, shifting the two bars only slightly. On the right, the resulting pH move of nine hundredths of a unit is drawn against the five-unit jump the same addition causes in plain water, on the same pH axis."
      caption="0.010 mol NaOH into 1.00 L. Buffer: HA 0.100 → 0.090, A⁻ 0.100 → 0.110, pH 4.74 → 4.83. Pure water: pH 7.00 → 12.00. Identical chemical insult, fifty-fold difference in response."
    >
      <ArrowDefs id="bab-arrow" />
      <ArrowDefs id="bab-arrow-water" color="var(--fig-2)" />

      <Note x={bx} y={26} anchor="start">
        moles in 1.00 L of acetate buffer
      </Note>
      <line
        x1={bx}
        y1={byTop + bh}
        x2={bx + 176}
        y2={byTop + bh}
        stroke="var(--fig-axis)"
        strokeWidth={1.5}
      />
      {bars.map((b) => (
        <g key={`${b.group}${b.tag}`}>
          <rect
            x={b.x}
            y={byTop + bh - hOf(b.mol)}
            width={barW}
            height={hOf(b.mol)}
            fill={b.tag === "HA" ? "var(--fig-1)" : "var(--fig-2)"}
            fillOpacity={b.group === 0 ? 0.45 : 1}
            stroke={b.tag === "HA" ? "var(--fig-1)" : "var(--fig-2)"}
            strokeWidth={1}
          />
          <text
            x={b.x + barW / 2}
            y={byTop + bh - hOf(b.mol) - 5}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={9}
            fontWeight={600}
          >
            {b.mol.toFixed(3)}
          </text>
          <text
            x={b.x + barW / 2}
            y={byTop + bh + 13}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {b.tag}
          </text>
        </g>
      ))}
      <Note x={bx + 39} y={byTop + bh + 27}>
        before
      </Note>
      <Note x={bx + 139} y={byTop + bh + 27}>
        after +0.010 mol OH⁻
      </Note>
      <line
        x1={bx + 76}
        y1={byTop + 24}
        x2={bx + 100}
        y2={byTop + 24}
        stroke="var(--fig-axis)"
        strokeWidth={1}
        markerEnd="url(#bab-arrow)"
      />

      {/* Same axis for both systems, so the comparison is honest. */}
      <Note x={ax + 60} y={26}>
        resulting pH
      </Note>
      <line x1={ax} y1={ay} x2={ax} y2={ay + ah} stroke="var(--fig-axis)" strokeWidth={1.5} />
      {[0, 2, 4, 6, 8, 10, 12, 14].map((p) => (
        <g key={p}>
          <line
            x1={ax - 4}
            y1={yOf(p)}
            x2={ax}
            y2={yOf(p)}
            stroke="var(--fig-axis)"
            strokeWidth={1}
          />
          <text
            x={ax - 7}
            y={yOf(p) + 3}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {p}
          </text>
        </g>
      ))}

      {/* Buffer: a move so small that at this scale the two marks coincide. */}
      <Note x={ax + 16} y={yOf(BUF_PH0) - 9} anchor="start">
        acetate buffer
      </Note>
      <line
        x1={ax + 16}
        y1={yOf(BUF_PH0)}
        x2={ax + 48}
        y2={yOf(BUF_PH0)}
        stroke="var(--fig-1)"
        strokeWidth={2}
      />
      <line
        x1={ax + 16}
        y1={yOf(BUF_PH1)}
        x2={ax + 48}
        y2={yOf(BUF_PH1)}
        stroke="var(--fig-1)"
        strokeWidth={2}
      />
      <text
        x={ax + 54}
        y={yOf(BUF_PH0) + 3}
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        {BUF_PH0.toFixed(2)} → {BUF_PH1.toFixed(2)} (+{(BUF_PH1 - BUF_PH0).toFixed(2)})
      </text>

      {/* Pure water: the same 0.010 mol, five pH units. */}
      <Note x={ax + 130} y={yOf(WATER_PH1) - 16}>
        pure water
      </Note>
      <line
        x1={ax + 118}
        y1={yOf(7)}
        x2={ax + 142}
        y2={yOf(7)}
        stroke="var(--fig-2)"
        strokeWidth={2}
      />
      <line
        x1={ax + 118}
        y1={yOf(WATER_PH1)}
        x2={ax + 142}
        y2={yOf(WATER_PH1)}
        stroke="var(--fig-2)"
        strokeWidth={2}
      />
      <line
        x1={ax + 130}
        y1={yOf(7)}
        x2={ax + 130}
        y2={yOf(WATER_PH1) + 2}
        stroke="var(--fig-2)"
        strokeWidth={2}
        markerEnd="url(#bab-arrow-water)"
      />
      <text
        x={ax + 110}
        y={(yOf(7) + yOf(WATER_PH1)) / 2 - 3}
        textAnchor="end"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        7.00 → {WATER_PH1.toFixed(2)}
      </text>
      <Note x={ax + 110} y={(yOf(7) + yOf(WATER_PH1)) / 2 + 9} anchor="end">
        +{(WATER_PH1 - 7).toFixed(2)} units
      </Note>

      <SeriesLabel x={bx} y={byTop + bh + 48} color="var(--fig-1)">
        HA, the acid member
      </SeriesLabel>
      <SeriesLabel x={bx + 150} y={byTop + bh + 48} color="var(--fig-2)">
        A⁻, the base member
      </SeriesLabel>
    </Figure>
  );
}

/**
 * Buffer capacity from the expression the lesson derives,
 *
 *   β = 2.303([H₃O⁺] + [OH⁻] + C·Ka[H₃O⁺]/(Ka + [H₃O⁺])²)
 *
 * with C = 0.100 M and acetic acid. Evaluating it reproduces every number in
 * the prose: the peak is 2.303C/4 = 0.0576 at pH = pKa, and one unit away in
 * either direction it has fallen to 0.335 of that -- the "about a third at
 * 10:1" that justifies the pKa ± 1 rule. The upturns at the ends of the range
 * are the two water terms, which is why strongly acidic and strongly basic
 * solutions resist pH change with no conjugate pair present.
 */
const BETA_C = 0.1;
const betaOf = (pH: number) => {
  const h = Math.pow(10, -pH);
  return 2.303 * (h + KW / h + (BETA_C * KA_ACETIC * h) / Math.pow(KA_ACETIC + h, 2));
};
const BETA_MAX = (2.303 * BETA_C) / 4; // 0.05758

function BufferCapacityCurve() {
  const px = 50,
    py = 20,
    pw = 356,
    ph = 150;
  const pLo = 2,
    pHi = 12,
    bMax = 0.066;
  const xOf = (p: number) => px + ((p - pLo) / (pHi - pLo)) * pw;
  const yOf = (b: number) => py + ph - (b / bMax) * ph;

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 400; i++) {
    const p = pLo + ((pHi - pLo) * i) / 400;
    pts.push({ x: xOf(p), y: yOf(betaOf(p)) });
  }
  const betaSide = betaOf(PKA_ACETIC + 1); // 0.01921
  const fracSide = betaSide / BETA_MAX; // 0.334

  return (
    <Figure
      viewBox="0 0 450 226"
      alt="Buffer capacity plotted against pH for a tenth molar acetate pair. The curve is a single symmetric peak centred on the pKa of 4.74, where capacity reaches 0.058 moles of base per litre per pH unit; one unit to either side it has already fallen to a third of that, and it is near zero across the middle of the scale before rising again at the extremes where hydronium and hydroxide buffer on their own."
      caption="β = 2.303([H₃O⁺]+[OH⁻]+C·Ka[H₃O⁺]/(Ka+[H₃O⁺])²) for C = 0.100 M acetate. Peak 2.303C/4 = 0.0576 at pH = pKa; at pKa ± 1 the ratio is 10:1 and only a third of the capacity is left."
    >
      {/* The useful window, shaded, because it is a region and not a series. */}
      <rect
        x={xOf(PKA_ACETIC - 1)}
        y={py}
        width={xOf(PKA_ACETIC + 1) - xOf(PKA_ACETIC - 1)}
        height={ph}
        fill="var(--fig-1)"
        fillOpacity={0.09}
      />

      <Axes
        x={px}
        y={py}
        w={pw}
        h={ph}
        xLabel="pH"
        yLabel="β  (mol OH⁻ per L per pH unit)"
        xTicks={[2, 4, 6, 8, 10, 12].map((p) => ({
          at: (p - pLo) / (pHi - pLo),
          label: String(p),
        }))}
        yTicks={[0, 0.02, 0.04, 0.06].map((b) => ({ at: b / bMax, label: b.toFixed(2) }))}
      />

      <path d={pathFrom(pts)} fill="none" stroke="var(--fig-1)" strokeWidth={2} />

      {/* Peak. */}
      <line
        x1={xOf(PKA_ACETIC)}
        y1={yOf(BETA_MAX)}
        x2={xOf(PKA_ACETIC)}
        y2={py + ph}
        stroke="var(--fig-1)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <circle cx={xOf(PKA_ACETIC)} cy={yOf(BETA_MAX)} r={3.5} fill="var(--fig-1)" />
      {/* Leader takes the peak label clear of the descending limb. */}
      <line
        x1={xOf(PKA_ACETIC) + 5}
        y1={yOf(BETA_MAX)}
        x2={xOf(6.1)}
        y2={yOf(BETA_MAX)}
        stroke="var(--fig-1)"
        strokeWidth={1}
      />
      <text
        x={xOf(6.3)}
        y={yOf(BETA_MAX) + 3}
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        pH = pKa = {PKA_ACETIC.toFixed(2)}
      </text>
      <Note x={xOf(6.3)} y={yOf(BETA_MAX) + 15} anchor="start">
        β = 2.303C/4 = {BETA_MAX.toFixed(4)}
      </Note>

      {/* The ±1 shoulders, where the 10:1 ratio bites. */}
      {[-1, 1].map((d) => (
        <circle key={d} cx={xOf(PKA_ACETIC + d)} cy={yOf(betaSide)} r={3} fill="var(--fig-2)" />
      ))}
      <line
        x1={xOf(PKA_ACETIC - 1)}
        y1={yOf(betaSide)}
        x2={xOf(PKA_ACETIC + 1)}
        y2={yOf(betaSide)}
        stroke="var(--fig-2)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <text
        x={xOf(6.2)}
        y={yOf(betaSide) + 3}
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        pKa ± 1: {Math.round(fracSide * 100)}% of peak, ratio 10:1
      </text>

      {/* The two water terms, labelled up in the empty corners with leaders
          down to the limbs they explain. */}
      <line
        x1={xOf(2.3)}
        y1={py + 18}
        x2={xOf(2.1)}
        y2={py + 88}
        stroke="var(--fig-axis)"
        strokeWidth={1}
      />
      <Note x={xOf(2.05)} y={py + 12} anchor="start">
        H₃O⁺ alone
      </Note>
      <line
        x1={xOf(11.7)}
        y1={py + 18}
        x2={xOf(11.9)}
        y2={py + 88}
        stroke="var(--fig-axis)"
        strokeWidth={1}
      />
      <Note x={xOf(11.95)} y={py + 12} anchor="end">
        OH⁻ alone
      </Note>
      <Note x={xOf(7)} y={py + ph + 46}>
        capacity scales with C, so pKa picks where a buffer works and C picks how hard
      </Note>
    </Figure>
  );
}

/**
 * Why blood works despite breaking the pKa ± 1 rule. The bicarbonate system
 * sits 1.30 units above its apparent pKa of 6.1 -- outside the useful window
 * of any closed buffer -- and the reservoir is lopsided 20:1. It holds anyway
 * because both members are under independent physiological control, so the
 * ratio is a regulated variable rather than a fixed property of the flask.
 * pH = 6.1 + log(24 / (0.03 × 40)) = 6.1 + log 20 = 7.40, computed below.
 */
const BLOOD_PKA = 6.1;
const BLOOD_HCO3 = 24; // mM
const BLOOD_PCO2 = 40; // mmHg
const BLOOD_CO2 = 0.03 * BLOOD_PCO2; // 1.2 mM
const BLOOD_PH = BLOOD_PKA + Math.log10(BLOOD_HCO3 / BLOOD_CO2); // 7.401

function BloodBicarbonate() {
  const x0 = 46,
    w = 356;
  const railY = 66;
  const lo = 5.0,
    hi = 8.5;
  const xOf = (p: number) => x0 + ((p - lo) / (hi - lo)) * w;

  // Reservoir bars, on a shared mM scale so 20:1 is visible as 20:1.
  const barX = 120,
    barW = 250,
    barTop = 128,
    barH = 18,
    barGap = 30;
  const wOf = (mM: number) => (mM / 26) * barW;

  return (
    <Figure
      viewBox="0 0 450 216"
      alt="Blood pH of 7.40 sits 1.3 units above the apparent pKa of 6.1 for the carbon dioxide bicarbonate pair, well outside the shaded pKa plus or minus one window that a closed buffer needs. The bars below show why the ratio is twenty to one: bicarbonate at 24 millimolar against dissolved carbon dioxide at 1.2, with the lungs setting the small member within seconds and the kidneys setting the large one over hours."
      caption="pH = 6.1 + log(24 / (0.03 × 40)) = 6.1 + 1.30 = 7.40. A 20:1 ratio 1.3 units off the pKa would be a poor closed buffer; it works because lungs and kidneys set the two members independently."
    >
      <ArrowDefs id="bb-arrow" />

      {/* The window the system is supposed to need, and does not. */}
      <rect
        x={xOf(BLOOD_PKA - 1)}
        y={railY - 22}
        width={xOf(BLOOD_PKA + 1) - xOf(BLOOD_PKA - 1)}
        height={44}
        fill="var(--fig-3)"
        fillOpacity={0.14}
      />
      <Note x={xOf(BLOOD_PKA)} y={railY - 28}>
        pKa′ ± 1, the usual useful range
      </Note>

      <line x1={x0} y1={railY} x2={x0 + w} y2={railY} stroke="var(--fig-axis)" strokeWidth={1.5} />
      {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5].map((p) => (
        <g key={p}>
          <line
            x1={xOf(p)}
            y1={railY}
            x2={xOf(p)}
            y2={railY + 4}
            stroke="var(--fig-axis)"
            strokeWidth={1}
          />
          <text
            x={xOf(p)}
            y={railY + 15}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {p.toFixed(1)}
          </text>
        </g>
      ))}
      <text x={x0} y={railY + 27} className="fill-muted-foreground" fontSize={9}>
        pH
      </text>

      <circle cx={xOf(BLOOD_PKA)} cy={railY} r={3.5} fill="var(--fig-3)" />
      <text
        x={xOf(BLOOD_PKA)}
        y={railY - 8}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        pKa′ 6.10
      </text>
      <circle cx={xOf(BLOOD_PH)} cy={railY} r={3.5} fill="var(--fig-1)" />
      <text
        x={xOf(BLOOD_PH)}
        y={railY - 8}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        blood {BLOOD_PH.toFixed(2)}
      </text>
      <line
        x1={xOf(BLOOD_PKA)}
        y1={railY + 26}
        x2={xOf(BLOOD_PH)}
        y2={railY + 26}
        stroke="var(--fig-1)"
        strokeWidth={1}
        markerEnd="url(#bb-arrow)"
      />
      <Note x={(xOf(BLOOD_PKA) + xOf(BLOOD_PH)) / 2} y={railY + 38}>
        +{(BLOOD_PH - BLOOD_PKA).toFixed(2)} = log 20
      </Note>

      {/* The lopsided reservoir that the log of 20 comes from. */}
      {[
        {
          label: "HCO₃⁻",
          value: BLOOD_HCO3,
          unit: "24 mM",
          who: "kidneys reset this over hours",
          color: "var(--fig-2)",
          row: 0,
        },
        {
          label: "CO₂(aq)",
          value: BLOOD_CO2,
          unit: "1.2 mM  (0.03 × 40 mmHg)",
          who: "lungs reset this in seconds",
          color: "var(--fig-1)",
          row: 1,
        },
      ].map((b) => {
        const y = barTop + b.row * barGap;
        return (
          <g key={b.label}>
            <text
              x={barX - 8}
              y={y + 13}
              textAnchor="end"
              className="fill-foreground"
              fontSize={9}
              fontWeight={600}
            >
              {b.label}
            </text>
            <rect
              x={barX}
              y={y}
              width={wOf(b.value)}
              height={barH}
              fill={b.color}
              stroke={b.color}
              strokeWidth={1}
            />
            <text
              x={barX + wOf(b.value) + 6}
              y={y + 13}
              className="fill-muted-foreground"
              fontSize={9}
            >
              {b.unit}
            </text>
            <text
              x={barX}
              y={b.row === 0 ? y - 6 : y + barH + 12}
              className="fill-muted-foreground"
              fontSize={9}
            >
              {b.who}
            </text>
          </g>
        );
      })}
      <Note x={barX + barW / 2} y={barTop + barGap + barH + 30}>
        the base member outnumbers the acid 20 to 1
      </Note>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */

/**
 * The Deep Dive tier argues that dG < 0 is not a second criterion sitting
 * beside the second law -- it IS the second law, rewritten so an
 * experimentalist who never measures anything outside the flask can still
 * apply it. The AP tier's microstate count cannot carry that; it is an
 * identity, so it is drawn as one.
 */
function GibbsIsSecondLaw() {
  const rows: { tex: string; note?: string }[] = [
    { tex: "ΔS_universe = ΔS_system + ΔS_surroundings", note: "the second law, as stated" },
    { tex: "ΔS_surroundings = −ΔH / T", note: "heat −ΔH into a reservoir too large to warm" },
    { tex: "ΔS_universe = ΔS_system − ΔH / T", note: "substitute" },
    { tex: "−T ΔS_universe = ΔH − T ΔS_system", note: "multiply by −T — the inequality flips" },
    { tex: "ΔG = −T ΔS_universe", note: "and the right-hand side is ΔG" },
  ];
  const H = 40 + rows.length * 34 + 66;
  return (
    <Figure
      viewBox={`0 0 460 ${H}`}
      alt="A five-step identity showing that the Gibbs free energy change equals minus temperature times the entropy change of the universe. Starting from the second law, substituting the surroundings' entropy change as minus enthalpy over temperature, and multiplying by minus temperature turns a statement about the universe into one about the system alone."
      caption="ΔG is not a second criterion beside the second law — it is the second law, rewritten in system-only terms. The substitution holds only at constant T and P."
    >
      <ArrowDefs id="gsl-arrow" color="var(--fig-axis)" />
      <text x={16} y={20} fontSize={9} letterSpacing="0.08em" className="fill-muted-foreground">
        ABOUT THE UNIVERSE
      </text>
      <text
        x={444}
        y={20}
        textAnchor="end"
        fontSize={9}
        letterSpacing="0.08em"
        className="fill-muted-foreground"
      >
        ABOUT THE SYSTEM ONLY
      </text>
      {rows.map((r, i) => {
        const y = 44 + i * 34;
        const last = i === rows.length - 1;
        return (
          <g key={r.tex}>
            {i > 0 && (
              <line
                x1={30}
                y1={y - 24}
                x2={30}
                y2={y - 10}
                stroke="var(--fig-axis)"
                strokeWidth={1}
                markerEnd="url(#gsl-arrow)"
              />
            )}
            <text
              x={44}
              y={y}
              fontSize={12}
              fontWeight={last ? 700 : 500}
              fill={last ? "var(--fig-1)" : "var(--foreground)"}
            >
              {r.tex}
            </text>
            {r.note && (
              <text x={44} y={y + 13} fontSize={8.5} className="fill-muted-foreground">
                {r.note}
              </text>
            )}
          </g>
        );
      })}
      <rect
        x={16}
        y={H - 48}
        width={428}
        height={34}
        rx={5}
        fill="none"
        stroke="var(--border)"
        strokeWidth={1}
      />
      <text x={30} y={H - 33} fontSize={9} className="fill-muted-foreground">
        Valid at constant T and P only. At constant T and V the matching function is the
      </text>
      <text x={30} y={H - 21} fontSize={9} className="fill-muted-foreground">
        Helmholtz energy A = U − TS, and ΔG stops being a spontaneity test.
      </text>
    </Figure>
  );
}

/**
 * Why a buffer's pH survives dilution and a strong acid's does not. Both
 * columns are computed: the buffer from Henderson-Hasselbalch with the ratio
 * held at 1:1 (so pH = pKa at every dilution), the strong acid from
 * pH = -log[H3O+] directly. The capacity bar is what dilution actually costs.
 */
function BufferRatioInvariance() {
  const pKa = 4.74;
  const steps = [
    { label: "as made", factor: 1 },
    { label: "diluted 10×", factor: 10 },
    { label: "diluted 100×", factor: 100 },
  ];
  const C0 = 0.1; // M, of each buffer component
  const A0 = 0.1; // M strong acid
  const bufferPH = () => pKa; // ratio [A-]/[HA] is unchanged by dilution
  const acidPH = (f: number) => -Math.log10(A0 / f);

  const PX = 92,
    PY = 26,
    PW = 300,
    PH = 132;
  const yOf = (pH: number) => PY + PH - (pH / 14) * PH;
  const xOf = (i: number) => PX + (i + 0.5) * (PW / steps.length);

  return (
    <Figure
      viewBox="0 0 460 236"
      alt="A buffer and a strong acid, each diluted ten-fold and then a hundred-fold. The buffer's pH stays at 4.74 throughout because dilution does not change the ratio of conjugate base to acid. The strong acid's pH climbs from 1 to 2 to 3, one unit per ten-fold dilution. Bars beneath show the buffer's capacity falling even though its pH does not."
      caption="Dilution does not change [A⁻]/[HA], so it does not change a buffer's pH — but it does drain its capacity. A strong acid has no ratio to preserve and moves a full unit per ten-fold."
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        yLabel="pH"
        yTicks={[0, 7, 14].map((v) => ({ at: v / 14, label: String(v) }))}
      />
      <line
        x1={PX}
        y1={yOf(7)}
        x2={PX + PW}
        y2={yOf(7)}
        stroke="var(--fig-grid)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />

      {/* buffer: flat */}
      <path
        d={steps.map((_, i) => `${i === 0 ? "M" : "L"}${xOf(i)},${yOf(bufferPH())}`).join(" ")}
        fill="none"
        stroke="var(--fig-2)"
        strokeWidth={2}
      />
      {steps.map((_, i) => (
        <circle key={`b${i}`} cx={xOf(i)} cy={yOf(bufferPH())} r={4} fill="var(--fig-2)" />
      ))}

      {/* strong acid: one unit per decade */}
      <path
        d={steps
          .map((s, i) => `${i === 0 ? "M" : "L"}${xOf(i)},${yOf(acidPH(s.factor))}`)
          .join(" ")}
        fill="none"
        stroke="var(--fig-1)"
        strokeWidth={2}
      />
      {steps.map((s, i) => (
        <g key={`a${i}`}>
          <circle cx={xOf(i)} cy={yOf(acidPH(s.factor))} r={4} fill="var(--fig-1)" />
          <text
            x={xOf(i)}
            y={yOf(acidPH(s.factor)) - 9}
            textAnchor="middle"
            fontSize={9}
            className="fill-foreground"
          >
            {acidPH(s.factor).toFixed(2)}
          </text>
        </g>
      ))}
      <text
        x={xOf(1) + 18}
        y={yOf(bufferPH()) - 10}
        textAnchor="middle"
        fontSize={9}
        className="fill-foreground"
      >
        {bufferPH().toFixed(2)} at every dilution
      </text>

      {/* Labels sit clear of both lines: the buffer's above its own flat
          trace, the acid's below its first point, neither near the value
          callouts. */}
      <SeriesLabel x={PX + 8} y={yOf(bufferPH()) - 16} color="var(--fig-2)">
        buffer (1:1 acetate)
      </SeriesLabel>
      <SeriesLabel x={PX + 8} y={yOf(3.3)} color="var(--fig-1)">
        strong acid
      </SeriesLabel>

      {steps.map((s, i) => (
        <text
          key={`x${i}`}
          x={xOf(i)}
          y={PY + PH + 15}
          textAnchor="middle"
          fontSize={9}
          className="fill-muted-foreground"
        >
          {s.label}
        </text>
      ))}

      {/* capacity, which dilution does destroy */}
      <Note x={PX - 8} y={PY + PH + 42} anchor="end">
        capacity
      </Note>
      {steps.map((s, i) => {
        const w = (PW / steps.length) * 0.44;
        const full = 26;
        const h = Math.max(2, full * (C0 / s.factor / C0));
        return (
          <g key={`c${i}`}>
            <rect
              x={xOf(i) - w / 2}
              y={PY + PH + 30}
              width={w}
              height={full}
              fill="none"
              stroke="var(--border)"
              strokeWidth={1}
            />
            <rect
              x={xOf(i) - w / 2}
              y={PY + PH + 30 + (full - h)}
              width={w}
              height={h}
              fill="var(--fig-2)"
              opacity={0.45}
            />
          </g>
        );
      })}
      <Note x={PX + PW / 2} y={PY + PH + 74}>
        same pH, less ability to hold it
      </Note>
    </Figure>
  );
}

export const equilibriumFigures = {
  "thermo-microstate-count": MicrostateCount,
  "thermo-spontaneity-quadrant": SpontaneityQuadrant,
  "thermo-free-energy-well": FreeEnergyWell,
  "thermo-dg-is-second-law": GibbsIsSecondLaw,
  "acid-conjugate-seesaw": ConjugateSeesaw,
  "acid-levelling-window": LevellingWindow,
  "acid-titration-strong-vs-weak": TitrationStrongVsWeak,
  "acid-polyprotic-titration": PolyproticTitration,
  "acid-ph-scale-populated": PHScalePopulated,
  "buffer-absorbs-base": BufferAbsorbsBase,
  "buffer-capacity-curve": BufferCapacityCurve,
  "buffer-blood-bicarbonate": BloodBicarbonate,
  "buffer-ratio-invariance": BufferRatioInvariance,
} satisfies Record<string, FigureDef>;

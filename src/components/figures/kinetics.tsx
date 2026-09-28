import { ArrowDefs, Axes, Figure, Note, SeriesLabel, pathFrom, type FigureDef } from "./Figure";

/**
 * Diagrams for the kinetics lessons. Keys are referenced from the lesson data by
 * the `figure` field on a theory block; see Figure.tsx for the contract.
 *
 * Two kinds of drawing live here and they follow different rules.
 *
 * Anything with a numeric axis -- the linearised plots, the decay curves, the
 * half-life panels, the Lindemann fall-off, the Arrhenius line -- is sampled
 * from the real integrated rate law or the real Arrhenius expression, with the
 * rate constants written out as named constants so the numbers can be checked.
 *
 * Energy profiles are genuinely qualitative: nobody measures the height of a
 * transition state off a textbook diagram. Those are drawn as schematics with
 * no numeric energy axis, but the *relative* barrier heights are kept honest,
 * because the relative heights are the whole content of the picture.
 */

/* ---------------------------------------------------------------------- */
/* Shared helpers                                                          */
/* ---------------------------------------------------------------------- */

type Pt = { x: number; y: number };

/**
 * Smooth curve through a list of stationary points, for energy profiles.
 *
 * Cosine interpolation between consecutive control points gives a curve whose
 * tangent is horizontal at every control point -- which is exactly the physics:
 * a reactant plateau, a transition state and an intermediate well are all
 * stationary points on the reaction coordinate. Straight segments or a generic
 * spline would put the maxima and minima in the wrong places.
 */
function smoothProfile(pts: Pt[], per = 28): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const last = i === pts.length - 2;
    const steps = last ? per : per - 1;
    for (let j = 0; j <= steps; j++) {
      const t = j / per;
      const s = (1 - Math.cos(Math.PI * t)) / 2;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * s });
    }
  }
  return out;
}

/** Tick label with a typographic minus rather than a hyphen. */
function num(v: number): string {
  return v < 0 ? `−${Math.abs(v)}` : String(v);
}

/** Maps a profile given in fractional (position, energy) coordinates to pixels. */
function profilePx(
  levels: { at: number; e: number }[],
  box: { x: number; y: number; w: number; h: number },
): Pt[] {
  return smoothProfile(
    levels.map((l) => ({ x: box.x + l.at * box.w, y: box.y + box.h - l.e * box.h })),
  );
}

/* ---------------------------------------------------------------------- */
/* Rate laws                                                               */
/* ---------------------------------------------------------------------- */

/**
 * The linearised-plot test, as small multiples.
 *
 * All three curves are computed from the integrated rate laws for the same
 * starting concentration, with the three rate constants chosen so that every
 * run reaches the same concentration at the same time. That makes the panels a
 * fair test: the curves are forced to share both endpoints, so the only thing
 * distinguishing them in any panel is the shape between -- and in each panel
 * exactly one of them is a straight line.
 */
function LinearizedPlots() {
  const A0 = 1.0; // M
  const T = 8; // s, the length of the run
  // Chosen so [A](T) = 0.20 M for all three orders.
  const k0 = 0.1; // M s^-1   zero order   [A] = [A]0 - k t
  const k1 = Math.log(5) / T; // s^-1      first order  [A] = [A]0 e^-kt
  const k2 = 0.5; // M^-1 s^-1 second order 1/[A] = 1/[A]0 + k t

  const conc = [
    { key: "zero", label: "zero order", color: "var(--fig-3)", f: (t: number) => A0 - k0 * t },
    {
      key: "first",
      label: "first order",
      color: "var(--fig-1)",
      f: (t: number) => A0 * Math.exp(-k1 * t),
    },
    {
      key: "second",
      label: "second order",
      color: "var(--fig-2)",
      f: (t: number) => 1 / (1 / A0 + k2 * t),
    },
  ];

  // Each panel plots a different function of [A]; exactly one order is linear
  // in each, and that is the order the panel identifies.
  const panels = [
    {
      title: "[A] vs t",
      g: (a: number) => a,
      lo: 0,
      hi: 1.0,
      ticks: ["0", "1.0"],
      straight: "zero",
    },
    {
      title: "ln[A] vs t",
      g: (a: number) => Math.log(a),
      lo: -1.8,
      hi: 0,
      ticks: ["−1.8", "0"],
      straight: "first",
    },
    {
      title: "1/[A] vs t",
      g: (a: number) => 1 / a,
      lo: 0,
      hi: 5,
      ticks: ["0", "5"],
      straight: "second",
    },
  ];

  const PY = 52,
    PH = 112,
    PW = 112;
  const PXS = [46, 206, 366];
  const N = 90;

  return (
    <Figure
      viewBox="0 0 520 228"
      alt="Three plots of the same three simulated runs: concentration against time, natural log of concentration against time, and reciprocal concentration against time. The zero-order run is a straight line only in the first plot, the first-order run only in the second, and the second-order run only in the third."
      caption="One run per order, all starting at 1.00 M and all reaching 0.20 M at 8 s. Each transformation straightens exactly one of them — that is the order test, and the slope of the straight line is k."
    >
      {conc.map((c, i) => (
        <SeriesLabel key={c.key} x={46 + i * 132} y={20} color={c.color}>
          {c.label}
        </SeriesLabel>
      ))}

      {panels.map((p, pi) => {
        const PX = PXS[pi]!;
        const yOf = (v: number) => PY + PH - ((v - p.lo) / (p.hi - p.lo)) * PH;
        return (
          <g key={p.title}>
            <Axes
              x={PX}
              y={PY}
              w={PW}
              h={PH}
              xTicks={[
                { at: 0, label: "0" },
                { at: 1, label: "8" },
              ]}
              yTicks={[
                { at: 0, label: p.ticks[0]! },
                { at: 1, label: p.ticks[1]! },
              ]}
            />
            <Note x={PX + PW / 2} y={PY - 12}>
              {p.title}
            </Note>
            {conc.map((c) => {
              const pts: Pt[] = [];
              for (let j = 0; j <= N; j++) {
                const t = (T * j) / N;
                pts.push({ x: PX + (t / T) * PW, y: yOf(p.g(c.f(t))) });
              }
              const isStraight = c.key === p.straight;
              return (
                <path
                  key={c.key}
                  d={pathFrom(pts)}
                  fill="none"
                  stroke={c.color}
                  strokeWidth={isStraight ? 2.2 : 1.1}
                />
              );
            })}
            <Note x={PX + PW / 2} y={PY + PH + 30}>
              straight: {panels[pi]!.straight} order
            </Note>
          </g>
        );
      })}

      <Note x={260} y={218}>
        time (s)
      </Note>
    </Figure>
  );
}

/**
 * What the three integrated laws actually look like as histories.
 *
 * Here the runs are matched on *initial rate* rather than on endpoint, which is
 * the fair comparison for "same starting conditions, different order": all
 * three lose reactant at 0.10 M/s at t = 0 and then diverge completely. Zero
 * order keeps that rate until the reactant is gone and stops dead at
 * t = [A]0/k; second order slows continuously and still has almost half its
 * reactant left when the zero-order run has finished.
 */
function IntegratedDecay() {
  const A0 = 1.0; // M
  const RATE0 = 0.1; // M s^-1, shared initial rate
  const k0 = RATE0; // M s^-1
  const k1 = RATE0 / A0; // s^-1
  const k2 = RATE0 / (A0 * A0); // M^-1 s^-1
  const TMAX = 12;
  const tStop = A0 / k0; // 10 s: zero order runs out of reactant here

  const PX = 48,
    PY = 16,
    PW = 296,
    PH = 148;
  const xOf = (t: number) => PX + (t / TMAX) * PW;
  const yOf = (a: number) => PY + PH - (a / A0) * PH;
  const sample = (f: (t: number) => number, tEnd: number) => {
    const pts: Pt[] = [];
    for (let j = 0; j <= 100; j++) {
      const t = (tEnd * j) / 100;
      pts.push({ x: xOf(t), y: yOf(f(t)) });
    }
    return pts;
  };

  const zero = sample((t) => A0 - k0 * t, tStop);
  const first = sample((t) => A0 * Math.exp(-k1 * t), TMAX);
  const second = sample((t) => 1 / (1 / A0 + k2 * t), TMAX);

  return (
    <Figure
      viewBox="0 0 450 214"
      alt="Concentration against time for zero, first and second order runs that all begin at one molar and all lose reactant at the same initial rate. The zero-order line falls steadily and reaches zero at ten seconds; the first-order curve decays exponentially and the second-order curve slows the most, leaving the largest amount of reactant at the end."
      caption="Same [A]₀, same initial rate, three orders. The zero-order run holds its rate to the end and stops abruptly at t = [A]₀/k; the second-order run slows continuously and leaves the longest tail."
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        xLabel="time (s)"
        yLabel="[A]  (M)"
        xTicks={[0, 4, 8, 12].map((v) => ({ at: v / TMAX, label: String(v) }))}
        yTicks={[
          { at: 0, label: "0" },
          { at: 0.5, label: "0.5" },
          { at: 1, label: "1.0" },
        ]}
      />

      <path d={pathFrom(second)} fill="none" stroke="var(--fig-2)" strokeWidth={2} />
      <path d={pathFrom(first)} fill="none" stroke="var(--fig-1)" strokeWidth={2} />
      <path d={pathFrom(zero)} fill="none" stroke="var(--fig-3)" strokeWidth={2} />

      {/* The abrupt stop is the diagnostic feature of a zero-order run. */}
      <circle cx={xOf(tStop)} cy={yOf(0)} r={3.5} fill="var(--fig-3)" />
      <Note x={xOf(tStop) + 4} y={yOf(0) - 8} anchor="start">
        stops dead
      </Note>

      <SeriesLabel x={xOf(2.2)} y={yOf(0.86)} color="var(--fig-3)">
        zero order
      </SeriesLabel>
      <SeriesLabel x={xOf(TMAX) + 8} y={yOf(0.301) + 4} color="var(--fig-1)">
        first order
      </SeriesLabel>
      <SeriesLabel x={xOf(TMAX) + 8} y={yOf(0.455)} color="var(--fig-2)">
        second order
      </SeriesLabel>
    </Figure>
  );
}

/**
 * Successive half-lives, the order test that needs no plotting.
 *
 * Every panel is computed from its integrated law and every run is tuned to the
 * same *first* half-life of 10 s, so the first interval carries no information
 * and the divergence afterwards is the entire finding: constant, doubling,
 * halving. The panels share one time axis, which is why the zero-order run
 * visibly finishes before the second-order run has reached a quarter.
 */
function HalfLifeByOrder() {
  const A0 = 1.0;
  const THALF = 10; // s, the shared first half-life
  const k0 = A0 / (2 * THALF); // zero:   t1/2 = [A]0 / 2k
  const k1 = Math.log(2) / THALF; // first:  t1/2 = ln2 / k
  const k2 = 1 / (THALF * A0); // second: t1/2 = 1 / k[A]0
  const TMAX = 70;

  const rows = [
    {
      key: "zero",
      color: "var(--fig-3)",
      f: (t: number) => Math.max(0, A0 - k0 * t),
      tEnd: A0 / k0, // 20 s
      // 1/2 at 10 s, then 1/4 at 15 s, then 1/8 at 17.5 s
      marks: [10, 15, 17.5],
      label: "zero order — 10, 5, 2.5 s: each half-life halves",
    },
    {
      key: "first",
      color: "var(--fig-1)",
      f: (t: number) => A0 * Math.exp(-k1 * t),
      tEnd: TMAX,
      marks: [10, 20, 30],
      label: "first order — 10, 10, 10 s: constant",
    },
    {
      key: "second",
      color: "var(--fig-2)",
      f: (t: number) => 1 / (1 / A0 + k2 * t),
      tEnd: TMAX,
      marks: [10, 30, 70],
      label: "second order — 10, 20, 40 s: each half-life doubles",
    },
  ];

  const PX = 46,
    PW = 336,
    PH = 62;
  const tops = [30, 118, 206];

  return (
    <Figure
      viewBox="0 0 450 300"
      alt="Three stacked decay curves sharing one time axis, each tuned to the same first half-life of ten seconds. The zero-order run then halves faster and faster and finishes at twenty seconds, the first-order run keeps a constant ten second half-life, and the second-order run takes ten, then twenty, then forty seconds for successive halvings."
      caption="All three are tuned to the same first half-life, so only what happens afterwards is informative: constant means first order, doubling means second, halving means zero."
    >
      {rows.map((r, i) => {
        const PY = tops[i]!;
        const xOf = (t: number) => PX + (t / TMAX) * PW;
        const yOf = (a: number) => PY + PH - (a / A0) * PH;
        const pts: Pt[] = [];
        for (let j = 0; j <= 120; j++) {
          const t = (r.tEnd * j) / 120;
          pts.push({ x: xOf(t), y: yOf(r.f(t)) });
        }
        const bottom = i === 2;
        return (
          <g key={r.key}>
            <Axes
              x={PX}
              y={PY}
              w={PW}
              h={PH}
              {...(bottom ? { xLabel: "time (s)" } : {})}
              xTicks={
                bottom ? [0, 20, 40, 60].map((v) => ({ at: v / TMAX, label: String(v) })) : []
              }
              yTicks={[
                { at: 0.5, label: "½" },
                { at: 1, label: "1" },
              ]}
            />
            {/* Quarter and eighth guides: unlabelled, so the drops read as a ladder. */}
            {[0.25, 0.125].map((f) => (
              <line
                key={f}
                x1={PX}
                y1={yOf(f)}
                x2={PX + PW}
                y2={yOf(f)}
                stroke="var(--fig-grid)"
                strokeWidth={1}
              />
            ))}
            <path d={pathFrom(pts)} fill="none" stroke={r.color} strokeWidth={2} />
            {r.marks.map((t, mi) => (
              <g key={t}>
                <line
                  x1={xOf(t)}
                  y1={yOf(A0 / Math.pow(2, mi + 1))}
                  x2={xOf(t)}
                  y2={yOf(0)}
                  stroke={r.color}
                  strokeWidth={1}
                  strokeDasharray="2 3"
                />
                <circle cx={xOf(t)} cy={yOf(A0 / Math.pow(2, mi + 1))} r={2.8} fill={r.color} />
              </g>
            ))}
            <circle cx={PX + 6} cy={PY - 9} r={3.5} fill={r.color} />
            <text
              x={PX + 14}
              y={PY - 6}
              className="fill-foreground"
              fontSize={9.5}
              fontWeight={600}
            >
              {r.label}
            </text>
          </g>
        );
      })}
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */
/* Reaction mechanisms                                                     */
/* ---------------------------------------------------------------------- */

/**
 * The two-barrier energy profile: what an intermediate actually is.
 *
 * Schematic by design -- there is no honest number to put on the energy axis --
 * but the relative heights carry the argument. The intermediate sits in a local
 * minimum, so it has a real if short lifetime; the two transition states sit at
 * maxima, so they have none. The first barrier is drawn taller, which makes
 * step 1 rate-determining.
 */
function IntermediateProfile() {
  const BOX = { x: 44, y: 34, w: 366, h: 138 };
  const levels = [
    { at: 0.02, e: 0.3 },
    { at: 0.27, e: 0.94 },
    { at: 0.5, e: 0.46 },
    { at: 0.73, e: 0.72 },
    { at: 0.98, e: 0.12 },
  ];
  const px = (l: { at: number; e: number }) => ({
    x: BOX.x + l.at * BOX.w,
    y: BOX.y + BOX.h - l.e * BOX.h,
  });
  const R = px(levels[0]!),
    TS1 = px(levels[1]!),
    IM = px(levels[2]!),
    TS2 = px(levels[3]!),
    P = px(levels[4]!);

  return (
    <Figure
      viewBox="0 0 450 220"
      alt="A schematic energy profile with two humps and a dip between them. The first hump is the taller of the two and is marked as the rate-determining step; the dip between them is the intermediate, a real minimum, while each hump top is a transition state with no lifetime at all."
      caption="Two elementary steps, two transition states, one intermediate. The intermediate is a minimum — it exists; a transition state is a maximum — it does not. The taller barrier throttles the sequence."
    >
      <ArrowDefs id="ipArrow" color="var(--fig-2)" />
      <Axes x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} xLabel="reaction coordinate" />
      <text
        x={-(BOX.y + BOX.h / 2)}
        y={BOX.x - 30}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        free energy (schematic)
      </text>

      {/* Activation energy of the rate-determining step. */}
      <line
        x1={R.x}
        y1={R.y}
        x2={TS1.x + 30}
        y2={R.y}
        stroke="var(--fig-grid)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <line
        x1={TS1.x + 22}
        y1={R.y}
        x2={TS1.x + 22}
        y2={TS1.y}
        stroke="var(--fig-2)"
        strokeWidth={1.2}
        markerStart="url(#ipArrow)"
        markerEnd="url(#ipArrow)"
      />
      <Note x={TS1.x + 14} y={R.y - 6} anchor="end">
        Ea, step 1
      </Note>

      <path
        d={pathFrom(profilePx(levels, BOX))}
        fill="none"
        stroke="var(--fig-1)"
        strokeWidth={2}
      />

      <circle cx={IM.x} cy={IM.y} r={3.5} fill="var(--fig-1)" />
      <Note x={IM.x} y={IM.y + 16}>
        intermediate
      </Note>
      <Note x={TS1.x} y={TS1.y - 8}>
        ‡ TS 1
      </Note>
      <Note x={TS2.x} y={TS2.y - 8}>
        ‡ TS 2
      </Note>
      <Note x={R.x + 4} y={R.y + 16} anchor="start">
        reactants
      </Note>
      <Note x={P.x + 6} y={P.y + 15} anchor="end">
        products
      </Note>
      <text
        x={BOX.x + BOX.w}
        y={BOX.y - 12}
        textAnchor="end"
        className="fill-foreground"
        fontSize={9.5}
        fontWeight={600}
      >
        taller barrier = rate-determining step
      </text>
    </Figure>
  );
}

/**
 * The Lindemann fall-off, computed.
 *
 * Steady state on A* in A + M <=> A* + M, A* -> P gives an effective
 * first-order constant k_uni = k1 k2 [M] / (k-1[M] + k2). Dividing by its
 * high-pressure limit k_inf = k1 k2 / k-1 leaves a one-parameter curve,
 * k_uni/k_inf = [M] / ([M] + [M]half) with [M]half = k2 / k-1, so the whole
 * fall-off is a single computed function of log([M]/[M]half) with no fitted
 * constants at all. The low-pressure asymptote has slope 1 on log-log axes --
 * that is the second-order regime -- and the high-pressure asymptote is flat.
 */
function LindemannFalloff() {
  const PX = 56,
    PY = 18,
    PW = 314,
    PH = 142;
  const XLO = -2.5,
    XHI = 2.5,
    YLO = -2.6,
    YHI = 0.25;
  const xOf = (v: number) => PX + ((v - XLO) / (XHI - XLO)) * PW;
  const yOf = (v: number) => PY + PH - ((v - YLO) / (YHI - YLO)) * PH;

  // y = log10(k_uni / k_inf) = -log10(1 + 10^-x), x = log10([M]/[M]half).
  const curve: Pt[] = [];
  for (let i = 0; i <= 160; i++) {
    const x = XLO + ((XHI - XLO) * i) / 160;
    curve.push({ x: xOf(x), y: yOf(-Math.log10(1 + Math.pow(10, -x))) });
  }

  return (
    <Figure
      viewBox="0 0 450 214"
      alt="A log-log fall-off curve for a unimolecular gas reaction. At low pressure the curve follows a straight line of slope one, so the reaction is second order; at high pressure it flattens onto a plateau, so the reaction is first order. The bend sits where the deactivation rate equals the reaction rate of the energised molecule."
      caption="Steady state on A* gives one expression, k_uni = k₁k₂[M]/(k₋₁[M] + k₂), containing both observed regimes. Pre-equilibrium reproduces only the flat high-pressure end."
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        xLabel="log₁₀ ( [M] / [M]½ ),  [M]½ = k₂ / k₋₁"
        yLabel="log₁₀ ( k_uni / k∞ )"
        xTicks={[-2, -1, 0, 1, 2].map((v) => ({
          at: (v - XLO) / (XHI - XLO),
          label: num(v),
        }))}
        yTicks={[-2, -1, 0].map((v) => ({ at: (v - YLO) / (YHI - YLO), label: num(v) }))}
      />

      {/* Both asymptotes, so the two limiting orders can be read off as slopes. */}
      <line
        x1={xOf(XLO)}
        y1={yOf(XLO)}
        x2={xOf(-0.55)}
        y2={yOf(-0.55)}
        stroke="var(--fig-axis)"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <line
        x1={xOf(-0.9)}
        y1={yOf(0)}
        x2={xOf(XHI)}
        y2={yOf(0)}
        stroke="var(--fig-axis)"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <line x1={xOf(0)} y1={PY} x2={xOf(0)} y2={PY + PH} stroke="var(--fig-grid)" strokeWidth={1} />

      <path d={pathFrom(curve)} fill="none" stroke="var(--fig-1)" strokeWidth={2} />

      {/* Each limit is named where its asymptote runs, clear of the curve. */}
      <Note x={PX + 12} y={PY + 22} anchor="start">
        slope 1: second order
      </Note>
      <Note x={PX + 12} y={PY + 34} anchor="start">
        rate = k₁[A][M]
      </Note>
      <Note x={xOf(2.45)} y={PY + 34} anchor="end">
        slope 0: first order
      </Note>
      <Note x={xOf(2.45)} y={PY + 46} anchor="end">
        rate = k∞[A]
      </Note>
      <Note x={xOf(0) + 6} y={yOf(-2.35)} anchor="start">
        k₋₁[M] = k₂
      </Note>
    </Figure>
  );
}

/**
 * The Arrhenius plot, computed from k = A e^(-Ea/RT).
 *
 * Ea = 100 kJ/mol and A = 1e13 s^-1 are ordinary values for a gas-phase
 * reaction. The line is straight because ln k is exactly linear in 1/T, which
 * is the point of the plot: its slope is -Ea/R and nothing else has to be
 * known to extract an activation energy from rate data.
 */
function ArrheniusPlot() {
  const EA = 100_000; // J/mol
  const PRE = 1e13; // s^-1
  const R = 8.314; // J/(mol K)
  const lnK = (T: number) => Math.log(PRE) - EA / (R * T);

  const PX = 56,
    PY = 18,
    PW = 300,
    PH = 142;
  const XLO = 1.9,
    XHI = 3.45; // 1000/T, K^-1
  const YLO = -12,
    YHI = 8;
  const xOf = (invT: number) => PX + ((invT - XLO) / (XHI - XLO)) * PW;
  const yOf = (v: number) => PY + PH - ((v - YLO) / (YHI - YLO)) * PH;

  const pts: Pt[] = [];
  for (let i = 0; i <= 80; i++) {
    const T = 300 + (200 * i) / 80;
    pts.push({ x: xOf(1000 / T), y: yOf(lnK(T)) });
  }
  const hot = { T: 500, x: xOf(1000 / 500), y: yOf(lnK(500)) };
  const cold = { T: 300, x: xOf(1000 / 300), y: yOf(lnK(300)) };
  // The rise-over-run a measurement actually reads off the line. Both are
  // magnitudes; the sign lives in the slope, which is quoted separately.
  const run = Math.abs(1000 / 500 - 1000 / 300); // in 10^-3 K^-1
  const fall = Math.abs(lnK(500) - lnK(300));
  const slopeK = EA / R; // -Ea/R in K, quoted as a magnitude with a sign
  const foldRise = Math.exp(fall);

  return (
    <Figure
      viewBox="0 0 450 214"
      alt="Natural log of the rate constant plotted against reciprocal temperature for an activation energy of one hundred kilojoules per mole. The points fall on an exactly straight line of negative slope, and over the plotted range from three hundred to five hundred kelvin the rate constant rises by about seven orders of magnitude."
      caption="k = Ae^(−Ea/RT) with Ea = 100 kJ mol⁻¹, A = 10¹³ s⁻¹. ln k is exactly linear in 1/T, slope −Ea/R = −1.20 × 10⁴ K — which is how an activation energy is measured."
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        xLabel="1 / T   ( 10⁻³ K⁻¹ )"
        yLabel="ln k"
        xTicks={[2.0, 2.5, 3.0].map((v) => ({
          at: (v - XLO) / (XHI - XLO),
          label: v.toFixed(1),
        }))}
        yTicks={[-10, -5, 0, 5].map((v) => ({ at: (v - YLO) / (YHI - YLO), label: num(v) }))}
      />

      {/* Slope triangle, placed in the empty corner under the line. */}
      <line
        x1={hot.x}
        y1={cold.y}
        x2={cold.x}
        y2={cold.y}
        stroke="var(--fig-grid)"
        strokeWidth={1}
      />
      <line x1={hot.x} y1={hot.y} x2={hot.x} y2={cold.y} stroke="var(--fig-grid)" strokeWidth={1} />
      <Note x={hot.x + 10} y={PY + PH - 50} anchor="start">
        run = {run.toFixed(2)} × 10⁻³ K⁻¹
      </Note>
      <Note x={hot.x + 10} y={PY + PH - 38} anchor="start">
        fall = {fall.toFixed(1)} in ln k
      </Note>
      <Note x={hot.x + 10} y={PY + PH - 26} anchor="start">
        slope = −Ea/R = −{slopeK.toFixed(0)} K
      </Note>

      <path d={pathFrom(pts)} fill="none" stroke="var(--fig-1)" strokeWidth={2} />
      <circle cx={hot.x} cy={hot.y} r={3.5} fill="var(--fig-1)" />
      <circle cx={cold.x} cy={cold.y} r={3.5} fill="var(--fig-1)" />
      <Note x={hot.x + 5} y={hot.y - 9} anchor="start">
        500 K
      </Note>
      <Note x={cold.x + 5} y={cold.y + 5} anchor="start">
        300 K
      </Note>
      <text
        x={PX + PW}
        y={PY + 30}
        textAnchor="end"
        className="fill-foreground"
        fontSize={9.5}
        fontWeight={600}
      >
        k rises {(foldRise / 1e6).toFixed(1)} × 10⁶ fold over these 200 K
      </text>
    </Figure>
  );
}

/**
 * What a catalyst does, and what it cannot do.
 *
 * Both routes are drawn from the same reactant level to the same product level,
 * because that is the constraint: a catalyst changes the path between two fixed
 * endpoints. The catalysed route is not the same hump made shorter -- it has a
 * different number of steps and an intermediate of its own -- and because the
 * endpoints are untouched, ΔG and therefore K are untouched too.
 */
function CatalysedPath() {
  const BOX = { x: 44, y: 34, w: 344, h: 136 };
  const E_R = 0.34,
    E_P = 0.1;
  const uncat = [
    { at: 0.02, e: E_R },
    { at: 0.5, e: 0.95 },
    { at: 0.98, e: E_P },
  ];
  const cat = [
    { at: 0.02, e: E_R },
    { at: 0.26, e: 0.62 },
    { at: 0.5, e: 0.44 },
    { at: 0.74, e: 0.58 },
    { at: 0.98, e: E_P },
  ];
  const yE = (e: number) => BOX.y + BOX.h - e * BOX.h;
  const xAt = (at: number) => BOX.x + at * BOX.w;

  return (
    <Figure
      viewBox="0 0 450 222"
      alt="Two energy profiles drawn between the same reactant and product levels. The uncatalysed route is a single tall hump; the catalysed route is a pair of lower humps with an intermediate between them, and its highest point lies below the uncatalysed maximum. The gap between reactants and products is identical for both."
      caption="A catalyst does not shorten the old hump — it supplies a different sequence of steps with its own intermediate. The reactant and product levels are untouched, so ΔG is untouched, so K cannot move."
    >
      <ArrowDefs id="catArrow" color="var(--fig-axis)" />
      <Axes x={BOX.x} y={BOX.y} w={BOX.w} h={BOX.h} xLabel="reaction coordinate" />
      <text
        x={-(BOX.y + BOX.h / 2)}
        y={BOX.x - 30}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        free energy (schematic)
      </text>

      {/* Endpoint levels, extended so the unchanged ΔG can be measured off them. */}
      {[E_R, E_P].map((e) => (
        <line
          key={e}
          x1={BOX.x}
          y1={yE(e)}
          x2={BOX.x + BOX.w + 14}
          y2={yE(e)}
          stroke="var(--fig-grid)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      ))}
      <line
        x1={BOX.x + BOX.w + 22}
        y1={yE(E_R)}
        x2={BOX.x + BOX.w + 22}
        y2={yE(E_P)}
        stroke="var(--fig-axis)"
        strokeWidth={1.2}
        markerStart="url(#catArrow)"
        markerEnd="url(#catArrow)"
      />
      <text
        x={BOX.x + BOX.w + 30}
        y={(yE(E_R) + yE(E_P)) / 2 + 3}
        className="fill-foreground"
        fontSize={9.5}
        fontWeight={600}
      >
        ΔG
      </text>

      <path d={pathFrom(profilePx(uncat, BOX))} fill="none" stroke="var(--fig-1)" strokeWidth={2} />
      <path d={pathFrom(profilePx(cat, BOX))} fill="none" stroke="var(--fig-2)" strokeWidth={2} />

      <circle cx={xAt(0.5)} cy={yE(0.44)} r={3.2} fill="var(--fig-2)" />
      <line
        x1={xAt(0.5)}
        y1={yE(0.44) + 5}
        x2={xAt(0.5)}
        y2={yE(0.44) + 19}
        stroke="var(--fig-2)"
        strokeWidth={1}
      />
      <Note x={xAt(0.5)} y={yE(0.44) + 28}>
        catalyst-bound intermediate
      </Note>

      <SeriesLabel x={xAt(0.5) + 12} y={yE(0.95) - 6} color="var(--fig-1)">
        uncatalysed: one step
      </SeriesLabel>
      <SeriesLabel x={xAt(0.04)} y={yE(0.17)} color="var(--fig-2)">
        catalysed: two steps
      </SeriesLabel>
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */
/* Organic mechanisms                                                      */
/* ---------------------------------------------------------------------- */

/**
 * SN2 in one frame: why backside, why a trigonal bipyramid, why inversion.
 *
 * The three are one fact. The acceptor orbital is σ*(C–X), whose large lobe
 * points directly away from X, so the only approach with good overlap is the
 * one 180° from the leaving group; pushing electron density into an antibonding
 * orbital forms the new bond and breaks the old one in the same motion; and
 * arriving from the far side leaves the other three substituents no option but
 * to sweep through the plane. The orbital is drawn with its two lobes in
 * opposite phase, which is what makes it antibonding.
 */
function Sn2Backside() {
  const CY = 74;
  // Stage 1 -- reactant with the acceptor orbital drawn in.
  const C1 = { x: 116, y: CY };
  // Stage 2 -- the transition state.
  const C2 = { x: 263, y: CY };
  // Stage 3 -- product, umbrella turned inside out.
  const C3 = { x: 410, y: CY };
  const spoke = (c: { x: number; y: number }, deg: number, r: number) => ({
    x: c.x + r * Math.cos((deg * Math.PI) / 180),
    y: c.y - r * Math.sin((deg * Math.PI) / 180),
  });
  /**
   * The third substituent lies on the Nu–C–X axis in this projection, so it is
   * drawn as a wedge rather than a line -- otherwise it reads as part of the
   * C–X bond and the carbon looks two-coordinate.
   */
  const wedge = (c: { x: number; y: number }, deg: number, r: number) => {
    const t = spoke(c, deg, r);
    const n = { x: -(t.y - c.y) / r, y: (t.x - c.x) / r };
    return `M${c.x},${c.y} L${t.x + n.x * 4},${t.y + n.y * 4} L${t.x - n.x * 4},${t.y - n.y * 4} Z`;
  };

  return (
    <Figure
      viewBox="0 0 490 172"
      alt="Three stages of an SN2 reaction. In the first the nucleophile approaches the carbon from the side directly opposite the leaving group, into the large lobe of the antibonding carbon–halogen orbital. In the second the carbon is flat with the nucleophile and the leaving group on opposite sides, a trigonal bipyramidal transition state. In the third the three remaining groups have swept through to the other side, so the configuration is inverted."
      caption="One motion, three consequences. The large lobe of σ*(C–X) points away from X, so attack is backside; donating into an antibonding orbital makes and breaks a bond at once; and the three spectator groups invert on the way through."
    >
      <ArrowDefs id="sn2Arrow" color="var(--fig-axis)" />

      {/* --- stage 1 --------------------------------------------------- */}
      {/* Antibonding orbital first, so the bonds are drawn over it. */}
      <ellipse
        cx={92}
        cy={CY}
        rx={26}
        ry={16}
        fill="var(--fig-pos)"
        fillOpacity={0.2}
        stroke="var(--fig-pos)"
        strokeWidth={1}
      />
      <ellipse
        cx={180}
        cy={CY}
        rx={9}
        ry={6.5}
        fill="var(--fig-neg)"
        fillOpacity={0.2}
        stroke="var(--fig-neg)"
        strokeWidth={1}
      />
      <Note x={92} y={CY - 22}>
        σ*(C–X)
      </Note>
      <line
        x1={34}
        y1={CY}
        x2={60}
        y2={CY}
        stroke="var(--fig-axis)"
        strokeWidth={1.2}
        strokeDasharray="3 3"
        markerEnd="url(#sn2Arrow)"
      />
      <text x={16} y={CY + 4} className="fill-foreground" fontSize={11} fontWeight={600}>
        Nu⁻
      </text>
      {[120, 240].map((a) => {
        const p = spoke(C1, a, 24);
        return (
          <line
            key={a}
            x1={C1.x}
            y1={C1.y}
            x2={p.x}
            y2={p.y}
            stroke="currentColor"
            strokeWidth={1.4}
          />
        );
      })}
      <path d={wedge(C1, 180, 24)} fill="currentColor" stroke="none" />
      <line x1={C1.x} y1={CY} x2={148} y2={CY} stroke="currentColor" strokeWidth={1.4} />
      <circle cx={C1.x} cy={CY} r={3} fill="currentColor" />
      <text x={154} y={CY + 4} className="fill-foreground" fontSize={11} fontWeight={600}>
        X
      </text>

      {/* --- stage 2: trigonal bipyramidal transition state -------------- */}
      <line
        x1={194}
        y1={CY}
        x2={206}
        y2={CY}
        stroke="var(--fig-axis)"
        strokeWidth={1.2}
        markerEnd="url(#sn2Arrow)"
      />
      <path
        d={`M218,36 L212,36 L212,120 L218,120`}
        fill="none"
        stroke="var(--fig-axis)"
        strokeWidth={1.2}
      />
      <path
        d={`M310,36 L316,36 L316,120 L310,120`}
        fill="none"
        stroke="var(--fig-axis)"
        strokeWidth={1.2}
      />
      <line
        x1={232}
        y1={CY}
        x2={256}
        y2={CY}
        stroke="var(--fig-2)"
        strokeWidth={1.6}
        strokeDasharray="3 3"
      />
      <line
        x1={270}
        y1={CY}
        x2={296}
        y2={CY}
        stroke="var(--fig-2)"
        strokeWidth={1.6}
        strokeDasharray="3 3"
      />
      <text x={228} y={CY + 4} textAnchor="end" className="fill-foreground" fontSize={10}>
        Nu
      </text>
      <text x={300} y={CY + 4} className="fill-foreground" fontSize={10}>
        X
      </text>
      {/* Three equatorial bonds, now coplanar and perpendicular to the axis. */}
      {[90, 210, 330].map((a) => {
        const p = spoke(C2, a, 27);
        return (
          <line
            key={a}
            x1={C2.x}
            y1={C2.y}
            x2={p.x}
            y2={p.y}
            stroke="currentColor"
            strokeWidth={1.4}
          />
        );
      })}
      <circle cx={C2.x} cy={CY} r={3} fill="currentColor" />
      <text x={322} y={44} className="fill-foreground" fontSize={11} fontWeight={600}>
        ‡
      </text>
      <Note x={263} y={136}>
        trigonal bipyramidal, 180° Nu–C–X
      </Note>

      {/* --- stage 3: inverted product ----------------------------------- */}
      <line
        x1={336}
        y1={CY}
        x2={354}
        y2={CY}
        stroke="var(--fig-axis)"
        strokeWidth={1.2}
        markerEnd="url(#sn2Arrow)"
      />
      <line x1={374} y1={CY} x2={C3.x} y2={CY} stroke="currentColor" strokeWidth={1.4} />
      <text
        x={370}
        y={CY + 4}
        textAnchor="end"
        className="fill-foreground"
        fontSize={11}
        fontWeight={600}
      >
        Nu
      </text>
      {[60, 300].map((a) => {
        const p = spoke(C3, a, 24);
        return (
          <line
            key={a}
            x1={C3.x}
            y1={C3.y}
            x2={p.x}
            y2={p.y}
            stroke="currentColor"
            strokeWidth={1.4}
          />
        );
      })}
      <path d={wedge(C3, 0, 24)} fill="currentColor" stroke="none" />
      <circle cx={C3.x} cy={CY} r={3} fill="currentColor" />

      <Note x={100} y={158}>
        attack 180° from X
      </Note>
      <Note x={408} y={158}>
        inverted — Walden
      </Note>
    </Figure>
  );
}

/**
 * Leaving-group ability on the one scale that explains it.
 *
 * Every value here is the pKa of the leaving group's conjugate acid, which is
 * the quantity the prose claims the trend tracks; putting them on a single axis
 * turns that claim into something you can read off. The seventeen-unit gap
 * between hydroxide and water is the reason an alcohol has to be protonated or
 * tosylated before it will substitute at all.
 */
function LeavingGroupPka() {
  const LO = -16,
    HI = 18;
  const AX = 34,
    AW = 396,
    AY = 112;
  const xOf = (p: number) => AX + ((p - LO) / (HI - LO)) * AW;

  // pKa of the conjugate acid. Species sit above the axis on two tiers so the
  // crowded halide/sulfonate region stays legible; the numeric scale runs
  // below, where nothing competes with it.
  const groups = [
    { name: "TfO⁻", pka: -14, far: true },
    { name: "I⁻", pka: -10, far: false },
    { name: "Cl⁻", pka: -7, far: true },
    { name: "TsO⁻", pka: -2.8, far: false },
    { name: "H₂O", pka: -1.7, far: true },
    { name: "HO⁻", pka: 15.7, far: false },
  ];

  return (
    <Figure
      viewBox="0 0 460 204"
      alt="Leaving groups placed on an axis of the pKa of their conjugate acid. Triflate, iodide and chloride sit far to the acidic left and are excellent leaving groups; hydroxide sits seventeen pKa units to the right and is a terrible one. Protonating hydroxide to water moves it almost the whole width of the scale."
      caption="Leaving-group ability is conjugate-base stability read off one axis: the weaker the base, the lower the pKa of its conjugate acid, the more willingly it goes."
    >
      <ArrowDefs id="lgArrow" color="var(--fig-2)" />
      <ArrowDefs id="lgAxisArrow" color="var(--fig-axis)" />

      <line
        x1={AX + 150}
        y1={30}
        x2={AX + 4}
        y2={30}
        stroke="var(--fig-axis)"
        strokeWidth={1.2}
        markerEnd="url(#lgAxisArrow)"
      />
      <Note x={AX + 4} y={46} anchor="start">
        better leaving group
      </Note>
      <Note x={AX + AW} y={46} anchor="end">
        stronger base — worse leaving group
      </Note>

      <line x1={AX} y1={AY} x2={AX + AW} y2={AY} stroke="var(--fig-axis)" strokeWidth={1.5} />
      {[-15, -10, -5, 0, 5, 10, 15].map((p) => (
        <g key={p}>
          <line
            x1={xOf(p)}
            y1={AY}
            x2={xOf(p)}
            y2={AY + 5}
            stroke="var(--fig-axis)"
            strokeWidth={1}
          />
          <text
            x={xOf(p)}
            y={AY + 17}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {num(p)}
          </text>
        </g>
      ))}
      <text
        x={AX + AW * 0.72}
        y={AY + 34}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={10}
      >
        pKa of the conjugate acid
      </text>

      {groups.map((g) => {
        const x = xOf(g.pka);
        const tip = g.far ? AY - 26 : AY - 8;
        return (
          <g key={g.name}>
            <line x1={x} y1={AY} x2={x} y2={tip} stroke="var(--fig-1)" strokeWidth={1.2} />
            <circle cx={x} cy={AY} r={3.2} fill="var(--fig-1)" />
            <text
              x={x}
              y={tip - 5}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={10}
              fontWeight={600}
            >
              {g.name}
            </text>
          </g>
        );
      })}

      {/* The protonation trick, drawn as the move it is. */}
      <path
        d={`M${xOf(15.7)},${AY + 26} C${xOf(15.7)},${AY + 62} ${xOf(-1.7)},${AY + 62} ${xOf(-1.7)},${AY + 24}`}
        fill="none"
        stroke="var(--fig-2)"
        strokeWidth={1.3}
        markerEnd="url(#lgArrow)"
      />
      <Note x={xOf(7)} y={AY + 78}>
        protonate: HO⁻ becomes H₂O, 17 pKa units better
      </Note>
    </Figure>
  );
}

/**
 * The carbocation stability ladder, with the reason attached.
 *
 * Energies are schematic -- the ladder has no numeric axis -- but the count
 * beside each rung is not: it is the number of C–H bonds on carbons adjacent to
 * the cationic centre, which is the number of σ(C–H) donors that can overlap
 * the empty p orbital. Nought, three, six, nine. That count is the mechanism
 * behind the ordering, so it is drawn next to the ordering.
 */
function CarbocationStability() {
  const LX = 46,
    LY = 30,
    LH = 132;
  const yOf = (e: number) => LY + LH - e * LH;
  const rungs = [
    { name: "CH₃⁺", e: 0.95, nCH: 0 },
    { name: "1°", e: 0.7, nCH: 3 },
    { name: "2°", e: 0.42, nCH: 6 },
    { name: "3°", e: 0.12, nCH: 9 },
  ];
  const BARW = 44;
  const barX = (i: number) => LX + 18 + i * 56;

  // Inset: the sp2 cationic carbon, its empty p orbital, and one C–H bond on
  // the neighbouring carbon lined up with the empty lobe.
  const IC = { x: 372, y: 104 };
  const CB = { x: IC.x - 26, y: IC.y };

  return (
    <Figure
      viewBox="0 0 470 214"
      alt="A ladder of carbocation energies falling from methyl at the top to tertiary at the bottom, labelled with the number of adjacent carbon–hydrogen bonds able to donate into the empty p orbital: none, three, six and nine. An inset shows one such bond standing parallel to the empty p lobe on the flat sp2 carbon."
      caption="Each alkyl group brings three more σ(C–H) bonds that can overlap the empty p orbital. Hyperconjugation is that count, and the count is the stability order — which is why methyl and primary substrates have no SN1 or E1 route at all."
    >
      <ArrowDefs id="ccArrow" color="var(--fig-2)" />
      <line
        x1={LX}
        y1={LY - 6}
        x2={LX}
        y2={LY + LH + 6}
        stroke="var(--fig-axis)"
        strokeWidth={1.5}
      />
      <text
        x={-(LY + LH / 2)}
        y={LX - 26}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        cation energy (schematic)
      </text>

      {rungs.map((r, i) => (
        <g key={r.name}>
          <line
            x1={barX(i)}
            y1={yOf(r.e)}
            x2={barX(i) + BARW}
            y2={yOf(r.e)}
            stroke="var(--fig-1)"
            strokeWidth={2.6}
          />
          <text
            x={barX(i) + BARW / 2}
            y={yOf(r.e) - 7}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={10}
            fontWeight={600}
          >
            {r.name}
          </text>
          <text
            x={barX(i) + BARW / 2}
            y={LY + LH + 20}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {r.nCH}
          </text>
        </g>
      ))}
      <Note x={barX(1) + BARW} y={LY + LH + 36}>
        σ(C–H) bonds able to overlap the empty p orbital
      </Note>
      <Note x={barX(0) + BARW + 12} y={yOf(0.95) + 4} anchor="start">
        least stable
      </Note>
      <Note x={barX(3) - 12} y={yOf(0.12) + 4} anchor="end">
        most stable
      </Note>

      {/* --- inset: the overlap itself ----------------------------------- */}
      <line
        x1={300}
        y1={LY - 6}
        x2={300}
        y2={LY + LH + 6}
        stroke="var(--fig-grid)"
        strokeWidth={1}
      />
      {/* Empty p orbital: dashed, faintly filled, opposite phases. */}
      <ellipse
        cx={IC.x}
        cy={IC.y - 26}
        rx={11}
        ry={22}
        fill="var(--fig-pos)"
        fillOpacity={0.12}
        stroke="var(--fig-pos)"
        strokeWidth={1}
        strokeDasharray="3 2"
      />
      <ellipse
        cx={IC.x}
        cy={IC.y + 26}
        rx={11}
        ry={22}
        fill="var(--fig-neg)"
        fillOpacity={0.12}
        stroke="var(--fig-neg)"
        strokeWidth={1}
        strokeDasharray="3 2"
      />
      {/* The three coplanar σ bonds of the sp2 centre. */}
      {[35, 180, 325].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={IC.x}
            y1={IC.y}
            x2={IC.x + 26 * Math.cos(rad)}
            y2={IC.y - 26 * Math.sin(rad)}
            stroke="currentColor"
            strokeWidth={1.4}
          />
        );
      })}
      <circle cx={IC.x} cy={IC.y} r={3} fill="currentColor" />
      {/* The neighbouring carbon, with one C–H bond standing parallel to the
          empty lobe -- which is exactly the alignment hyperconjugation needs. */}
      <circle cx={CB.x} cy={CB.y} r={2.4} fill="currentColor" />
      <line x1={CB.x} y1={CB.y} x2={CB.x} y2={CB.y - 24} stroke="var(--fig-2)" strokeWidth={2} />
      <text
        x={CB.x - 5}
        y={CB.y - 26}
        textAnchor="end"
        className="fill-foreground"
        fontSize={9.5}
        fontWeight={600}
      >
        C–H
      </text>
      <line
        x1={CB.x + 6}
        y1={CB.y - 22}
        x2={IC.x - 13}
        y2={IC.y - 30}
        stroke="var(--fig-2)"
        strokeWidth={1.3}
        strokeDasharray="2 2"
        markerEnd="url(#ccArrow)"
      />
      <Note x={IC.x + 16} y={IC.y - 44} anchor="start">
        empty p
      </Note>
      <Note x={IC.x} y={LY + LH + 20}>
        hyperconjugation
      </Note>
    </Figure>
  );
}
/**
 * The anti-periplanar requirement for E2, as two Newman projections.
 *
 * E2 forms a π bond in the same step that the C–H and C–X bonds break, so the
 * developing p orbital on the β carbon has to be aligned with σ*(C–X). Only the
 * 180° arrangement provides that alignment; rotate to gauche and the overlap is
 * gone, whatever the thermodynamics of the product would have been.
 */
function AntiperiplanarNewman() {
  const R = 40;
  const A = { x: 118, y: 100 };
  const B = { x: 332, y: 100 };
  const pt = (c: { x: number; y: number }, deg: number, r: number) => ({
    x: c.x + r * Math.cos((deg * Math.PI) / 180),
    y: c.y - r * Math.sin((deg * Math.PI) / 180),
  });

  // Front carbon bonds run from the centre out; back carbon bonds start at the
  // rim. Front is fixed at 90/210/330; only the back carbon is rotated.
  const FRONT = [90, 210, 330];
  const panels = [
    {
      key: "anti",
      c: A,
      back: [270, 30, 150],
      hAngle: 270,
      dihedral: "180°",
      verdict: "anti-periplanar — E2 proceeds",
      ok: true,
    },
    {
      key: "gauche",
      c: B,
      back: [150, 270, 30],
      hAngle: 150,
      dihedral: "60°",
      verdict: "gauche — no E2 from this rotamer",
      ok: false,
    },
  ];

  return (
    <Figure
      viewBox="0 0 460 224"
      alt="Two Newman projections of the same molecule. In the first the leaving group on the front carbon points straight up and the beta hydrogen on the back carbon points straight down, a dihedral angle of one hundred and eighty degrees, and elimination proceeds. In the second the back carbon has been rotated so the hydrogen is only sixty degrees away, the orbitals no longer align, and no elimination occurs."
      caption="E2 needs σ(C–H) and σ*(C–X) coplanar and opposed. Menthyl chloride has just one β-hydrogen that can reach 180° and eliminates slowly to the less substituted alkene; neomenthyl chloride has two and eliminates fast."
    >
      {panels.map((p) => (
        <g key={p.key}>
          {/* back carbon */}
          <circle
            cx={p.c.x}
            cy={p.c.y}
            r={R}
            fill="none"
            stroke="var(--fig-axis)"
            strokeWidth={1.4}
          />
          {p.back.map((a) => {
            const s = pt(p.c, a, R);
            const e = pt(p.c, a, R + 26);
            const isH = a === p.hAngle;
            return (
              <line
                key={`b${a}`}
                x1={s.x}
                y1={s.y}
                x2={e.x}
                y2={e.y}
                stroke={isH ? "var(--fig-2)" : "currentColor"}
                strokeWidth={isH ? 2.2 : 1.4}
              />
            );
          })}
          {/* front carbon */}
          {FRONT.map((a) => {
            const e = pt(p.c, a, R);
            const isX = a === 90;
            return (
              <line
                key={`f${a}`}
                x1={p.c.x}
                y1={p.c.y}
                x2={e.x}
                y2={e.y}
                stroke={isX ? "var(--fig-1)" : "currentColor"}
                strokeWidth={isX ? 2.2 : 1.4}
              />
            );
          })}
          <circle cx={p.c.x} cy={p.c.y} r={3} fill="currentColor" />

          {/* the two reacting partners */}
          <text
            x={pt(p.c, 90, R + 14).x}
            y={pt(p.c, 90, R + 14).y}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={11}
            fontWeight={600}
          >
            X
          </text>
          <text
            x={pt(p.c, p.hAngle, R + 38).x}
            y={pt(p.c, p.hAngle, R + 38).y + 4}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={11}
            fontWeight={600}
          >
            H
          </text>

          <Note x={p.c.x} y={p.c.y + R + 62}>
            dihedral H–C–C–X = {p.dihedral}
          </Note>
          <text
            x={p.c.x}
            y={p.c.y + R + 78}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={9.5}
            fontWeight={600}
          >
            {p.verdict}
          </text>
        </g>
      ))}

      {/* the alignment itself, shown only where it exists */}
      <line
        x1={A.x}
        y1={A.y - R - 6}
        x2={A.x}
        y2={A.y + R + 24}
        stroke="var(--fig-grid)"
        strokeWidth={1.2}
        strokeDasharray="4 3"
      />
      <Note x={A.x} y={A.y - R - 34}>
        one line: σ(C–H) into σ*(C–X)
      </Note>
      {/* an explicit cross, so the failing case is not signalled by colour */}
      <g stroke="var(--fig-axis)" strokeWidth={1.6}>
        <line x1={B.x + 50} y1={B.y - 8} x2={B.x + 66} y2={B.y + 8} />
        <line x1={B.x + 66} y1={B.y - 8} x2={B.x + 50} y2={B.y + 8} />
      </g>
    </Figure>
  );
}

/**
 * Zaitsev versus Hofmann on one substrate.
 *
 * 2-bromo-2-methylbutane is the classical test case because its two sets of
 * β-hydrogens are genuinely different: six on the two methyls, exposed, and two
 * on the ring-inward CH₂, shielded by the neighbouring quaternary carbon. A
 * small base takes the hindered one and gets the more stable trisubstituted
 * alkene; a bulky base cannot reach it and takes the exposed one instead. The
 * substrate does not change — only which hydrogen the base can physically
 * reach.
 */
function ZaitsevHofmann() {
  /**
   * A skeletal bond. `dbl` adds the second line of a double bond, in the colour
   * of the route that made it, so each product is tied to the arrow that led
   * there without relying on the colour alone.
   */
  const Bond = ({ a, b, dbl }: { a: Pt; b: Pt; dbl?: string }) => {
    const dx = b.x - a.x,
      dy = b.y - a.y;
    const L = Math.hypot(dx, dy);
    const nx = (-dy / L) * 3,
      ny = (dx / L) * 3;
    return (
      <g stroke="currentColor" strokeWidth={1.4}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        {dbl && <line x1={a.x + nx} y1={a.y + ny} x2={b.x + nx} y2={b.y + ny} stroke={dbl} />}
      </g>
    );
  };

  const S = {
    C2: { x: 86, y: 105 },
    MeA: { x: 54, y: 88 },
    MeB: { x: 54, y: 122 },
    Br: { x: 86, y: 74 },
    C3: { x: 118, y: 122 },
    C4: { x: 150, y: 105 },
  };
  const Z = {
    C1: { x: 250, y: 74 },
    C2: { x: 282, y: 58 },
    Me: { x: 282, y: 30 },
    C3: { x: 314, y: 74 },
    C4: { x: 346, y: 58 },
  };
  const H = {
    C1: { x: 250, y: 176 },
    C2: { x: 282, y: 160 },
    Me: { x: 282, y: 132 },
    C3: { x: 314, y: 176 },
    C4: { x: 346, y: 160 },
  };

  return (
    <Figure
      viewBox="0 0 470 200"
      alt="One substrate, two elimination products. Removing one of the six exposed methyl hydrogens gives the less substituted alkene, and removing one of the two shielded hydrogens on the neighbouring carbon gives the more substituted one. A small base reaches the shielded hydrogen and gives the Zaitsev product; a bulky base cannot, and gives the Hofmann product instead."
      caption="2-bromo-2-methylbutane. Zaitsev is about alkene stability, Hofmann about which β-hydrogen the base can physically reach — so the bulk of the base, not the substrate, picks the product."
    >
      <ArrowDefs id="zhA" color="var(--fig-1)" />
      <ArrowDefs id="zhB" color="var(--fig-2)" />

      {/* --- substrate ---------------------------------------------------- */}
      <Bond a={S.C2} b={S.MeA} />
      <Bond a={S.C2} b={S.MeB} />
      <Bond a={S.C2} b={S.Br} />
      <Bond a={S.C2} b={S.C3} />
      <Bond a={S.C3} b={S.C4} />
      <text
        x={S.Br.x}
        y={S.Br.y - 5}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={11}
        fontWeight={600}
      >
        Br
      </text>
      <Note x={44} y={76} anchor="end">
        6 β-H
      </Note>
      <Note x={44} y={88} anchor="end">
        exposed
      </Note>
      <Note x={126} y={142} anchor="start">
        2 β-H
      </Note>
      <Note x={126} y={154} anchor="start">
        shielded
      </Note>

      {/* --- the two routes ----------------------------------------------- */}
      <line
        x1={176}
        y1={96}
        x2={228}
        y2={70}
        stroke="var(--fig-1)"
        strokeWidth={1.3}
        markerEnd="url(#zhA)"
      />
      <Note x={202} y={62}>
        small base
      </Note>
      <line
        x1={176}
        y1={130}
        x2={228}
        y2={156}
        stroke="var(--fig-2)"
        strokeWidth={1.3}
        markerEnd="url(#zhB)"
      />
      <Note x={202} y={172}>
        bulky base
      </Note>

      {/* --- Zaitsev product ------------------------------------------------ */}
      <Bond a={Z.C1} b={Z.C2} />
      <Bond a={Z.C2} b={Z.Me} />
      <Bond a={Z.C2} b={Z.C3} dbl="var(--fig-1)" />
      <Bond a={Z.C3} b={Z.C4} />
      <text x={360} y={62} className="fill-foreground" fontSize={9.5} fontWeight={600}>
        trisubstituted
      </text>
      <Note x={360} y={76} anchor="start">
        Zaitsev
      </Note>

      {/* --- Hofmann product ------------------------------------------------ */}
      <Bond a={H.C1} b={H.C2} dbl="var(--fig-2)" />
      <Bond a={H.C2} b={H.Me} />
      <Bond a={H.C2} b={H.C3} />
      <Bond a={H.C3} b={H.C4} />
      <text x={360} y={164} className="fill-foreground" fontSize={9.5} fontWeight={600}>
        disubstituted
      </text>
      <Note x={360} y={178} anchor="start">
        Hofmann
      </Note>
    </Figure>
  );
}

/**
 * SN1 and SN2 as energy profiles: one step against two.
 *
 * The shapes carry the rate laws. SN2 has a single maximum, so the only
 * transition state contains both the substrate and the nucleophile and both
 * appear in the rate law. SN1 has two maxima with a carbocation minimum between
 * them, and the first barrier is the taller, so the nucleophile enters after
 * the bottleneck and is absent from the rate law entirely. Schematic heights,
 * honest ordering.
 */
function Sn1Sn2Profiles() {
  const A = { x: 44, y: 34, w: 168, h: 116 };
  const B = { x: 272, y: 34, w: 168, h: 116 };
  const sn2 = [
    { at: 0.03, e: 0.3 },
    { at: 0.5, e: 0.88 },
    { at: 0.97, e: 0.12 },
  ];
  const sn1 = [
    { at: 0.03, e: 0.3 },
    { at: 0.3, e: 0.96 },
    { at: 0.56, e: 0.66 },
    { at: 0.76, e: 0.74 },
    { at: 0.97, e: 0.12 },
  ];
  const at = (box: typeof A, f: number) => box.x + f * box.w;
  const en = (box: typeof A, e: number) => box.y + box.h - e * box.h;

  return (
    <Figure
      viewBox="0 0 470 214"
      alt="Two schematic energy profiles side by side. The SN2 profile has a single hump, so its one transition state contains both the substrate and the nucleophile. The SN1 profile has two humps with a carbocation sitting in the well between them, and the first hump is the taller, so the nucleophile only enters after the rate-determining step."
      caption="One maximum against two. The nucleophile is in the SN2 transition state and therefore in its rate law; in SN1 it arrives after the bottleneck, so the rate law knows nothing about it."
    >
      <Axes x={A.x} y={A.y} w={A.w} h={A.h} xLabel="reaction coordinate" />
      <Axes x={B.x} y={B.y} w={B.w} h={B.h} xLabel="reaction coordinate" />
      <text
        x={-(A.y + A.h / 2)}
        y={A.x - 28}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        free energy (schematic)
      </text>

      <path d={pathFrom(profilePx(sn2, A))} fill="none" stroke="var(--fig-1)" strokeWidth={2} />
      <path d={pathFrom(profilePx(sn1, B))} fill="none" stroke="var(--fig-2)" strokeWidth={2} />

      <Note x={at(A, 0.5)} y={en(A, 0.88) - 9}>
        ‡ Nu···C···X
      </Note>
      <Note x={at(B, 0.3)} y={en(B, 0.96) - 9}>
        ‡ ionisation
      </Note>
      <circle cx={at(B, 0.56)} cy={en(B, 0.66)} r={3.4} fill="var(--fig-2)" />
      <Note x={at(B, 0.6)} y={en(B, 0.66) + 15}>
        carbocation
      </Note>

      <SeriesLabel x={A.x + 2} y={A.y + A.h + 42} color="var(--fig-1)">
        SN2 — one step, rate = k[RX][Nu⁻]
      </SeriesLabel>
      <SeriesLabel x={B.x + 2} y={B.y + B.h + 42} color="var(--fig-2)">
        SN1 — two steps, rate = k[RX]
      </SeriesLabel>
    </Figure>
  );
}

export const kineticsFigures = {
  // rate-laws
  "rate-linearized-plots": LinearizedPlots,
  "rate-integrated-decay": IntegratedDecay,
  "rate-half-life-by-order": HalfLifeByOrder,
  // reaction-mechanisms
  "mech-intermediate-profile": IntermediateProfile,
  "mech-lindemann-falloff": LindemannFalloff,
  "mech-arrhenius-plot": ArrheniusPlot,
  "mech-catalysed-path": CatalysedPath,
  // organic-mechanisms
  "org-sn2-backside": Sn2Backside,
  "org-leaving-group-pka": LeavingGroupPka,
  "org-carbocation-stability": CarbocationStability,
  "org-antiperiplanar-newman": AntiperiplanarNewman,
  "org-zaitsev-hofmann": ZaitsevHofmann,
  "org-sn1-sn2-profiles": Sn1Sn2Profiles,
} satisfies Record<string, FigureDef>;

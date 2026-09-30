import { ArrowDefs, Axes, Figure, Note, SeriesLabel, pathFrom } from "./Figure";
import { DOUBLING_PPM, PREINDUSTRIAL_PPM, TODAY_PPM, solveCarbonateSystem } from "@/lib/oceanChem";

/**
 * Diagrams for the "Chemistry in the World" essays (src/routes/everyday.tsx).
 * That page is prose rather than the lesson engine, so these are imported
 * directly instead of being registered in figures/registry.ts.
 */

/* ---------------------------------------------------------------------- */
/* Stereochemistry                                                          */
/* ---------------------------------------------------------------------- */

const RECEPTOR = [
  { id: "A", x: 66, y: 158, color: "var(--fig-1)" },
  { id: "B", x: 154, y: 158, color: "var(--fig-2)" },
  { id: "C", x: 110, y: 84, color: "var(--fig-3)" },
];

function ReceptorSite({ x, y, color, id }: { x: number; y: number; color: string; id: string }) {
  const isTop = id === "C";
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={11}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="2 2"
      />
      <text
        x={isTop ? x - 16 : x}
        y={isTop ? y + 3 : y + 24}
        textAnchor={isTop ? "end" : "middle"}
        className="fill-muted-foreground"
        fontSize={8.5}
      >
        site {id}
      </text>
    </g>
  );
}

/**
 * Easson–Stedman three-point model. The pocket is identical in both panels;
 * only the molecule changes hand. Any two substituents can be rotated into
 * two sites by either enantiomer, so the mirror form still makes A and B
 * contacts — but that rotation leaves its C group pointing away from site C.
 */
function ChiralRecognition() {
  const dx = 220;
  return (
    <Figure
      viewBox="0 0 450 226"
      maxWidth={560}
      alt="Two copies of the same three-site receptor pocket. In the left panel a molecule's three substituents each sit inside their matching docking site. In the right panel the mirror-image molecule brings two of its substituents into their sites, but its third group points away from the third site with a broken leader line, because no rotation brings all three mirror-swapped positions into the fixed pocket at once."
      caption="Same pocket, two mirror-image molecules. Either hand can put two groups into two sites; only one hand can reach the third. That single missing contact is why receptors can tell enantiomers apart."
    >
      <text
        x={110}
        y={18}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={700}
      >
        binds: 3 of 3 contacts
      </text>
      <text
        x={110 + dx}
        y={18}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={700}
      >
        mirror image: 2 of 3
      </text>
      <line x1={225} y1={30} x2={225} y2={196} stroke="var(--fig-grid)" strokeWidth={1} />

      {/* Left: every group lands in its site. */}
      {RECEPTOR.map((r) => (
        <ReceptorSite key={r.id} {...r} />
      ))}
      {RECEPTOR.map((r) => (
        <line
          key={`bond-${r.id}`}
          x1={110}
          y1={126}
          x2={r.x}
          y2={r.y}
          stroke="var(--fig-axis)"
          strokeWidth={1.5}
        />
      ))}
      <circle cx={110} cy={126} r={5} fill="var(--fig-axis)" />
      {RECEPTOR.map((r) => (
        <circle key={`grp-${r.id}`} cx={r.x} cy={r.y} r={7} fill={r.color} />
      ))}
      <circle
        cx={124}
        cy={116}
        r={4}
        fill="var(--fig-grid)"
        stroke="var(--fig-axis)"
        strokeWidth={1}
      />
      <text x={131} y={113} className="fill-muted-foreground" fontSize={8}>
        H
      </text>

      {/* Right: same pocket, mirror molecule. */}
      {RECEPTOR.map((r) => (
        <ReceptorSite key={`m${r.id}`} x={r.x + dx} y={r.y} color={r.color} id={r.id} />
      ))}
      <line
        x1={110 + dx}
        y1={126}
        x2={66 + dx}
        y2={158}
        stroke="var(--fig-axis)"
        strokeWidth={1.5}
      />
      <line
        x1={110 + dx}
        y1={126}
        x2={154 + dx}
        y2={158}
        stroke="var(--fig-axis)"
        strokeWidth={1.5}
      />
      <line
        x1={110 + dx}
        y1={126}
        x2={160 + dx}
        y2={66}
        stroke="var(--fig-axis)"
        strokeWidth={1.5}
      />
      <circle cx={110 + dx} cy={126} r={5} fill="var(--fig-axis)" />
      <circle cx={66 + dx} cy={158} r={7} fill="var(--fig-1)" />
      <circle cx={154 + dx} cy={158} r={7} fill="var(--fig-2)" />
      <circle cx={160 + dx} cy={66} r={7} fill="var(--fig-3)" />
      <line
        x1={152 + dx}
        y1={70}
        x2={122 + dx}
        y2={82}
        stroke="var(--fig-3)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <text
        x={170 + dx}
        y={52}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        C can't reach
      </text>
      <circle
        cx={96 + dx}
        cy={116}
        r={4}
        fill="var(--fig-grid)"
        stroke="var(--fig-axis)"
        strokeWidth={1}
      />

      <Note x={225} y={218}>
        the pocket is fixed; only the molecule's handedness changes
      </Note>
    </Figure>
  );
}

/**
 * Colour encodes outcome, not letter: R is the wanted form of thalidomide but
 * the idle form of ibuprofen, so "R" and "S" never map onto safe/unsafe.
 */
const ENANTIOMER_ROWS = [
  {
    compound: "Ibuprofen",
    left: { label: "S", desc: "does ~all the COX inhibition", color: "var(--fig-3)" },
    right: { label: "R", desc: "inert; body converts it to S", color: "var(--fig-axis)" },
  },
  {
    compound: "Thalidomide",
    left: { label: "R", desc: "the intended sedative", color: "var(--fig-3)" },
    right: { label: "S", desc: "teratogenic: birth defects", color: "var(--fig-1)" },
  },
  {
    compound: "Carvone",
    left: { label: "R", desc: "smells of caraway", color: "var(--fig-2)" },
    right: { label: "S", desc: "smells of spearmint", color: "var(--fig-2)" },
  },
];

function EnantiomerOutcomes() {
  const rowH = 62;
  const y0 = 20;
  const boxW = 190;
  const cols = [20, 240];
  return (
    <Figure
      viewBox="0 0 450 216"
      maxWidth={560}
      alt="Three real molecules, each shown as its two mirror-image forms with the effect of each. Ibuprofen: S is the active painkiller, R is inert until the body converts it. Thalidomide: R is the intended sedative, S caused birth defects. Carvone: R smells of caraway, S of spearmint. Neither letter is consistently the safe one."
      caption="Same formula, same bonds, different biology. R and S don't map onto 'safe' — thalidomide's harmful hand is S while ibuprofen's idle hand is R. Which form matters is set by the receptor, not by the label."
    >
      {ENANTIOMER_ROWS.map((row, i) => {
        const y = y0 + i * rowH;
        return (
          <g key={row.compound}>
            <text x={20} y={y + 4} className="fill-foreground" fontSize={11} fontWeight={700}>
              {row.compound}
            </text>
            {[row.left, row.right].map((side, j) => {
              const x = cols[j]!;
              return (
                <g key={j}>
                  <rect
                    x={x}
                    y={y + 12}
                    width={boxW}
                    height={32}
                    rx={6}
                    fill="none"
                    stroke={side.color}
                    strokeWidth={1.5}
                  />
                  <circle cx={x + 14} cy={y + 28} r={3.5} fill={side.color} />
                  <text
                    x={x + 24}
                    y={y + 32}
                    className="fill-foreground"
                    fontSize={11}
                    fontWeight={700}
                  >
                    {side.label}
                  </text>
                  <text x={x + 40} y={y + 31} className="fill-muted-foreground" fontSize={9}>
                    {side.desc}
                  </text>
                </g>
              );
            })}
            <text
              x={225}
              y={y + 32}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={10}
            >
              ⇄
            </text>
          </g>
        );
      })}
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */
/* Materials — plastics                                                    */
/* ---------------------------------------------------------------------- */

/**
 * Radical autoxidation of a polyolefin. UV only starts the chain; the
 * propagation loop (R• → ROO• → ROOH + new R•) then regenerates its own
 * radical, and the exit from the loop is scission, not mineralisation.
 */
const CYCLE_NODES = [
  { id: "init", x: 225, y: 34, label: "UV breaks a C–H", sub: "at a trace chromophore" },
  { id: "radical", x: 350, y: 118, label: "R•", sub: "carbon radical" },
  { id: "peroxy", x: 225, y: 200, label: "ROO•", sub: "O₂ adds" },
  { id: "propagate", x: 100, y: 118, label: "ROOH + new R•", sub: "H taken from next chain" },
];

function AutoxidationCycle() {
  const halfW = 60;
  return (
    <Figure
      viewBox="0 0 450 300"
      maxWidth={560}
      alt="A cycle diagram. Ultraviolet light breaks a carbon-hydrogen bond, producing a carbon radical. Oxygen adds to it, making a peroxy radical. The peroxy radical takes a hydrogen from a neighbouring chain, leaving a hydroperoxide and a new carbon radical, and an arrow carries that new radical back to the start of the loop. A dashed branch leaves the loop, labelled Norrish decomposition, and ends in a box reading shorter chains, embrittles, crumbles."
      caption="Radical autoxidation: each lap regenerates the radical that started it, so one UV hit can walk through many C–H bonds. The only way out of the loop is chain scission — the plastic gets shorter and more brittle, but its carbon never leaves."
    >
      <ArrowDefs id="ac-arrow" />
      <ArrowDefs id="ac-arrow-exit" color="var(--fig-1)" />
      {CYCLE_NODES.map((n) => (
        <g key={n.id}>
          <rect
            x={n.x - halfW}
            y={n.y - 16}
            width={halfW * 2}
            height={32}
            rx={7}
            fill="none"
            stroke="var(--fig-axis)"
            strokeWidth={1.5}
          />
          <text
            x={n.x}
            y={n.y - 2}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={10}
            fontWeight={700}
          >
            {n.label}
          </text>
          <text
            x={n.x}
            y={n.y + 10}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={8}
          >
            {n.sub}
          </text>
        </g>
      ))}
      {/* init -> R• (initiation, once) */}
      <path
        d="M 285 40 Q 345 48 350 100"
        fill="none"
        stroke="var(--fig-axis)"
        strokeWidth={1.5}
        markerEnd="url(#ac-arrow)"
      />
      {/* R• -> ROO• */}
      <path
        d="M 350 136 Q 345 192 287 200"
        fill="none"
        stroke="var(--fig-2)"
        strokeWidth={1.5}
        markerEnd="url(#ac-arrow)"
      />
      {/* ROO• -> ROOH + R• */}
      <path
        d="M 163 200 Q 118 196 120 136"
        fill="none"
        stroke="var(--fig-2)"
        strokeWidth={1.5}
        markerEnd="url(#ac-arrow)"
      />
      {/* new R• loops back */}
      <line
        x1={162}
        y1={118}
        x2={286}
        y2={118}
        stroke="var(--fig-2)"
        strokeWidth={1.5}
        markerEnd="url(#ac-arrow)"
      />
      <Note x={224} y={110}>
        new R• — chain continues
      </Note>

      {/* Exit: scission */}
      <line
        x1={70}
        y1={136}
        x2={70}
        y2={246}
        stroke="var(--fig-1)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        markerEnd="url(#ac-arrow-exit)"
      />
      <text
        x={62}
        y={191}
        textAnchor="middle"
        transform="rotate(-90 62 191)"
        className="fill-muted-foreground"
        fontSize={8}
      >
        ROOH decomposes (Norrish)
      </text>
      <rect
        x={20}
        y={250}
        width={220}
        height={32}
        rx={6}
        fill="none"
        stroke="var(--fig-1)"
        strokeWidth={1.5}
      />
      <text
        x={130}
        y={270}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={10}
        fontWeight={700}
      >
        shorter chains → embrittles, crumbles
      </text>
    </Figure>
  );
}

/**
 * PLA hydrolysis against temperature. The step is drawn as a logistic centred
 * on Tg = 60 °C: the exact shape is schematic, but the threshold and the
 * composter-vs-ocean contrast are the essay's own numbers.
 */
const PLA_TG = 60;
function plaRate(tC: number): number {
  return 1 / (1 + Math.exp(-(tC - PLA_TG) / 4.5));
}

function PlasticHydrolysisThreshold() {
  const px = 50,
    py = 22,
    pw = 360,
    ph = 150;
  const xOf = (t: number) => px + (t / 100) * pw;
  const yOf = (rate: number) => py + ph - rate * ph;
  const curve = Array.from({ length: 101 }, (_, t) => ({ x: xOf(t), y: yOf(plaRate(t)) }));
  const ocean = { t: 15, rate: plaRate(15) };
  const composter = { t: 58, rate: plaRate(58) };

  return (
    <Figure
      viewBox="0 0 450 216"
      maxWidth={560}
      alt="PLA hydrolysis rate against temperature, a sharp S-shaped step centred on the glass transition at 60 degrees Celsius. A cold ocean at 15 degrees sits on the flat, near-zero part of the curve. An industrial composter at 58 degrees sits at the foot of the steep rise."
      caption="PLA's breakdown doesn't speed up gradually with warmth — it steps at the glass transition, Tg ≈ 60 °C, where water can finally get into the solid. A composter at 58 °C sits on that edge; a 15 °C sea sits nowhere near it."
    >
      <Axes
        x={px}
        y={py}
        w={pw}
        h={ph}
        xLabel="temperature (°C)"
        yLabel="hydrolysis rate"
        xTicks={[0, 20, 40, 60, 80, 100].map((t) => ({ at: t / 100, label: String(t) }))}
        yTicks={[
          { at: 0, label: "slow" },
          { at: 1, label: "fast" },
        ]}
      />
      <line
        x1={xOf(PLA_TG)}
        y1={py}
        x2={xOf(PLA_TG)}
        y2={py + ph}
        stroke="var(--fig-axis)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <text
        x={xOf(PLA_TG) - 5}
        y={py + 12}
        textAnchor="end"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        Tg ≈ 60 °C
      </text>
      <text
        x={xOf(PLA_TG) - 5}
        y={py + 24}
        textAnchor="end"
        className="fill-muted-foreground"
        fontSize={8}
      >
        glass → rubbery; water gets in
      </text>
      <path d={pathFrom(curve)} fill="none" stroke="var(--fig-1)" strokeWidth={2} />

      <circle cx={xOf(ocean.t)} cy={yOf(ocean.rate)} r={3.5} fill="var(--fig-2)" />
      <text
        x={xOf(ocean.t)}
        y={yOf(ocean.rate) - 10}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        cold sea, 15 °C
      </text>
      <text
        x={xOf(ocean.t)}
        y={yOf(ocean.rate) - 21}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={8}
      >
        decades
      </text>

      <circle cx={xOf(composter.t)} cy={yOf(composter.rate)} r={3.5} fill="var(--fig-2)" />
      <text
        x={xOf(composter.t) - 7}
        y={yOf(composter.rate) + 3}
        textAnchor="end"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        composter, 58 °C
      </text>
      <text
        x={xOf(composter.t) - 7}
        y={yOf(composter.rate) + 14}
        textAnchor="end"
        className="fill-muted-foreground"
        fontSize={8}
      >
        weeks to months
      </text>
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */
/* Environment — ocean acidification                                       */
/* ---------------------------------------------------------------------- */

const OCEAN_PRE = solveCarbonateSystem(PREINDUSTRIAL_PPM);
const OCEAN_TODAY = solveCarbonateSystem(TODAY_PPM);
const OCEAN_DOUBLED = solveCarbonateSystem(DOUBLING_PPM);
const PK1 = OCEAN_TODAY.pK1;
const PK2 = OCEAN_TODAY.pK2;

/**
 * The carbonate chain on a pH ladder. Surface seawater sits between pK1 and
 * pK2, which is the entire reason bicarbonate dominates. The historical drift
 * is only ~0.15 pH units — invisible at ladder scale — so it gets a zoomed
 * sub-rail. Every value is solved by src/lib/oceanChem.ts at module load, the
 * same solver the simulation below uses.
 */
function CarbonateLadder() {
  const x0 = 40,
    w = 370;
  const lo = 4,
    hi = 12;
  const railY = 120;
  const xOf = (pH: number) => x0 + ((pH - lo) / (hi - lo)) * w;

  const zLo = 7.85,
    zHi = 8.25;
  const zx0 = 230,
    zw = 180,
    zY = 196;
  const zOf = (pH: number) => zx0 + ((pH - zLo) / (zHi - zLo)) * zw;

  const points = [
    { s: OCEAN_PRE, label: `1750 · ${PREINDUSTRIAL_PPM} ppm`, above: true },
    { s: OCEAN_TODAY, label: `today · ${TODAY_PPM} ppm`, above: true },
    { s: OCEAN_DOUBLED, label: `${DOUBLING_PPM} ppm`, above: false },
  ];

  return (
    <Figure
      viewBox="0 0 450 240"
      maxWidth={560}
      alt="A reaction chain across the top: carbon dioxide and water in equilibrium with bicarbonate and a hydrogen ion, in equilibrium with carbonate and two hydrogen ions. Below it a pH ladder from four to twelve marks pK1 near 5.8 and pK2 near 9.0, with a shaded band between them labelled bicarbonate dominates. A zoomed rail below magnifies pH 7.85 to 8.25 and shows warm surface water drifting from pH 8.18 in 1750, to about 8.03 today, to about 7.93 at double preindustrial carbon dioxide."
      caption={`Seawater's pH sits between pK₁ and pK₂, so HCO₃⁻ is ${((OCEAN_TODAY.hco3 / OCEAN_TODAY.dic) * 100).toFixed(0)}% of dissolved carbon today. Solved values: pH ${OCEAN_PRE.pH.toFixed(2)} (1750) → ${OCEAN_TODAY.pH.toFixed(2)} (today) → ${OCEAN_DOUBLED.pH.toFixed(2)} (2× CO₂). The text's rounded 8.2 → 8.1 is the same drift.`}
    >
      <ArrowDefs id="cl-arrow" color="var(--fig-1)" />
      <text
        x={225}
        y={20}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={11}
        fontWeight={700}
      >
        CO₂ + H₂O ⇌ H⁺ + HCO₃⁻ ⇌ 2H⁺ + CO₃²⁻
      </text>
      <Note x={225} y={36}>
        more CO₂ pushes the chain right, releasing H⁺
      </Note>

      <rect
        x={xOf(PK1)}
        y={railY - 44}
        width={xOf(PK2) - xOf(PK1)}
        height={48}
        fill="var(--fig-3)"
        fillOpacity={0.14}
      />
      <Note x={(xOf(PK1) + xOf(PK2)) / 2} y={railY - 50}>
        HCO₃⁻ dominates
      </Note>
      <Note x={(x0 + xOf(PK1)) / 2} y={railY - 12}>
        CO₂(aq)
      </Note>
      <Note x={(xOf(PK2) + x0 + w) / 2} y={railY - 12}>
        CO₃²⁻
      </Note>

      <line x1={x0} y1={railY} x2={x0 + w} y2={railY} stroke="var(--fig-axis)" strokeWidth={1.5} />
      {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((t) => (
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
        x={x0 - 8}
        y={railY + 15}
        textAnchor="end"
        className="fill-muted-foreground"
        fontSize={9}
      >
        pH
      </text>
      {[
        { p: PK1, label: `pK₁ ${PK1.toFixed(2)}` },
        { p: PK2, label: `pK₂ ${PK2.toFixed(2)}` },
      ].map((k) => (
        <g key={k.label}>
          <line
            x1={xOf(k.p)}
            y1={railY - 6}
            x2={xOf(k.p)}
            y2={railY + 6}
            stroke="var(--fig-2)"
            strokeWidth={1.5}
          />
          <text
            x={xOf(k.p)}
            y={railY - 26}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={9}
            fontWeight={600}
          >
            {k.label}
          </text>
        </g>
      ))}
      <circle cx={xOf(OCEAN_TODAY.pH)} cy={railY} r={3.5} fill="var(--fig-1)" />

      {/* Zoom: the historical drift, magnified. */}
      <line
        x1={xOf(zLo)}
        y1={railY + 20}
        x2={zx0}
        y2={zY - 32}
        stroke="var(--fig-grid)"
        strokeWidth={1}
      />
      <line
        x1={xOf(zHi)}
        y1={railY + 20}
        x2={zx0 + zw}
        y2={zY - 32}
        stroke="var(--fig-grid)"
        strokeWidth={1}
      />
      <line x1={zx0} y1={zY} x2={zx0 + zw} y2={zY} stroke="var(--fig-axis)" strokeWidth={1.5} />
      <text
        x={zx0 - 5}
        y={zY + 3}
        textAnchor="end"
        className="fill-muted-foreground"
        fontSize={8.5}
      >
        {zLo.toFixed(2)}
      </text>
      <text x={zx0 + zw + 5} y={zY + 3} className="fill-muted-foreground" fontSize={8.5}>
        {zHi.toFixed(2)}
      </text>
      <text
        x={zx0 - 5}
        y={zY - 12}
        textAnchor="end"
        className="fill-muted-foreground"
        fontSize={8.5}
      >
        zoom ×20
      </text>
      <line
        x1={zOf(OCEAN_PRE.pH)}
        y1={zY}
        x2={zOf(OCEAN_DOUBLED.pH) + 5}
        y2={zY}
        stroke="var(--fig-1)"
        strokeWidth={2}
        markerEnd="url(#cl-arrow)"
      />
      {points.map((p) => (
        <g key={p.label}>
          <circle
            cx={zOf(p.s.pH)}
            cy={zY}
            r={3.5}
            fill={p.s === OCEAN_PRE ? "var(--fig-axis)" : "var(--fig-1)"}
          />
          <text
            x={zOf(p.s.pH)}
            y={p.above ? zY - 8 : zY + 15}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={8.5}
            fontWeight={600}
          >
            {p.s.pH.toFixed(2)}
          </text>
          <text
            x={zOf(p.s.pH)}
            y={p.above ? zY - 18 : zY + 25}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={7.5}
          >
            {p.label}
          </text>
        </g>
      ))}
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */
/* Kinetics at home                                                         */
/* ---------------------------------------------------------------------- */

/**
 * The Maxwell–Boltzmann energy distribution at fridge and counter
 * temperature, integrated past Ea = 50 kJ/mol. The tail fractions are ~1e-9,
 * so a linear axis would show nothing; on a log axis the gap is visible.
 */
const R_GAS = 8.314e-3; // kJ/(mol·K)
const EA_SPOILAGE = 50; // kJ/mol
const T_FRIDGE = 277.15;
const T_COUNTER = 295.15;

function maxwellF(E: number, T: number): number {
  const RT = R_GAS * T;
  return ((2 * Math.sqrt(E / Math.PI)) / Math.pow(RT, 1.5)) * Math.exp(-E / RT);
}

function tailFraction(T: number, Ea: number): number {
  const steps = 8000,
    eMax = 400,
    dE = eMax / steps;
  let sum = 0;
  for (let i = 1; i < steps; i++) {
    const E = i * dE;
    if (E >= Ea) sum += maxwellF(E, T) * dE;
  }
  return sum;
}

// Cross-checked against a Python trapezoid integration: 3.64×, vs the
// simple exp(-Ea/RT) ratio of 3.76× the essay's "about four times" rounds.
const TAIL_RATIO = tailFraction(T_COUNTER, EA_SPOILAGE) / tailFraction(T_FRIDGE, EA_SPOILAGE);

function MaxwellBoltzmannShift() {
  const px = 56,
    py = 20,
    pw = 350,
    ph = 150;
  const eMax = 70;
  const logMin = -12,
    logMax = 0;
  const xOf = (E: number) => px + (E / eMax) * pw;
  const yOf = (f: number) => {
    const l = Math.log10(Math.max(f, Math.pow(10, logMin)));
    return py + ph - ((l - logMin) / (logMax - logMin)) * ph;
  };
  const sample = (T: number) =>
    Array.from({ length: 141 }, (_, i) => {
      const E = Math.max((i / 140) * eMax, 0.05);
      return { x: xOf(E), y: yOf(maxwellF(E, T)) };
    });
  const tailPoly = (T: number) => {
    const pts = Array.from({ length: 41 }, (_, i) => {
      const E = EA_SPOILAGE + (i / 40) * (eMax - EA_SPOILAGE);
      return { x: xOf(E), y: yOf(maxwellF(E, T)) };
    });
    return pathFrom(pts, { toY: py + ph });
  };

  return (
    <Figure
      viewBox="0 0 450 226"
      maxWidth={560}
      alt="Two Maxwell–Boltzmann energy distributions on a logarithmic vertical axis, one at 4 degrees Celsius and one at 22 degrees. Both fall steeply with energy; the colder one falls faster. At the 50 kilojoule per mole activation energy, marked by a vertical line, the warm curve sits visibly above the cold one, and the shaded tails beyond that line differ by a factor of about 3.6."
      caption={`f(E) ∝ √E · e^(−E/RT), on a log axis because only ~10⁻⁹ of molecules clear Eₐ at either temperature. Integrated past 50 kJ/mol, the 22 °C tail is ${TAIL_RATIO.toFixed(1)}× the 4 °C tail — the text's "about four times slower" in the fridge.`}
    >
      <Axes
        x={px}
        y={py}
        w={pw}
        h={ph}
        xLabel="molecular energy (kJ/mol)"
        yLabel="fraction (log)"
        xTicks={[0, 10, 20, 30, 40, 50, 60, 70].map((e) => ({ at: e / eMax, label: String(e) }))}
        yTicks={[
          { at: 0, label: "10⁻¹²" },
          { at: 1 / 3, label: "10⁻⁸" },
          { at: 2 / 3, label: "10⁻⁴" },
          { at: 1, label: "1" },
        ]}
      />
      <path d={tailPoly(T_COUNTER)} fill="var(--fig-1)" fillOpacity={0.18} stroke="none" />
      <path d={tailPoly(T_FRIDGE)} fill="var(--fig-2)" fillOpacity={0.25} stroke="none" />
      <line
        x1={xOf(EA_SPOILAGE)}
        y1={py}
        x2={xOf(EA_SPOILAGE)}
        y2={py + ph}
        stroke="var(--fig-axis)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <text
        x={xOf(EA_SPOILAGE) + 4}
        y={py + 12}
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        Eₐ = 50
      </text>
      <path d={pathFrom(sample(T_FRIDGE))} fill="none" stroke="var(--fig-2)" strokeWidth={2} />
      <path d={pathFrom(sample(T_COUNTER))} fill="none" stroke="var(--fig-1)" strokeWidth={2} />
      <SeriesLabel x={xOf(30)} y={py + 16} color="var(--fig-1)">
        counter, 22 °C
      </SeriesLabel>
      <SeriesLabel x={xOf(30)} y={py + 30} color="var(--fig-2)">
        fridge, 4 °C
      </SeriesLabel>
      <text x={xOf(1)} y={py + ph - 22} className="fill-foreground" fontSize={9} fontWeight={600}>
        shaded tails past Eₐ:
      </text>
      <text x={xOf(1)} y={py + ph - 10} className="fill-muted-foreground" fontSize={9}>
        {TAIL_RATIO.toFixed(1)}× bigger at 22 °C
      </text>
    </Figure>
  );
}

/**
 * Maillard browning, Arrhenius-shaped. Ea = 125 kJ/mol is not a literature
 * value (those vary by system); it is the Ea that reproduces the essay's own
 * two landmarks — idle at 100 °C, ~50× faster by 140 °C.
 */
const MAILLARD_EA = 125;
function maillardRate(tC: number): number {
  return Math.exp((-MAILLARD_EA / R_GAS) * (1 / (tC + 273.15) - 1 / 373.15));
}

function MaillardArrheniusCurve() {
  const px = 50,
    py = 22,
    pw = 356,
    ph = 150;
  const tMin = 80,
    tMax = 200;
  const logMin = -1.2,
    logMax = 3.8;
  const xOf = (t: number) => px + ((t - tMin) / (tMax - tMin)) * pw;
  const yOf = (rate: number) => py + ph - ((Math.log10(rate) - logMin) / (logMax - logMin)) * ph;
  const curve = Array.from({ length: 121 }, (_, i) => {
    const t = tMin + i;
    return { x: xOf(t), y: yOf(maillardRate(t)) };
  });
  const r140 = maillardRate(140);

  return (
    <Figure
      viewBox="0 0 450 222"
      maxWidth={560}
      alt="Maillard browning rate on a logarithmic axis against surface temperature from 80 to 200 degrees Celsius, rising steeply the whole way. A shaded band up to 100 degrees is labelled wet surface pinned here, because evaporation holds a wet surface at the boiling point. A marker at 140 degrees shows the rate roughly fifty times its value at 100."
      caption={`Rate ∝ e^(−Eₐ/RT) with Eₐ = 125 kJ/mol, the value that reproduces the text's landmarks: idle at 100 °C, ~${r140.toFixed(0)}× faster at 140 °C. A wet surface can't leave the shaded band — every joule goes into evaporation — so browning waits until it dries.`}
    >
      <Axes
        x={px}
        y={py}
        w={pw}
        h={ph}
        xLabel="surface temperature (°C)"
        yLabel="browning rate (log)"
        xTicks={[80, 100, 120, 140, 160, 180, 200].map((t) => ({
          at: (t - tMin) / (tMax - tMin),
          label: String(t),
        }))}
        yTicks={[
          { at: (0 - logMin) / (logMax - logMin), label: "1×" },
          { at: (1 - logMin) / (logMax - logMin), label: "10×" },
          { at: (2 - logMin) / (logMax - logMin), label: "100×" },
          { at: (3 - logMin) / (logMax - logMin), label: "1000×" },
        ]}
      />
      <rect
        x={px}
        y={py}
        width={xOf(100) - px}
        height={ph}
        fill="var(--fig-2)"
        fillOpacity={0.12}
      />
      <text x={px + 5} y={py + 12} className="fill-foreground" fontSize={9} fontWeight={600}>
        wet surface
      </text>
      <text x={px + 5} y={py + 23} className="fill-muted-foreground" fontSize={8}>
        pinned ≤ 100 °C
      </text>
      <path d={pathFrom(curve)} fill="none" stroke="var(--fig-1)" strokeWidth={2} />
      <circle cx={xOf(100)} cy={yOf(1)} r={3.5} fill="var(--fig-2)" />
      <circle cx={xOf(140)} cy={yOf(r140)} r={3.5} fill="var(--fig-1)" />
      <text
        x={xOf(140) + 7}
        y={yOf(r140) + 14}
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        140 °C: browning obvious
      </text>
      <text x={xOf(100) + 7} y={yOf(1) + 14} className="fill-muted-foreground" fontSize={8.5}>
        boiling: barely moving
      </text>
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */
/* Buffers — blood                                                          */
/* ---------------------------------------------------------------------- */

const BLOOD_PKA = 6.1;
const BLOOD_PH = 7.4;
const BLOOD_RATIO = Math.pow(10, BLOOD_PH - BLOOD_PKA); // ≈ 20, the text's 24 mM / 1.2 mM

/**
 * Upper panel: on a plain pH dial, blood's operating point sits 1.3 units
 * above pKa — outside the textbook pKa ± 1 range. Lower panel: why it works
 * anyway, because lungs and kidneys each hold one side of the ratio.
 */
function BufferOpenSystem() {
  const railY = 76;
  const x0 = 40,
    w = 370;
  const lo = 4,
    hi = 10;
  const xOf = (pH: number) => x0 + ((pH - lo) / (hi - lo)) * w;

  return (
    <Figure
      viewBox="0 0 450 312"
      maxWidth={560}
      alt="Top: a pH dial from four to ten. A shaded band marks the textbook effective buffer range, one unit either side of carbonic acid's pKa of 6.1. Blood's operating pH of 7.4 sits just outside that band. Bottom: the bicarbonate equilibrium in a box, with the lungs removing carbon dioxide from it within minutes and the kidneys resetting bicarbonate over hours to days, beside a crossed-out sealed beaker labelled fixed capacity."
      caption={`[HCO₃⁻]/[CO₂] = 10^(7.4 − 6.1) ≈ ${BLOOD_RATIO.toFixed(0)} — the text's 24 mM over 1.2 mM. That ratio puts blood outside the pKa ± 1 rule for a sealed buffer. It holds anyway because the lungs set one side of the ratio and the kidneys set the other.`}
    >
      <ArrowDefs id="bo-arrow" />
      <ArrowDefs id="bo-arrow-2" color="var(--fig-2)" />
      <ArrowDefs id="bo-arrow-3" color="var(--fig-3)" />
      <Note x={225} y={16}>
        pH = pKa + log([HCO₃⁻]/[CO₂])
      </Note>
      <rect
        x={xOf(BLOOD_PKA - 1)}
        y={railY - 34}
        width={xOf(BLOOD_PKA + 1) - xOf(BLOOD_PKA - 1)}
        height={38}
        fill="var(--fig-3)"
        fillOpacity={0.14}
      />
      <Note x={xOf(BLOOD_PKA)} y={railY - 40}>
        sealed-buffer range, pKa ± 1
      </Note>
      <line x1={x0} y1={railY} x2={x0 + w} y2={railY} stroke="var(--fig-axis)" strokeWidth={1.5} />
      {[4, 5, 6, 7, 8, 9, 10].map((t) => (
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
      <line
        x1={xOf(BLOOD_PKA)}
        y1={railY - 6}
        x2={xOf(BLOOD_PKA)}
        y2={railY + 6}
        stroke="var(--fig-2)"
        strokeWidth={2}
      />
      <text
        x={xOf(BLOOD_PKA)}
        y={railY - 12}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={9}
        fontWeight={600}
      >
        pKa 6.1
      </text>
      <circle cx={xOf(BLOOD_PH)} cy={railY} r={4.5} fill="var(--fig-1)" />
      <text
        x={xOf(BLOOD_PH) + 8}
        y={railY - 12}
        className="fill-foreground"
        fontSize={10}
        fontWeight={700}
      >
        blood 7.4
      </text>
      <line
        x1={xOf(BLOOD_PKA)}
        y1={railY + 26}
        x2={xOf(BLOOD_PH)}
        y2={railY + 26}
        stroke="var(--fig-1)"
        strokeWidth={1}
      />
      <line
        x1={xOf(BLOOD_PKA)}
        y1={railY + 22}
        x2={xOf(BLOOD_PKA)}
        y2={railY + 30}
        stroke="var(--fig-1)"
        strokeWidth={1}
      />
      <line
        x1={xOf(BLOOD_PH)}
        y1={railY + 22}
        x2={xOf(BLOOD_PH)}
        y2={railY + 30}
        stroke="var(--fig-1)"
        strokeWidth={1}
      />
      <text
        x={(xOf(BLOOD_PKA) + xOf(BLOOD_PH)) / 2}
        y={railY + 42}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={8.5}
      >
        1.3 units: ratio ≈ {BLOOD_RATIO.toFixed(0)} : 1
      </text>

      {/* Lower panel: open at both ends */}
      <g transform="translate(0 150)">
        <rect
          x={160}
          y={36}
          width={130}
          height={34}
          rx={7}
          fill="none"
          stroke="var(--fig-axis)"
          strokeWidth={1.5}
        />
        <text
          x={225}
          y={57}
          textAnchor="middle"
          className="fill-foreground"
          fontSize={10}
          fontWeight={700}
        >
          CO₂ ⇌ H⁺ + HCO₃⁻
        </text>

        <rect
          x={20}
          y={0}
          width={110}
          height={32}
          rx={7}
          fill="none"
          stroke="var(--fig-2)"
          strokeWidth={1.5}
        />
        <text
          x={75}
          y={15}
          textAnchor="middle"
          className="fill-foreground"
          fontSize={10}
          fontWeight={700}
        >
          lungs
        </text>
        <text x={75} y={26} textAnchor="middle" className="fill-muted-foreground" fontSize={8}>
          vent CO₂ · minutes
        </text>
        <line
          x1={170}
          y1={36}
          x2={132}
          y2={22}
          stroke="var(--fig-2)"
          strokeWidth={1.5}
          markerEnd="url(#bo-arrow-2)"
        />

        <rect
          x={320}
          y={0}
          width={110}
          height={32}
          rx={7}
          fill="none"
          stroke="var(--fig-3)"
          strokeWidth={1.5}
        />
        <text
          x={375}
          y={15}
          textAnchor="middle"
          className="fill-foreground"
          fontSize={10}
          fontWeight={700}
        >
          kidneys
        </text>
        <text x={375} y={26} textAnchor="middle" className="fill-muted-foreground" fontSize={8}>
          reset HCO₃⁻ · hours–days
        </text>
        <line
          x1={318}
          y1={22}
          x2={282}
          y2={36}
          stroke="var(--fig-3)"
          strokeWidth={1.5}
          markerEnd="url(#bo-arrow-3)"
        />

        <g transform="translate(180 96)">
          <path
            d="M 0 0 L 6 44 L 84 44 L 90 0"
            fill="none"
            stroke="var(--fig-axis)"
            strokeWidth={1.5}
          />
          <line x1={20} y1={10} x2={70} y2={38} stroke="var(--fig-1)" strokeWidth={1.5} />
          <line x1={20} y1={38} x2={70} y2={10} stroke="var(--fig-1)" strokeWidth={1.5} />
        </g>
        <text x={225} y={156} textAnchor="middle" className="fill-muted-foreground" fontSize={8.5}>
          a sealed beaker: fixed capacity, eventually used up
        </text>
      </g>
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */
/* Policy — ozone                                                           */
/* ---------------------------------------------------------------------- */

/**
 * Upper panel: the Cl/ClO cycle, which returns its chlorine unchanged.
 * Lower panel: why the result is a seasonal Antarctic hole rather than a
 * uniform thinning — reactive chlorine is stockpiled in the dark, then
 * released all at once by returning sunlight.
 */
function OzoneCatalyticCycle() {
  const stages = [
    { x: 30, label: "polar winter", sub: "ice clouds free Cl₂ from reservoirs" },
    { x: 150, label: "dark", sub: "Cl₂ piles up — no light to split it" },
    { x: 290, label: "spring sun", sub: "Cl₂ → 2 Cl• all at once" },
    { x: 420, label: "ozone hole", sub: "rapid catalytic loss" },
  ];
  return (
    <Figure
      viewBox="0 0 450 270"
      maxWidth={560}
      alt="Top: a two-step cycle. A chlorine atom reacts with ozone to give chlorine monoxide and oxygen; chlorine monoxide reacts with an oxygen atom to give back the chlorine atom and more oxygen. The net reaction is an oxygen atom plus ozone giving two oxygen molecules, with chlorine cancelling out. Bottom: a timeline of four stages — polar winter ice clouds release chlorine gas from reservoir compounds, it accumulates through the dark, spring sunlight splits it into chlorine atoms all at once, and the ozone hole follows."
      caption="Chlorine comes out of each lap unchanged, so one atom destroys ~10⁵ O₃ before it's parked as HCl or ClONO₂. The hole is seasonal because Antarctic winter stockpiles reactive chlorine in the dark, and the first spring sunlight sets it all off together."
    >
      <ArrowDefs id="oc-arrow" />
      <circle cx={130} cy={72} r={26} fill="none" stroke="var(--fig-1)" strokeWidth={1.5} />
      <text
        x={130}
        y={77}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={13}
        fontWeight={700}
      >
        Cl•
      </text>
      <circle cx={320} cy={72} r={26} fill="none" stroke="var(--fig-2)" strokeWidth={1.5} />
      <text
        x={320}
        y={77}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={13}
        fontWeight={700}
      >
        ClO•
      </text>
      <path
        d="M 154 60 Q 225 18 294 60"
        fill="none"
        stroke="var(--fig-axis)"
        strokeWidth={1.5}
        markerEnd="url(#oc-arrow)"
      />
      <text
        x={225}
        y={28}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={9.5}
        fontWeight={600}
      >
        Cl + O₃ → ClO + O₂
      </text>
      <path
        d="M 296 86 Q 225 128 156 86"
        fill="none"
        stroke="var(--fig-axis)"
        strokeWidth={1.5}
        markerEnd="url(#oc-arrow)"
      />
      <text
        x={225}
        y={124}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={9.5}
        fontWeight={600}
      >
        ClO + O → Cl + O₂
      </text>
      <text x={225} y={152} textAnchor="middle" className="fill-muted-foreground" fontSize={9.5}>
        net: O + O₃ → 2 O₂ · Cl cancels · ~10⁵ laps per atom
      </text>

      <g transform="translate(0 186)">
        <line x1={30} y1={24} x2={420} y2={24} stroke="var(--fig-axis)" strokeWidth={1.5} />
        {stages.map((s, i) => {
          const anchor = i === 0 ? "start" : i === stages.length - 1 ? "end" : "middle";
          return (
            <g key={s.label}>
              <circle cx={s.x} cy={24} r={4.5} fill={i >= 2 ? "var(--fig-1)" : "var(--fig-axis)"} />
              <text
                x={s.x}
                y={10}
                textAnchor={anchor}
                className="fill-foreground"
                fontSize={10}
                fontWeight={700}
              >
                {s.label}
              </text>
              <text
                x={s.x}
                y={i % 2 === 0 ? 42 : 56}
                textAnchor={anchor}
                className="fill-muted-foreground"
                fontSize={8}
              >
                {s.sub}
              </text>
            </g>
          );
        })}
      </g>
    </Figure>
  );
}

export {
  ChiralRecognition,
  EnantiomerOutcomes,
  AutoxidationCycle,
  PlasticHydrolysisThreshold,
  CarbonateLadder,
  MaxwellBoltzmannShift,
  MaillardArrheniusCurve,
  BufferOpenSystem,
  OzoneCatalyticCycle,
};

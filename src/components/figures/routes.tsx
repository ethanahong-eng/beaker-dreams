import { Axes, ArrowDefs, Figure, Note, SeriesLabel, pathFrom, type FigureDef } from "./Figure";

/**
 * Diagrams for the five hand-built route pages (geometry, hybridization,
 * kinetics, equilibrium, everyday). These are used directly as JSX in those
 * routes rather than through a lesson's `figure` key, but they live in the
 * registry so the render/accessibility check covers them too.
 */

const R = 8.314e-3; // kJ/mol/K

/* ---------------------------------------------------------------------- */

/**
 * The central figure of the kinetics page: why a small temperature rise
 * multiplies rate. Both curves are the real Maxwell-Boltzmann energy
 * distribution, f(E) proportional to sqrt(E)*exp(-E/RT), at 300 K and 310 K.
 *
 * The honest difficulty here is that a 10 K rise barely moves the
 * distribution -- which is exactly the prose's point, and exactly what makes
 * it hard to draw. So the main panel shows how nearly identical the curves
 * are, and the inset magnifies the tail past Ea where the fraction of
 * molecules with enough energy actually changes. Drawing only the main panel
 * would understate the effect; drawing only the inset would misrepresent the
 * distributions as far apart.
 */
export function MaxwellBoltzmannTail() {
  const T1 = 300,
    T2 = 310,
    Ea = 50; // kJ/mol
  const eMax = 90;
  const f = (E: number, T: number) => Math.sqrt(E) * Math.exp(-E / (R * T));

  // Normalize both curves by the same constant -- the 300 K peak -- so their
  // relative heights stay meaningful. Scaling each to its own peak would hide
  // the (small) real difference between them.
  const peak = f(R * T1 * 0.5, T1) || 1;
  let scale = 0;
  for (let i = 0; i <= 400; i++) scale = Math.max(scale, f((eMax * i) / 400, T1));
  const norm = scale || peak;

  const PX = 46,
    PY = 12,
    PW = 250,
    PH = 132;
  const xOf = (E: number) => PX + (E / eMax) * PW;
  const yOf = (v: number) => PY + PH - (v / norm) * PH;
  const curve = (T: number) => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 300; i++) {
      const E = (eMax * i) / 300;
      pts.push({ x: xOf(E), y: yOf(f(E, T)) });
    }
    return pts;
  };
  const tail = (T: number) => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 120; i++) {
      const E = Ea + ((eMax - Ea) * i) / 120;
      pts.push({ x: xOf(E), y: yOf(f(E, T)) });
    }
    return pts;
  };

  // Inset: the tail region, rescaled so the difference is visible.
  const IX = 322,
    IY = 40,
    IW = 108,
    IH = 78;
  const iLo = 48,
    iHi = 72;
  let iMax = 0;
  for (let i = 0; i <= 100; i++) iMax = Math.max(iMax, f(iLo + ((iHi - iLo) * i) / 100, T2));
  const ixOf = (E: number) => IX + ((E - iLo) / (iHi - iLo)) * IW;
  const iyOf = (v: number) => IY + IH - (v / iMax) * IH;
  const iCurve = (T: number) => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 100; i++) {
      const E = iLo + ((iHi - iLo) * i) / 100;
      pts.push({ x: ixOf(E), y: iyOf(f(E, T)) });
    }
    return pts;
  };

  // The headline number: the Boltzmann factor ratio at Ea.
  const ratio = Math.exp(-Ea / (R * T2)) / Math.exp(-Ea / (R * T1));

  return (
    <Figure
      viewBox="0 0 450 200"
      alt={`Maxwell-Boltzmann energy distributions at 300 and 310 kelvin. The two curves are almost indistinguishable across the full energy range, but the shaded region beyond the activation energy of 50 kilojoules per mole contains about ${ratio.toFixed(1)} times more molecules at the higher temperature, which is why a small temperature rise multiplies reaction rate.`}
      caption={`Molecular energies at 300 K and 310 K. The distributions barely move — but past Eₐ the shaded fraction grows ${ratio.toFixed(1)}×, and that tail is what reacts.`}
    >
      <Axes
        x={PX}
        y={PY}
        w={PW}
        h={PH}
        xLabel="molecular energy (kJ/mol)"
        yLabel="fraction of molecules"
        xTicks={[0, 30, 60, 90].map((v) => ({ at: v / eMax, label: String(v) }))}
      />

      <path d={pathFrom(tail(T1), { toY: PY + PH })} fill="var(--fig-1)" opacity={0.16} />
      <path d={pathFrom(curve(T1))} fill="none" stroke="var(--fig-1)" strokeWidth={2} />
      <path d={pathFrom(curve(T2))} fill="none" stroke="var(--fig-2)" strokeWidth={2} />

      <line
        x1={xOf(Ea)}
        y1={PY}
        x2={xOf(Ea)}
        y2={PY + PH}
        stroke="var(--fig-axis)"
        strokeWidth={1.25}
        strokeDasharray="4 3"
      />
      <Note x={xOf(Ea) + 4} y={PY + 10} anchor="start">
        Eₐ = 50
      </Note>

      <SeriesLabel x={xOf(18)} y={PY + 30} color="var(--fig-1)">
        300 K
      </SeriesLabel>
      <SeriesLabel x={xOf(18)} y={PY + 46} color="var(--fig-2)">
        310 K
      </SeriesLabel>

      {/* Inset */}
      <rect
        x={IX - 8}
        y={IY - 16}
        width={IW + 18}
        height={IH + 34}
        rx={5}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth={1}
      />
      <Note x={IX + IW / 2} y={IY - 5}>
        tail, magnified
      </Note>
      <line
        x1={IX}
        y1={IY + IH}
        x2={IX + IW}
        y2={IY + IH}
        stroke="var(--fig-axis)"
        strokeWidth={1.25}
      />
      <path d={pathFrom(iCurve(T1))} fill="none" stroke="var(--fig-1)" strokeWidth={2} />
      <path d={pathFrom(iCurve(T2))} fill="none" stroke="var(--fig-2)" strokeWidth={2} />
      <Note x={IX + IW / 2} y={IY + IH + 14}>
        {`${iLo}–${iHi} kJ/mol`}
      </Note>

      <ArrowDefs id="mb-arrow" color="var(--fig-axis)" />
      <line
        x1={xOf(72)}
        y1={yOf(f(58, T1)) - 4}
        x2={IX - 12}
        y2={IY + IH / 2}
        stroke="var(--fig-axis)"
        strokeWidth={1}
        strokeDasharray="2 2"
        markerEnd="url(#mb-arrow)"
      />
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */

/**
 * Lone pairs take more angular room than bonding pairs, so each one squeezes
 * the remaining bond angles. Three real molecules with their measured angles:
 * the trend is the evidence for the claim.
 */
export function LonePairSqueeze() {
  const mols = [
    { name: "CH₄", angle: 109.5, lp: 0, sub: "no lone pairs" },
    { name: "NH₃", angle: 107.8, lp: 1, sub: "one lone pair" },
    { name: "H₂O", angle: 104.5, lp: 2, sub: "two lone pairs" },
  ];
  return (
    <Figure
      viewBox="0 0 450 190"
      alt="Three molecules with the same tetrahedral electron geometry but different numbers of lone pairs: methane at 109.5 degrees, ammonia at 107.8 degrees, and water at 104.5 degrees. Each added lone pair squeezes the bond angle further closed."
      caption="Same tetrahedral electron geometry, three different shapes. Each lone pair claims more angular space, closing the bond angle by roughly two degrees."
    >
      {mols.map((m, i) => {
        const cx = 85 + i * 145;
        const cy = 84;
        const half = ((m.angle / 2) * Math.PI) / 180;
        const L = 42;
        return (
          <g key={m.name}>
            {/* lone pairs, drawn as fatter lobes above the atom */}
            {Array.from({ length: m.lp }).map((_, k) => {
              const a = -Math.PI / 2 + (m.lp === 1 ? 0 : k === 0 ? -0.44 : 0.44);
              return (
                <ellipse
                  key={k}
                  cx={cx + Math.cos(a) * 26}
                  cy={cy + Math.sin(a) * 26}
                  rx={13}
                  ry={8.5}
                  transform={`rotate(${(a * 180) / Math.PI + 90} ${cx + Math.cos(a) * 26} ${cy + Math.sin(a) * 26})`}
                  fill="var(--fig-2)"
                  opacity={0.22}
                  stroke="var(--fig-2)"
                  strokeWidth={1}
                />
              );
            })}
            {/* the two drawn bonds, opening downward at the real angle */}
            {[-1, 1].map((s) => (
              <line
                key={s}
                x1={cx}
                y1={cy}
                x2={cx + s * Math.sin(half) * L}
                y2={cy + Math.cos(half) * L}
                stroke="var(--fig-1)"
                strokeWidth={2.25}
              />
            ))}
            {[-1, 1].map((s) => (
              <circle
                key={`a${s}`}
                cx={cx + s * Math.sin(half) * L}
                cy={cy + Math.cos(half) * L}
                r={7}
                fill="var(--card)"
                stroke="var(--fig-1)"
                strokeWidth={1.5}
              />
            ))}
            <circle cx={cx} cy={cy} r={10} fill="var(--fig-1)" />
            <text
              x={cx}
              y={cy + 3.5}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill="var(--card)"
            >
              {m.name[0]}
            </text>
            <text
              x={cx}
              y={cy + 62}
              textAnchor="middle"
              className="fill-foreground"
              fontSize={13}
              fontWeight={700}
            >
              {m.angle}°
            </text>
            <text
              x={cx}
              y={cy + 78}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {m.name} · {m.sub}
            </text>
          </g>
        );
      })}
      <Note x={225} y={172}>
        lone pair (shaded) · bonding pair (line)
      </Note>
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */

/**
 * Sigma overlap is end-on and cylindrically symmetric, so rotation about it
 * costs almost nothing; pi overlap is side-on, and rotating breaks it. This
 * is the whole reason a double bond is rigid and cis/trans isomers can be
 * isolated -- the barrier numbers are ethane's ~12 kJ/mol against ethene's
 * ~270 kJ/mol, both quoted in the page's prose.
 */
export function SigmaVsPiOverlap() {
  return (
    <Figure
      viewBox="0 0 450 200"
      alt="Sigma bonding shows two orbitals overlapping end-on along the internuclear axis, giving a bond that is cylindrically symmetric and rotates freely with a barrier near 12 kilojoules per mole. Pi bonding shows two p orbitals overlapping side-on above and below the axis, so rotation breaks the overlap and costs about 270 kilojoules per mole."
      caption="σ overlap is end-on and survives rotation; π overlap is side-on and rotation destroys it. That difference is why C–C spins freely and C=C does not."
    >
      <ArrowDefs id="rot-arrow" color="var(--fig-axis)" />

      {/* sigma */}
      <g>
        <text
          x={112}
          y={22}
          textAnchor="middle"
          className="fill-foreground"
          fontSize={11}
          fontWeight={700}
        >
          σ — end-on
        </text>
        <line
          x1={38}
          y1={78}
          x2={186}
          y2={78}
          stroke="var(--fig-axis)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <ellipse
          cx={90}
          cy={78}
          rx={34}
          ry={21}
          fill="var(--fig-1)"
          opacity={0.25}
          stroke="var(--fig-1)"
          strokeWidth={1.5}
        />
        <ellipse
          cx={134}
          cy={78}
          rx={34}
          ry={21}
          fill="var(--fig-1)"
          opacity={0.25}
          stroke="var(--fig-1)"
          strokeWidth={1.5}
        />
        <circle cx={90} cy={78} r={4} fill="var(--fig-1)" />
        <circle cx={134} cy={78} r={4} fill="var(--fig-1)" />
        <path
          d="M100,112 A26,26 0 1 0 124,112"
          fill="none"
          stroke="var(--fig-axis)"
          strokeWidth={1.25}
          markerEnd="url(#rot-arrow)"
        />
        <text x={112} y={140} textAnchor="middle" className="fill-foreground" fontSize={10}>
          rotates freely
        </text>
        <text x={112} y={156} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
          ethane barrier ≈ 12 kJ/mol
        </text>
      </g>

      <line x1={225} y1={30} x2={225} y2={168} stroke="var(--border)" strokeWidth={1} />

      {/* pi */}
      <g>
        <text
          x={338}
          y={22}
          textAnchor="middle"
          className="fill-foreground"
          fontSize={11}
          fontWeight={700}
        >
          π — side-on
        </text>
        <line
          x1={264}
          y1={78}
          x2={412}
          y2={78}
          stroke="var(--fig-axis)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <ellipse
          cx={316}
          cy={60}
          rx={20}
          ry={13}
          fill="var(--fig-pos)"
          opacity={0.28}
          stroke="var(--fig-pos)"
          strokeWidth={1.5}
        />
        <ellipse
          cx={360}
          cy={60}
          rx={20}
          ry={13}
          fill="var(--fig-pos)"
          opacity={0.28}
          stroke="var(--fig-pos)"
          strokeWidth={1.5}
        />
        <ellipse
          cx={316}
          cy={96}
          rx={20}
          ry={13}
          fill="var(--fig-neg)"
          opacity={0.28}
          stroke="var(--fig-neg)"
          strokeWidth={1.5}
        />
        <ellipse
          cx={360}
          cy={96}
          rx={20}
          ry={13}
          fill="var(--fig-neg)"
          opacity={0.28}
          stroke="var(--fig-neg)"
          strokeWidth={1.5}
        />
        <circle cx={316} cy={78} r={4} fill="var(--foreground)" />
        <circle cx={360} cy={78} r={4} fill="var(--foreground)" />
        <path
          d="M326,112 A26,26 0 1 0 350,112"
          fill="none"
          stroke="var(--fig-axis)"
          strokeWidth={1.25}
          strokeDasharray="3 3"
          markerEnd="url(#rot-arrow)"
        />
        <line x1={324} y1={124} x2={352} y2={104} stroke="var(--fig-1)" strokeWidth={2} />
        <line x1={324} y1={104} x2={352} y2={124} stroke="var(--fig-1)" strokeWidth={2} />
        <text x={338} y={140} textAnchor="middle" className="fill-foreground" fontSize={10}>
          rotation breaks overlap
        </text>
        <text x={338} y={156} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
          ethene barrier ≈ 270 kJ/mol
        </text>
      </g>

      <Note x={225} y={186}>
        lobe shading shows orbital phase
      </Note>
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */

/**
 * Q against K on one axis, with the direction of shift read straight off the
 * comparison. The page derives this from dG = RT ln(Q/K) rather than
 * asserting it, so the figure labels the free-energy sign alongside.
 */
export function QversusK() {
  const AX = 58,
    AY = 88,
    AW = 334;
  const kAt = AX + AW * 0.5;
  return (
    <Figure
      viewBox="0 0 450 160"
      alt="A number line for the reaction quotient Q with the equilibrium constant K at its centre. When Q is less than K the free energy change is negative and the reaction runs forward; when Q equals K the free energy change is zero and the system is at equilibrium; when Q is greater than K the free energy change is positive and the reaction runs in reverse."
      caption="Q versus K decides direction, and ΔG = RT ln(Q/K) says why: the sign of the logarithm is the sign of ΔG."
    >
      <ArrowDefs id="qk-arrow" color="var(--fig-axis)" />
      <line x1={AX} y1={AY} x2={AX + AW} y2={AY} stroke="var(--fig-axis)" strokeWidth={1.5} />

      <line
        x1={kAt}
        y1={AY - 26}
        x2={kAt}
        y2={AY + 12}
        stroke="var(--foreground)"
        strokeWidth={2}
      />
      <text
        x={kAt}
        y={AY - 33}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={12}
        fontWeight={700}
      >
        Q = K
      </text>
      <text x={kAt} y={AY + 28} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        ΔG = 0 · at equilibrium
      </text>

      <line
        x1={AX + 24}
        y1={AY - 14}
        x2={kAt - 30}
        y2={AY - 14}
        stroke="var(--fig-1)"
        strokeWidth={2}
        markerEnd="url(#qk-arrow)"
      />
      <text
        x={(AX + 24 + kAt - 30) / 2}
        y={AY - 22}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={11}
        fontWeight={700}
      >
        Q &lt; K
      </text>
      <text
        x={(AX + 24 + kAt - 30) / 2}
        y={AY + 28}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        ΔG &lt; 0 · runs forward
      </text>

      <line
        x1={AX + AW - 24}
        y1={AY - 14}
        x2={kAt + 30}
        y2={AY - 14}
        stroke="var(--fig-2)"
        strokeWidth={2}
        markerEnd="url(#qk-arrow)"
      />
      <text
        x={(AX + AW - 24 + kAt + 30) / 2}
        y={AY - 22}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={11}
        fontWeight={700}
      >
        Q &gt; K
      </text>
      <text
        x={(AX + AW - 24 + kAt + 30) / 2}
        y={AY + 28}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
      >
        ΔG &gt; 0 · runs in reverse
      </text>

      <Note x={AX} y={AY + 50} anchor="start">
        more reactant
      </Note>
      <Note x={AX + AW} y={AY + 50} anchor="end">
        more product
      </Note>
    </Figure>
  );
}

/* ---------------------------------------------------------------------- */

/**
 * Hybridization as a change of basis: the atomic orbitals go in on the left
 * at their own energies, the hybrids come out on the right all degenerate and
 * at the weighted-average energy. Drawn for sp3, with the s-character
 * fractions labelled because that is what Bent's rule turns on.
 */
export function HybridEnergyMixing() {
  const LX = 92,
    RX = 330;
  const sY = 138,
    pY = 62,
    hY = 96;
  const level = (x: number, y: number, w: number, key: string, color: string) => (
    <line key={key} x1={x - w / 2} y1={y} x2={x + w / 2} y2={y} stroke={color} strokeWidth={2.5} />
  );
  return (
    <Figure
      viewBox="0 0 450 200"
      alt="An energy diagram for sp3 hybridization. One s orbital at low energy and three p orbitals at higher energy combine into four equivalent sp3 hybrid orbitals at an intermediate energy, one quarter s character and three quarters p character, all at the same level."
      caption="sp³: one s and three p orbitals in, four equivalent hybrids out at the weighted-average energy — 25% s character each. No energy is created or destroyed; the basis is just rotated."
    >
      <text
        x={LX}
        y={26}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={11}
        fontWeight={700}
      >
        atomic orbitals
      </text>
      <text
        x={RX}
        y={26}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={11}
        fontWeight={700}
      >
        sp³ hybrids
      </text>

      {/* p set */}
      {[-34, 0, 34].map((dx, i) => level(LX + dx, pY, 26, `p${i}`, "var(--fig-2)"))}
      <text x={LX + 66} y={pY + 4} className="fill-muted-foreground" fontSize={10}>
        2p
      </text>
      {/* s */}
      {level(LX, sY, 26, "s", "var(--fig-1)")}
      <text x={LX + 22} y={sY + 4} className="fill-muted-foreground" fontSize={10}>
        2s
      </text>

      {/* hybrids */}
      {[-51, -17, 17, 51].map((dx, i) => level(RX + dx, hY, 26, `h${i}`, "var(--fig-3)"))}
      <text x={RX + 82} y={hY + 4} className="fill-muted-foreground" fontSize={10}>
        sp³
      </text>

      {/* mixing lines */}
      {[-51, -17, 17, 51].map((dx, i) => (
        <g key={`m${i}`}>
          <line
            x1={LX}
            y1={sY}
            x2={RX + dx}
            y2={hY}
            stroke="var(--fig-axis)"
            strokeWidth={0.75}
            strokeDasharray="2 3"
          />
          <line
            x1={LX + [-34, 0, 34, 0][i]!}
            y1={pY}
            x2={RX + dx}
            y2={hY}
            stroke="var(--fig-axis)"
            strokeWidth={0.75}
            strokeDasharray="2 3"
          />
        </g>
      ))}

      <line x1={40} y1={44} x2={40} y2={160} stroke="var(--fig-axis)" strokeWidth={1.25} />
      <text
        x={-102}
        y={28}
        transform="rotate(-90)"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={10}
      >
        energy
      </text>

      <Note x={225} y={182}>
        each hybrid: ¼ s character, ¾ p character
      </Note>
    </Figure>
  );
}

export const routesFigures = {
  "mb-tail": MaxwellBoltzmannTail,
  "lone-pair-squeeze": LonePairSqueeze,
  "sigma-vs-pi": SigmaVsPiOverlap,
  "q-vs-k": QversusK,
  "hybrid-energy": HybridEnergyMixing,
} satisfies Record<string, FigureDef>;

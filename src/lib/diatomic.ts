/**
 * Two-centre LCAO model for main-group diatomic molecules.
 *
 * This is the data and maths behind the Diatomic Bond Explorer. It is
 * deliberately free of any rendering concern so it can be evaluated on the
 * server, checked numerically, and reused.
 *
 * The model is explicitly schematic and says so on the page: the molecular
 * orbital is built from two Slater-like 1s-shaped atomic functions,
 *
 *   psi(r) = cA e^(-kA rA)  +/-  cB e^(-kB rB)
 *
 * with the decay constant k fixed from each element's covalent radius. That
 * is not a solution of the real many-electron problem, and it does not try to
 * be -- what it reproduces honestly is the *shape* of a bonding orbital, how
 * that shape distorts when the two atoms differ in electronegativity, and
 * where the node sits in the antibonding combination. Bond lengths, bond
 * energies and bond orders are measured gas-phase values, not model output.
 */

export type DiatomicElement = {
  sym: string;
  name: string;
  /** Atomic number. */
  Z: number;
  /** Pauling electronegativity. Null for the noble gases, which form no bond here. */
  en: number | null;
  /** Covalent radius in angstroms. */
  rc: number;
  /** Valence configuration, for display. */
  val: string;
  /** Period (1-3) and main-group column (1-2, then 3-8 for groups 13-18). */
  row: number;
  col: number;
  /** Nucleus tint. */
  color: string;
  /** Valence electron count contributed to the diagram. */
  ve: number;
  /** Slater-like decay constant for the atomic function, from the covalent radius. */
  k: number;
};

type ElementRow = [string, string, number, number | null, number, string, number, number, string];

// Periods 1-3, main-group layout: groups 1, 2 and 13-18.
const ELEMENT_ROWS: ElementRow[] = [
  ["H", "Hydrogen", 1, 2.2, 0.31, "1s¹", 1, 1, "#d8d2c4"],
  ["He", "Helium", 2, null, 0.28, "1s²", 1, 8, "#9a9a9a"],
  ["Li", "Lithium", 3, 0.98, 1.28, "2s¹", 2, 1, "#9a74c8"],
  ["Be", "Beryllium", 4, 1.57, 0.96, "2s²", 2, 2, "#5aa877"],
  ["B", "Boron", 5, 2.04, 0.84, "2s²2p¹", 2, 3, "#c98159"],
  ["C", "Carbon", 6, 2.55, 0.76, "2s²2p²", 2, 4, "#6b6862"],
  ["N", "Nitrogen", 7, 3.04, 0.71, "2s²2p³", 2, 5, "#4a6fc4"],
  ["O", "Oxygen", 8, 3.44, 0.66, "2s²2p⁴", 2, 6, "#c4443c"],
  ["F", "Fluorine", 9, 3.98, 0.57, "2s²2p⁵", 2, 7, "#4f9d55"],
  ["Ne", "Neon", 10, null, 0.58, "2s²2p⁶", 2, 8, "#9a9a9a"],
  ["Na", "Sodium", 11, 0.93, 1.66, "3s¹", 3, 1, "#9a74c8"],
  ["Mg", "Magnesium", 12, 1.31, 1.41, "3s²", 3, 2, "#5aa877"],
  ["Al", "Aluminium", 13, 1.61, 1.21, "3s²3p¹", 3, 3, "#8b86a8"],
  ["Si", "Silicon", 14, 1.9, 1.11, "3s²3p²", 3, 4, "#b08d4f"],
  ["P", "Phosphorus", 15, 2.19, 1.07, "3s²3p³", 3, 5, "#c47a28"],
  ["S", "Sulfur", 16, 2.58, 1.05, "3s²3p⁴", 3, 6, "#b09a1e"],
  ["Cl", "Chlorine", 17, 3.16, 1.02, "3s²3p⁵", 3, 7, "#4f9d55"],
  ["Ar", "Argon", 18, null, 1.06, "3s²3p⁶", 3, 8, "#9a9a9a"],
];

export const ELEMENTS: Record<string, DiatomicElement> = {};
for (const [sym, name, Z, en, rc, val, row, col, color] of ELEMENT_ROWS) {
  ELEMENTS[sym] = {
    sym,
    name,
    Z,
    en,
    rc,
    val,
    row,
    col,
    color,
    // Column is the group count for 1-2 and for 13-18 alike in this layout;
    // helium is the one element whose column (the noble-gas one) does not
    // match its two valence electrons.
    ve: sym === "He" ? 2 : col,
    k: 0.73 / rc,
  };
}

/** [A, B, equilibrium bond length in A, dissociation energy in kJ/mol, bond order] */
export type DiatomicData = readonly [string, string, number, number, number];

// Measured gas-phase values. These are data, not model output: the LCAO
// picture above is not accurate enough to predict a bond length.
export const DIATOMICS: DiatomicData[] = [
  ["H", "H", 0.741, 436, 1],
  ["Li", "Li", 2.673, 105, 1],
  ["B", "B", 1.59, 290, 1],
  ["C", "C", 1.243, 602, 2],
  ["N", "N", 1.098, 945, 3],
  ["O", "O", 1.208, 498, 2],
  ["F", "F", 1.412, 159, 1],
  ["Na", "Na", 3.079, 72, 1],
  ["Al", "Al", 2.701, 133, 1],
  ["Si", "Si", 2.246, 317, 2],
  ["P", "P", 1.893, 489, 3],
  ["S", "S", 1.889, 425, 2],
  ["Cl", "Cl", 1.988, 243, 1],
  ["Li", "H", 1.595, 238, 1],
  ["Be", "H", 1.343, 221, 1],
  ["B", "H", 1.232, 340, 1],
  ["C", "H", 1.12, 338, 1],
  ["N", "H", 1.036, 339, 1],
  ["O", "H", 0.97, 428, 1],
  ["H", "F", 0.917, 570, 1],
  ["Na", "H", 1.887, 186, 1],
  ["Mg", "H", 1.73, 127, 1],
  ["Al", "H", 1.648, 288, 1],
  ["Si", "H", 1.52, 293, 1],
  ["P", "H", 1.422, 297, 1],
  ["S", "H", 1.341, 353, 1],
  ["H", "Cl", 1.275, 432, 1],
  ["Li", "F", 1.564, 577, 1],
  ["Li", "Cl", 2.021, 469, 1],
  ["Na", "F", 1.926, 477, 1],
  ["Na", "Cl", 2.361, 412, 1],
  ["Be", "O", 1.331, 437, 2],
  ["Mg", "O", 1.749, 358, 2],
  ["Be", "F", 1.361, 573, 1],
  ["Mg", "F", 1.75, 463, 1],
  ["Mg", "Cl", 2.196, 318, 1],
  ["B", "F", 1.263, 757, 1],
  ["B", "Cl", 1.715, 427, 1],
  ["B", "O", 1.205, 806, 2.5],
  ["Al", "F", 1.654, 675, 1],
  ["Al", "Cl", 2.13, 502, 1],
  ["C", "O", 1.128, 1072, 3],
  ["C", "N", 1.172, 750, 2.5],
  ["C", "S", 1.535, 714, 3],
  ["N", "O", 1.151, 631, 2.5],
  ["N", "S", 1.494, 464, 2.5],
  ["Si", "O", 1.51, 798, 2],
  ["Si", "S", 1.929, 617, 2],
  ["Si", "F", 1.601, 552, 1],
  ["Si", "Cl", 2.058, 417, 1],
  ["P", "N", 1.491, 617, 3],
  ["P", "O", 1.476, 596, 2.5],
  ["S", "O", 1.481, 522, 2],
  ["Cl", "F", 1.628, 253, 1],
  ["Cl", "O", 1.57, 269, 1.5],
];

export function pairKey(a: string, b: string): string {
  return [a, b].sort().join("-");
}

export const DIATOMIC_PAIRS: Map<string, DiatomicData> = new Map(
  DIATOMICS.map((d) => [pairKey(d[0], d[1]), d]),
);

/** Which elements form a tabulated diatomic with `sym`. */
export function partnersOf(sym: string): Set<string> {
  const out = new Set<string>();
  for (const d of DIATOMICS) {
    if (d[0] === sym) out.add(d[1]);
    else if (d[1] === sym) out.add(d[0]);
  }
  return out;
}

export function subscript(n: number): string {
  return String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]!);
}

/* ------------------------------------------------------------------ */
/* The wavefunction                                                    */
/* ------------------------------------------------------------------ */

/**
 * The |psi| contour the drawn orbital boundary is taken at.
 *
 * Chosen by sweeping: 0.5 is the tightest contour at which all 55 tabulated
 * molecules still enclose both nuclei in one connected surface. Going to 0.6
 * breaks four of them into separate blobs, which would draw a bonded molecule
 * as unbonded. Going lower is safe but inflates the surface -- at 0.3 it spans
 * 2.9x the bond length and the nuclei read as specks inside it; at 0.5 it spans
 * 2.1x and the shape is legible.
 */
export const ISO = 0.5;

/**
 * psi along a meridian: `x` runs along the internuclear axis with the nuclei
 * at -R/2 and +R/2, `rho` is the perpendicular distance from that axis.
 * `sign` is +1 for the bonding combination and -1 for the antibonding one.
 */
export function psi(
  x: number,
  rho: number,
  R: number,
  cA: number,
  cB: number,
  kA: number,
  kB: number,
  sign: 1 | -1,
): number {
  return (
    cA * Math.exp(-kA * Math.hypot(x + R / 2, rho)) +
    sign * cB * Math.exp(-kB * Math.hypot(x - R / 2, rho))
  );
}

/** Bisection on a monotone-in-the-bracket function. */
export function bisect(f: (x: number) => number, lo: number, hi: number, steps = 28): number {
  let a = lo;
  let b = hi;
  for (let i = 0; i < steps; i++) {
    const m = (a + b) / 2;
    if (f(m) > 0) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

/**
 * Orbital coefficients for a polarity parameter p in (-1, 1). p = 0 shares the
 * pair equally; p -> 1 moves it onto B. Normalised so cA^2 + cB^2 = 2, which
 * keeps the isosurface a comparable size across molecules.
 */
export function coeffs(p: number): [number, number] {
  return [Math.sqrt(1 - p), Math.sqrt(1 + p)];
}

/** How far out the drawn surface could possibly reach. */
function far(kA: number, kB: number): number {
  return 10 / Math.min(kA, kB);
}

/** Where the isosurface crosses the axis, on each side. */
export function axialExtents(
  R: number,
  cA: number,
  cB: number,
  kA: number,
  kB: number,
  sign: 1 | -1,
): [number, number] {
  const f = (x: number) => Math.abs(psi(x, 0, R, cA, cB, kA, kB, sign));
  const reach = far(kA, kB);
  const xR = f(R / 2) > ISO ? bisect((x) => f(x) - ISO, R / 2, R / 2 + reach) : R / 2;
  const xL = f(-R / 2) > ISO ? bisect((x) => ISO - f(x), -R / 2 - reach, -R / 2) : -R / 2;
  return [xL, xR];
}

/**
 * The isosurface is a surface of revolution about the internuclear axis, so
 * its whole shape is one profile rho(x) -- and, because it is rotationally
 * symmetric, that profile is also its silhouette from every viewing
 * direction. That is what makes this drawable as a plain filled path.
 */
export function profile(
  xs: number[],
  R: number,
  cA: number,
  cB: number,
  kA: number,
  kB: number,
  sign: 1 | -1,
): { x: number; rho: number }[] {
  const reach = far(kA, kB);
  return xs.map((x, i) => {
    if (i === 0 || i === xs.length - 1) return { x, rho: 0 };
    if (Math.abs(psi(x, 0, R, cA, cB, kA, kB, sign)) < ISO) return { x, rho: 0 };
    const rho = bisect((q) => Math.abs(psi(x, q, R, cA, cB, kA, kB, sign)) - ISO, 0, reach);
    return { x, rho };
  });
}

/** Cosine-spaced samples: denser at the ends, where the profile turns hardest. */
export function cosSpace(a: number, b: number, n: number): number[] {
  return Array.from(
    { length: n },
    (_, i) => a + ((b - a) * (1 - Math.cos((Math.PI * i) / (n - 1)))) / 2,
  );
}

/** Where the antibonding combination changes sign between the nuclei. */
export function nodeX(R: number, cA: number, cB: number, kA: number, kB: number): number {
  return bisect((x) => psi(x, 0, R, cA, cB, kA, kB, -1), -R / 2, R / 2);
}

/* ------------------------------------------------------------------ */
/* Valence MO diagram                                                  */
/* ------------------------------------------------------------------ */

export type MOKind = "sigma" | "pi" | "nonbonding";

export type MOLevelSpec = {
  name: string;
  /** Degeneracy: 1 for sigma, 2 for a pi pair. */
  g: number;
  /** +1 bonding, 0 nonbonding, -1 antibonding. */
  sign: 1 | 0 | -1;
  kind: MOKind;
  /** Electrons assigned by filling from the bottom. */
  e: number;
};

export type MODiagram = {
  /** Which structural family the level ordering came from. */
  family: "alkali" | "hydride" | "ionic" | "p-block";
  levels: MOLevelSpec[];
  bondOrder: number;
  unpaired: number;
  /** How many pi bonds the filling implies, for the 3D scene. */
  nPi: number;
  /** The more and less electronegative partner. */
  neg: DiatomicElement;
  pos: DiatomicElement;
};

/** Hund's rule: spread electrons across degenerate orbitals before pairing. */
export function hund(e: number, g: number): number[] {
  const a = new Array<number>(g).fill(0);
  for (let i = 0; i < e; i++) a[i % g] = (a[i % g] ?? 0) + 1;
  return a;
}

type LevelTemplate = [string, number, 1 | 0 | -1, MOKind];

export function moDiagram(A: DiatomicElement, B: DiatomicElement): MODiagram {
  const valenceElectrons = A.ve + B.ve;
  const n = A.row === B.row ? String(A.row) : "";
  const neg = (A.en ?? 0) >= (B.en ?? 0) ? A : B;
  const pos = neg === A ? B : A;

  let family: MODiagram["family"];
  let template: LevelTemplate[];

  if (A.col === 1 && B.col === 1) {
    // Two alkali metals: a single s-s interaction.
    family = "alkali";
    const nn = A.sym === B.sym ? `${A.row}s` : "";
    template = [
      [`σ${nn}`, 1, 1, "sigma"],
      [`σ*${nn}`, 1, -1, "sigma"],
    ];
  } else if (A.sym === "H" || B.sym === "H") {
    // A hydride: hydrogen's 1s interacts with one orbital on the heavy atom
    // and leaves the rest of its valence shell nonbonding.
    family = "hydride";
    const X = A.sym === "H" ? B : A;
    template = [
      ["σ", 1, 1, "sigma"],
      [`${X.sym} ${X.row}s`, 1, 0, "nonbonding"],
      ...(X.col >= 3 ? ([[`${X.sym} ${X.row}p`, 2, 0, "nonbonding"]] as LevelTemplate[]) : []),
      ["σ*", 1, -1, "sigma"],
    ];
  } else if (
    (["Li", "Na", "Be", "Mg", "Al"].includes(pos.sym) && ["F", "Cl", "O"].includes(neg.sym)) ||
    (["B", "Si"].includes(pos.sym) && ["F", "Cl"].includes(neg.sym))
  ) {
    // Strongly polar: the levels sit close to one atom or the other, so most
    // of them are essentially untouched atomic orbitals.
    family = "ionic";
    template = [
      [`${neg.sym} ${neg.row}s`, 1, 0, "nonbonding"],
      ["σ", 1, 1, "sigma"],
      [`${neg.sym} ${neg.row}p`, 2, 0, "nonbonding"],
      [`${pos.sym} ${pos.row}s`, 1, 0, "nonbonding"],
      ...(pos.col >= 3
        ? ([[`${pos.sym} ${pos.row}p`, 2, 0, "nonbonding"]] as LevelTemplate[])
        : []),
      ["σ*", 1, -1, "sigma"],
    ];
  } else {
    // General p-block. The sigma2p / pi2p ordering flips across the row:
    // s-p mixing pushes sigma2p above pi2p early on, and stops mattering by
    // oxygen -- which is why O2 and F2 take the other order.
    family = "p-block";
    const heavy = ["O", "F", "S", "Cl"];
    const lateRow = heavy.includes(A.sym) && heavy.includes(B.sym);
    const pi: LevelTemplate = [`π${n}p`, 2, 1, "pi"];
    const sigmaP: LevelTemplate = [`σ${n}p`, 1, 1, "sigma"];
    template = [
      [`σ${n}s`, 1, 1, "sigma"],
      [`σ*${n}s`, 1, -1, "sigma"],
      ...(lateRow ? [sigmaP, pi] : [pi, sigmaP]),
      [`π*${n}p`, 2, -1, "pi"],
      [`σ*${n}p`, 1, -1, "sigma"],
    ];
  }

  let left = valenceElectrons;
  const levels: MOLevelSpec[] = template.map(([name, g, sign, kind]) => {
    const e = Math.min(left, 2 * g);
    left -= e;
    return { name, g, sign, kind, e };
  });

  const bondOrder = levels.reduce((s, l) => s + l.sign * l.e, 0) / 2;
  const unpaired = levels.reduce((s, l) => s + hund(l.e, l.g).filter((x) => x === 1).length, 0);
  const ePi = levels.filter((l) => l.kind === "pi").reduce((s, l) => s + l.sign * l.e, 0);

  return {
    family,
    levels,
    bondOrder,
    unpaired,
    nPi: family === "p-block" ? Math.max(0, Math.floor(ePi / 2)) : 0,
    neg,
    pos,
  };
}

/* ------------------------------------------------------------------ */
/* Assembled molecule                                                  */
/* ------------------------------------------------------------------ */

export type BondType = "nonpolar covalent" | "polar covalent" | "ionic";

export type Molecule = {
  A: DiatomicElement;
  B: DiatomicElement;
  formula: string;
  homonuclear: boolean;
  /** Equilibrium bond length, angstroms. */
  r: number;
  /** Dissociation energy, kJ/mol. */
  D: number;
  /** Measured bond order from the data table. */
  bondOrder: number;
  /** Bond order the filled MO diagram implies. */
  moBondOrder: number;
  unpaired: number;
  nPi: number;
  type: BondType;
  /** Electronegativity difference, B - A. */
  dEN: number;
  /** Polarity parameter fed to the orbital coefficients. */
  polarity: number;
  pointGroup: "D∞h" | "C∞v";
  diagram: MODiagram;
  kA: number;
  kB: number;
};

export function bondTypeFor(absDEN: number): BondType {
  if (absDEN < 0.4) return "nonpolar covalent";
  if (absDEN < 1.8) return "polar covalent";
  return "ionic";
}

export function buildMolecule(a: string, b: string): Molecule | null {
  const data = DIATOMIC_PAIRS.get(pairKey(a, b));
  if (!data) return null;
  const [symA, symB, r, D, bondOrder] = data;
  const A = ELEMENTS[symA]!;
  const B = ELEMENTS[symB]!;
  const diagram = moDiagram(A, B);
  const dEN = (B.en ?? 0) - (A.en ?? 0);
  const homonuclear = A.sym === B.sym;
  return {
    A,
    B,
    formula: homonuclear ? A.sym + subscript(2) : A.sym + B.sym,
    homonuclear,
    r,
    D,
    bondOrder,
    moBondOrder: diagram.bondOrder,
    unpaired: diagram.unpaired,
    nPi: diagram.nPi,
    type: bondTypeFor(Math.abs(dEN)),
    dEN,
    // tanh keeps the shift bounded as dEN grows, and the 0.95 cap stops a
    // coefficient reaching zero, which would collapse the surface entirely.
    polarity: Math.tanh(dEN / 1.4) * 0.95,
    pointGroup: homonuclear ? "D∞h" : "C∞v",
    diagram,
    kA: A.k,
    kB: B.k,
  };
}

/** Every element that forms at least one tabulated diatomic, in layout order. */
export const SELECTABLE: DiatomicElement[] = Object.values(ELEMENTS).filter(
  (e) => e.en != null && partnersOf(e.sym).size > 0,
);

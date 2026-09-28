/**
 * Diatomic Bond Explorer — data and maths.
 *
 * A faithful port of the two-centre LCAO model from the original three.js
 * artifact. Everything here is pure and free of `three`, `window`,
 * `performance.now()` and `Math.random()`, so it can run during a
 * server render and be unit-checked directly. The WebGL side lives in
 * `src/components/DiatomicStage.ts` and `src/components/DiatomicBondExplorer.tsx`.
 *
 * The model: psi = cA·e^(−kA·rA) ± cB·e^(−kB·rB), with an isosurface drawn at
 * |psi| = ISO. Because the isosurface is a surface of revolution about the
 * internuclear axis, it is described by a single profile rho(x), computed here
 * and turned into a LatheGeometry by the component.
 */

export type DiatomicElement = {
  /** Element symbol. */
  sym: string;
  name: string;
  /** Atomic number. */
  Z: number;
  /** Pauling electronegativity; null for the noble gases, which form no bond. */
  en: number | null;
  /** Covalent radius, Angstrom. */
  rc: number;
  /** Valence configuration string, e.g. "2s²2p⁴". */
  val: string;
  /** Period (1–3). */
  row: number;
  /** Main-group column in the 8-wide layout: groups 1, 2, 13–18 → 1…8. */
  col: number;
  /** Nucleus tint, as a three.js hex. */
  color: number;
  /** Valence electron count. */
  ve: number;
  /** Slater-like exponent of the atomic function, 0.73 / rc. */
  k: number;
};

type ElementRow = [
  sym: string,
  name: string,
  Z: number,
  en: number | null,
  rc: number,
  val: string,
  row: number,
  col: number,
  color: number,
];

// Elements, periods 1–3 (main-group layout: groups 1, 2, 13–18).
const ELEMENT_ROWS: ElementRow[] = [
  ["H", "Hydrogen", 1, 2.2, 0.31, "1s¹", 1, 1, 0xf4efe6],
  ["He", "Helium", 2, null, 0.28, "1s²", 1, 8, 0x9a9a9a],
  ["Li", "Lithium", 3, 0.98, 1.28, "2s¹", 2, 1, 0xc9a8f2],
  ["Be", "Beryllium", 4, 1.57, 0.96, "2s²", 2, 2, 0xa8e0b8],
  ["B", "Boron", 5, 2.04, 0.84, "2s²2p¹", 2, 3, 0xf0b89a],
  ["C", "Carbon", 6, 2.55, 0.76, "2s²2p²", 2, 4, 0xb8b6b0],
  ["N", "Nitrogen", 7, 3.04, 0.71, "2s²2p³", 2, 5, 0x8fb0f5],
  ["O", "Oxygen", 8, 3.44, 0.66, "2s²2p⁴", 2, 6, 0xf28b82],
  ["F", "Fluorine", 9, 3.98, 0.57, "2s²2p⁵", 2, 7, 0x9fe3a0],
  ["Ne", "Neon", 10, null, 0.58, "2s²2p⁶", 2, 8, 0x9a9a9a],
  ["Na", "Sodium", 11, 0.93, 1.66, "3s¹", 3, 1, 0xc9a8f2],
  ["Mg", "Magnesium", 12, 1.31, 1.41, "3s²", 3, 2, 0xa8e0b8],
  ["Al", "Aluminium", 13, 1.61, 1.21, "3s²3p¹", 3, 3, 0xc8c4d8],
  ["Si", "Silicon", 14, 1.9, 1.11, "3s²3p²", 3, 4, 0xe6c89a],
  ["P", "Phosphorus", 15, 2.19, 1.07, "3s²3p³", 3, 5, 0xf5a860],
  ["S", "Sulfur", 16, 2.58, 1.05, "3s²3p⁴", 3, 6, 0xf2dc6b],
  ["Cl", "Chlorine", 17, 3.16, 1.02, "3s²3p⁵", 3, 7, 0x9fe3a0],
  ["Ar", "Argon", 18, null, 1.06, "3s²3p⁶", 3, 8, 0x9a9a9a],
];

/** Every element the picker can show, keyed by symbol, in periodic-table order. */
export const ELEMENTS: Record<string, DiatomicElement> = {};
export const ELEMENT_LIST: DiatomicElement[] = ELEMENT_ROWS.map(
  ([sym, name, Z, en, rc, val, row, col, color]) => {
    // Valence electrons: groups 1, 2 → 1, 2; groups 13–18 → 3–8. Helium is the
    // one element whose group position overstates its valence shell.
    const e: DiatomicElement = {
      sym,
      name,
      Z,
      en,
      rc,
      val,
      row,
      col,
      color,
      ve: sym === "He" ? 2 : col,
      k: 0.73 / rc,
    };
    ELEMENTS[sym] = e;
    return e;
  },
);

/** Look an element up by symbol, or throw — the tables are closed sets. */
export function el(sym: string): DiatomicElement {
  const e = ELEMENTS[sym];
  if (!e) throw new Error(`diatomic: unknown element ${sym}`);
  return e;
}

/** Gas-phase diatomics: [A, B, r_e (Angstrom), D0 (kJ/mol), tabulated bond order]. */
export type DiatomicRow = [a: string, b: string, r: number, D: number, bo: number];

export const DATA: DiatomicRow[] = [
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

/** Order-independent key for a pair of symbols. */
export const pairKey = (a: string, b: string): string => [a, b].sort().join("-");

export const PAIRS: Map<string, DiatomicRow> = new Map(DATA.map((d) => [pairKey(d[0], d[1]), d]));

/** Every element that forms a tabulated diatomic with `s` (including itself). */
export const partners = (s: string): Set<string> =>
  new Set(DATA.flatMap((d) => (d[0] === s ? [d[1]] : d[1] === s ? [d[0]] : [])));

const SUBSCRIPTS = "₀₁₂₃₄₅₆₇₈₉";
/** Render the digits of `n` as Unicode subscripts. */
export const sub = (n: number | string): string =>
  String(n).replace(/\d/g, (d) => SUBSCRIPTS[Number(d)] ?? d);

// ---------------------------------------------------------------------------
// Wavefunction model: psi = cA·e^(−kA·rA) ± cB·e^(−kB·rB)
// ---------------------------------------------------------------------------

/** The isosurface level the orbital shells are drawn at. */
export const ISO = 0.3;

export function psi(
  x: number,
  rho: number,
  R: number,
  cA: number,
  cB: number,
  kA: number,
  kB: number,
  s: number,
): number {
  return (
    cA * Math.exp(-kA * Math.hypot(x + R / 2, rho)) +
    s * cB * Math.exp(-kB * Math.hypot(x - R / 2, rho))
  );
}

/** Bisection on a function that is positive at `lo` and negative at `hi`. */
export function bisect(f: (x: number) => number, lo: number, hi: number, n = 28): number {
  for (let i = 0; i < n; i++) {
    const m = (lo + hi) / 2;
    if (f(m) > 0) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

/** `n` samples from a to b, clustered at both ends (cosine spacing). */
export const cosSpace = (a: number, b: number, n: number): number[] =>
  Array.from({ length: n }, (_, i) => a + ((b - a) * (1 - Math.cos((Math.PI * i) / (n - 1)))) / 2);

/** Far enough out that the slower-decaying exponential is negligible. */
const far = (kA: number, kB: number): number => 10 / Math.min(kA, kB);

/** Where the isosurface cuts the internuclear axis, on each side. */
export function extents(
  R: number,
  cA: number,
  cB: number,
  kA: number,
  kB: number,
  s: number,
): [number, number] {
  const f = (x: number) => Math.abs(psi(x, 0, R, cA, cB, kA, kB, s));
  const F = far(kA, kB);
  const xR = f(R / 2) > ISO ? bisect((x) => f(x) - ISO, R / 2, R / 2 + F) : R / 2;
  const xL = f(-R / 2) > ISO ? bisect((x) => ISO - f(x), -R / 2 - F, -R / 2) : -R / 2;
  return [xL, xR];
}

/** One point of a surface-of-revolution profile: radius `rho` at axial `x`. */
export type ProfilePoint = { rho: number; x: number };
export type Profile = { pts: ProfilePoint[]; rhoMax: number };

/**
 * The isosurface radius at each x in `xs`, found by bisecting outward from the
 * axis. The two end points are pinned to the axis so the lathe closes; a
 * radius of exactly zero would collapse the ring, so it is floored at 1e-4.
 */
export function latheProfile(
  xs: number[],
  R: number,
  cA: number,
  cB: number,
  kA: number,
  kB: number,
  s: number,
): Profile {
  let rhoMax = 0;
  const F = far(kA, kB);
  const pts = xs.map((x, i) => {
    let r = 0;
    if (i > 0 && i < xs.length - 1 && Math.abs(psi(x, 0, R, cA, cB, kA, kB, s)) >= ISO)
      r = bisect((q) => Math.abs(psi(x, q, R, cA, cB, kA, kB, s)) - ISO, 0, F);
    rhoMax = Math.max(rhoMax, r);
    return { rho: Math.max(r, 1e-4), x };
  });
  return { pts, rhoMax };
}

/** Profile of the bonding (in-phase) sigma isosurface. */
export function bondingProfile(R: number, cA: number, cB: number, kA: number, kB: number): Profile {
  const [a, b] = extents(R, cA, cB, kA, kB, 1);
  return latheProfile(cosSpace(a, b, 160), R, cA, cB, kA, kB, 1);
}

/**
 * The antibonding (out-of-phase) isosurface, split at the nodal point into two
 * opposite-phase lobes.
 */
export function antiProfiles(
  R: number,
  cA: number,
  cB: number,
  kA: number,
  kB: number,
): { lower: Profile; upper: Profile; nodeX: number } {
  const [a, b] = extents(R, cA, cB, kA, kB, -1);
  const xn = bisect((x) => psi(x, 0, R, cA, cB, kA, kB, -1), -R / 2, R / 2);
  return {
    lower: latheProfile(cosSpace(a, xn, 90), R, cA, cB, kA, kB, -1),
    upper: latheProfile(cosSpace(xn, b, 90), R, cA, cB, kA, kB, -1),
    nodeX: xn,
  };
}

/**
 * LCAO coefficients for a polarity p in (−1, 1): cA² = 1 − p, cB² = 1 + p, so
 * p > 0 shifts density toward B.
 */
export function coeffs(p: number): [number, number] {
  return [Math.sqrt(1 - p), Math.sqrt(1 + p)];
}

// ---------------------------------------------------------------------------
// Valence MO diagram
// ---------------------------------------------------------------------------

/** Fill `g` degenerate orbitals with `e` electrons, one each before pairing. */
export function hund(e: number, g: number): number[] {
  const a: number[] = Array(g).fill(0);
  for (let i = 0; i < e; i++) a[i % g] = (a[i % g] ?? 0) + 1;
  return a;
}

/** 's' sigma-type, 'p' pi-type, 'n' essentially nonbonding. */
export type MOKind = "s" | "p" | "n";
/** Which family of diagram a pair falls into. */
export type MOType = "s" | "h" | "i" | "g";

export type MOLevel = {
  name: string;
  /** Degeneracy (1 for sigma, 2 for a pi pair, 2 for a lumped p set). */
  g: number;
  /** +1 bonding, 0 nonbonding, −1 antibonding. */
  sign: number;
  kind: MOKind;
  /** Electrons that land in this level. */
  e: number;
};

export type MODiagramResult = {
  type: MOType;
  levels: MOLevel[];
  /** Bond order derived from the diagram — this is the number the UI shows. */
  bo: number;
  unpaired: number;
  /** How many pi bonds the scene should draw. */
  nPi: number;
  neg: DiatomicElement;
  pos: DiatomicElement;
};

type LevelSpec = [name: string, g: number, sign: number, kind: MOKind];

const enOf = (X: DiatomicElement): number => X.en ?? 0;

/**
 * Valence MO scheme for a pair, filled with their valence electrons from the
 * bottom up. Four families: both s-block (s), anything with hydrogen (h),
 * strongly ionic metal–halide/oxide pairs (i), and the general second/third-row
 * covalent scheme (g), whose sigma_p/pi_p ordering flips for the
 * later p-block pairs.
 */
export function moDiagram(A: DiatomicElement, B: DiatomicElement): MODiagramResult {
  const ve = A.ve + B.ve;
  const n: number | "" = A.row === B.row ? A.row : "";
  const neg = enOf(A) >= enOf(B) ? A : B;
  const pos = neg === A ? B : A;
  let type: MOType;
  let L: LevelSpec[];
  if (A.col === 1 && B.col === 1) {
    type = "s";
    const nn = A.sym === B.sym ? `${A.row}s` : "";
    L = [
      [`σ${nn}`, 1, 1, "s"],
      [`σ*${nn}`, 1, -1, "s"],
    ];
  } else if (A.sym === "H" || B.sym === "H") {
    type = "h";
    const X = A.sym === "H" ? B : A;
    const pSet: LevelSpec[] = X.col >= 3 ? [[`${X.sym} ${X.row}p`, 2, 0, "n"]] : [];
    L = [["σ", 1, 1, "s"], [`${X.sym} ${X.row}s`, 1, 0, "n"], ...pSet, ["σ*", 1, -1, "s"]];
  } else if (
    (["Li", "Na", "Be", "Mg", "Al"].includes(pos.sym) && ["F", "Cl", "O"].includes(neg.sym)) ||
    (["B", "Si"].includes(pos.sym) && ["F", "Cl"].includes(neg.sym))
  ) {
    type = "i";
    const pSet: LevelSpec[] = pos.col >= 3 ? [[`${pos.sym} ${pos.row}p`, 2, 0, "n"]] : [];
    L = [
      [`${neg.sym} ${neg.row}s`, 1, 0, "n"],
      ["σ", 1, 1, "s"],
      [`${neg.sym} ${neg.row}p`, 2, 0, "n"],
      [`${pos.sym} ${pos.row}s`, 1, 0, "n"],
      ...pSet,
      ["σ*", 1, -1, "s"],
    ];
  } else {
    type = "g";
    const hv = ["O", "F", "S", "Cl"];
    const o2 = hv.includes(A.sym) && hv.includes(B.sym);
    const pi: LevelSpec = [`π${n}p`, 2, 1, "p"];
    const sp: LevelSpec = [`σ${n}p`, 1, 1, "s"];
    L = [
      [`σ${n}s`, 1, 1, "s"],
      [`σ*${n}s`, 1, -1, "s"],
      ...(o2 ? [sp, pi] : [pi, sp]),
      [`π*${n}p`, 2, -1, "p"],
      [`σ*${n}p`, 1, -1, "s"],
    ];
  }
  let left = ve;
  const levels: MOLevel[] = L.map(([name, g, sign, kind]) => {
    const e = Math.min(left, 2 * g);
    left -= e;
    return { name, g, sign, kind, e };
  });
  const bo = levels.reduce((s, l) => s + l.sign * l.e, 0) / 2;
  const unpaired = levels.reduce((s, l) => s + hund(l.e, l.g).filter((x) => x === 1).length, 0);
  const ePi = levels.filter((l) => l.kind === "p").reduce((s, l) => s + l.sign * l.e, 0);
  return {
    type,
    levels,
    bo,
    unpaired,
    nPi: type === "g" ? Math.max(0, Math.floor(ePi / 2)) : 0,
    neg,
    pos,
  };
}

// ---------------------------------------------------------------------------
// A loaded molecule
// ---------------------------------------------------------------------------

export type BondType = "nonpolar covalent" | "polar covalent" | "ionic";

export type MoleculeInfo = {
  A: DiatomicElement;
  B: DiatomicElement;
  /** Equilibrium bond length, Angstrom. */
  r: number;
  /** Bond dissociation energy, kJ/mol. */
  D: number;
  /** Bond order as the MO diagram gives it — what the panel and caption show. */
  bo: number;
  type: BondType;
  /** B.en − A.en, signed: positive means density moves toward B. */
  dEN: number;
  /** Equilibrium polarity fed to `coeffs`. */
  pFinal: number;
  homo: boolean;
  nPi: number;
  /** Mean covalent radius, the scene's length unit for lobes and the node disc. */
  rcAvg: number;
  unpaired: number;
  ve: number;
  formula: string;
  /** The more electronegative partner. */
  neg: DiatomicElement;
  diagram: MODiagramResult;
};

/** Everything about a pair that does not depend on the rendered scene. */
export function moleculeInfo(a: string, b: string): MoleculeInfo {
  const d = PAIRS.get(pairKey(a, b));
  if (!d) throw new Error(`diatomic: no tabulated molecule for ${a}–${b}`);
  const [, , r, D] = d;
  const A = el(d[0]);
  const B = el(d[1]);
  const diagram = moDiagram(A, B);
  const dEN = enOf(B) - enOf(A);
  const ad = Math.abs(dEN);
  const type: BondType = ad < 0.4 ? "nonpolar covalent" : ad < 1.8 ? "polar covalent" : "ionic";
  const pFinal = Math.tanh(dEN / 1.4) * 0.95;
  const homo = A.sym === B.sym;
  return {
    A,
    B,
    r,
    D,
    bo: diagram.bo,
    type,
    dEN,
    pFinal,
    homo,
    nPi: diagram.nPi,
    rcAvg: (A.rc + B.rc) / 2,
    unpaired: diagram.unpaired,
    ve: A.ve + B.ve,
    formula: homo ? A.sym + sub(2) : A.sym + B.sym,
    neg: dEN > 0 ? B : A,
    diagram,
  };
}

export type SceneMetrics = {
  /** Axial extents of the equilibrium bonding isosurface. */
  xL: number;
  xR: number;
  /** Widest radius the scene has to hold, including the pi lobes. */
  rhoMax: number;
  /** Model scale that puts the isosurface in a 2.6-unit box. */
  s: number;
  /** One scene "unit" for guide furniture: 0.02 on screen. */
  u: number;
  /** Height of the bond-length dimension line, below the orbital. */
  dimY: number;
  /** Separation the atoms start from when the bond forms. */
  R0: number;
};

/** Size the scene from the equilibrium bonding isosurface. */
export function sceneMetrics(mol: MoleculeInfo): SceneMetrics {
  const [cA, cB] = coeffs(mol.pFinal);
  const kA = mol.A.k;
  const kB = mol.B.k;
  const [xL, xR] = extents(mol.r, cA, cB, kA, kB, 1);
  const { rhoMax: lastRhoMax } = bondingProfile(mol.r, cA, cB, kA, kB);
  const rhoMax = Math.max(lastRhoMax, mol.nPi ? mol.rcAvg * 1.25 : 0);
  const s = 2.6 / (xR - xL);
  return {
    xL,
    xR,
    rhoMax,
    s,
    u: 0.02 / s,
    dimY: -(rhoMax + 0.18 / s),
    R0: mol.r + 0.6 * (xR - xL),
  };
}

/** The 5-second formation animation's easing curve (cubic in-out). */
export const ease = (u: number): number =>
  u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;

/** Length of the formation animation, seconds. */
export const FORM = 5.0;

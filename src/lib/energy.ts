// A real total electronic energy needs the same DFT/ab initio machinery
// this whole app already can't run live in a browser (see the note in
// molecule.ts) -- so instead of faking a precise-looking number or leaving
// energy out entirely, this estimates "how much energy holds the molecule
// together" from real, tabulated bond dissociation energies, using a real,
// named technique for the bonds that aren't directly tabulated: Pauling's
// own electronegativity-difference correction (The Nature of the Chemical
// Bond, 1960):
//
//   D(A-B) = [D(A-A) + D(B-B)] / 2 + 96.5 * (chiA - chiB)^2      (kJ/mol)
//
// Checked against real values it typically lands within a few percent (its
// C-H estimate is ~403 vs. the tabulated ~413), with more error for very
// polar bonds like O-H or H-F -- a known, documented limitation of the
// formula itself, not something hidden here.

import type { ElementSymbol } from "./vsepr";
import type { BondOrder, MoleculeAtom, MoleculeBond } from "./molecule";

// Average homonuclear single-bond dissociation energies, kJ/mol.
const HOMONUCLEAR_ENERGY: Partial<Record<ElementSymbol, number>> = {
  H: 436,
  C: 347,
  N: 163,
  O: 146,
  F: 155,
  Si: 222,
  P: 201,
  S: 226,
  Cl: 243,
  Br: 193,
};

// Pauling electronegativities.
const ELECTRONEGATIVITY: Partial<Record<ElementSymbol, number>> = {
  H: 2.2,
  C: 2.55,
  N: 3.04,
  O: 3.44,
  F: 3.98,
  Si: 1.9,
  P: 2.19,
  S: 2.58,
  Cl: 3.16,
  Br: 2.96,
};

// A handful of well-established, specifically-tabulated multi-bond energies
// (kJ/mol) -- real values, used in preference to the generic multiplier
// below wherever the pair is common enough to know precisely.
const KNOWN_MULTI_BOND_ENERGY: Partial<Record<string, number>> = {
  "C=C": 614,
  "C#C": 839,
  "C=N": 615,
  "C#N": 891,
  "C=O": 799,
  "N=N": 418,
  "N#N": 945,
  "N=O": 607,
  "O=O": 498,
  "S=O": 522,
};

function multiBondKey(a: ElementSymbol, b: ElementSymbol, order: BondOrder): string {
  const [x, y] = a <= b ? [a, b] : [b, a];
  return `${x}${order === 2 ? "=" : "#"}${y}`;
}

// Real double/triple bonds don't scale from their single-bond energy by any
// one universal factor -- N's triple bond is unusually strong specifically
// because N-N single bonds are unusually weak, for instance -- so this
// generic multiplier (fit to typical carbon-based multiple bonds) is a
// genuine simplification, only used as a fallback where the pair isn't in
// the table above.
const ORDER_MULTIPLIER: Record<BondOrder, number> = { 1: 1, 2: 1.8, 3: 2.4 };

function singleBondEnergy(a: ElementSymbol, b: ElementSymbol): number | null {
  const da = HOMONUCLEAR_ENERGY[a];
  const db = HOMONUCLEAR_ENERGY[b];
  const xa = ELECTRONEGATIVITY[a];
  const xb = ELECTRONEGATIVITY[b];
  if (da === undefined || db === undefined || xa === undefined || xb === undefined) return null;
  return (da + db) / 2 + 96.5 * (xa - xb) ** 2;
}

export function bondEnergy(a: ElementSymbol, b: ElementSymbol, order: BondOrder): number {
  if (order > 1) {
    const known = KNOWN_MULTI_BOND_ENERGY[multiBondKey(a, b, order)];
    if (known !== undefined) return known;
  }
  const base = singleBondEnergy(a, b);
  if (base === null) return 0;
  return base * ORDER_MULTIPLIER[order];
}

// Sum of every bond's estimated dissociation energy -- the energy it would
// take to break the molecule all the way down to free atoms, which is what
// "bond energy" conventionally means in a general-chemistry course.
export function totalBondEnergy(atoms: MoleculeAtom[], bonds: MoleculeBond[]): number {
  const elementOf = new Map(atoms.map((a) => [a.id, a.element]));
  let total = 0;
  for (const bond of bonds) {
    const ea = elementOf.get(bond.a);
    const eb = elementOf.get(bond.b);
    if (!ea || !eb) continue;
    total += bondEnergy(ea, eb, bond.order);
  }
  return total;
}

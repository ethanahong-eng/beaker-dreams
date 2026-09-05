// Formal charge needs a different lone-pair rule than the rest of the app.
// Everywhere else, lonePairsOf (molecule.ts) gives each atom exactly its
// own leftover valence electrons -- the real 3D-geometry-driving rule, and
// one that always nets every atom to zero formal charge by construction
// (an atom that keeps only its own electrons can't be "shorted" or
// "overpaid" relative to a free atom).
//
// Formal charge is the other bookkeeping convention: the WHOLE molecule
// shares one fixed pool of valence electrons (every atom's own valence
// electron count, added up), some of it already spent on the bonds that
// are drawn, and the rest handed out as lone pairs -- outer (terminal)
// atoms completing their own shell first, with whatever's left going to
// the more interior atom(s). That's the actual textbook Lewis-structure
// procedure, and it's what makes formal charge come out right even when
// the pool runs short: CO2 drawn with two single C-O bonds spends the
// entire remaining pool completing both oxygens' octets and leaves carbon
// with none, which is exactly why that structure gets a nonzero formal
// charge and the double-bonded structure doesn't. A rule that let every
// atom complete its own octet independently (ignoring the shared pool)
// would silently invent electrons that were never there, and formal
// charges computed from it would stop summing to the molecule's real net
// charge -- an easy way to be quietly wrong, avoided here by construction.

import { ELEMENTS, type ElementSymbol } from "./vsepr";
import {
  neighborsOf,
  bondKey,
  type AtomId,
  type MoleculeAtom,
  type MoleculeBond,
  type BondOrder,
} from "./molecule";

function sumBondOrderAt(bonds: MoleculeBond[], id: AtomId): number {
  let sum = 0;
  for (const b of bonds) if (b.a === id || b.b === id) sum += b.order;
  return sum;
}

// Electron-shell capacities this atom could plausibly be drawn with, from
// smallest to largest: hydrogen only ever completes a duet; period-2
// elements are locked to a strict octet; everything else here can expand
// past an octet when the bonding pattern genuinely needs more room.
function capacitiesFor(element: ElementSymbol): number[] {
  if (element === "H") return [2];
  return ELEMENTS[element].maxDomains === 4 ? [8] : [8, 10, 12];
}

// How many lone pairs this atom would want if it could freely complete its
// own shell -- a per-atom *request*, not yet checked against how many
// electrons the shared pool actually has left to give it.
function desiredLonePairs(element: ElementSymbol, sumBondOrder: number): number {
  for (const capacity of capacitiesFor(element)) {
    const lp = capacity / 2 - sumBondOrder;
    if (lp >= 0) return lp;
  }
  return 0;
}

// Spends the molecule's fixed electron pool on lone pairs, terminal atoms
// first (each capped at what completing its own shell needs), with
// whatever's left going to the single most interior atom uncapped -- the
// same order real Lewis structures are drawn in by hand. `processingOrder`
// lets the bond-order search reuse this once per candidate without
// resorting atoms every time.
function spendPoolOnLonePairs(
  processingOrder: MoleculeAtom[],
  bonds: MoleculeBond[],
  sumOrderAt: (id: AtomId) => number,
  totalPool: number,
  bondingElectrons: number,
): { lonePairs: Map<AtomId, number>; remaining: number } | null {
  let remaining = totalPool - bondingElectrons;
  if (remaining < 0) return null;

  const lonePairs = new Map<AtomId, number>();
  for (let i = 0; i < processingOrder.length; i++) {
    const atom = processingOrder[i]!;
    const degree = neighborsOf(bonds, atom.id).length;
    if (degree === 0) {
      lonePairs.set(atom.id, 0);
      continue;
    }
    const sum = sumOrderAt(atom.id);
    const isLast = i === processingOrder.length - 1;
    const lp = isLast
      ? Math.max(0, Math.floor(remaining / 2))
      : Math.max(0, Math.min(desiredLonePairs(atom.element, sum), Math.floor(remaining / 2)));
    if (degree + lp > ELEMENTS[atom.element].maxDomains) return null;
    lonePairs.set(atom.id, lp);
    remaining -= 2 * lp;
  }
  return { lonePairs, remaining };
}

// Terminal (degree-1) atoms are processed before more interior ones, the
// same "outer atoms first" priority a hand-drawn Lewis structure follows.
function byIncreasingDegree(atoms: MoleculeAtom[], bonds: MoleculeBond[]): MoleculeAtom[] {
  return [...atoms].sort(
    (a, b) => neighborsOf(bonds, a.id).length - neighborsOf(bonds, b.id).length,
  );
}

export function formalCharges(atoms: MoleculeAtom[], bonds: MoleculeBond[]): Map<AtomId, number> {
  const totalPool = atoms.reduce((s, a) => s + ELEMENTS[a.element].valenceElectrons, 0);
  const bondingElectrons = 2 * bonds.reduce((s, b) => s + b.order, 0);
  const order = byIncreasingDegree(atoms, bonds);
  const spent = spendPoolOnLonePairs(
    order,
    bonds,
    (id) => sumBondOrderAt(bonds, id),
    totalPool,
    bondingElectrons,
  );

  const map = new Map<AtomId, number>();
  for (const atom of atoms) {
    const lp = spent?.lonePairs.get(atom.id) ?? 0;
    const sum = sumBondOrderAt(bonds, atom.id);
    map.set(atom.id, ELEMENTS[atom.element].valenceElectrons - 2 * lp - sum);
  }
  return map;
}

// Brute-force search over the current skeleton's bond orders is exponential
// (3^bonds), so it's only run for small structures -- exactly the size
// range formal-charge teaching examples (CO2, O3, SO2, NO2, CO...) live in.
// Larger structures just don't offer the "ideal bonding" overlay.
const MAX_SEARCH_BONDS = 9;

export type IdealBondOrders = {
  orders: Map<string, BondOrder>;
  totalAbsCharge: number;
  matchesCurrent: boolean;
};

// Searches every way of reassigning bond orders on the existing skeleton
// (same atoms, same connectivity) for the one that minimizes total formal
// charge, subject to actually being a complete Lewis structure: the
// electron pool must exactly cover every bond and every lone pair (no
// electrons invented or left stranded), and no atom may end up with more
// domains than its shell allows.
export function findIdealBondOrders(
  atoms: MoleculeAtom[],
  bonds: MoleculeBond[],
): IdealBondOrders | null {
  const n = bonds.length;
  if (n === 0 || n > MAX_SEARCH_BONDS) return null;

  const totalPool = atoms.reduce((s, a) => s + ELEMENTS[a.element].valenceElectrons, 0);
  const order = byIncreasingDegree(atoms, bonds);

  const evaluate = (orders: number[]): number | null => {
    const sums = new Map<AtomId, number>();
    for (let i = 0; i < n; i++) {
      const b = bonds[i]!;
      sums.set(b.a, (sums.get(b.a) ?? 0) + orders[i]!);
      sums.set(b.b, (sums.get(b.b) ?? 0) + orders[i]!);
    }
    const bondingElectrons = 2 * orders.reduce((s, o) => s + o, 0);
    const spent = spendPoolOnLonePairs(
      order,
      bonds,
      (id) => sums.get(id) ?? 0,
      totalPool,
      bondingElectrons,
    );
    if (!spent || spent.remaining !== 0) return null;

    let score = 0;
    for (const atom of atoms) {
      const lp = spent.lonePairs.get(atom.id) ?? 0;
      const sum = sums.get(atom.id) ?? 0;
      score += Math.abs(ELEMENTS[atom.element].valenceElectrons - 2 * lp - sum);
    }
    return score;
  };

  const currentOrders = bonds.map((b) => b.order);
  const currentScore = evaluate(currentOrders);
  let best: { orders: number[]; score: number } | null =
    currentScore !== null ? { orders: currentOrders, score: currentScore } : null;

  const total = Math.pow(3, n);
  const candidate = new Array<number>(n);
  for (let code = 0; code < total; code++) {
    let c = code;
    for (let i = 0; i < n; i++) {
      candidate[i] = (c % 3) + 1;
      c = Math.floor(c / 3);
    }
    const score = evaluate(candidate);
    if (score !== null && (best === null || score < best.score)) {
      best = { orders: [...candidate], score };
    }
  }
  if (!best) return null;

  const map = new Map<string, BondOrder>();
  bonds.forEach((b, i) => map.set(bondKey(b.a, b.b), best!.orders[i] as BondOrder));
  const matchesCurrent = bonds.every((b) => map.get(bondKey(b.a, b.b)) === b.order);
  return { orders: map, totalAbsCharge: best.score, matchesCurrent };
}

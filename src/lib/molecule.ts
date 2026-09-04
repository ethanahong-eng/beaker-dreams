// A general multi-center molecule: atoms connected by bonds of a chosen
// order (1/2/3), rather than one fixed central atom with terminal groups.
// Every atom's own local electron geometry still comes from the same
// valence-electron bookkeeping used throughout this app -- the only
// change is that "how many electrons this bond costs" is now a property
// of the bond itself (its order, picked with the bond-order tool) instead
// of being hardcoded per element, which is what makes a real carbon
// chain, C=C double bonds, and branching all fall out of the same rule
// instead of needing special cases.

import { ELEMENTS, type ElementSymbol } from "./vsepr";

export type AtomId = number;
export type MoleculeAtom = { id: AtomId; element: ElementSymbol };
export type BondOrder = 1 | 2 | 3;
export type MoleculeBond = { a: AtomId; b: AtomId; order: BondOrder };

// Kept small on purpose: this is the set the multi-atom builder needs to
// stay legible at up to MAX_ATOMS atoms, not the periodic table. Every one
// of these can act as either an interior (chain) atom or a terminal cap.
export const ATOM_CHOICES: ElementSymbol[] = ["H", "C", "N", "O", "F", "Si", "P", "S", "Cl", "Br"];

// A real DFT (or even a minimal ab initio) calculation needs iterative
// matrix diagonalization over basis-set integrals -- seconds to minutes
// per geometry even on server hardware, not something that can redraw
// live as a student drags atoms around in a browser with no backend.
// Fifteen atoms keeps the same electron-domain repulsion physics used
// everywhere else on this site (real, just not full quantum mechanics)
// fast enough to stay interactive -- each atom's local relax is O(k^2)
// for k<=6 domains, trivial even at this size -- while reaching real
// small rings and branched chains.
export const MAX_ATOMS = 15;

export function bondKey(a: AtomId, b: AtomId): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function neighborsOf(bonds: MoleculeBond[], id: AtomId): AtomId[] {
  const out: AtomId[] = [];
  for (const b of bonds) {
    if (b.a === id) out.push(b.b);
    else if (b.b === id) out.push(b.a);
  }
  return out;
}

export function bondBetween(bonds: MoleculeBond[], a: AtomId, b: AtomId): MoleculeBond | undefined {
  return bonds.find((bd) => (bd.a === a && bd.b === b) || (bd.a === b && bd.b === a));
}

function electronsConsumed(bonds: MoleculeBond[], id: AtomId): number {
  let sum = 0;
  for (const b of bonds) {
    if (b.a === id || b.b === id) sum += b.order;
  }
  return sum;
}

// Same rule as everywhere else in this app: count the atom's valence
// electrons, subtract what every bond touching it costs (1 per bond
// order), and whatever's left pairs up into lone pairs. Null means either
// the atom isn't bonded to anything yet (no structure to speak of) or the
// combination is chemically impossible (negative/odd electrons, or more
// electron domains than its octet allows).
export function lonePairsOf(
  atoms: MoleculeAtom[],
  bonds: MoleculeBond[],
  id: AtomId,
): number | null {
  const atom = atoms.find((a) => a.id === id);
  if (!atom) return null;
  const degree = neighborsOf(bonds, id).length;
  if (degree === 0) return null;
  const info = ELEMENTS[atom.element];
  const remaining = info.valenceElectrons - electronsConsumed(bonds, id);
  if (remaining < 0 || remaining % 2 !== 0) return null;
  const lone = remaining / 2;
  if (degree + lone > info.maxDomains) return null;
  return lone;
}

// The molecule is always one connected structure (every edit either grows
// it from an existing atom or trims a leaf), so its cyclomatic number --
// edges minus vertices plus one -- is exactly how many independent rings
// it currently has. 0 means a tree; this app supports growing that to 1.
export function cyclomaticNumber(atoms: MoleculeAtom[], bonds: MoleculeBond[]): number {
  return bonds.length - atoms.length + 1;
}

function shortestPath(bonds: MoleculeBond[], start: AtomId, end: AtomId): AtomId[] | null {
  if (start === end) return [start];
  const prev = new Map<AtomId, AtomId>();
  const visited = new Set<AtomId>([start]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const n of neighborsOf(bonds, cur)) {
      if (visited.has(n)) continue;
      visited.add(n);
      prev.set(n, cur);
      if (n === end) {
        const path = [end];
        let node = end;
        while (node !== start) {
          node = prev.get(node)!;
          path.push(node);
        }
        return path.reverse();
      }
      queue.push(n);
    }
  }
  return null;
}

// The molecule stays connected, so before a ring-closing bond is added
// there's exactly one path between any two existing atoms -- its length
// (plus the new bond) is the ring size that bond would create.
function ringSizeIfBonded(bonds: MoleculeBond[], a: AtomId, b: AtomId): number {
  const path = shortestPath(bonds, a, b);
  return path ? path.length : Infinity;
}

export const MAX_RING_SIZE = 8;

// Finds the molecule's one ring, if it has one: the bond list always
// contains exactly `atoms.length` edges when there's a single ring (one
// more than a tree), so the first bond that reconnects two atoms already
// joined by the rest is the ring-closing edge -- the tree path between its
// endpoints, plus that edge, is the ring.
export function findRing(
  atoms: MoleculeAtom[],
  bonds: MoleculeBond[],
): { members: AtomId[]; closingBond: MoleculeBond } | null {
  if (cyclomaticNumber(atoms, bonds) < 1) return null;
  const parent = new Map<AtomId, AtomId>();
  const find = (x: AtomId): AtomId => {
    let cur = x;
    while (parent.get(cur) !== undefined && parent.get(cur) !== cur) cur = parent.get(cur)!;
    return cur;
  };
  let closingBond: MoleculeBond | null = null;
  for (const bond of bonds) {
    if (!parent.has(bond.a)) parent.set(bond.a, bond.a);
    if (!parent.has(bond.b)) parent.set(bond.b, bond.b);
    const rootA = find(bond.a);
    const rootB = find(bond.b);
    if (rootA === rootB) {
      closingBond = bond;
      continue;
    }
    parent.set(rootA, rootB);
  }
  if (!closingBond) return null;
  const treeBonds = bonds.filter((b) => b !== closingBond);
  const members = shortestPath(treeBonds, closingBond.a, closingBond.b);
  if (!members) return null;
  return { members, closingBond };
}

export type EditResult =
  | { ok: true; atoms: MoleculeAtom[]; bonds: MoleculeBond[]; newId?: AtomId }
  | { ok: false; reason: string };

// Same asymmetry as the single-center model's tryAttach vs. computeLonePairs:
// only two things about a bond are ever irrecoverable no matter what gets
// attached afterward -- running an atom out of valence electrons, or packing
// in more electron domains than its (possibly expanded) octet allows. An odd
// number of electrons left over is NOT one of those -- an atom mid-chain
// reads as "incomplete" until its next bond, not "wrong" (lonePairsOf
// reports that unresolved state as null for rendering purposes, but it must
// not gate the drop, or no bond could ever be added one at a time). The
// domain count is estimated optimistically via floor(remaining/2), the most
// lone pairs the atom could still end up with, since every future bond can
// only consume more electrons and shrink that number.
function hasCapacityForBond(atoms: MoleculeAtom[], bonds: MoleculeBond[], id: AtomId): boolean {
  const atom = atoms.find((a) => a.id === id);
  if (!atom) return false;
  const info = ELEMENTS[atom.element];
  const degree = neighborsOf(bonds, id).length;
  const remaining = info.valenceElectrons - electronsConsumed(bonds, id);
  if (remaining < 0) return false;
  return degree + Math.floor(remaining / 2) <= info.maxDomains;
}

// Starts the molecule (attachTo === null) or bonds a fresh atom onto an
// existing one, validating the new bond against both atoms' remaining
// valence before committing to it -- the same "won't drop if it's not
// chemically legal" guarantee the single-center builder made, generalized
// to whichever atom happens to be selected.
export function tryAddAtom(
  atoms: MoleculeAtom[],
  bonds: MoleculeBond[],
  attachTo: AtomId | null,
  element: ElementSymbol,
  bondOrder: BondOrder,
): EditResult {
  if (atoms.length >= MAX_ATOMS) {
    return {
      ok: false,
      reason: `Molecules are capped at ${MAX_ATOMS} atoms here, to keep the physics fast and the structure legible.`,
    };
  }
  const newId = atoms.length === 0 ? 0 : Math.max(...atoms.map((a) => a.id)) + 1;
  if (attachTo === null) {
    if (atoms.length > 0) {
      return { ok: false, reason: "Select an atom to attach to first." };
    }
    return { ok: true, atoms: [{ id: newId, element }], bonds, newId };
  }
  const target = atoms.find((a) => a.id === attachTo);
  if (!target) return { ok: false, reason: "Select an atom to attach to first." };

  const candidateAtoms = [...atoms, { id: newId, element }];
  const candidateBonds: MoleculeBond[] = [...bonds, { a: attachTo, b: newId, order: bondOrder }];
  if (!hasCapacityForBond(candidateAtoms, candidateBonds, attachTo)) {
    const info = ELEMENTS[target.element];
    return {
      ok: false,
      reason:
        info.maxDomains === 4
          ? `${info.name} can't take another bond there — it's already at its octet limit or out of valence electrons.`
          : `${info.name} can't take another bond there — it's already out of valence electrons or past its ${info.maxDomains}-domain limit.`,
    };
  }
  if (!hasCapacityForBond(candidateAtoms, candidateBonds, newId)) {
    const orderName = bondOrder === 1 ? "single" : bondOrder === 2 ? "double" : "triple";
    return {
      ok: false,
      reason: `${ELEMENTS[element].name} can't form a ${orderName} bond there — not enough valence electrons for it.`,
    };
  }
  return { ok: true, atoms: candidateAtoms, bonds: candidateBonds, newId };
}

export type BondEditResult = { ok: true; bonds: MoleculeBond[] } | { ok: false; reason: string };

export function tryChangeBondOrder(
  atoms: MoleculeAtom[],
  bonds: MoleculeBond[],
  a: AtomId,
  b: AtomId,
  newOrder: BondOrder,
): BondEditResult {
  const existing = bondBetween(bonds, a, b);
  if (!existing) return { ok: false, reason: "That bond doesn't exist." };
  const candidateBonds = bonds.map((bd) => (bd === existing ? { ...bd, order: newOrder } : bd));
  if (
    !hasCapacityForBond(atoms, candidateBonds, a) ||
    !hasCapacityForBond(atoms, candidateBonds, b)
  ) {
    return {
      ok: false,
      reason: "That bond order isn't valid for one of these atoms' remaining valence electrons.",
    };
  }
  return { ok: true, bonds: candidateBonds };
}

// Bonds two atoms that are both already in the molecule -- the only way to
// close a ring, since every other edit only ever attaches a brand-new atom.
// Because the molecule is always connected, any two distinct existing atoms
// already have a path between them, so this bond always closes exactly one
// ring; only one ring is supported at a time, and only up to MAX_RING_SIZE,
// since embedding a ring is a real (if approximated) geometric placement,
// not just another tree branch -- see embed.ts.
export function tryBondAtoms(
  atoms: MoleculeAtom[],
  bonds: MoleculeBond[],
  a: AtomId,
  b: AtomId,
  order: BondOrder,
): BondEditResult {
  if (a === b) return { ok: false, reason: "An atom can't bond to itself." };
  if (bondBetween(bonds, a, b)) {
    return {
      ok: false,
      reason: "These two are already bonded — use the π/σ bonds tool to change the bond order.",
    };
  }
  if (cyclomaticNumber(atoms, bonds) >= 1) {
    return { ok: false, reason: "Only one ring is supported at a time here." };
  }
  const ringSize = ringSizeIfBonded(bonds, a, b) + 1;
  if (ringSize > MAX_RING_SIZE) {
    return {
      ok: false,
      reason: `Rings are supported up to ${MAX_RING_SIZE} atoms — bonding these two would make a ${ringSize}-atom ring.`,
    };
  }
  const candidateBonds: MoleculeBond[] = [...bonds, { a, b, order }];
  if (
    !hasCapacityForBond(atoms, candidateBonds, a) ||
    !hasCapacityForBond(atoms, candidateBonds, b)
  ) {
    return {
      ok: false,
      reason: "That bond isn't valid for one of these atoms' remaining valence electrons.",
    };
  }
  return { ok: true, bonds: candidateBonds };
}

// Only leaves (single-bonded atoms) can be removed, so deleting an atom
// never splits the molecule into disconnected pieces that would need
// their own re-rooted embedding.
export function isRemovable(bonds: MoleculeBond[], atoms: MoleculeAtom[], id: AtomId): boolean {
  if (atoms.length <= 1) return false;
  return neighborsOf(bonds, id).length <= 1;
}

export function removeAtom(
  atoms: MoleculeAtom[],
  bonds: MoleculeBond[],
  id: AtomId,
): { atoms: MoleculeAtom[]; bonds: MoleculeBond[] } {
  return {
    atoms: atoms.filter((a) => a.id !== id),
    bonds: bonds.filter((b) => b.a !== id && b.b !== id),
  };
}

export function formulaOfGraph(atoms: MoleculeAtom[]): string {
  const counts = new Map<ElementSymbol, number>();
  for (const a of atoms) counts.set(a.element, (counts.get(a.element) ?? 0) + 1);
  const SUBSCRIPT = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  const sub = (n: number) =>
    String(n)
      .split("")
      .map((d) => SUBSCRIPT[Number(d)])
      .join("");
  // Carbon first, then hydrogen, then the rest alphabetically -- standard
  // organic-chemistry formula convention.
  const order: ElementSymbol[] = [...counts.keys()].sort((x, y) => {
    const rank = (e: ElementSymbol) => (e === "C" ? 0 : e === "H" ? 1 : 2);
    const rx = rank(x);
    const ry = rank(y);
    if (rx !== ry) return rx - ry;
    return x.localeCompare(y);
  });
  return order.map((el) => el + (counts.get(el)! > 1 ? sub(counts.get(el)!) : "")).join("");
}

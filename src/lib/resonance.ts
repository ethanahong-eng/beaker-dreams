// Real resonance is multiple equally-valid Lewis structures for the same
// atom skeleton, differing only in where a multiple bond sits, that get
// averaged into one delocalized structure in reality (a nitrate ion's
// shared double bond; benzene's alternating ring bonds). Reworking this
// app's fixed integer bond orders into genuinely fractional, delocalized
// ones would be a much bigger change to the same electron-bookkeeping model
// every other feature here relies on -- so instead resonance is detected
// structurally and surfaced as an annotation: "this exact bond-order
// pattern is one of several equally valid arrangements," which is the
// actual insight resonance is meant to teach, without pretending the
// underlying model has become quantum-delocalized.

import {
  bondBetween,
  bondKey,
  findRing,
  neighborsOf,
  type AtomId,
  type MoleculeAtom,
  type MoleculeBond,
} from "./molecule";
import type { ElementSymbol } from "./vsepr";

export type ResonanceInfo = {
  element: ElementSymbol;
  count: number;
  orders: number[];
};

// A selected atom has "branch" resonance when two or more of its leaf
// neighbors are the same element but don't all carry the same bond order.
// Because those neighbors are chemically identical, swapping which one
// holds the higher-order bond produces an equally real structure -- exactly
// the ambiguity resonance describes (e.g. the two terminal oxygens on a
// carbon that's double-bonded to one and single-bonded to the other).
export function branchResonanceAt(
  atoms: MoleculeAtom[],
  bonds: MoleculeBond[],
  id: AtomId,
): ResonanceInfo | null {
  const atom = atoms.find((a) => a.id === id);
  if (!atom) return null;

  const byElement = new Map<ElementSymbol, { id: AtomId; order: number }[]>();
  for (const nId of neighborsOf(bonds, id)) {
    if (neighborsOf(bonds, nId).length !== 1) continue; // only leaves are unambiguously interchangeable
    const n = atoms.find((a) => a.id === nId);
    const bond = bondBetween(bonds, id, nId);
    if (!n || !bond) continue;
    const list = byElement.get(n.element) ?? [];
    list.push({ id: nId, order: bond.order });
    byElement.set(n.element, list);
  }

  for (const [element, list] of byElement) {
    if (list.length < 2) continue;
    const orders = [...new Set(list.map((x) => x.order))].sort((a, b) => a - b);
    if (orders.length > 1) {
      return { element, count: list.length, orders };
    }
  }
  return null;
}

// A ring whose bond orders strictly alternate all the way around (like
// benzene's Kekulé structure) is the aromatic version of the same
// ambiguity: the alternation could just as validly start on the other
// bond, so real aromatic rings delocalize evenly instead of picking one.
// Alternation can only close perfectly around an even-sized ring -- an odd
// ring genuinely can't do this with two plain bond orders, which is itself
// real chemistry (odd aromatic rings need a formal charge to work, which
// this model doesn't represent), not a bug in the check.
export function ringResonanceAt(
  atoms: MoleculeAtom[],
  bonds: MoleculeBond[],
  id: AtomId,
): { ringSize: number } | null {
  const ring = findRing(atoms, bonds);
  if (!ring || !ring.members.includes(id)) return null;
  const n = ring.members.length;
  const orders: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = ring.members[i]!;
    const b = ring.members[(i + 1) % n]!;
    const bond = bondBetween(bonds, a, b);
    if (!bond) return null;
    orders.push(bond.order);
  }
  const alternates = orders.every((o, i) => o !== orders[(i + 1) % n]);
  return alternates ? { ringSize: n } : null;
}

export type ResonanceHighlights = {
  atomIds: Set<AtomId>;
  bondKeys: Set<string>;
  notes: string[];
};

// The per-atom checks above are written to answer "does resonance apply
// here?" for one clicked atom. Spotting resonance without already knowing
// where to look is exactly the harder skill this scan is meant to make
// easier -- it runs both checks over every atom/the one supported ring and
// collects everything they find into a single highlight set, so a
// resonance-eligible structure lights up on its own the moment it exists.
export function allResonanceHighlights(
  atoms: MoleculeAtom[],
  bonds: MoleculeBond[],
): ResonanceHighlights {
  const atomIds = new Set<AtomId>();
  const bondKeys = new Set<string>();
  const notes: string[] = [];

  for (const atom of atoms) {
    const branch = branchResonanceAt(atoms, bonds, atom.id);
    if (!branch) continue;
    atomIds.add(atom.id);
    for (const nId of neighborsOf(bonds, atom.id)) {
      const n = atoms.find((a) => a.id === nId);
      if (!n || n.element !== branch.element || neighborsOf(bonds, nId).length !== 1) continue;
      atomIds.add(nId);
      bondKeys.add(bondKey(atom.id, nId));
    }
    const orderWord = (o: number) => (o === 1 ? "single" : o === 2 ? "double" : "triple");
    notes.push(
      `${branch.count} equivalent atoms around this center could swap which one holds the ${branch.orders.map(orderWord).join("/")} bond.`,
    );
  }

  const ring = findRing(atoms, bonds);
  if (ring) {
    const alt = ringResonanceAt(atoms, bonds, ring.members[0]!);
    if (alt) {
      for (const id of ring.members) atomIds.add(id);
      const n = ring.members.length;
      for (let i = 0; i < n; i++) {
        bondKeys.add(bondKey(ring.members[i]!, ring.members[(i + 1) % n]!));
      }
      notes.push(
        `This ${alt.ringSize}-membered ring's alternating bonds could start on either bond.`,
      );
    }
  }

  return { atomIds, bondKeys, notes };
}

// Turns a bonded graph of atoms into actual 3D positions. There is no
// single global optimization here -- instead, exactly the same
// electron-domain repulsion physics used for one central atom elsewhere
// on this site runs independently at every atom that has bonds, and each
// child atom's whole local result is rotated as a rigid unit so its
// "back toward parent" bond direction lines up with the shared bond axis.
// That's a real, standard shortcut (the same idea distance-geometry tools
// like RDKit's ETKDG use to skip full quantum optimization): local
// geometry is genuinely simulated, only the *global* assembly is a rule
// rather than an energy minimization.
//
// The one degree of freedom VSEPR can't resolve on its own is the twist
// around each bond axis (the torsion/conformation) -- real molecules have
// that freedom too, which is exactly why it's exposed as the "Rotate
// bond" tool instead of being silently pinned to one "correct" answer.
//
// A single ring is handled as a special case: its atoms are placed first,
// as a regular polygon sized so consecutive atoms are exactly BOND_LENGTH
// apart (circumradius = L / (2*sin(pi/N))), which closes the ring exactly
// by construction -- something a pure tree walk fundamentally can't do,
// since it would need two independently-placed atoms to land on the same
// point. Everything else hangs off the ring (or off the tree's root, if
// there's no ring) exactly as before. A ring atom's local VSEPR angle
// rarely matches the polygon's own interior angle exactly (a hexagon's is
// 120 degrees; a tetrahedral carbon's is 109.5), so its local frame is
// *best-fit* to the two required ring directions rather than forced --
// this view shows the flat, unstrained approximation, not a real chair or
// boat pucker.

import { initialDomains, relaxStep, DEFAULT_LONE_PAIR_WEIGHT } from "./vsepr";
import {
  findRing,
  neighborsOf,
  lonePairsOf,
  bondKey,
  type AtomId,
  type MoleculeAtom,
  type MoleculeBond,
} from "./molecule";
import {
  vAdd,
  vSub,
  vScale,
  vNormalize,
  alignRotation,
  rotateAroundAxis,
  rotationFromTwoVectorPairs,
  type Vec3,
} from "./project3d";

const BOND_LENGTH = 1;
const RELAX_ITERATIONS = 120;
const RELAX_RATE = 0.05;
const DEFAULT_TORSION = Math.PI / 3; // ~60 degrees -- a staggered-looking default, not eclipsed

export type EmbeddedAtom = {
  pos: Vec3;
  bondDirs: Map<AtomId, Vec3>;
  loneDirs: Vec3[];
};

function settledLocalDomains(bondingCount: number, lone: number, lonePairWeight: number) {
  let current = initialDomains(bondingCount, lone);
  for (let i = 0; i < RELAX_ITERATIONS; i++)
    current = relaxStep(current, RELAX_RATE, lonePairWeight);
  return current;
}

export function embedMolecule(
  atoms: MoleculeAtom[],
  bonds: MoleculeBond[],
  rootId: AtomId,
  torsionOf: (key: string) => number | undefined,
  lonePairWeight: number = DEFAULT_LONE_PAIR_WEIGHT,
): Map<AtomId, EmbeddedAtom> {
  const result = new Map<AtomId, EmbeddedAtom>();
  const visited = new Set<AtomId>();

  type QueueItem = {
    id: AtomId;
    parent: AtomId | null;
    pos: Vec3;
    incomingDir: Vec3 | null; // direction from parent to this atom, global space
  };

  const ring = findRing(atoms, bonds);
  const ringPos = new Map<AtomId, Vec3>();
  const ringNeighborsOf = new Map<AtomId, readonly [AtomId, AtomId]>();
  const queue: QueueItem[] = [];

  if (ring) {
    const members = ring.members;
    const n = members.length;
    const circumradius = BOND_LENGTH / (2 * Math.sin(Math.PI / n));
    members.forEach((id, i) => {
      const theta = (2 * Math.PI * i) / n;
      ringPos.set(id, [circumradius * Math.cos(theta), circumradius * Math.sin(theta), 0]);
    });
    members.forEach((id, i) => {
      const prev = members[(i - 1 + n) % n]!;
      const next = members[(i + 1) % n]!;
      ringNeighborsOf.set(id, [prev, next]);
      queue.push({ id, parent: null, pos: ringPos.get(id)!, incomingDir: null });
    });
  } else {
    queue.push({ id: rootId, parent: null, pos: [0, 0, 0], incomingDir: null });
  }

  while (queue.length > 0) {
    const item = queue.shift()!;
    if (visited.has(item.id)) continue;
    visited.add(item.id);

    const degree = neighborsOf(bonds, item.id).length;
    const lone = degree > 0 ? (lonePairsOf(atoms, bonds, item.id) ?? 0) : 0;
    const local = settledLocalDomains(degree, lone, lonePairWeight);
    const localBonds = local.filter((d) => d.kind === "bond");
    const localLones = local.filter((d) => d.kind === "lone");

    const ringNeighbors = ringNeighborsOf.get(item.id);

    // Local bonding-domain slot 0 (and, for a ring atom, slot 1 too)
    // always represents the bond(s) back toward whatever placed this atom
    // -- every atom that reserves a slot this way agrees on the
    // convention, so the choice stays consistent across the whole walk.
    let rotate: (v: Vec3) => Vec3 = (v) => v;
    let reserved = 0;
    if (ringNeighbors && localBonds.length >= 2) {
      const [prevId, nextId] = ringNeighbors;
      const toPrev = vNormalize(vSub(ringPos.get(prevId)!, item.pos));
      const toNext = vNormalize(vSub(ringPos.get(nextId)!, item.pos));
      rotate = rotationFromTwoVectorPairs(localBonds[0]!.pos, localBonds[1]!.pos, toPrev, toNext);
      reserved = 2;
    } else if (item.parent !== null && item.incomingDir) {
      const requiredGlobalBack = vScale(item.incomingDir, -1);
      const baseRotate = alignRotation(localBonds[0]!.pos, requiredGlobalBack);
      const torsion = torsionOf(bondKey(item.parent, item.id)) ?? DEFAULT_TORSION;
      rotate = (v) => rotateAroundAxis(baseRotate(v), requiredGlobalBack, torsion);
      reserved = 1;
    }

    const others = neighborsOf(bonds, item.id).filter((n) => {
      if (ringNeighbors) return n !== ringNeighbors[0] && n !== ringNeighbors[1];
      return n !== item.parent;
    });

    const bondDirs = new Map<AtomId, Vec3>();
    if (ringNeighbors) {
      const [prevId, nextId] = ringNeighbors;
      bondDirs.set(prevId, vNormalize(vSub(ringPos.get(prevId)!, item.pos)));
      bondDirs.set(nextId, vNormalize(vSub(ringPos.get(nextId)!, item.pos)));
    } else if (item.parent !== null) {
      bondDirs.set(item.parent, vScale(item.incomingDir!, -1));
    }

    others.forEach((neighborId, i) => {
      const localDir = localBonds[reserved + i]?.pos;
      if (!localDir) return;
      const globalDir = rotate(localDir);
      bondDirs.set(neighborId, globalDir);
      if (!visited.has(neighborId)) {
        queue.push({
          id: neighborId,
          parent: item.id,
          pos: vAdd(item.pos, vScale(globalDir, BOND_LENGTH)),
          incomingDir: globalDir,
        });
      }
    });

    result.set(item.id, {
      pos: item.pos,
      bondDirs,
      loneDirs: localLones.map((d) => rotate(d.pos)),
    });
  }

  return result;
}

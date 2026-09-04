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
// Because this is a tree walk, ring-closing bonds (which would need two
// independently-placed atoms to coincide) aren't supported -- the graph
// model rejects those before they ever reach this function.

import { initialDomains, relaxStep, DEFAULT_LONE_PAIR_WEIGHT } from "./vsepr";
import {
  neighborsOf,
  lonePairsOf,
  bondKey,
  type AtomId,
  type MoleculeAtom,
  type MoleculeBond,
} from "./molecule";
import { vAdd, vScale, alignRotation, rotateAroundAxis, type Vec3 } from "./project3d";

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
  const queue: QueueItem[] = [{ id: rootId, parent: null, pos: [0, 0, 0], incomingDir: null }];

  while (queue.length > 0) {
    const item = queue.shift()!;
    if (visited.has(item.id)) continue;
    visited.add(item.id);

    const degree = neighborsOf(bonds, item.id).length;
    const lone = degree > 0 ? (lonePairsOf(atoms, bonds, item.id) ?? 0) : 0;
    const local = settledLocalDomains(degree, lone, lonePairWeight);
    const localBonds = local.filter((d) => d.kind === "bond");
    const localLones = local.filter((d) => d.kind === "lone");

    // Local bonding-domain slot 0 always represents "the bond back to my
    // parent" by convention; every other atom that placed this one always
    // reserves that same slot, so the choice is consistent everywhere.
    let rotate: (v: Vec3) => Vec3 = (v) => v;
    if (item.parent !== null && item.incomingDir) {
      const requiredGlobalBack = vScale(item.incomingDir, -1);
      const baseRotate = alignRotation(localBonds[0]!.pos, requiredGlobalBack);
      const torsion = torsionOf(bondKey(item.parent, item.id)) ?? DEFAULT_TORSION;
      rotate = (v) => rotateAroundAxis(baseRotate(v), requiredGlobalBack, torsion);
    }

    const others = neighborsOf(bonds, item.id).filter((n) => n !== item.parent);
    const offset = item.parent !== null ? 1 : 0;

    const bondDirs = new Map<AtomId, Vec3>();
    if (item.parent !== null) bondDirs.set(item.parent, vScale(item.incomingDir!, -1));

    others.forEach((neighborId, i) => {
      const localDir = localBonds[offset + i]?.pos;
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

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
// A single ring is handled as a special case: its atoms are placed first
// -- something a pure tree walk fundamentally can't do, since closing a
// ring needs two independently-placed atoms to land on the same point.
// Everything else hangs off the ring (or off the tree's root, if there's
// no ring) exactly as before.
//
// A ring atom's local VSEPR angle rarely matches a flat polygon's own
// interior angle exactly (a hexagon's is 120 degrees; a tetrahedral
// carbon's is 109.5). For an even-membered ring, that mismatch is solved
// for directly: alternating atoms are lifted +h/-h out of the ring plane
// until the resulting bond angle at each vertex actually reaches the
// average of what its own already-simulated local geometry wants --
// solving out to a real chair for an all-single-bond six-ring (109.5
// degrees needs real puckering) and to zero pucker, staying flat, for a
// ring whose atoms already want ~120 degrees (an aromatic ring). Odd
// rings can't alternate height evenly, so they stay in the flat
// regular-polygon approximation (circumradius = L / (2*sin(pi/N))); a
// real odd-ring pucker (envelope, twist) isn't a simple two-parameter fit
// the way an even ring's is. Either way, a ring atom's local frame is
// *best-fit* to the two required ring directions rather than forced.

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
  vDot,
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

// The bond angle a flat, evenly-alternating-height n-gon actually produces
// at each vertex, given bond length L and pucker height h (alternating
// +h/-h atom to atom, which requires n even). h=0 reduces to the regular
// polygon's own interior angle; as h grows the angle shrinks monotonically
// toward zero, which is what makes a bisection search for a target angle
// well-posed.
function ringAngleGivenH(n: number, L: number, h: number): number {
  const r2 = L * L - 4 * h * h;
  if (r2 <= 0) return 0;
  const r = Math.sqrt(r2);
  const dTheta = (2 * Math.PI) / n;
  const prev: Vec3 = [r * Math.cos(-dTheta), r * Math.sin(-dTheta), -h];
  const here: Vec3 = [r, 0, h];
  const next: Vec3 = [r * Math.cos(dTheta), r * Math.sin(dTheta), -h];
  const toPrev = vNormalize(vSub(prev, here));
  const toNext = vNormalize(vSub(next, here));
  const d = Math.max(-1, Math.min(1, vDot(toPrev, toNext)));
  return Math.acos(d);
}

// How far an even-membered ring must pucker out of plane for its atoms'
// own already-simulated bond angle to actually be reached -- the same
// mechanism that turns a flat hexagon (120 degrees) into a real chair
// (109.5 degrees) for an all-single-bond ring, while a ring whose atoms
// already want ~120 degrees (an aromatic ring) solves out to zero pucker
// and stays flat. This is a real geometric constraint being solved
// numerically, not a hardcoded "hexagon = chair" rule -- it falls out of
// whatever electron-domain count each ring atom's own substituents give
// it, the same way every other shape on this site is simulated rather
// than looked up.
function solveChairHeight(n: number, L: number, targetAngle: number): number {
  const flatAngle = ringAngleGivenH(n, L, 0);
  if (targetAngle >= flatAngle) return 0;
  let lo = 0;
  let hi = (L / 2) * 0.999;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (ringAngleGivenH(n, L, mid) > targetAngle) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
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

    // Odd-membered rings can't alternate height evenly (there's no
    // consistent +h/-h parity to assign), so they stay in the flat
    // regular-polygon approximation; a real odd-ring pucker (envelope,
    // twist) isn't a simple two-parameter fit the way an even ring's is.
    if (n % 2 === 0) {
      const localAngles = members
        .map((id) => {
          const degree = neighborsOf(bonds, id).length;
          const lone = degree > 0 ? (lonePairsOf(atoms, bonds, id) ?? 0) : 0;
          const localBonds = settledLocalDomains(degree, lone, lonePairWeight).filter(
            (d) => d.kind === "bond",
          );
          if (localBonds.length < 2) return null;
          const d = Math.max(
            -1,
            Math.min(1, vDot(vNormalize(localBonds[0]!.pos), vNormalize(localBonds[1]!.pos))),
          );
          return Math.acos(d);
        })
        .filter((a): a is number => a !== null);
      const targetAngle =
        localAngles.length > 0
          ? localAngles.reduce((s, a) => s + a, 0) / localAngles.length
          : ringAngleGivenH(n, BOND_LENGTH, 0);
      const h = solveChairHeight(n, BOND_LENGTH, targetAngle);
      const r2 = BOND_LENGTH * BOND_LENGTH - 4 * h * h;
      const r = r2 > 0 ? Math.sqrt(r2) : circumradius;
      members.forEach((id, i) => {
        const theta = (2 * Math.PI * i) / n;
        ringPos.set(id, [r * Math.cos(theta), r * Math.sin(theta), i % 2 === 0 ? h : -h]);
      });
    } else {
      members.forEach((id, i) => {
        const theta = (2 * Math.PI * i) / n;
        ringPos.set(id, [circumradius * Math.cos(theta), circumradius * Math.sin(theta), 0]);
      });
    }

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

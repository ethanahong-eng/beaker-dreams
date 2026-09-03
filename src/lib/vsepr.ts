// VSEPR is, quite literally, point charges arranging themselves to
// minimize repulsion on a sphere around a central atom. Rather than
// hardcoding a geometry per electron-domain count, we simulate that
// repulsion directly — lone pairs get extra repulsive weight (they really
// do repel more strongly than bonding pairs), so angle compression effects
// like water's ~104.5 degrees fall out of the simulation instead of being
// asserted.

export type Domain = { kind: "bond" | "lone"; pos: [number, number, number] };

const LONE_PAIR_WEIGHT = 1.2;

function weightOf(kind: Domain["kind"]) {
  return kind === "lone" ? LONE_PAIR_WEIGHT : 1;
}

function normalize(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

// Fibonacci sphere lattice, a cheap well-spread starting layout so the
// relaxation doesn't have to fight a bad initial guess (e.g. two domains
// starting near-antipodal already, since that's linear's answer anyway).
export function initialDomains(bonding: number, lone: number): Domain[] {
  const n = bonding + lone;
  const points: [number, number, number][] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = n <= 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push([Math.cos(theta) * radius, y, Math.sin(theta) * radius]);
  }
  const domains: Domain[] = [];
  for (let i = 0; i < bonding; i++) domains.push({ kind: "bond", pos: points[i]! });
  for (let i = 0; i < lone; i++) domains.push({ kind: "lone", pos: points[bonding + i]! });
  return domains;
}

// One damped relaxation step: every pair of domains pushes the other away
// along the great-circle direction between them, weighted by charge, then
// everything is renormalized back onto the unit sphere.
export function relaxStep(domains: Domain[], rate: number): Domain[] {
  const n = domains.length;
  const forces: [number, number, number][] = domains.map(() => [0, 0, 0]);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = domains[i]!.pos;
      const b = domains[j]!.pos;
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      const dz = a[2] - b[2];
      const distSq = Math.max(0.02, dx * dx + dy * dy + dz * dz);
      const w = weightOf(domains[i]!.kind) * weightOf(domains[j]!.kind);
      const f = (w / distSq) * rate;
      forces[i]![0] += dx * f;
      forces[i]![1] += dy * f;
      forces[i]![2] += dz * f;
      forces[j]![0] -= dx * f;
      forces[j]![1] -= dy * f;
      forces[j]![2] -= dz * f;
    }
  }
  return domains.map((d, i) => ({
    kind: d.kind,
    pos: normalize([d.pos[0] + forces[i]![0], d.pos[1] + forces[i]![1], d.pos[2] + forces[i]![2]]),
  }));
}

export function maxDisplacement(a: Domain[], b: Domain[]): number {
  let max = 0;
  for (let i = 0; i < a.length; i++) {
    const d = Math.hypot(
      a[i]!.pos[0] - b[i]!.pos[0],
      a[i]!.pos[1] - b[i]!.pos[1],
      a[i]!.pos[2] - b[i]!.pos[2],
    );
    if (d > max) max = d;
  }
  return max;
}

const ELECTRON_GEOMETRY: Record<number, string> = {
  2: "Linear",
  3: "Trigonal planar",
  4: "Tetrahedral",
  5: "Trigonal bipyramidal",
  6: "Octahedral",
};

const MOLECULAR_GEOMETRY: Record<string, string> = {
  "2,0": "Linear",
  "3,0": "Trigonal planar",
  "2,1": "Bent",
  "4,0": "Tetrahedral",
  "3,1": "Trigonal pyramidal",
  "2,2": "Bent",
  "5,0": "Trigonal bipyramidal",
  "4,1": "See-saw",
  "3,2": "T-shaped",
  "2,3": "Linear",
  "6,0": "Octahedral",
  "5,1": "Square pyramidal",
  "4,2": "Square planar",
};

export function electronGeometryName(bonding: number, lone: number): string {
  return ELECTRON_GEOMETRY[bonding + lone] ?? "—";
}

export function molecularGeometryName(bonding: number, lone: number): string {
  return MOLECULAR_GEOMETRY[`${bonding},${lone}`] ?? "—";
}

export function bondAngleFromDomains(domains: Domain[]): number | null {
  const bonds = domains.filter((d) => d.kind === "bond");
  if (bonds.length < 2) return null;
  let min = Infinity;
  for (let i = 0; i < bonds.length; i++) {
    for (let j = i + 1; j < bonds.length; j++) {
      const a = bonds[i]!.pos;
      const b = bonds[j]!.pos;
      const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      const angle = (Math.acos(dot) * 180) / Math.PI;
      if (angle < min) min = angle;
    }
  }
  return min;
}

export type MoleculeTarget = {
  formula: string;
  centralAtom: string;
  bonding: number;
  lone: number;
};

export const MOLECULE_DECK: MoleculeTarget[] = [
  { formula: "BeCl2", centralAtom: "Be", bonding: 2, lone: 0 },
  { formula: "BF3", centralAtom: "B", bonding: 3, lone: 0 },
  { formula: "SO2", centralAtom: "S", bonding: 2, lone: 1 },
  { formula: "CH4", centralAtom: "C", bonding: 4, lone: 0 },
  { formula: "NH3", centralAtom: "N", bonding: 3, lone: 1 },
  { formula: "H2O", centralAtom: "O", bonding: 2, lone: 2 },
  { formula: "PCl5", centralAtom: "P", bonding: 5, lone: 0 },
  { formula: "SF4", centralAtom: "S", bonding: 4, lone: 1 },
  { formula: "ClF3", centralAtom: "Cl", bonding: 3, lone: 2 },
  { formula: "XeF2", centralAtom: "Xe", bonding: 2, lone: 3 },
  { formula: "SF6", centralAtom: "S", bonding: 6, lone: 0 },
  { formula: "BrF5", centralAtom: "Br", bonding: 5, lone: 1 },
  { formula: "XeF4", centralAtom: "Xe", bonding: 4, lone: 2 },
];

export function shuffledDeck(): MoleculeTarget[] {
  const deck = [...MOLECULE_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

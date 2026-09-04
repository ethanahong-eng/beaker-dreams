// VSEPR is, quite literally, point charges arranging themselves to
// minimize repulsion on a sphere around a central atom. Rather than
// hardcoding a geometry per electron-domain count, we simulate that
// repulsion directly — lone pairs get extra repulsive weight (they really
// do repel more strongly than bonding pairs), so angle compression effects
// like water's ~104.5 degrees fall out of the simulation instead of being
// asserted.

export type Domain = {
  kind: "bond" | "lone";
  pos: [number, number, number];
  element?: ElementSymbol;
};

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

// Same layout as initialDomains, but each bonding domain is tagged with the
// actual terminal element occupying it (in the order attached), so the
// renderer can draw the real atom instead of a generic sphere. Physics
// doesn't care which element is there -- only electron-domain count and
// kind matter for repulsion -- so this just decorates the existing layout.
export function initialDomainsWithElements(terminals: ElementSymbol[], lone: number): Domain[] {
  const base = initialDomains(terminals.length, lone);
  return base.map((d, i) => (d.kind === "bond" ? { ...d, element: terminals[i]! } : d));
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
    ...(d.element !== undefined ? { element: d.element } : {}),
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

// --- Real-atom toolkit ---------------------------------------------------
// Everything below turns the abstract "N bonding pairs, M lone pairs"
// builder into an actual periodic-table toolkit: pick a central atom, drag
// real terminal atoms onto it, and let plain valence-electron bookkeeping
// -- the same rule taught as "count electrons, subtract one pair per bond,
// whatever's left is lone pairs" -- decide both whether the combination is
// chemically legal and how many lone pairs the central atom ends up with.
// No molecule-by-molecule lookup table: XeF2's three lone pairs, SF6's
// none, and ClF3's rejection of a 4th halogen all fall out of the same
// four-line calculation.

export type ElementSymbol =
  "H" | "Be" | "B" | "C" | "N" | "O" | "F" | "Al" | "Si" | "P" | "S" | "Cl" | "Br" | "I" | "Xe";

type ElementInfo = {
  symbol: ElementSymbol;
  name: string;
  color: string;
  radius: number;
  valenceElectrons: number; // used when this element is the central atom
  maxDomains: 4 | 6; // strict octet (period 2) vs. an expanded one
};

export const ELEMENTS: Record<ElementSymbol, ElementInfo> = {
  H: {
    symbol: "H",
    name: "Hydrogen",
    color: "rgba(148, 163, 184, 0.9)",
    radius: 5,
    valenceElectrons: 1,
    maxDomains: 4,
  },
  Be: {
    symbol: "Be",
    name: "Beryllium",
    color: "rgba(196, 181, 253, 0.9)",
    radius: 10,
    valenceElectrons: 2,
    maxDomains: 4,
  },
  B: {
    symbol: "B",
    name: "Boron",
    color: "rgba(244, 114, 182, 0.9)",
    radius: 10,
    valenceElectrons: 3,
    maxDomains: 4,
  },
  C: {
    symbol: "C",
    name: "Carbon",
    color: "rgba(15, 23, 42, 0.92)",
    radius: 11,
    valenceElectrons: 4,
    maxDomains: 4,
  },
  N: {
    symbol: "N",
    name: "Nitrogen",
    color: "rgba(59, 130, 246, 0.9)",
    radius: 10,
    valenceElectrons: 5,
    maxDomains: 4,
  },
  O: {
    symbol: "O",
    name: "Oxygen",
    color: "rgba(220, 38, 38, 0.92)",
    radius: 10,
    valenceElectrons: 6,
    maxDomains: 4,
  },
  F: {
    symbol: "F",
    name: "Fluorine",
    color: "rgba(134, 239, 172, 0.9)",
    radius: 9,
    valenceElectrons: 7,
    maxDomains: 4,
  },
  Al: {
    symbol: "Al",
    name: "Aluminum",
    color: "rgba(100, 116, 139, 0.8)",
    radius: 12,
    valenceElectrons: 3,
    maxDomains: 6,
  },
  Si: {
    symbol: "Si",
    name: "Silicon",
    color: "rgba(161, 98, 7, 0.75)",
    radius: 12,
    valenceElectrons: 4,
    maxDomains: 6,
  },
  P: {
    symbol: "P",
    name: "Phosphorus",
    color: "rgba(249, 115, 22, 0.9)",
    radius: 12,
    valenceElectrons: 5,
    maxDomains: 6,
  },
  S: {
    symbol: "S",
    name: "Sulfur",
    color: "rgba(234, 179, 8, 0.9)",
    radius: 11,
    valenceElectrons: 6,
    maxDomains: 6,
  },
  Cl: {
    symbol: "Cl",
    name: "Chlorine",
    color: "rgba(34, 197, 94, 0.9)",
    radius: 11,
    valenceElectrons: 7,
    maxDomains: 6,
  },
  Br: {
    symbol: "Br",
    name: "Bromine",
    color: "rgba(153, 27, 27, 0.85)",
    radius: 12,
    valenceElectrons: 7,
    maxDomains: 6,
  },
  I: {
    symbol: "I",
    name: "Iodine",
    color: "rgba(147, 51, 234, 0.85)",
    radius: 13,
    valenceElectrons: 7,
    maxDomains: 6,
  },
  Xe: {
    symbol: "Xe",
    name: "Xenon",
    color: "rgba(45, 212, 191, 0.85)",
    radius: 13,
    valenceElectrons: 8,
    maxDomains: 6,
  },
};

// Central-atom candidates cover the usual intro-VSEPR set. Terminal atoms
// are restricted to a small set with an unambiguous, fixed bond order --
// halogens and hydrogen always single-bond, oxygen and sulfur always
// double-bond as a terminal group (the common carbonyl/sulfonyl case) --
// so the interaction never needs to ask the user "single or double bond?"
// while still reproducing real electron-domain counts.
export const CENTRAL_CANDIDATES: ElementSymbol[] = [
  "Be",
  "B",
  "C",
  "N",
  "O",
  "Al",
  "Si",
  "P",
  "S",
  "Cl",
  "Br",
  "I",
  "Xe",
];
export const TERMINAL_CANDIDATES: ElementSymbol[] = ["H", "F", "Cl", "Br", "I", "O", "S"];

export const TERMINAL_BOND_COST: Partial<Record<ElementSymbol, 1 | 2>> = {
  H: 1,
  F: 1,
  Cl: 1,
  Br: 1,
  I: 1,
  O: 2,
  S: 2,
};

// Valence electrons left on the central atom once every terminal atom's
// bond is accounted for, halved into lone pairs. Null means the
// combination isn't chemically valid -- negative or odd electrons left
// over, or more electron domains than the central atom's octet allows.
export function computeLonePairs(
  central: ElementSymbol,
  terminals: ElementSymbol[],
): number | null {
  if (terminals.length === 0) return null;
  const info = ELEMENTS[central];
  const consumed = terminals.reduce((sum, t) => sum + (TERMINAL_BOND_COST[t] ?? 1), 0);
  const remaining = info.valenceElectrons - consumed;
  if (remaining < 0 || remaining % 2 !== 0) return null;
  const lone = remaining / 2;
  if (terminals.length + lone > info.maxDomains) return null;
  return lone;
}

export type AttachResult = { ok: true; lone: number } | { ok: false; reason: string };

// Tries adding one more terminal atom and explains, in plain language,
// exactly which valence rule a rejected attempt would break -- this is
// the check that keeps the toolkit from building anything that "doesn't
// exist in nature" by the same standard a chemistry class would use.
// Only two things about an attachment are irrecoverable no matter what gets
// attached afterward: running the central atom out of valence electrons, or
// packing in more electron domains than its octet (or expanded octet)
// allows. An odd number of electrons left over is NOT one of those --
// carbon reads as "incomplete" after one or three chlorines are attached,
// not "wrong," because a fourth one finishes CCl4 perfectly legally.
// Blocking on odd parity would reject every legitimate structure on the
// way to being built one bond at a time, so only the two irrecoverable
// cases gate the drop; parity is left for computeLonePairs to report as
// "not resolved yet" rather than "invalid."
export function tryAttach(
  central: ElementSymbol,
  terminals: ElementSymbol[],
  next: ElementSymbol,
): AttachResult {
  const info = ELEMENTS[central];
  const candidate = [...terminals, next];
  const consumed = candidate.reduce((sum, t) => sum + (TERMINAL_BOND_COST[t] ?? 1), 0);
  const remaining = info.valenceElectrons - consumed;
  if (remaining < 0) {
    return {
      ok: false,
      reason: `${info.name} doesn't have enough valence electrons left to bond another ${ELEMENTS[next].name.toLowerCase()} atom.`,
    };
  }
  const domainEstimate = candidate.length + Math.floor(remaining / 2);
  if (domainEstimate > info.maxDomains) {
    return {
      ok: false,
      reason:
        info.maxDomains === 4
          ? `${info.name} can't exceed 4 electron domains — the octet rule caps it there.`
          : `${info.name} can't hold more than ${info.maxDomains} electron domains.`,
    };
  }
  return { ok: true, lone: computeLonePairs(central, candidate) ?? 0 };
}

const SUBSCRIPT_DIGITS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
function subscript(n: number): string {
  return String(n)
    .split("")
    .map((d) => SUBSCRIPT_DIGITS[Number(d)])
    .join("");
}

export function formulaOf(central: ElementSymbol, terminals: ElementSymbol[]): string {
  const counts = new Map<ElementSymbol, number>();
  for (const t of terminals) counts.set(t, (counts.get(t) ?? 0) + 1);
  let formula = central as string;
  for (const [el, n] of [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    formula += el + (n > 1 ? subscript(n) : "");
  }
  return formula;
}

export function sameComposition(a: ElementSymbol[], b: ElementSymbol[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((el, i) => el === sortedB[i]);
}

export type MoleculeTarget = {
  formula: string;
  central: ElementSymbol;
  terminals: ElementSymbol[];
};

export const MOLECULE_DECK: MoleculeTarget[] = [
  { formula: "BeCl₂", central: "Be", terminals: ["Cl", "Cl"] },
  { formula: "BF₃", central: "B", terminals: ["F", "F", "F"] },
  { formula: "CO₂", central: "C", terminals: ["O", "O"] },
  { formula: "CH₄", central: "C", terminals: ["H", "H", "H", "H"] },
  { formula: "NH₃", central: "N", terminals: ["H", "H", "H"] },
  { formula: "H₂O", central: "O", terminals: ["H", "H"] },
  { formula: "PCl₅", central: "P", terminals: ["Cl", "Cl", "Cl", "Cl", "Cl"] },
  { formula: "SF₄", central: "S", terminals: ["F", "F", "F", "F"] },
  { formula: "ClF₃", central: "Cl", terminals: ["F", "F", "F"] },
  { formula: "XeF₂", central: "Xe", terminals: ["F", "F"] },
  { formula: "SF₆", central: "S", terminals: ["F", "F", "F", "F", "F", "F"] },
  { formula: "BrF₅", central: "Br", terminals: ["F", "F", "F", "F", "F"] },
  { formula: "XeF₄", central: "Xe", terminals: ["F", "F", "F", "F"] },
];

export function shuffledDeck(): MoleculeTarget[] {
  const deck = [...MOLECULE_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

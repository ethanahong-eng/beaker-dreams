// Orbital composition for each hybridization scheme taught at the intro
// level. Domain count is exactly what VSEPR already tracks (bonding +
// lone pairs), which is why hybridization and electron geometry always
// agree: sp3 IS "4 electron domains," just described from the orbital
// side instead of the repulsion side.

export type HybridType = "sp" | "sp2" | "sp3" | "sp3d" | "sp3d2";

export type HybridInfo = {
  type: HybridType;
  label: string;
  domains: number;
  pCount: number; // p orbitals promoted into the hybrid mix
  dCount: number; // d orbitals promoted into the hybrid mix
  leftoverP: number; // p orbitals left pure (e.g. for pi bonds)
  leftoverD: number; // d orbitals left pure
  example: string;
};

export const HYBRID_TYPES: Record<HybridType, HybridInfo> = {
  sp: {
    type: "sp",
    label: "sp",
    domains: 2,
    pCount: 1,
    dCount: 0,
    leftoverP: 2,
    leftoverD: 0,
    example: "BeCl₂, C₂H₂",
  },
  sp2: {
    type: "sp2",
    label: "sp²",
    domains: 3,
    pCount: 2,
    dCount: 0,
    leftoverP: 1,
    leftoverD: 0,
    example: "BF₃, C₂H₄",
  },
  sp3: {
    type: "sp3",
    label: "sp³",
    domains: 4,
    pCount: 3,
    dCount: 0,
    leftoverP: 0,
    leftoverD: 0,
    example: "CH₄, NH₃, H₂O",
  },
  sp3d: {
    type: "sp3d",
    label: "sp³d",
    domains: 5,
    pCount: 3,
    dCount: 1,
    leftoverP: 0,
    leftoverD: 4,
    example: "PCl₅, SF₄",
  },
  sp3d2: {
    type: "sp3d2",
    label: "sp³d²",
    domains: 6,
    pCount: 3,
    dCount: 2,
    leftoverP: 0,
    leftoverD: 3,
    example: "SF₆, XeF₄",
  },
};

export const HYBRID_ORDER: HybridType[] = ["sp", "sp2", "sp3", "sp3d", "sp3d2"];

// Fixed orbital-slot counts a period-2/3 valence shell actually has, used
// so the energy diagram can show "3 p orbitals, N of them promoted" with
// stable per-slot identity (needed for the merge animation to read as a
// transition rather than a swap when the hybridization type changes).
export const P_SLOTS = 3;
export const D_SLOTS = 5;

// Illustrative, not a real MO calculation: relative atomic-orbital
// energies used only to place lines on the diagram (s lowest, d highest).
export const ORBITAL_ENERGY = { s: 0, p: 1, d: 1.7 };

// A hybrid orbital's energy sits at the (illustrative) weighted average of
// the atomic orbitals that were promoted and mixed into it -- pulling in
// more p or d character raises it further above pure s.
export function hybridEnergy(info: HybridInfo): number {
  const total = ORBITAL_ENERGY.s + info.pCount * ORBITAL_ENERGY.p + info.dCount * ORBITAL_ENERGY.d;
  const count = 1 + info.pCount + info.dCount;
  return total / count;
}

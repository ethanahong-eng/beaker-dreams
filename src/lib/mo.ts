// Molecular orbital theory for a diatomic built from two real atoms, via a
// genuine (if minimal) LCAO treatment: each valence atomic orbital comes
// from the same hydrogen-like wavefunctions used in the atomic-orbitals
// topic, the mixing between a symmetry-matched pair on the two atoms is
// found by numerically integrating their overlap and solving the resulting
// 2x2 secular equation (the standard Wolfsberg-Helmholz / extended-Huckel
// approximation for the resonance integral), and the diagram's ordering
// and filling follow directly from the resulting energies.
import { radialWavefunction, angularValue, rMaxFor, type Orientation } from "@/lib/orbitals";
import type { Vec3 } from "@/lib/project3d";

export type OrbitalKind = "1s" | "2s" | "2pz" | "2px" | "2py";

function kindToNL(kind: OrbitalKind): { n: number; l: number; orientation: Orientation } {
  switch (kind) {
    case "1s":
      return { n: 1, l: 0, orientation: "s" };
    case "2s":
      return { n: 2, l: 0, orientation: "s" };
    case "2pz":
      return { n: 2, l: 1, orientation: "pz" };
    case "2px":
      return { n: 2, l: 1, orientation: "px" };
    case "2py":
      return { n: 2, l: 1, orientation: "py" };
  }
}

// Approximate valence-state ionization energies (eV, negative = bound),
// the standard extended-Huckel-style orbital energies used as the diagonal
// of the secular equation. Real values, not stand-ins -- but still an
// approximation (the true one-electron energy shifts with the molecular
// environment, which a full self-consistent calculation would capture and
// this qualitative model doesn't).
export type Element = {
  symbol: string;
  name: string;
  z: number;
  period: 1 | 2;
  valenceElectrons: number;
  vsie: Partial<Record<"1s" | "2s" | "2p", number>>;
  // Clementi-Raimondi effective nuclear charge for the valence shell: real
  // atoms bind their 2s/2p electrons far more tightly than a Z=1 hydrogen
  // atom would, because the nucleus's full charge isn't fully screened by
  // the other electrons. orbitals.ts only implements Z=1 hydrogenic
  // wavefunctions, but psi_Z(r) = Z^1.5 * psi_1(Z*r) is the exact scaling
  // relation for any hydrogen-like orbital, so this Zeff is applied at
  // evaluation time in atomicOrbitalAt rather than duplicating the
  // wavefunction math. Skipping this would make every element's valence
  // orbitals equally (and unrealistically) diffuse, which visibly breaks
  // the 2s/2p energy ordering for heavier atoms like N or O.
  zEff: number;
};

export const ELEMENTS: Element[] = [
  {
    symbol: "H",
    name: "Hydrogen",
    z: 1,
    period: 1,
    valenceElectrons: 1,
    vsie: { "1s": -13.6 },
    zEff: 1.0,
  },
  {
    symbol: "He",
    name: "Helium",
    z: 2,
    period: 1,
    valenceElectrons: 2,
    vsie: { "1s": -24.6 },
    zEff: 1.69,
  },
  {
    symbol: "Li",
    name: "Lithium",
    z: 3,
    period: 2,
    valenceElectrons: 1,
    vsie: { "2s": -5.4, "2p": -3.5 },
    zEff: 1.28,
  },
  {
    symbol: "Be",
    name: "Beryllium",
    z: 4,
    period: 2,
    valenceElectrons: 2,
    vsie: { "2s": -10.0, "2p": -6.0 },
    zEff: 1.91,
  },
  {
    symbol: "B",
    name: "Boron",
    z: 5,
    period: 2,
    valenceElectrons: 3,
    vsie: { "2s": -14.0, "2p": -8.3 },
    zEff: 2.42,
  },
  {
    symbol: "C",
    name: "Carbon",
    z: 6,
    period: 2,
    valenceElectrons: 4,
    vsie: { "2s": -19.4, "2p": -10.7 },
    zEff: 3.14,
  },
  {
    symbol: "N",
    name: "Nitrogen",
    z: 7,
    period: 2,
    valenceElectrons: 5,
    vsie: { "2s": -25.6, "2p": -13.2 },
    zEff: 3.83,
  },
  {
    symbol: "O",
    name: "Oxygen",
    z: 8,
    period: 2,
    valenceElectrons: 6,
    vsie: { "2s": -32.3, "2p": -15.9 },
    zEff: 4.45,
  },
  {
    symbol: "F",
    name: "Fluorine",
    z: 9,
    period: 2,
    valenceElectrons: 7,
    vsie: { "2s": -40.2, "2p": -18.7 },
    zEff: 5.1,
  },
  {
    symbol: "Ne",
    name: "Neon",
    z: 10,
    period: 2,
    valenceElectrons: 8,
    vsie: { "2s": -48.5, "2p": -21.6 },
    zEff: 5.76,
  },
];

function energyOf(el: Element, kind: OrbitalKind): number {
  const key = kind === "1s" ? "1s" : kind === "2s" ? "2s" : "2p";
  return el.vsie[key] ?? 0;
}

// psi_atomic(kind, centered at `center`) evaluated at point r, in the one
// shared lab frame -- both atoms' p orbitals point along the same global
// axes, which is exactly what lets the secular equation (rather than any
// hand-picked sign) decide which combination ends up bonding. `zEff`
// applies the exact hydrogenic scaling relation psi_Z(r) = Z^1.5 *
// psi_1(Z*r), so heavier atoms' valence orbitals come out realistically
// contracted instead of all sharing hydrogen's Z=1 size.
export function atomicOrbitalAt(kind: OrbitalKind, zEff: number, center: Vec3, r: Vec3): number {
  const dx = r[0] - center[0];
  const dy = r[1] - center[1];
  const dz = r[2] - center[2];
  const dist = Math.hypot(dx, dy, dz);
  const { n, l, orientation } = kindToNL(kind);
  const scale = zEff ** 1.5;
  if (dist < 1e-9)
    return orientation === "s" ? scale * radialWavefunction(n, l, 0) * angularValue("s", 0, 0) : 0;
  const theta = Math.acos(dz / dist);
  const phi = Math.atan2(dy, dx);
  return scale * radialWavefunction(n, l, zEff * dist) * angularValue(orientation, theta, phi);
}

function diagonalize2x2(a: number, b: number, d: number) {
  const avg = (a + d) / 2;
  const diff = (a - d) / 2;
  const r = Math.sqrt(diff * diff + b * b);
  const eLower = avg - r;
  const eUpper = avg + r;
  const eigvecFor = (lambda: number): [number, number] => {
    if (Math.abs(b) < 1e-9) return Math.abs(a - lambda) <= Math.abs(d - lambda) ? [1, 0] : [0, 1];
    const x = 1;
    const y = (lambda - a) / b;
    const norm = Math.hypot(x, y) || 1;
    return [x / norm, y / norm];
  };
  return { eLower, eUpper, vLower: eigvecFor(eLower), vUpper: eigvecFor(eUpper) };
}

const K_WOLFSBERG = 0.9;

export type MOLevel = {
  id: string;
  label: string;
  energy: number; // eV, negative = bound
  bonding: "bonding" | "antibonding" | "nonbonding";
  symmetry: "sigma" | "pi";
  degeneracy: 1 | 2;
  electrons: number; // total across the degenerate pair
  // Coefficients + which atomic orbitals combine, so the 3D view can build
  // psi_MO(r) = cA * phiA(kindA, posA, r) + cB * phiB(kindB, posB, r) for
  // each member of the degeneracy (member 2, if any, uses kindA2/kindB2 --
  // the px/py partner -- with the same coefficients, since px and py are
  // related by the same symmetry that makes them degenerate).
  cA: number;
  cB: number;
  kindA: OrbitalKind;
  kindB: OrbitalKind;
  kindA2?: OrbitalKind | undefined;
  kindB2?: OrbitalKind | undefined;
  zEffA: number;
  zEffB: number;
};

export type MODiagram = {
  levels: MOLevel[]; // ascending energy
  bondOrder: number;
  totalElectrons: number;
  spMixingApplied: boolean;
  posA: Vec3;
  posB: Vec3;
};

// Monte-Carlo-free numerical overlap integral over a shared grid -- reused
// per orbital pair rather than resampled, since it only needs to run once
// per (element pair, bond length) selection.
function overlapIntegral(
  kindA: OrbitalKind,
  zEffA: number,
  posA: Vec3,
  kindB: OrbitalKind,
  zEffB: number,
  posB: Vec3,
  extent: number,
): number {
  const STEPS = 26;
  const lo = -extent;
  const hi = extent;
  const step = (hi - lo) / STEPS;
  const dV = step * step * step;
  let sum = 0;
  for (let i = 0; i <= STEPS; i++) {
    const x = lo + i * step;
    for (let j = 0; j <= STEPS; j++) {
      const y = lo + j * step;
      for (let k = 0; k <= STEPS; k++) {
        const z = lo + k * step;
        const r: Vec3 = [x, y, z];
        sum += atomicOrbitalAt(kindA, zEffA, posA, r) * atomicOrbitalAt(kindB, zEffB, posB, r);
      }
    }
  }
  return sum * dV;
}

function buildPair(
  label: string,
  symmetry: "sigma" | "pi",
  degeneracy: 1 | 2,
  kindA: OrbitalKind,
  kindA2: OrbitalKind | undefined,
  elA: Element,
  posA: Vec3,
  kindB: OrbitalKind,
  kindB2: OrbitalKind | undefined,
  elB: Element,
  posB: Vec3,
  extent: number,
): { bondingLevel: MOLevel; antibondingLevel: MOLevel } {
  const alphaA = energyOf(elA, kindA);
  const alphaB = energyOf(elB, kindB);
  const S = overlapIntegral(kindA, elA.zEff, posA, kindB, elB.zEff, posB, extent);
  const beta = K_WOLFSBERG * S * ((alphaA + alphaB) / 2);
  const { eLower, eUpper, vLower, vUpper } = diagonalize2x2(alphaA, beta, alphaB);
  const bondingLevel: MOLevel = {
    id: `${label}`,
    label: `${label}`,
    energy: eLower,
    bonding: "bonding",
    symmetry,
    degeneracy,
    electrons: 0,
    cA: vLower[0],
    cB: vLower[1],
    kindA,
    kindB,
    kindA2,
    kindB2,
    zEffA: elA.zEff,
    zEffB: elB.zEff,
  };
  const antibondingLevel: MOLevel = {
    id: `${label}*`,
    label: `${label}*`,
    energy: eUpper,
    bonding: "antibonding",
    symmetry,
    degeneracy,
    electrons: 0,
    cA: vUpper[0],
    cB: vUpper[1],
    kindA,
    kindB,
    kindA2,
    kindB2,
    zEffA: elA.zEff,
    zEffB: elB.zEff,
  };
  return { bondingLevel, antibondingLevel };
}

export function buildMODiagram(elA: Element, elB: Element, bondLength: number): MODiagram {
  const posA: Vec3 = [0, 0, -bondLength / 2];
  const posB: Vec3 = [0, 0, bondLength / 2];
  // Effective nuclear charge contracts an orbital roughly in proportion to
  // Zeff, so size the integration box off whichever atom is more diffuse
  // (the smaller Zeff) rather than a fixed Z=1 box that would undersample
  // a contracted heavy-atom orbital.
  const extent = Math.max(rMaxFor(2) / Math.min(elA.zEff, elB.zEff), bondLength) * 0.9;

  const levels: MOLevel[] = [];
  let spMixingApplied = false;

  if (elA.period === 1 && elB.period === 1) {
    const { bondingLevel, antibondingLevel } = buildPair(
      "σ1s",
      "sigma",
      1,
      "1s",
      undefined,
      elA,
      posA,
      "1s",
      undefined,
      elB,
      posB,
      extent,
    );
    levels.push(bondingLevel, antibondingLevel);
  } else if (elA.period === 2 && elB.period === 2) {
    const s = buildPair(
      "σ2s",
      "sigma",
      1,
      "2s",
      undefined,
      elA,
      posA,
      "2s",
      undefined,
      elB,
      posB,
      extent,
    );
    const p = buildPair(
      "σ2p",
      "sigma",
      1,
      "2pz",
      undefined,
      elA,
      posA,
      "2pz",
      undefined,
      elB,
      posB,
      extent,
    );
    const pi = buildPair("π2p", "pi", 2, "2px", "2py", elA, posA, "2px", "2py", elB, posB, extent);
    levels.push(
      s.bondingLevel,
      s.antibondingLevel,
      p.bondingLevel,
      p.antibondingLevel,
      pi.bondingLevel,
      pi.antibondingLevel,
    );

    // The well-established empirical effect of 2s/2p mixing (not modeled
    // explicitly here, since that needs a 4x4 treatment mixing 2s and 2pz
    // together): for Li through N, it pushes sigma(2p) bonding above
    // pi(2p) bonding. Applied as a direct reordering rather than derived,
    // and flagged as such in the UI.
    if (elA.z <= 7 && elB.z <= 7) {
      spMixingApplied = true;
      if (p.bondingLevel.energy <= pi.bondingLevel.energy) {
        const bump = pi.bondingLevel.energy - p.bondingLevel.energy + 0.05;
        p.bondingLevel.energy += bump;
      }
    }
  } else {
    // Cross-period pair (hydrogen or helium with a period-2 atom): only
    // the period-1 atom's 1s and the period-2 atom's 2pz share sigma
    // symmetry along the bond axis in this simplified treatment, so only
    // those two mix. The period-2 atom's 2s, 2px and 2py are left as
    // nonbonding lone pairs at their own atomic energies -- a standard
    // simplification for a diagram like HF's.
    const xIsA = elA.period === 2;
    const h = xIsA ? elB : elA;
    const hPos = xIsA ? posB : posA;
    const x = xIsA ? elA : elB;
    const xPos = xIsA ? posA : posB;

    const { bondingLevel, antibondingLevel } = buildPair(
      "σ",
      "sigma",
      1,
      "1s",
      undefined,
      h,
      hPos,
      "2pz",
      undefined,
      x,
      xPos,
      extent,
    );
    levels.push(bondingLevel, antibondingLevel);
    // The nonbonding orbitals live entirely on x, so they're placed in
    // whichever of the (kindA, posA) / (kindB, posB) slots actually
    // corresponds to x's real position -- getting this backwards would
    // silently evaluate the "lone pair" density at the wrong nucleus.
    const nonbondingBase = {
      bonding: "nonbonding" as const,
      electrons: 0,
      zEffA: elA.zEff,
      zEffB: elB.zEff,
    };
    levels.push({
      id: "n(2s)",
      label: "n(2s)",
      energy: energyOf(x, "2s"),
      symmetry: "sigma",
      degeneracy: 1,
      cA: xIsA ? 1 : 0,
      cB: xIsA ? 0 : 1,
      kindA: "2s",
      kindB: "2s",
      ...nonbondingBase,
    });
    levels.push({
      id: "n(2p)",
      label: "n(2p)",
      energy: energyOf(x, "2px"),
      symmetry: "pi",
      degeneracy: 2,
      cA: xIsA ? 1 : 0,
      cB: xIsA ? 0 : 1,
      kindA: "2px",
      kindB: "2px",
      kindA2: "2py",
      kindB2: "2py",
      ...nonbondingBase,
    });
  }

  levels.sort((a, b) => a.energy - b.energy);

  let remaining = elA.valenceElectrons + elB.valenceElectrons;
  const totalElectrons = remaining;
  for (const level of levels) {
    const capacity = level.degeneracy * 2;
    const fill = Math.min(capacity, remaining);
    level.electrons = fill;
    remaining -= fill;
  }

  const bondingElectrons = levels
    .filter((l) => l.bonding === "bonding")
    .reduce((sum, l) => sum + l.electrons, 0);
  const antibondingElectrons = levels
    .filter((l) => l.bonding === "antibonding")
    .reduce((sum, l) => sum + l.electrons, 0);
  const bondOrder = (bondingElectrons - antibondingElectrons) / 2;

  return { levels, bondOrder, totalElectrons, spMixingApplied, posA, posB };
}

export type MOPoint = { pos: Vec3; sign: 1 | -1 };

// Rejection-sample the actual |psi_MO|^2 = |cA*phiA + cB*phiB|^2 over a box
// enclosing both nuclei, exactly the same honest Monte-Carlo approach used
// for single-atom orbitals, generalized to two centers. For a degenerate
// pi level, the second member (the py-based partner) is sampled the same
// way and the two point sets are meant to be shown one at a time, not
// summed -- they're separate orbitals that happen to share an energy.
export function sampleMOPoints(
  level: MOLevel,
  posA: Vec3,
  posB: Vec3,
  count: number,
  second = false,
): MOPoint[] {
  const kindA = second && level.kindA2 ? level.kindA2 : level.kindA;
  const kindB = second && level.kindB2 ? level.kindB2 : level.kindB;
  const bondLength = Math.hypot(posB[0] - posA[0], posB[1] - posA[1], posB[2] - posA[2]);
  const extent = Math.max(rMaxFor(2) / Math.min(level.zEffA, level.zEffB), bondLength) * 0.8;

  const psi = (r: Vec3): number =>
    level.cA * atomicOrbitalAt(kindA, level.zEffA, posA, r) +
    level.cB * atomicOrbitalAt(kindB, level.zEffB, posB, r);

  let maxDensity = 0;
  const GRID = 24;
  const lo = -extent;
  const step = (2 * extent) / GRID;
  for (let i = 0; i <= GRID; i++) {
    for (let j = 0; j <= GRID; j++) {
      for (let k = 0; k <= GRID; k++) {
        const v = psi([lo + i * step, lo + j * step, lo + k * step]);
        if (v * v > maxDensity) maxDensity = v * v;
      }
    }
  }
  maxDensity *= 1.15;
  if (maxDensity < 1e-12) return [];

  const points: MOPoint[] = [];
  let guard = 0;
  while (points.length < count && guard < count * 500) {
    guard++;
    const x = lo + Math.random() * 2 * extent;
    const y = lo + Math.random() * 2 * extent;
    const z = lo + Math.random() * 2 * extent;
    const v = psi([x, y, z]);
    if (Math.random() * maxDensity > v * v) continue;
    points.push({ pos: [x, y, z], sign: v >= 0 ? 1 : -1 });
  }
  return points;
}

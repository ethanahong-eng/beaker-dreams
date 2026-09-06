// Real hydrogen-like atomic orbitals, in atomic units (a0 = 1, Z = 1).
// Every number here comes from actually evaluating the exact solutions of
// the hydrogen Schrodinger equation from the previous topic -- nothing is
// a stylized stand-in shape. The radial part uses the general associated-
// Laguerre-polynomial formula (verified below against the standard
// tabulated forms for 1s/2s/2p/3d) rather than hardcoding each orbital's
// formula separately, and the angular part uses the standard real
// ("chemist's") spherical harmonics -- the same pz/dxy/etc. combinations
// used everywhere outside of formal quantum mechanics.

export type Orientation =
  "s" | "pz" | "px" | "py" | "dz2" | "dxz" | "dyz" | "dx2y2" | "dxy" | "fz3";

export type OrbitalSpec = {
  name: string;
  n: number;
  l: number;
  orientations: { key: Orientation; label: string }[];
};

export const ORBITALS: OrbitalSpec[] = [
  { name: "1s", n: 1, l: 0, orientations: [{ key: "s", label: "1s" }] },
  { name: "2s", n: 2, l: 0, orientations: [{ key: "s", label: "2s" }] },
  {
    name: "2p",
    n: 2,
    l: 1,
    orientations: [
      { key: "pz", label: "2pz" },
      { key: "px", label: "2px" },
      { key: "py", label: "2py" },
    ],
  },
  { name: "3s", n: 3, l: 0, orientations: [{ key: "s", label: "3s" }] },
  {
    name: "3p",
    n: 3,
    l: 1,
    orientations: [
      { key: "pz", label: "3pz" },
      { key: "px", label: "3px" },
      { key: "py", label: "3py" },
    ],
  },
  {
    name: "3d",
    n: 3,
    l: 2,
    orientations: [
      { key: "dz2", label: "3dz²" },
      { key: "dxz", label: "3dxz" },
      { key: "dyz", label: "3dyz" },
      { key: "dx2y2", label: "3dx²−y²" },
      { key: "dxy", label: "3dxy" },
    ],
  },
  { name: "4f", n: 4, l: 3, orientations: [{ key: "fz3", label: "4fz³ (one of seven)" }] },
];

// Roughly how far each principal quantum number's probability density
// extends before it's negligible -- generous enough that the sampler
// below never visibly clips a lobe.
const R_MAX_BY_N: Record<number, number> = { 1: 10, 2: 20, 3: 34, 4: 52 };
export function rMaxFor(n: number): number {
  return R_MAX_BY_N[n] ?? 60;
}

function factorial(k: number): number {
  let r = 1;
  for (let i = 2; i <= k; i++) r *= i;
  return r;
}

function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return r;
}

// Associated Laguerre polynomial L_n^alpha(x), evaluated directly from its
// defining series rather than a recurrence relation.
function laguerre(n: number, alpha: number, x: number): number {
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    sum += ((-1) ** i * binom(n + alpha, n - i) * x ** i) / factorial(i);
  }
  return sum;
}

// Normalized hydrogen-like radial wavefunction R_nl(r). Verified against
// the standard tabulated closed forms: n=1,l=0 reduces exactly to 2e^-r;
// n=2,l=0 to (1/2sqrt2)(2-r)e^(-r/2); n=2,l=1 to (1/2sqrt6) r e^(-r/2);
// n=3,l=2 to (4/81sqrt30) r^2 e^(-r/3).
export function radialWavefunction(n: number, l: number, r: number): number {
  const nr = n - l - 1;
  const rho = (2 * r) / n;
  const norm = Math.sqrt(((2 / n) ** 3 * factorial(nr)) / (2 * n * factorial(n + l)));
  return norm * Math.exp(-rho / 2) * rho ** l * laguerre(nr, 2 * l + 1, rho);
}

// Real spherical harmonics (already normalized so integral |Y|^2 dOmega = 1),
// in the same combinations every general-chemistry textbook draws.
export function angularValue(orientation: Orientation, theta: number, phi: number): number {
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  switch (orientation) {
    case "s":
      return 1 / (2 * Math.sqrt(Math.PI));
    case "pz":
      return Math.sqrt(3 / (4 * Math.PI)) * ct;
    case "px":
      return Math.sqrt(3 / (4 * Math.PI)) * st * Math.cos(phi);
    case "py":
      return Math.sqrt(3 / (4 * Math.PI)) * st * Math.sin(phi);
    case "dz2":
      return Math.sqrt(5 / (16 * Math.PI)) * (3 * ct * ct - 1);
    case "dxz":
      return Math.sqrt(15 / (4 * Math.PI)) * st * ct * Math.cos(phi);
    case "dyz":
      return Math.sqrt(15 / (4 * Math.PI)) * st * ct * Math.sin(phi);
    case "dx2y2":
      return Math.sqrt(15 / (16 * Math.PI)) * st * st * Math.cos(2 * phi);
    case "dxy":
      return Math.sqrt(15 / (16 * Math.PI)) * st * st * Math.sin(2 * phi);
    case "fz3":
      return Math.sqrt(7 / (16 * Math.PI)) * (5 * ct ** 3 - 3 * ct);
  }
}

// The (theta, phi) direction along which |Y| is largest -- the lobe axis a
// real orbital-visualization tool draws its "line through the nucleus"
// wavefunction plot along, chosen the same way here.
export function probeAngles(orientation: Orientation): { theta: number; phi: number } {
  switch (orientation) {
    case "px":
      return { theta: Math.PI / 2, phi: 0 };
    case "py":
      return { theta: Math.PI / 2, phi: Math.PI / 2 };
    case "dxz":
      return { theta: Math.PI / 4, phi: 0 };
    case "dyz":
      return { theta: Math.PI / 4, phi: Math.PI / 2 };
    case "dx2y2":
      return { theta: Math.PI / 2, phi: 0 };
    case "dxy":
      return { theta: Math.PI / 2, phi: Math.PI / 4 };
    default: // s, pz, dz2, fz3
      return { theta: 0, phi: 0 };
  }
}

// psi evaluated along the signed line through the nucleus in the probe
// direction: for t<0 this is the antipodal point, and real spherical
// harmonics have parity (-1)^l under that inversion -- a general fact, not
// something special-cased per orbital -- which is exactly what produces a
// p orbital's positive lobe on one side and negative lobe on the other.
export function wavefunctionAlongProbe(
  n: number,
  l: number,
  orientation: Orientation,
  t: number,
): number {
  const r = Math.abs(t);
  const { theta, phi } = probeAngles(orientation);
  const R = radialWavefunction(n, l, r);
  const Y = angularValue(orientation, theta, phi);
  const parity = t < 0 && l % 2 === 1 ? -1 : 1;
  return parity * R * Y;
}

// Radial distribution function r^2*R(r)^2 -- the probability of finding
// the electron in a thin spherical shell at radius r, not the wavefunction
// itself (see the atomic-orbitals lesson for why the r^2 matters). This is
// the general form for any l once Y is normalized so integral |Y|^2 dOmega
// = 1 (true here for every orbital above): integrating |psi|^2 over all
// angles at fixed r leaves exactly r^2 R(r)^2, with no extra 4*pi factor.
// The commonly quoted "4*pi*r^2*psi^2" is the same physical quantity under
// a different, s-orbital-specific convention (Y taken as the unnormalized
// constant 1 instead of 1/sqrt(4*pi)) -- both describe the identical
// wavefunction, just split between R and Y differently.
export function radialDistribution(n: number, l: number, r: number): number {
  const R = radialWavefunction(n, l, r);
  return r * r * R * R;
}

export type OrbitalPoint = { pos: readonly [number, number, number]; sign: 1 | -1 };

// Draws real samples from the electron's actual 3D probability density
// |psi|^2 -- an honest Monte Carlo "electron cloud," not a fixed boundary
// shape. The radial coordinate is drawn by inverting a numerically-built
// CDF of the radial distribution function (exact, no rejection needed);
// the angular coordinate is drawn by ordinary rejection sampling against
// |Y(theta,phi)|^2 using a uniform point on the sphere as the proposal,
// which converges quickly since these harmonics have no sharp peaks.
export function sampleOrbitalPoints(
  n: number,
  l: number,
  orientation: Orientation,
  count: number,
): OrbitalPoint[] {
  const rMax = rMaxFor(n);
  const STEPS = 600;
  const dr = rMax / STEPS;
  const cdf = new Float64Array(STEPS + 1);
  for (let i = 1; i <= STEPS; i++) {
    cdf[i] = cdf[i - 1]! + radialDistribution(n, l, i * dr) * dr;
  }
  const total = cdf[STEPS]! || 1;
  for (let i = 0; i <= STEPS; i++) cdf[i] = cdf[i]! / total;

  const sampleRadius = (): number => {
    const u = Math.random();
    let lo = 0;
    let hi = STEPS;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid]! < u) lo = mid + 1;
      else hi = mid;
    }
    return lo * dr;
  };

  let maxY2 = 0;
  const GRID = 40;
  for (let i = 0; i <= GRID; i++) {
    const theta = (Math.PI * i) / GRID;
    for (let j = 0; j <= GRID; j++) {
      const phi = (2 * Math.PI * j) / GRID;
      const y = angularValue(orientation, theta, phi);
      if (y * y > maxY2) maxY2 = y * y;
    }
  }
  maxY2 *= 1.05; // safety margin against the coarse grid missing the true peak

  const points: OrbitalPoint[] = [];
  let guard = 0;
  while (points.length < count && guard < count * 400) {
    guard++;
    const theta = Math.acos(1 - 2 * Math.random());
    const phi = 2 * Math.PI * Math.random();
    const y = angularValue(orientation, theta, phi);
    if (Math.random() * maxY2 > y * y) continue;
    const r = sampleRadius();
    const sinT = Math.sin(theta);
    const x = r * sinT * Math.cos(phi);
    const yy = r * sinT * Math.sin(phi);
    const z = r * Math.cos(theta);
    const sign: 1 | -1 = radialWavefunction(n, l, r) * y >= 0 ? 1 : -1;
    points.push({ pos: [x, yy, z], sign });
  }
  return points;
}

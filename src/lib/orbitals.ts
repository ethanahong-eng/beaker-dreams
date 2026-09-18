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
  | "s"
  | "pz"
  | "px"
  | "py"
  | "dz2"
  | "dxz"
  | "dyz"
  | "dx2y2"
  | "dxy"
  | "fz3"
  | "fxz2"
  | "fyz2"
  | "fz_x2y2"
  | "fxyz"
  | "fx_x2_3y2"
  | "fy_3x2_y2";

export type OrbitalSpec = {
  name: string;
  n: number;
  l: number;
  orientations: { key: Orientation; label: string }[];
};

const P_ORIENTATIONS: { key: Orientation; label: string }[] = [
  { key: "pz", label: "pz" },
  { key: "px", label: "px" },
  { key: "py", label: "py" },
];

const D_ORIENTATIONS: { key: Orientation; label: string }[] = [
  { key: "dz2", label: "dz²" },
  { key: "dxz", label: "dxz" },
  { key: "dyz", label: "dyz" },
  { key: "dx2y2", label: "dx²−y²" },
  { key: "dxy", label: "dxy" },
];

// The seven real ("cubic set") f orbitals -- the linear combinations of the
// m = -3..+3 complex l=3 harmonics that are individually real-valued, which
// is what makes them drawable and what inorganic chemistry actually uses.
const F_ORIENTATIONS: { key: Orientation; label: string }[] = [
  { key: "fz3", label: "fz³" },
  { key: "fxz2", label: "fxz²" },
  { key: "fyz2", label: "fyz²" },
  { key: "fz_x2y2", label: "fz(x²−y²)" },
  { key: "fxyz", label: "fxyz" },
  { key: "fx_x2_3y2", label: "fx(x²−3y²)" },
  { key: "fy_3x2_y2", label: "fy(3x²−y²)" },
];

function shell(n: number, set: { key: Orientation; label: string }[]) {
  return set.map((o) => ({ key: o.key, label: `${n}${o.label}` }));
}

export const ORBITALS: OrbitalSpec[] = [
  { name: "1s", n: 1, l: 0, orientations: [{ key: "s", label: "1s" }] },
  { name: "2s", n: 2, l: 0, orientations: [{ key: "s", label: "2s" }] },
  { name: "2p", n: 2, l: 1, orientations: shell(2, P_ORIENTATIONS) },
  { name: "3s", n: 3, l: 0, orientations: [{ key: "s", label: "3s" }] },
  { name: "3p", n: 3, l: 1, orientations: shell(3, P_ORIENTATIONS) },
  { name: "3d", n: 3, l: 2, orientations: shell(3, D_ORIENTATIONS) },
  { name: "4s", n: 4, l: 0, orientations: [{ key: "s", label: "4s" }] },
  { name: "4p", n: 4, l: 1, orientations: shell(4, P_ORIENTATIONS) },
  { name: "4d", n: 4, l: 2, orientations: shell(4, D_ORIENTATIONS) },
  { name: "4f", n: 4, l: 3, orientations: shell(4, F_ORIENTATIONS) },
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
// in the same combinations every general-chemistry textbook draws. The f set
// is the standard cubic set; each constant here is the exact normalization
// of that particular combination, not a shared l=3 prefactor.
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
    case "fxz2":
      return Math.sqrt(21 / (32 * Math.PI)) * st * (5 * ct * ct - 1) * Math.cos(phi);
    case "fyz2":
      return Math.sqrt(21 / (32 * Math.PI)) * st * (5 * ct * ct - 1) * Math.sin(phi);
    case "fz_x2y2":
      return Math.sqrt(105 / (16 * Math.PI)) * st * st * ct * Math.cos(2 * phi);
    case "fxyz":
      return Math.sqrt(105 / (16 * Math.PI)) * st * st * ct * Math.sin(2 * phi);
    case "fx_x2_3y2":
      return Math.sqrt(35 / (32 * Math.PI)) * st ** 3 * Math.cos(3 * phi);
    case "fy_3x2_y2":
      return Math.sqrt(35 / (32 * Math.PI)) * st ** 3 * Math.sin(3 * phi);
  }
}

// psi(r, theta, phi) = R_nl(r) * Y(theta, phi), evaluated at an arbitrary
// Cartesian point. Used by the cross-section plot, which needs signed psi
// on a whole plane rather than along one line.
export function psiAt(
  n: number,
  l: number,
  orientation: Orientation,
  x: number,
  y: number,
  z: number,
): number {
  const r = Math.hypot(x, y, z);
  if (r === 0) return radialWavefunction(n, l, 0) * angularValue(orientation, 0, 0);
  const theta = Math.acos(Math.max(-1, Math.min(1, z / r)));
  const phi = Math.atan2(y, x);
  return radialWavefunction(n, l, r) * angularValue(orientation, theta, phi);
}

// --- Angular extrema, found numerically -------------------------------------
//
// Where |Y| peaks, and how large it gets there, are both needed in several
// places (the lobe-axis probe line, the rejection sampler's envelope, the
// polar plot's scale). Rather than maintain a hand-written table that has to
// grow a correct entry for each of the sixteen orientations -- a standing
// invitation to a typo that is invisible in the rendering -- both come from
// one fine scan of the sphere, computed once per orientation and cached.

const THETA_STEPS = 360;
const PHI_STEPS = 720;

type AngularPeak = { theta: number; phi: number; absY: number };

const peakCache = new Map<Orientation, AngularPeak>();

function angularPeak(orientation: Orientation): AngularPeak {
  const cached = peakCache.get(orientation);
  if (cached) return cached;
  let best: AngularPeak = { theta: 0, phi: 0, absY: -1 };
  for (let i = 0; i <= THETA_STEPS; i++) {
    const theta = (Math.PI * i) / THETA_STEPS;
    for (let j = 0; j < PHI_STEPS; j++) {
      const phi = (2 * Math.PI * j) / PHI_STEPS;
      const absY = Math.abs(angularValue(orientation, theta, phi));
      if (absY > best.absY) best = { theta, phi, absY };
    }
  }
  peakCache.set(orientation, best);
  return best;
}

// The (theta, phi) direction along which |Y| is largest -- the lobe axis a
// real orbital-visualization tool draws its "line through the nucleus"
// wavefunction plot along, chosen the same way here. The step counts above
// are chosen so the grid lands exactly on the symmetry directions these
// harmonics actually peak along (multiples of pi/4 in theta, pi/12 in phi),
// so e.g. dxy returns exactly (pi/2, pi/4) and not a neighbouring sample.
export function probeAngles(orientation: Orientation): { theta: number; phi: number } {
  const peak = angularPeak(orientation);
  return { theta: peak.theta, phi: peak.phi };
}

// max |Y| over the whole sphere.
export function maxAbsAngular(orientation: Orientation): number {
  return angularPeak(orientation).absY;
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

// The radii at which R_nl(r) actually crosses zero -- the spherical nodes.
// Found by scanning for sign changes and bisecting, so the plots mark the
// nodes where the function really has them rather than at textbook values
// typed in by hand. There are always n - l - 1 of them, which is a useful
// self-check on the radial formula above.
const nodeCache = new Map<string, number[]>();

export function radialNodeRadii(n: number, l: number): number[] {
  const key = `${n},${l}`;
  const cached = nodeCache.get(key);
  if (cached) return cached;
  const rMax = rMaxFor(n);
  const STEPS = 4000;
  const roots: number[] = [];
  let prevR = 1e-6;
  let prev = radialWavefunction(n, l, prevR);
  for (let i = 1; i <= STEPS; i++) {
    const r = 1e-6 + ((rMax - 1e-6) * i) / STEPS;
    const v = radialWavefunction(n, l, r);
    if (prev !== 0 && v !== 0 && Math.sign(v) !== Math.sign(prev)) {
      let lo = prevR;
      let hi = r;
      let loV = prev;
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2;
        const midV = radialWavefunction(n, l, mid);
        if (Math.sign(midV) === Math.sign(loV)) {
          lo = mid;
          loV = midV;
        } else {
          hi = mid;
        }
      }
      roots.push((lo + hi) / 2);
    }
    prevR = r;
    prev = v;
  }
  nodeCache.set(key, roots);
  return roots;
}

// --- Cross-section plane ----------------------------------------------------
//
// A 2D slice only teaches anything if it is cut where the orbital actually
// has structure: the xy plane through a pz orbital is identically zero, and
// every coordinate plane through fxyz is. Rather than a hand-kept table of
// "which plane for which orbital", the plane is derived -- for each
// candidate, count how many times Y changes sign going once around the
// circle in that plane (that count IS the number of angular nodes the slice
// will show), and keep the richest one, breaking ties toward the plane where
// |Y| gets largest and then toward the plainest coordinate plane.

export type SectionPlane = {
  key: string;
  label: string;
  uLabel: string;
  vLabel: string;
  u: readonly [number, number, number];
  v: readonly [number, number, number];
};

const INV_SQRT2 = Math.SQRT1_2;

const CANDIDATE_PLANES: SectionPlane[] = [
  { key: "xz", label: "xz plane", uLabel: "x", vLabel: "z", u: [1, 0, 0], v: [0, 0, 1] },
  { key: "yz", label: "yz plane", uLabel: "y", vLabel: "z", u: [0, 1, 0], v: [0, 0, 1] },
  { key: "xy", label: "xy plane", uLabel: "x", vLabel: "y", u: [1, 0, 0], v: [0, 1, 0] },
  {
    key: "diag-z",
    label: "x=y diagonal, z plane",
    uLabel: "(x+y)/√2",
    vLabel: "z",
    u: [INV_SQRT2, INV_SQRT2, 0],
    v: [0, 0, 1],
  },
];

// Y evaluated at the in-plane direction cos(alpha)*u + sin(alpha)*v, which
// is a unit vector because u and v are orthonormal.
export function angularInPlane(
  orientation: Orientation,
  plane: SectionPlane,
  alpha: number,
): number {
  const ca = Math.cos(alpha);
  const sa = Math.sin(alpha);
  const x = ca * plane.u[0] + sa * plane.v[0];
  const y = ca * plane.u[1] + sa * plane.v[1];
  const z = ca * plane.u[2] + sa * plane.v[2];
  const theta = Math.acos(Math.max(-1, Math.min(1, z)));
  const phi = Math.atan2(y, x);
  return angularValue(orientation, theta, phi);
}

const planeCache = new Map<Orientation, SectionPlane>();

export function sectionPlaneFor(orientation: Orientation): SectionPlane {
  const cached = planeCache.get(orientation);
  if (cached) return cached;
  const tol = maxAbsAngular(orientation) * 1e-6;
  const SAMPLES = 1440;
  let best = CANDIDATE_PLANES[0]!;
  let bestChanges = -1;
  let bestPeak = -1;
  for (const plane of CANDIDATE_PLANES) {
    let changes = 0;
    let peak = 0;
    let lastSign = 0;
    let firstSign = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const v = angularInPlane(orientation, plane, (2 * Math.PI * i) / SAMPLES);
      if (Math.abs(v) > peak) peak = Math.abs(v);
      if (Math.abs(v) <= tol) continue;
      const sign = v > 0 ? 1 : -1;
      if (lastSign === 0) firstSign = sign;
      else if (sign !== lastSign) changes++;
      lastSign = sign;
    }
    if (lastSign !== 0 && lastSign !== firstSign) changes++; // wrap around
    if (changes > bestChanges || (changes === bestChanges && peak > bestPeak * (1 + 1e-9))) {
      best = plane;
      bestChanges = changes;
      bestPeak = peak;
    }
  }
  planeCache.set(orientation, best);
  return best;
}

// --- The explicit wavefunction ----------------------------------------------
//
// psi_nlm = R_nl(r) * Y(theta, phi), so the formula is composed from ten
// radial parts and sixteen angular ones rather than written out thirty
// times. Every expression is in atomic units (a0 = 1, Z = 1) and is the
// same function `radialWavefunction` / `angularValue` above evaluate --
// checked numerically, not transcribed from memory.

const RADIAL_TEX: Record<string, string> = {
  "1,0": String.raw`2\,e^{-r}`,
  "2,0": String.raw`\tfrac{1}{2\sqrt{2}}\,(2 - r)\,e^{-r/2}`,
  "2,1": String.raw`\tfrac{1}{2\sqrt{6}}\,r\,e^{-r/2}`,
  "3,0": String.raw`\tfrac{2}{81\sqrt{3}}\,(27 - 18r + 2r^{2})\,e^{-r/3}`,
  "3,1": String.raw`\tfrac{4}{81\sqrt{6}}\,(6r - r^{2})\,e^{-r/3}`,
  "3,2": String.raw`\tfrac{4}{81\sqrt{30}}\,r^{2}e^{-r/3}`,
  "4,0": String.raw`\tfrac{1}{768}\,(192 - 144r + 24r^{2} - r^{3})\,e^{-r/4}`,
  "4,1": String.raw`\tfrac{1}{256\sqrt{15}}\,(80r - 20r^{2} + r^{3})\,e^{-r/4}`,
  "4,2": String.raw`\tfrac{1}{768\sqrt{5}}\,(12r^{2} - r^{3})\,e^{-r/4}`,
  "4,3": String.raw`\tfrac{1}{768\sqrt{35}}\,r^{3}e^{-r/4}`,
};

const ANGULAR_TEX: Record<Orientation, string> = {
  s: String.raw`\tfrac{1}{2\sqrt{\pi}}`,
  pz: String.raw`\sqrt{\tfrac{3}{4\pi}}\,\cos\theta`,
  px: String.raw`\sqrt{\tfrac{3}{4\pi}}\,\sin\theta\cos\varphi`,
  py: String.raw`\sqrt{\tfrac{3}{4\pi}}\,\sin\theta\sin\varphi`,
  dz2: String.raw`\sqrt{\tfrac{5}{16\pi}}\,(3\cos^{2}\theta - 1)`,
  dxz: String.raw`\sqrt{\tfrac{15}{4\pi}}\,\sin\theta\cos\theta\cos\varphi`,
  dyz: String.raw`\sqrt{\tfrac{15}{4\pi}}\,\sin\theta\cos\theta\sin\varphi`,
  dx2y2: String.raw`\sqrt{\tfrac{15}{16\pi}}\,\sin^{2}\theta\cos 2\varphi`,
  dxy: String.raw`\sqrt{\tfrac{15}{16\pi}}\,\sin^{2}\theta\sin 2\varphi`,
  fz3: String.raw`\sqrt{\tfrac{7}{16\pi}}\,(5\cos^{3}\theta - 3\cos\theta)`,
  fxz2: String.raw`\sqrt{\tfrac{21}{32\pi}}\,\sin\theta\,(5\cos^{2}\theta - 1)\cos\varphi`,
  fyz2: String.raw`\sqrt{\tfrac{21}{32\pi}}\,\sin\theta\,(5\cos^{2}\theta - 1)\sin\varphi`,
  fz_x2y2: String.raw`\sqrt{\tfrac{105}{16\pi}}\,\sin^{2}\theta\cos\theta\cos 2\varphi`,
  fxyz: String.raw`\sqrt{\tfrac{105}{16\pi}}\,\sin^{2}\theta\cos\theta\sin 2\varphi`,
  fx_x2_3y2: String.raw`\sqrt{\tfrac{35}{32\pi}}\,\sin^{3}\theta\cos 3\varphi`,
  fy_3x2_y2: String.raw`\sqrt{\tfrac{35}{32\pi}}\,\sin^{3}\theta\sin 3\varphi`,
};

const SUBSCRIPT_TEX: Record<Orientation, string> = {
  s: "",
  pz: "z",
  px: "x",
  py: "y",
  dz2: "z^{2}",
  dxz: "xz",
  dyz: "yz",
  dx2y2: "x^{2}-y^{2}",
  dxy: "xy",
  fz3: "z^{3}",
  fxz2: "xz^{2}",
  fyz2: "yz^{2}",
  fz_x2y2: "z(x^{2}-y^{2})",
  fxyz: "xyz",
  fx_x2_3y2: "x(x^{2}-3y^{2})",
  fy_3x2_y2: "y(3x^{2}-y^{2})",
};

const SUBSHELL_LETTERS = ["s", "p", "d", "f"];

// The full psi as a KaTeX string, or null if we have no exact radial form
// on file for that (n, l) -- printing an approximation would be worse than
// printing nothing.
export function wavefunctionTex(n: number, l: number, orientation: Orientation): string | null {
  const radial = RADIAL_TEX[`${n},${l}`];
  const letter = SUBSHELL_LETTERS[l];
  if (!radial || !letter) return null;
  const sub = SUBSCRIPT_TEX[orientation];
  const name = sub ? `${n}${letter}_{${sub}}` : `${n}${letter}`;
  return String.raw`\psi_{${name}}(r,\theta,\varphi) = ${radial}\;\cdot\;${ANGULAR_TEX[orientation]}`;
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

  // The rejection envelope is the true peak of |Y|^2, taken from the same
  // fine cached scan the probe direction uses. An envelope that undershoots
  // the real peak silently oversamples the lobe tips, and a coarse scan
  // does undershoot for the l=3 harmonics -- cos(3*phi) peaks every 120
  // degrees, which a grid of 40 steps in phi misses entirely. The 5% margin
  // is belt-and-braces on top of that.
  const maxY2 = maxAbsAngular(orientation) ** 2 * 1.05;

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

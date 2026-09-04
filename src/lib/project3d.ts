// Shared yaw/pitch rotation for the site's drag-to-rotate 3D views
// (VSEPR builder, reaction mechanism). Perspective and display scale are
// left to each caller since their coordinate ranges differ.
export type Vec3 = readonly [number, number, number];

export function rotate3d(pos: Vec3, yaw: number, pitch: number): Vec3 {
  const [x0, y0, z0] = pos;
  const x1 = x0 * Math.cos(yaw) + z0 * Math.sin(yaw);
  const z1 = -x0 * Math.sin(yaw) + z0 * Math.cos(yaw);
  const y1 = y0 * Math.cos(pitch) - z1 * Math.sin(pitch);
  const z2 = y0 * Math.sin(pitch) + z1 * Math.cos(pitch);
  return [x1, y1, z2];
}

// General-purpose vector algebra, used by the multi-center molecule
// embedder to rotate one atom's locally-relaxed VSEPR directions into the
// orientation required by the shared bond back to its parent atom.
export function vAdd(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
export function vSub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
export function vScale(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s];
}
export function vDot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
export function vCross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
export function vLength(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}
export function vNormalize(a: Vec3): Vec3 {
  const len = vLength(a) || 1;
  return [a[0] / len, a[1] / len, a[2] / len];
}

// Rodrigues' rotation formula: rotate v by `angle` radians around the unit
// axis `axis`.
export function rotateAroundAxis(v: Vec3, axis: Vec3, angle: number): Vec3 {
  const k = vNormalize(axis);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const kxv = vCross(k, v);
  const kdotv = vDot(k, v);
  return [
    v[0] * cosA + kxv[0] * sinA + k[0] * kdotv * (1 - cosA),
    v[1] * cosA + kxv[1] * sinA + k[1] * kdotv * (1 - cosA),
    v[2] * cosA + kxv[2] * sinA + k[2] * kdotv * (1 - cosA),
  ];
}

// Any vector perpendicular to v -- used whenever a rotation axis or a
// second basis vector is genuinely underdetermined (e.g. two antiparallel
// vectors have no unique 180-degree axis; a single direction has no unique
// "the other one" to pair with it), so some consistent choice has to be
// made rather than leaving the math undefined.
function arbitraryPerpendicular(v: Vec3): Vec3 {
  let axis = vCross(v, [1, 0, 0]);
  if (vLength(axis) < 1e-6) axis = vCross(v, [0, 1, 0]);
  return vNormalize(axis);
}

// Returns a function that applies whatever single rotation carries unit
// vector `from` onto unit vector `to`, so that same rotation can then be
// applied to a whole set of other vectors (e.g. every other bond/lone-pair
// direction on the same atom) to carry its entire local frame along.
export function alignRotation(from: Vec3, to: Vec3): (v: Vec3) => Vec3 {
  const f = vNormalize(from);
  const t = vNormalize(to);
  const d = Math.max(-1, Math.min(1, vDot(f, t)));
  if (d > 0.9999) return (v) => v;
  if (d < -0.9999) {
    // Antiparallel: any axis perpendicular to f works for a 180 degree spin.
    const fixedAxis = arbitraryPerpendicular(f);
    return (v) => rotateAroundAxis(v, fixedAxis, Math.PI);
  }
  const axis = vNormalize(vCross(f, t));
  const angle = Math.acos(d);
  return (v) => rotateAroundAxis(v, axis, angle);
}

// Returns the best-fit rotation carrying local direction pair (u1, u2) onto
// global direction pair (v1, v2) -- needed for a ring atom, which has two
// bond directions pinned by the ring's geometry instead of the usual one
// pinned by a parent bond. Built from two orthonormal bases (Gram-Schmidt
// on each pair) rather than a general least-squares fit: u1 always lands
// exactly on v1, and u2 lands in the v1/v2 plane at the same angle from v1
// that it had from u1 -- exact only when angle(u1,u2) already equals
// angle(v1,v2), a best fit otherwise (the local VSEPR angle at a ring atom
// and the ring's own polygon angle rarely match exactly, so this is
// expected, not an error).
export function rotationFromTwoVectorPairs(
  u1: Vec3,
  u2: Vec3,
  v1: Vec3,
  v2: Vec3,
): (v: Vec3) => Vec3 {
  const e1 = vNormalize(u1);
  let e2 = vSub(u2, vScale(e1, vDot(u2, e1)));
  e2 = vLength(e2) < 1e-6 ? arbitraryPerpendicular(e1) : vNormalize(e2);
  const e3 = vNormalize(vCross(e1, e2));

  const f1 = vNormalize(v1);
  let f2 = vSub(v2, vScale(f1, vDot(v2, f1)));
  f2 = vLength(f2) < 1e-6 ? arbitraryPerpendicular(f1) : vNormalize(f2);
  const f3 = vNormalize(vCross(f1, f2));

  return (v: Vec3) => {
    const c1 = vDot(v, e1);
    const c2 = vDot(v, e2);
    const c3 = vDot(v, e3);
    return vAdd(vAdd(vScale(f1, c1), vScale(f2, c2)), vScale(f3, c3));
  };
}

// Shared spec for the small XYZ orientation gizmo drawn in a corner of each
// drag-to-rotate 3D view -- one fixed reference so "which way am I looking
// at this from" stays answerable while dragging. Colors follow the
// standard X=red/Y=green/Z=blue convention used by CAD and 3D software, so
// it reads as a coordinate system rather than an arbitrary decoration.
export type AxisSpec = { key: "x" | "y" | "z"; vec: Vec3; color: string; label: string };
export const AXES: AxisSpec[] = [
  { key: "x", vec: [1, 0, 0], color: "#ef4444", label: "X" },
  { key: "y", vec: [0, 1, 0], color: "#22c55e", label: "Y" },
  { key: "z", vec: [0, 0, 1], color: "#3b82f6", label: "Z" },
];

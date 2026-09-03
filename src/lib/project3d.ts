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

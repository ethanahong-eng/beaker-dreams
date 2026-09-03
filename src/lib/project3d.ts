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

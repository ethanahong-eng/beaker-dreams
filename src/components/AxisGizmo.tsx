import { rotate3d, AXES } from "@/lib/project3d";

// A small XYZ orientation indicator for the site's drag-to-rotate SVG
// scenes (VSEPR builder, reaction mechanism) -- shared since both need the
// exact same widget, just at a different corner/size for their own
// viewBox. Renders as a <g>, meant to be placed directly inside an <svg>.
export function AxisGizmo({
  yaw,
  pitch,
  cx,
  cy,
  radius,
}: {
  yaw: number;
  pitch: number;
  cx: number;
  cy: number;
  radius: number;
}) {
  const points = AXES.map((a) => {
    const [x1, y1, z2] = rotate3d(a.vec, yaw, pitch);
    return { ...a, x: cx + x1 * radius, y: cy + y1 * radius, z: z2 };
  }).sort((a, b) => a.z - b.z);

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={radius + 8}
        fill="var(--card)"
        fillOpacity={0.75}
        stroke="var(--border)"
        strokeWidth={1}
      />
      {points.map((p) => (
        <g key={p.key}>
          <line
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke={p.color}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <circle cx={p.x} cy={p.y} r={3} fill={p.color} />
          <text
            x={cx + (p.x - cx) * 1.32}
            y={cy + (p.y - cy) * 1.32}
            fontSize={9}
            fontWeight={700}
            fill={p.color}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {p.label}
          </text>
        </g>
      ))}
    </g>
  );
}

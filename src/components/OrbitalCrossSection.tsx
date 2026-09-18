import { useEffect, useRef } from "react";
import { psiAt, type Orientation, type SectionPlane } from "@/lib/orbitals";

// Pixels per side of the field. A per-pixel scalar field is the one thing
// SVG is genuinely bad at -- 130k <rect> elements would be a DOM disaster --
// so this one panel is a canvas while the rest of the sim stays SVG.
const RES = 360;

// psi spans orders of magnitude between the core and the outer lobes, so a
// linear ramp renders every orbital past 2s as a single bright dot in an
// empty field. Brightness follows |psi|^GAMMA instead, which keeps the
// faint outer structure visible; the sign, and therefore the phase, is
// untouched by it.
const GAMMA = 0.4;

type RGB = readonly [number, number, number];

// Resolves any CSS color the browser understands -- including the oklch()
// values this theme uses -- to concrete RGB, by letting the canvas itself do
// the conversion. Reading the custom property gives us the theme's current
// (light or dark) value, so the heat map re-themes with everything else.
function resolveColor(ctx: CanvasRenderingContext2D, css: string, fallback: RGB): RGB {
  if (!css) return fallback;
  const sentinel = "#ff00ff";
  try {
    ctx.fillStyle = sentinel;
    ctx.fillStyle = css;
    if (ctx.fillStyle === sentinel) return fallback;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0] ?? fallback[0], d[1] ?? fallback[1], d[2] ?? fallback[2]];
  } catch {
    return fallback;
  }
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function OrbitalCrossSection({
  n,
  l,
  orientation,
  plane,
  extent,
}: {
  n: number;
  l: number;
  orientation: Orientation;
  plane: SectionPlane;
  extent: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // All canvas work happens here, never during render: the server has no
  // canvas, and a component that painted during render would produce markup
  // the client could not reproduce. Same reason the 3D cloud samples in an
  // effect.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    canvas.width = RES;
    canvas.height = RES;

    const styles = getComputedStyle(canvas);
    const positive = resolveColor(ctx, styles.getPropertyValue("--accent").trim(), [176, 86, 58]);
    const negative = resolveColor(ctx, "#3b82f6", [59, 130, 246]);
    const zero = resolveColor(ctx, styles.getPropertyValue("--card").trim(), [253, 252, 248]);
    ctx.clearRect(0, 0, RES, RES);

    const field = new Float64Array(RES * RES);
    let peak = 0;
    for (let j = 0; j < RES; j++) {
      // +v points up the screen, so the vertical axis reads the usual way.
      const b = extent - ((j + 0.5) / RES) * 2 * extent;
      for (let i = 0; i < RES; i++) {
        const a = ((i + 0.5) / RES) * 2 * extent - extent;
        const x = a * plane.u[0] + b * plane.v[0];
        const y = a * plane.u[1] + b * plane.v[1];
        const z = a * plane.u[2] + b * plane.v[2];
        const v = psiAt(n, l, orientation, x, y, z);
        field[j * RES + i] = v;
        const av = Math.abs(v);
        if (av > peak) peak = av;
      }
    }
    const scale = peak > 0 ? 1 / peak : 0;

    const img = ctx.createImageData(RES, RES);
    const data = img.data;
    for (let k = 0; k < RES * RES; k++) {
      const v = (field[k] ?? 0) * scale;
      const m = Math.min(1, Math.abs(v) ** GAMMA);
      const rgb = mix(zero, v >= 0 ? positive : negative, m);
      const o = k * 4;
      data[o] = rgb[0];
      data[o + 1] = rgb[1];
      data[o + 2] = rgb[2];
      data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [n, l, orientation, plane, extent]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px]">
      <canvas ref={canvasRef} className="h-full w-full rounded-lg border border-border" />
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
        <line
          x1={0}
          y1={50}
          x2={100}
          y2={50}
          stroke="var(--muted-foreground)"
          strokeWidth={0.3}
          strokeOpacity={0.45}
          strokeDasharray="2 2"
        />
        <line
          x1={50}
          y1={0}
          x2={50}
          y2={100}
          stroke="var(--muted-foreground)"
          strokeWidth={0.3}
          strokeOpacity={0.45}
          strokeDasharray="2 2"
        />
        <circle cx={50} cy={50} r={0.9} fill="var(--foreground)" />
        <text
          x={96}
          y={47}
          fontSize={4}
          textAnchor="end"
          fill="var(--muted-foreground)"
          fontFamily="ui-monospace, monospace"
        >
          {plane.uLabel}
        </text>
        <text
          x={52}
          y={7}
          fontSize={4}
          fill="var(--muted-foreground)"
          fontFamily="ui-monospace, monospace"
        >
          {plane.vLabel}
        </text>
      </svg>
      <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">
        ±{extent.toFixed(0)} a₀ across · {plane.label}
      </p>
    </div>
  );
}

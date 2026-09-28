import type { ReactNode } from "react";

/**
 * Shared chrome for every explanatory diagram on the site.
 *
 * Figures are static SVG: deterministic, dependency-free and safe to render on
 * the server. Anything that needs state, animation or pointer input is a
 * simulation instead and lives in its own component -- the split is that a
 * figure illustrates a paragraph, a simulation is the thing the page is about.
 *
 * Colour comes from the --fig-* tokens in styles.css, never from raw hex, so
 * the whole set restyles from one place and the validated palette is not
 * silently bypassed one diagram at a time.
 */

/**
 * A figure is just a render function. Its caption and screen-reader
 * description are props of the <Figure> it returns, so they live next to the
 * drawing they describe rather than being duplicated in the registry.
 */
export type FigureDef = () => ReactNode;

export function Figure({
  alt,
  caption,
  viewBox,
  children,
  maxWidth,
}: {
  alt: string;
  caption: string;
  viewBox: string;
  children: ReactNode;
  /** Caps the drawing width so a small diagram is not stretched absurdly wide. */
  maxWidth?: number;
}) {
  return (
    <figure className="my-7">
      <div className="rounded-xl border border-border bg-card px-4 py-5">
        <svg
          viewBox={viewBox}
          role="img"
          aria-label={alt}
          className="mx-auto h-auto w-full"
          style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
        >
          {children}
        </svg>
      </div>
      <figcaption className="mt-2.5 text-center font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------------- */
/* Shared primitives. Every diagram draws its furniture with these so axes, */
/* labels and legends are identical across the set.                        */
/* ---------------------------------------------------------------------- */

/** Recessive plot frame: left and bottom rules only, no box, no heavy grid. */
export function Axes({
  x,
  y,
  w,
  h,
  xLabel,
  yLabel,
  xTicks = [],
  yTicks = [],
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  xLabel?: string;
  yLabel?: string;
  /** Fractional positions 0..1 along the axis, with their labels. */
  xTicks?: { at: number; label: string }[];
  yTicks?: { at: number; label: string }[];
}) {
  return (
    <g>
      {xTicks.map((t) => (
        <line
          key={`gx${t.at}`}
          x1={x + t.at * w}
          y1={y}
          x2={x + t.at * w}
          y2={y + h}
          stroke="var(--fig-grid)"
          strokeWidth={1}
        />
      ))}
      {yTicks.map((t) => (
        <line
          key={`gy${t.at}`}
          x1={x}
          y1={y + h - t.at * h}
          x2={x + w}
          y2={y + h - t.at * h}
          stroke="var(--fig-grid)"
          strokeWidth={1}
        />
      ))}
      <line x1={x} y1={y} x2={x} y2={y + h} stroke="var(--fig-axis)" strokeWidth={1.5} />
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke="var(--fig-axis)" strokeWidth={1.5} />
      {xTicks.map((t) => (
        <text
          key={`tx${t.at}`}
          x={x + t.at * w}
          y={y + h + 14}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={9}
        >
          {t.label}
        </text>
      ))}
      {yTicks.map((t) => (
        <text
          key={`ty${t.at}`}
          x={x - 6}
          y={y + h - t.at * h + 3}
          textAnchor="end"
          className="fill-muted-foreground"
          fontSize={9}
        >
          {t.label}
        </text>
      ))}
      {xLabel && (
        <text
          x={x + w / 2}
          y={y + h + 30}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={10}
        >
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text
          x={-(y + h / 2)}
          y={x - 30}
          transform="rotate(-90)"
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={10}
        >
          {yLabel}
        </text>
      )}
    </g>
  );
}

/** Builds an SVG path from sampled points. */
export function pathFrom(points: { x: number; y: number }[], close?: { toY: number }): string {
  if (points.length === 0) return "";
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
  if (!close) return d;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  return `${d} L${last.x.toFixed(2)},${close.toY.toFixed(2)} L${first.x.toFixed(2)},${close.toY.toFixed(2)} Z`;
}

/**
 * Direct label anchored to a mark. Text wears a text token rather than the
 * series colour; the swatch beside it carries identity, so the pairing is
 * never colour-alone.
 */
export function SeriesLabel({
  x,
  y,
  color,
  children,
  anchor = "start",
}: {
  x: number;
  y: number;
  color: string;
  children: string;
  anchor?: "start" | "middle" | "end";
}) {
  const dx = anchor === "end" ? -11 : 0;
  return (
    <g>
      <circle
        cx={x + dx + (anchor === "start" ? 0 : anchor === "middle" ? -11 : 0)}
        cy={y - 3}
        r={3.5}
        fill={color}
      />
      <text
        x={x + dx + (anchor === "start" ? 8 : anchor === "middle" ? -3 : 8)}
        y={y}
        textAnchor="start"
        className="fill-foreground"
        fontSize={10}
        fontWeight={600}
      >
        {children}
      </text>
    </g>
  );
}

/** Small caps annotation, the site's existing label idiom. */
export function Note({
  x,
  y,
  children,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className="fill-muted-foreground"
      fontSize={9}
      letterSpacing="0.08em"
    >
      {children}
    </text>
  );
}

/** Arrow marker definitions. Include once per figure that uses arrows. */
export function ArrowDefs({
  id = "arrow",
  color = "var(--fig-axis)",
}: {
  id?: string;
  color?: string;
}) {
  return (
    <defs>
      <marker
        id={id}
        viewBox="0 0 10 10"
        refX={9}
        refY={5}
        markerWidth={5}
        markerHeight={5}
        orient="auto-start-reverse"
      >
        <path d="M0,1 L9,5 L0,9 z" fill={color} />
      </marker>
    </defs>
  );
}

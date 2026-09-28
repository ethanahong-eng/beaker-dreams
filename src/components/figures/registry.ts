import type { FigureDef } from "./Figure";
import { atomicFigures } from "./atomic";
import { bondingFigures } from "./bonding";
import { kineticsFigures } from "./kinetics";
import { equilibriumFigures } from "./equilibrium";
import { routesFigures } from "./routes";

/**
 * Every diagram on the site, keyed by the string a lesson's theory block puts
 * in its `figure` field. Split per unit so the set can grow without one file
 * becoming the bottleneck, merged here so lesson data needs to know only the
 * key.
 */
export const FIGURES = {
  ...atomicFigures,
  ...bondingFigures,
  ...kineticsFigures,
  ...equilibriumFigures,
  ...routesFigures,
} satisfies Record<string, FigureDef>;

export type FigureKey = keyof typeof FIGURES;

export function getFigure(key: string): FigureDef | undefined {
  return (FIGURES as Record<string, FigureDef>)[key];
}

/** Every registered key, for the integration check. */
export const FIGURE_KEYS: string[] = Object.keys(FIGURES);

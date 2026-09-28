import type { FigureDef } from "./Figure";

/**
 * Diagrams for the equilibrium lessons. Keys are referenced from the lesson data by
 * the `figure` field on a theory block; see Figure.tsx for the contract.
 */
export const equilibriumFigures = {} satisfies Record<string, FigureDef>;

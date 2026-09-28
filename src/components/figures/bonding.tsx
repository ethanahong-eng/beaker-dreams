import type { FigureDef } from "./Figure";

/**
 * Diagrams for the bonding lessons. Keys are referenced from the lesson data by
 * the `figure` field on a theory block; see Figure.tsx for the contract.
 */
export const bondingFigures = {} satisfies Record<string, FigureDef>;

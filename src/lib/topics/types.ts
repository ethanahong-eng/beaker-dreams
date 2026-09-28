import type { FigureKey } from "@/components/figures/registry";

/**
 * Types for the chemistry lesson library.
 *
 * The lessons themselves live in this directory, one module per unit, so a
 * lesson can be read and edited straight from the codebase.
 */

export type BuiltInPath =
  "/geometry" | "/hybridization" | "/kinetics" | "/equilibrium" | "/everyday";

export type SimKey =
  | "vsepr"
  | "hybridization"
  | "collision"
  | "equilibrium"
  | "mechanism"
  | "titration"
  | "blindTitration"
  | "orbital";

/** One section of written lesson content, optionally illustrated. */
export type TheoryBlock = {
  heading: string;
  body: string[];
  /**
   * Diagrams from the figure registry, rendered after this block's prose. A
   * bare key is the common case; an array is for a block that earns two --
   * typically a Deep Dive block that wants both its own figure and the
   * simpler one the AP Review tier uses for the same idea.
   *
   * Type-only import, so lesson data stays plain data with no JSX in it.
   */
  figure?: FigureKey | FigureKey[];
};

/** Normalises the one-or-many `figure` field to a list. */
export function figureKeysOf(block: TheoryBlock): FigureKey[] {
  if (!block.figure) return [];
  return Array.isArray(block.figure) ? block.figure : [block.figure];
}

export type TopicLesson = {
  /** Sections of written lesson content. */
  significance: string[];
  theory: TheoryBlock[];
  simulation?: {
    key: SimKey;
    heading: string;
    caption: string;
    /** Tunes the "vsepr" simulation toward what this specific lesson teaches. */
    mode?: "geometry" | "lewis" | "resonance";
  };
};

export type Topic = {
  slug: string;
  index: string;
  unit: string;
  title: string;
  /** Word inside `title` rendered in the accent colour. */
  accent: string;
  description: string;
  topics: string[];
  /** Existing hand-built page, if this topic already has one. */
  builtIn?: BuiltInPath;
  lesson?: TopicLesson;
};

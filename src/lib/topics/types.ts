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
   * A diagram from the figure registry, rendered after this block's prose.
   * Type-only import, so lesson data stays plain data with no JSX in it.
   */
  figure?: FigureKey;
};

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

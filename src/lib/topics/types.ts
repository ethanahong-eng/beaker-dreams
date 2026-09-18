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

export type TopicLesson = {
  /** Sections of written lesson content. */
  significance: string[];
  theory: { heading: string; body: string[] }[];
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

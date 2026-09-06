/**
 * Types for the chemistry lesson library.
 *
 * The lessons themselves live in the `topics` table in the backend, so new
 * lessons can be added or edited there without touching this codebase.
 */

export type BuiltInPath =
  | "/geometry"
  | "/hybridization"
  | "/kinetics"
  | "/equilibrium"
  | "/everyday";

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

/** Units in curriculum order, derived from the lessons currently in the database. */
export function unitsOf(topics: Topic[]): string[] {
  const seen: string[] = [];
  for (const topic of topics) {
    if (!seen.includes(topic.unit)) seen.push(topic.unit);
  }
  return seen;
}

export function bySlug(topics: Topic[]): Map<string, Topic> {
  return new Map(topics.map((t) => [t.slug, t]));
}

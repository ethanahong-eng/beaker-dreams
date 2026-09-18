import type { Topic } from "./types";
import { atomicTopics } from "./atomic";
import { bondingTopics } from "./bonding";
import { kineticsTopics } from "./kinetics";
import { equilibriumTopics } from "./equilibrium";
import { worldTopics } from "./world";

export type { BuiltInPath, SimKey, TopicLesson, Topic } from "./types";

/** Units in curriculum order. */
export const units = [
  "Atomic Structure & Orbitals",
  "Chemical Bonding",
  "Kinetics & Reaction Dynamics",
  "Equilibrium & Acid-Base Chemistry",
  "Chemistry in the World",
] as const;

/** Every lesson, in curriculum order. */
export const topics: Topic[] = [
  ...atomicTopics,
  ...bondingTopics,
  ...kineticsTopics,
  ...equilibriumTopics,
  ...worldTopics,
];

export const topicsBySlug: Map<string, Topic> = new Map(topics.map((t) => [t.slug, t]));

/** Units actually represented in a list of topics, in the order they appear. */
export function unitsOf(list: Topic[] = topics): string[] {
  const seen: string[] = [];
  for (const topic of list) {
    if (!seen.includes(topic.unit)) seen.push(topic.unit);
  }
  return seen;
}

export function bySlug(list: Topic[] = topics): Map<string, Topic> {
  return new Map(list.map((t) => [t.slug, t]));
}

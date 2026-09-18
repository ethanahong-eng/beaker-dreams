import type { TopicOverride } from "./types";
import { atomicOverrides } from "./atomic";
import { bondingOverrides } from "./bonding";
import { kineticsOverrides } from "./kinetics";
import { equilibriumOverrides } from "./equilibrium";

export type { TopicOverride } from "./types";

export const TOPIC_OVERRIDES: Record<string, TopicOverride> = {
  ...atomicOverrides,
  ...bondingOverrides,
  ...kineticsOverrides,
  ...equilibriumOverrides,
};

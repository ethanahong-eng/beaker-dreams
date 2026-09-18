import type { ReactNode } from "react";
import type { EasyContent } from "@/lib/reviewContent";

// Code-only extensions to the plain lesson data in src/lib/topics/.
// Keyed by slug, they extend a topic's theory section with real
// derivations and typeset math, replace its simulation slot with a richer
// interactive one, or supply a simplified "AP Review" tier -- anything
// that needs JSX and so can't live in the data modules themselves.
export type TopicOverride = {
  extraTheory?: { heading: string; body: ReactNode }[];
  simulation?: { heading: string; caption: string; render: () => ReactNode };
  // The "AP Review" tier. Deliberately excludes the Deep Dive theory and
  // extraTheory above when shown -- extraTheory here is calculus-level
  // derivation content (Gibbs free energy, the Schrodinger equation) that
  // has no place in a beginner-friendly pass.
  easy?: EasyContent;
};

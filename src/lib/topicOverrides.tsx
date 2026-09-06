import type { ReactNode } from "react";
import { GibbsDerivation } from "@/components/GibbsDerivation";
import { SchrodingerWalkthrough } from "@/components/SchrodingerWalkthrough";
import { MechanismExplorer3D } from "@/components/MechanismExplorer3D";
import { MolecularOrbitalSim } from "@/components/MolecularOrbitalSim";

// Lesson content and each topic's attached simulation now live in a
// Supabase table this codebase only has read access to (see the "topics"
// migration) -- there's no write path from here into that data. These
// overrides are additive instead: keyed by slug, they extend a topic's
// theory section with real derivations/typeset math, or replace its
// simulation slot with a newer one, without touching the database at all.
export type TopicOverride = {
  extraTheory?: { heading: string; body: ReactNode }[];
  simulation?: { heading: string; caption: string; render: () => ReactNode };
};

export const TOPIC_OVERRIDES: Record<string, TopicOverride> = {
  thermodynamics: {
    extraTheory: [
      {
        heading: "Where ΔG° = −RT ln K actually comes from",
        body: (
          <div className="space-y-4">
            <p className="leading-relaxed text-muted-foreground">
              That last line isn't a separate fact to memorize alongside ΔG = ΔH − TΔS — it's a
              direct calculus consequence of two definitions and the combined first and second law,
              worked through explicitly below rather than asserted.
            </p>
            <GibbsDerivation />
          </div>
        ),
      },
    ],
  },
  "schrodinger-atom": {
    extraTheory: [
      {
        heading: "Solving it, step by step",
        body: (
          <div className="space-y-4">
            <p className="leading-relaxed text-muted-foreground">
              Every equation in this unit typeset properly below, walked through in the same order
              as the derivation above: separating variables, quantizing l and mₗ from the angular
              equation, quantizing n from the radial equation, and reading the energy levels off the
              result.
            </p>
            <SchrodingerWalkthrough />
          </div>
        ),
      },
    ],
  },
  "organic-mechanisms": {
    simulation: {
      heading: "SN1, SN2, E1, E2 — side by side, in 3D",
      caption:
        "Switch between all four mechanisms on the same tetrahedral carbon: watch the concerted backside attack that inverts SN2's stereocenter, the planar carbocation SN1 and E1 share, and the anti-periplanar geometry E2 requires — including exactly where each one fails outside its required geometry.",
      render: () => <MechanismExplorer3D />,
    },
  },
  "molecular-orbital-theory": {
    simulation: {
      heading: "Build a molecular orbital diagram from any two atoms",
      caption:
        "Pick two elements and a bond length: the diagram is built from real valence orbital energies and a numerically-solved secular equation, not drawn by hand. Click any level to see that exact molecular orbital's 3D shape — bonding, antibonding, σ or π.",
      render: () => <MolecularOrbitalSim />,
    },
  },
};

import type { TopicOverride } from "./types";
import { MechanismExplorer3D } from "@/components/MechanismExplorer3D";

export const kineticsOverrides: Record<string, TopicOverride> = {
  "organic-mechanisms": {
    simulation: {
      heading: "SN1, SN2, E1, E2 — side by side, in 3D",
      caption:
        "Switch between all four mechanisms on the same tetrahedral carbon: watch the concerted backside attack that inverts SN2's stereocenter, the planar carbocation SN1 and E1 share, and the anti-periplanar geometry E2 requires — including exactly where each one fails outside its required geometry.",
      render: () => <MechanismExplorer3D />,
    },
    easy: {
      significance: [
        "Substitution and elimination are the two ways a molecule with a leaving group can react, and telling them apart — along with predicting what happens to the molecule's shape in the process — is one of the core organic-chemistry skills tested on the AP exam. You don't need to derive rate laws to do this well; you need to recognize the pattern.",
        "These four mechanisms — SN1, SN2, E1, E2 — show up constantly as multiple-choice questions asking you to identify a mechanism from a reaction setup, or free-response questions asking you to predict a product and explain why. A small set of clues (how crowded the carbon is, how strong the nucleophile or base is) is enough to answer both.",
      ],
      theory: [
        {
          heading: "SN2: one smooth step, and the molecule flips",
          body: [
            "In an SN2 reaction, the incoming nucleophile attacks the carbon from the side directly opposite the leaving group, and the leaving group departs at the same moment the new bond forms — a single, one-step event. The other three groups on that carbon get pushed through to the other side, like an umbrella flipping inside-out in the wind.",
            "The result is that the molecule's 3D arrangement is inverted every time — this reaction happens best on carbons that aren't crowded with other groups, since a crowded carbon leaves no room for the nucleophile to approach from behind.",
          ],
        },
        {
          heading: "SN1: two steps, with a fork in the road",
          body: [
            "An SN1 reaction happens in two separate steps. First, the leaving group leaves on its own, before the nucleophile ever gets involved, leaving behind a flat, positively charged carbon called a carbocation. Only after that does the nucleophile come in and bond to it.",
            "Because the carbocation is flat, the nucleophile can attack from either face with about equal ease, giving a mixture of both possible 3D arrangements rather than one clean inverted product. SN1 is favored on more crowded (more substituted) carbons, since those form more stable carbocations.",
          ],
        },
        {
          heading: "E1 and E2: when a base wins out over substitution",
          body: [
            "Elimination reactions compete with substitution: instead of a nucleophile swapping in for the leaving group, a base pulls off a hydrogen from a neighboring carbon, and the electrons from that C–H bond become a new double bond as the leaving group departs. E2 does this in one concerted step, like SN2; E1 does it in two steps through the same kind of carbocation intermediate SN1 forms.",
            "A strong, bulky base — one that's better at grabbing a proton than squeezing into a crowded carbon — tips the reaction toward elimination; a smaller, purely nucleophilic reagent favors substitution instead.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "A reaction follows a two-step mechanism in which the leaving group departs before the nucleophile attacks. Which mechanism is this, and what intermediate forms?",
          answer: "SN1, through a carbocation intermediate.",
          explanation:
            "SN1 is defined by its two steps: ionization first (forming a carbocation), then nucleophilic attack. SN2 has no intermediate — it happens in one step.",
        },
        {
          question:
            "A chiral substrate undergoes an SN2 reaction at its stereocenter. What happens to its stereochemistry?",
          answer:
            "It inverts — the product has the opposite 3D configuration from the starting material.",
          explanation:
            "Backside attack in SN2 forces the other three groups on that carbon through to the opposite side in a single step, flipping the configuration every time, like an umbrella turning inside out.",
        },
        {
          question:
            "Why can an SN1 reaction produce a mixture of two different stereochemical outcomes from a single starting material?",
          answer:
            "Because the carbocation intermediate is flat, so the nucleophile can attack from either face with roughly equal likelihood.",
          explanation:
            'Once the leaving group has departed, there\'s no longer a defined "back side" to react from — the planar carbocation offers two equally open faces, giving a mix of both possible products.',
        },
        {
          question:
            "A chemist wants to favor elimination over substitution for a given alkyl halide. Which change to the reagent would help?",
          answer: "Switching to a strong, bulky base.",
          explanation:
            "A bulky base has trouble squeezing in to attack a crowded carbon as a nucleophile, but can still easily grab a proton, so it favors E1/E2 elimination over SN1/SN2 substitution.",
        },
        {
          question:
            "Which pair of mechanisms are both single-step (concerted) processes, with no intermediate in between?",
          answer: "SN2 and E2.",
          explanation:
            "SN2 and E2 both happen in one smooth step — bond-breaking and bond-forming occur simultaneously. SN1 and E1 instead both pass through a carbocation intermediate formed in a separate first step.",
        },
      ],
    },
  },
};

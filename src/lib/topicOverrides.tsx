import type { ReactNode } from "react";
import { GibbsDerivation } from "@/components/GibbsDerivation";
import { SchrodingerWalkthrough } from "@/components/SchrodingerWalkthrough";
import { MechanismExplorer3D } from "@/components/MechanismExplorer3D";
import { MolecularOrbitalSim } from "@/components/MolecularOrbitalSim";
import type { EasyContent } from "@/lib/reviewContent";

// Lesson content and each topic's attached simulation now live in a
// Supabase table this codebase only has read access to (see the "topics"
// migration) -- there's no write path from here into that data. These
// overrides are additive instead: keyed by slug, they extend a topic's
// theory section with real derivations/typeset math, replace its
// simulation slot with a newer one, or supply a simplified "AP Review"
// tier -- all without touching the database at all.
export type TopicOverride = {
  extraTheory?: { heading: string; body: ReactNode }[];
  simulation?: { heading: string; caption: string; render: () => ReactNode };
  // The "AP Review" tier. Deliberately excludes the DB theory content and
  // extraTheory above when shown -- extraTheory here is calculus-level
  // derivation content (Gibbs free energy, the Schrodinger equation) that
  // has no place in a beginner-friendly pass.
  easy?: EasyContent;
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
    easy: {
      significance: [
        "Not every reaction that releases energy happens on its own, and not every reaction that needs energy is impossible. Whether a reaction goes forward by itself comes down to one number, ΔG, that balances the energy it releases against how much more spread out the system becomes.",
        'That same ΔG also predicts where a reaction ends up at equilibrium — a very negative ΔG° means a reaction goes almost entirely to products, connecting the "does this happen" question of thermodynamics directly to the equilibrium constant K.',
      ],
      theory: [
        {
          heading: "Entropy: a measure of spread-out energy",
          body: [
            "Entropy (S) measures how spread out or disordered a system's energy is. Melting ice, dissolving salt, and a gas expanding into a bigger container all increase entropy because each one creates more ways for the system's particles and energy to be arranged.",
            "The second law of thermodynamics says the entropy of the universe as a whole only increases, or stays the same — it never decreases on its own.",
          ],
        },
        {
          heading: "ΔG = ΔH − TΔS: the spontaneity equation",
          body: [
            "Gibbs free energy change (ΔG) combines a reaction's heat change (ΔH) and its entropy change (ΔS) into one number that predicts spontaneity. ΔG < 0 means the reaction is spontaneous as written; ΔG > 0 means it isn't (the reverse reaction is, instead); ΔG = 0 means the system is already at equilibrium.",
            "Because temperature (T) multiplies ΔS, some reactions flip from spontaneous to nonspontaneous (or the reverse) depending on temperature — this happens whenever ΔH and ΔS share the same sign. An endothermic reaction (ΔH > 0) that increases entropy (ΔS > 0), for example, is nonspontaneous at low T but becomes spontaneous once T is large enough.",
          ],
        },
        {
          heading: "Connecting ΔG° to the equilibrium constant K",
          body: [
            "ΔG° and K describe the same fact about a reaction in different units. A large negative ΔG° corresponds to a large K (the reaction favors products at equilibrium); a large positive ΔG° corresponds to a small K (the reaction barely proceeds at all).",
            'That\'s why a reaction with a very negative ΔG° is often described as going "to completion" — at equilibrium, essentially all the reactants have converted to products.',
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "A reaction has ΔH < 0 and ΔS < 0. Under what temperature conditions is it spontaneous?",
          answer: "Only at low temperatures.",
          explanation:
            "ΔG = ΔH − TΔS. With ΔH negative and ΔS negative, ΔG = (negative) + T·(positive). At low T that positive term stays small, so ΔG stays negative (spontaneous). As T rises, the T|ΔS| term eventually outweighs ΔH and ΔG turns positive (nonspontaneous).",
        },
        {
          question:
            "Which of the following increases the entropy of a system: melting, freezing, or compressing a gas?",
          answer: "Melting.",
          explanation:
            "Melting turns an ordered solid into a more disordered liquid, increasing the number of ways the molecules can be arranged. Freezing and compressing a gas both reduce the number of accessible arrangements, so entropy decreases in those cases.",
        },
        {
          question:
            "If ΔG° for a reaction is very large and positive, what does that tell you about K?",
          answer: "K is very small (K ≪ 1) — the reaction barely proceeds to products.",
          explanation:
            "ΔG° and K are directly linked by ΔG° = −RT ln K. A large positive ΔG° requires ln K to be a large negative number, which means K itself is a tiny fraction — at equilibrium the mixture is overwhelmingly reactants.",
        },
        {
          question: "A process has ΔG = 0. What does this tell you about the system?",
          answer: "The system is at equilibrium.",
          explanation:
            "ΔG = 0 is the defining condition of equilibrium: there's no net driving force pushing the reaction toward products or reactants, because both directions are equally favorable at that exact point.",
        },
      ],
    },
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
    easy: {
      significance: [
        "Quantum numbers are the electron's address. Instead of picturing an electron circling the nucleus like a planet, chemists describe where it's likely to be found and how much energy it has using four numbers — n, l, mₗ, and mₛ. Every orbital shape, every electron configuration, and every periodic trend traces back to what these four numbers mean.",
        "You don't need to solve any equation to use them well. What matters is knowing what each quantum number tells you, why an atom's electrons can only take on certain combinations of them, and how that restriction builds the s, p, and d orbital shapes and the structure of the periodic table itself.",
      ],
      theory: [
        {
          heading: "The four quantum numbers, in plain terms",
          body: [
            "The principal quantum number n is like which floor of a building the electron is on — n = 1 is the ground floor, closest to the nucleus and lowest in energy; higher n means farther out and higher in energy. The angular momentum quantum number l describes the shape of the electron's region on that floor: l = 0 is an s orbital (spherical), l = 1 is a p orbital (dumbbell-shaped), l = 2 is a d orbital (cloverleaf-shaped). The magnetic quantum number mₗ says which orientation that shape has in space — the three p orbitals (pₓ, p_y, p_z) all share the same shape but point along different axes. The spin quantum number mₛ describes a property of the electron itself, not its location — it's either +½ or −½, and it's what lets two (and only two) electrons share one orbital.",
            "These numbers aren't a filing system chemists invented — only certain combinations correspond to a valid, physically sensible description of an electron bound to an atom. In practice: l can only run from 0 up to n − 1, and mₗ can only run from −l to +l. So n = 1 allows only l = 0 (a single 1s orbital), while n = 2 allows l = 0 and l = 1 (2s and three 2p orbitals).",
          ],
        },
        {
          heading: "Why orbitals have the shapes and energies they do",
          body: [
            "An orbital isn't a fixed path — it's a 3D region where an electron is highly likely to be found, and its shape is set entirely by l. All s orbitals are spherical because l = 0 has no preferred direction. All p orbitals have two lobes with a node right at the nucleus, because l = 1 splits space into two regions. Bigger n just means a bigger, more spread-out version of the same shape.",
            "For hydrogen, energy depends only on n — all orbitals on the same floor (2s and 2p, for instance) have identical energy. Once an atom has more than one electron, though, electron-electron repulsion makes s orbitals sit slightly lower in energy than p orbitals at the same n, and p lower than d — which is exactly why electron configurations fill 4s before 3d in real atoms.",
          ],
        },
        {
          heading: "Connecting quantum numbers to electron configuration",
          body: [
            "Every electron in an atom has its own unique combination of all four quantum numbers (the Pauli exclusion principle) — that restriction is why each orbital holds at most two electrons, one spin-up and one spin-down. Filling orbitals from lowest energy to highest (the Aufbau principle) produces an atom's electron configuration, and it's also why the periodic table has the shape it does: the s-block is two columns wide because an s subshell holds 2 electrons, the p-block is six columns wide because a p subshell holds 6, and the d-block is ten columns wide because a d subshell holds 10.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question: "What does the principal quantum number n primarily determine?",
          answer: "An electron's main energy level and its average distance from the nucleus.",
          explanation:
            "Higher n means a higher energy level and, on average, an electron farther from the nucleus — like a higher floor of a building.",
        },
        {
          question: "What does the angular momentum quantum number l describe?",
          answer: "The shape of the orbital (s, p, d, f, …).",
          explanation:
            "l = 0 gives a spherical s orbital, l = 1 gives a two-lobed p orbital, l = 2 gives a four-lobed d orbital — l sets the shape, not the size or orientation.",
        },
        {
          question:
            "How many orbitals exist in the 3p subshell, and how many electrons can it hold?",
          answer: "Three orbitals (3pₓ, 3p_y, 3p_z), holding up to 6 electrons.",
          explanation:
            "For l = 1, mₗ can be −1, 0, or +1 — three allowed orientations, each a distinct orbital, and each orbital holds 2 electrons for 6 total.",
        },
        {
          question:
            "Two electrons occupy the same 2p orbital. What must be true about their spin quantum numbers?",
          answer: "They must be opposite (one +½ and one −½).",
          explanation:
            "The Pauli exclusion principle requires every electron to have a unique combination of all four quantum numbers; two electrons already sharing n, l, and mₗ can only differ in mₛ.",
        },
        {
          question: "Why is the p-block of the periodic table six columns wide?",
          answer:
            "Because a p subshell (l = 1) has three orbitals, and each orbital holds 2 electrons, for a maximum of 6 p electrons.",
          explanation:
            "The three mₗ values allowed for l = 1 (−1, 0, +1) give three p orbitals; filling all of them with 2 electrons each accounts for the six elements across each p-block period.",
        },
      ],
    },
  },
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
  "molecular-orbital-theory": {
    simulation: {
      heading: "Build a molecular orbital diagram from any two atoms",
      caption:
        "Pick two elements and a bond length: the diagram is built from real valence orbital energies and a numerically-solved secular equation, not drawn by hand. Click any level to see that exact molecular orbital's 3D shape — bonding, antibonding, σ or π.",
      render: () => <MolecularOrbitalSim />,
    },
    easy: {
      significance: [
        "A basic Lewis structure treats every bond as belonging to just two atoms and can't explain one of the most famous facts about oxygen: liquid O₂ is attracted to a magnet. Molecular orbital (MO) theory fixes this by treating a molecule's electrons as filling a whole new set of orbitals that belong to the molecule as a unit, not to any single bond.",
        "The reward for this shift is a simple, testable idea — combine atomic orbitals, fill the results the same way you'd fill atomic orbitals, and count electrons — that correctly predicts both how strong a bond is and whether a molecule is magnetic, in cases where drawing dots and lines gets the wrong answer.",
      ],
      theory: [
        {
          heading: "Combining atomic orbitals: bonding and antibonding",
          body: [
            'When two atomic orbitals combine, they produce two new molecular orbitals. Combining them "in phase" reinforces the electron density between the two nuclei, creating a lower-energy bonding orbital that holds the atoms together. Combining them "out of phase" cancels the density between the nuclei instead, leaving a node there and producing a higher-energy antibonding orbital (marked with an asterisk, like σ*) that pulls the atoms apart.',
            "Every pair of combining atomic orbitals produces exactly one bonding orbital and one antibonding orbital. Whether a molecule actually forms — and how strongly it's held together — depends entirely on which of these orbitals end up occupied by electrons.",
          ],
        },
        {
          heading: "Filling MOs and calculating bond order",
          body: [
            "Just like atomic orbitals, molecular orbitals fill from lowest energy to highest, one electron at a time before pairing up in orbitals of equal energy (Hund's rule). Bond order tells you how stable the resulting bond is: bond order = (bonding electrons − antibonding electrons) / 2.",
            "A higher bond order means a stronger, shorter bond. A bond order of zero means the bonding and antibonding electrons exactly cancel out — there's no net attraction holding the atoms together, which is why He₂ doesn't exist as a stable molecule.",
          ],
        },
        {
          heading: "The O₂ paramagnetism test",
          body: [
            "O₂ is the classic case where MO theory succeeds and a simple Lewis structure fails. A Lewis structure for O₂ pairs up every electron, predicting a molecule with no unpaired electrons (diamagnetic). But when O₂'s electrons are filled into molecular orbitals following Hund's rule, two electrons end up alone in a pair of equal-energy antibonding orbitals.",
            "Those two unpaired electrons are exactly why liquid oxygen is pulled toward a magnet (paramagnetic) — a real, easily demonstrated property that MO theory predicts correctly and a plain Lewis structure gets wrong. Counting O₂'s bonding and antibonding electrons this way still gives a bond order of 2, matching its measured double-bond strength.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "A diatomic molecule has 4 electrons in bonding orbitals and 2 electrons in antibonding orbitals. What is its bond order?",
          answer: "1.",
          explanation:
            "Bond order = (bonding electrons − antibonding electrons) / 2 = (4 − 2) / 2 = 1, equivalent to a single bond.",
        },
        {
          question:
            "Why does molecular orbital theory correctly predict that O₂ is paramagnetic, while a standard Lewis structure does not?",
          answer:
            "A Lewis structure pairs all of O₂'s electrons, but filling O₂'s actual molecular orbitals places two electrons unpaired in degenerate antibonding orbitals, which is what makes it paramagnetic.",
          explanation:
            "Lewis structures can only show electrons as paired bonds or lone pairs, so they can't represent two electrons forced into separate, equal-energy orbitals by Hund's rule. MO theory fills real energy levels and shows this directly.",
        },
        {
          question:
            "If a hypothetical diatomic molecule has equal numbers of bonding and antibonding electrons, what does that predict?",
          answer: "It won't form as a stable molecule (bond order = 0).",
          explanation:
            "Equal bonding and antibonding electron counts give a bond order of (n − n) / 2 = 0, meaning there's no net stabilization holding the two atoms together — exactly why He₂ isn't a stable molecule.",
        },
        {
          question:
            "What happens to the energy of two atomic orbitals when they combine out of phase to form a molecular orbital?",
          answer:
            "Their energy increases, forming a higher-energy antibonding orbital with a node between the nuclei.",
          explanation:
            "Out-of-phase (destructive) combination cancels electron density between the two nuclei rather than reinforcing it, raising the orbital's energy above that of the original atomic orbitals.",
        },
        {
          question:
            "Between a molecule with bond order 1 and one with bond order 3 (from the same pair of elements), which has the stronger, shorter bond?",
          answer: "The one with bond order 3.",
          explanation:
            "Higher bond order means more net bonding character, which corresponds to a stronger and shorter bond — the same trend single, double, and triple bonds follow in simpler bonding models.",
        },
      ],
    },
  },
};

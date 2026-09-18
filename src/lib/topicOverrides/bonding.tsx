import type { TopicOverride } from "./types";
import { MolecularOrbitalSim } from "@/components/MolecularOrbitalSim";

export const bondingOverrides: Record<string, TopicOverride> = {
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

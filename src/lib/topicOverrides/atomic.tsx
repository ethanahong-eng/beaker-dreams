import type { TopicOverride } from "./types";
import { SchrodingerWalkthrough } from "@/components/SchrodingerWalkthrough";

export const atomicOverrides: Record<string, TopicOverride> = {
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
};

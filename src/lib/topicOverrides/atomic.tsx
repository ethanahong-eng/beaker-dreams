import type { TopicOverride } from "./types";
import { SchrodingerWalkthrough } from "@/components/SchrodingerWalkthrough";

export const atomicOverrides: Record<string, TopicOverride> = {
  "quantum-atom": {
    easy: {
      significance: [
        "For about a decade after 1913, chemists pictured the atom as a tiny solar system: a nucleus in the middle, electrons circling it on fixed tracks. That picture came from Niels Bohr, and it worked beautifully for one element — hydrogen. It predicted exactly which colours of light hydrogen gives off when it is heated, which was a real triumph.",
        "It also stopped working the moment anyone tried it on helium. The fix was strange: electrons are not tiny balls on tracks at all. They behave like waves as well as particles, and that means you cannot say where an electron is and where it is going at the same time. Everything you will learn about orbitals comes out of accepting that.",
      ],
      theory: [
        {
          heading: "Bohr's picture: right answer, wrong reason",
          body: [
            "Bohr said electrons can only sit at certain fixed distances from the nucleus, each with its own fixed energy, and that an electron jumping from a higher level to a lower one gives off a photon of light whose energy equals the gap. Because the gaps are fixed, only certain colours come out — which is why heated hydrogen gives sharp coloured lines instead of a smooth rainbow.",
            "The numbers came out right for hydrogen, using the energy formula Eₙ = −13.6 eV/n², where n is the level number (1, 2, 3, …). But Bohr had no reason for why only those levels are allowed. He simply declared it, and his model gave the wrong answer for every atom with more than one electron, starting with helium.",
          ],
        },
        {
          heading: "Electrons behave like waves",
          body: [
            "In 1924 Louis de Broglie proposed that any moving object has a wavelength, given by λ = h/(mv), where h is Planck's constant (6.626 × 10⁻³⁴ J·s), m is mass and v is speed. For heavy objects this wavelength is far too small to notice. For electrons, which are extremely light, it is about the size of an atom — big enough to matter.",
            "Worked example. An electron (m = 9.11 × 10⁻³¹ kg) moving at 1.0 × 10⁶ m/s has λ = (6.626 × 10⁻³⁴)/(9.11 × 10⁻³¹ × 1.0 × 10⁶) = 7.3 × 10⁻¹⁰ m, or 0.73 nm — several atoms wide. A 0.145 kg baseball thrown at 40 m/s has λ = (6.626 × 10⁻³⁴)/(0.145 × 40) = 1.1 × 10⁻³⁴ m, which is smaller than anything that could ever be measured. That is why you never see a baseball diffract.",
          ],
        },
        {
          heading: "The uncertainty principle",
          body: [
            "Werner Heisenberg showed that position and momentum (mass times velocity) come as a package deal: the more precisely you pin down one, the less precisely the other is defined. Written out, Δx·Δp ≥ ħ/2, where Δx is the uncertainty in position and Δp the uncertainty in momentum.",
            'This is not a statement about weak instruments or clumsy measuring. An electron that has a definite position simply does not have a definite momentum — there is nothing more precise to find out. For an electron inside an atom, the uncertainty in speed works out to be about as large as the speed itself, so "this electron is here, moving that way" is not a meaningful description.',
          ],
        },
        {
          heading: "So what is an orbital?",
          body: [
            "Since an electron has no trajectory, chemists describe it with a probability map instead. An orbital is a region around the nucleus where an electron is likely to be found — by convention, the region that contains a 90% chance of finding it.",
            "The lobes and spheres in orbital pictures are the boundaries of those 90% regions, not solid shells and not paths. The electron is not orbiting inside them; it does not have a path to orbit on.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "Bohr's model correctly predicts the emission spectrum of hydrogen. Why does it fail for helium?",
          answer:
            "Helium has two electrons, which repel each other, and Bohr's model has no way to account for electron–electron repulsion.",
          explanation:
            "Bohr's energy levels are calculated from one electron attracted to a nucleus. Adding a second electron adds a repulsion the model cannot handle, so its predicted energies are wrong for every atom past hydrogen.",
        },
        {
          question:
            "Calculate the de Broglie wavelength of an electron (m = 9.11 × 10⁻³¹ kg) travelling at 2.0 × 10⁶ m/s.",
          answer: "About 3.6 × 10⁻¹⁰ m (0.36 nm).",
          explanation:
            "λ = h/(mv) = (6.626 × 10⁻³⁴)/(9.11 × 10⁻³¹ × 2.0 × 10⁶) = 3.6 × 10⁻¹⁰ m — roughly the diameter of a few atoms, which is why electrons diffract off crystals.",
        },
        {
          question: "Why is the wave behaviour of a moving car never observed?",
          answer:
            "Its de Broglie wavelength is far too small — around 10⁻³⁸ m — to produce any measurable effect.",
          explanation:
            "λ = h/(mv), and a car's mass is enormous compared with an electron's, so the wavelength shrinks to something billions of times smaller than an atomic nucleus.",
        },
        {
          question:
            "A student says the uncertainty principle means our instruments are not yet good enough to track an electron. Is this correct?",
          answer:
            "No. The uncertainty is a property of the electron itself, not a limitation of equipment.",
          explanation:
            "An electron with a well-defined position does not possess a well-defined momentum at all, so no improvement in instruments would reveal both.",
        },
        {
          question: "What does an atomic orbital actually represent?",
          answer:
            "A region of space where there is a high probability (usually 90%) of finding an electron.",
          explanation:
            "It is a probability map, not a path or a container — the electron has no orbit, so the boundary line is just where chemists have chosen to stop drawing.",
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
  "atomic-orbitals": {
    easy: {
      significance: [
        "Orbitals come in four families — s, p, d and f — and each has a shape you can recognize on sight. An s orbital is a sphere, a p orbital is a two-lobed dumbbell, a d orbital usually has four lobes, and f orbitals are more complicated still. These shapes are not decorative: the shape of an orbital decides which directions an atom can form bonds in, which is why molecules have the geometries they do.",
        "Alongside the shape, every orbital has a fixed number of nodes — surfaces where the electron is never found. Nodes sound abstract, but counting them correctly lets you identify any orbital from a picture, and the same counting explains why a 3s electron sits at lower energy than a 3p electron in a real atom.",
      ],
      theory: [
        {
          heading: "The letter tells you the shape",
          body: [
            "Every orbital is labelled by two numbers. The first, n, is the shell number (1, 2, 3, …) and controls size: bigger n means a bigger orbital, further from the nucleus. The second, l, controls shape, and chemists give it a letter instead of a number: l = 0 is s, l = 1 is p, l = 2 is d, l = 3 is f.",
            "The shapes are fixed by l. An s orbital (l = 0) is a sphere, and there is one of them per shell. A p orbital (l = 1) is a dumbbell with two lobes, and there are three of them per shell, pointing along x, y and z. A d orbital (l = 2) usually has four lobes, and there are five per shell. There are seven f orbitals per shell, with more lobes again.",
          ],
        },
        {
          heading: "Nodes: places the electron is never found",
          body: [
            "A node is a surface where the chance of finding the electron is exactly zero. There are two kinds. Angular nodes are flat planes (or cones) slicing through the nucleus, and the number of them equals l. Radial nodes are spherical shells at a fixed distance out, like the gap between layers of an onion, and the number of them equals n − l − 1.",
            "Add the two together and you always get n − 1, no matter which orbital. Worked example: a 4d orbital has n = 4 and l = 2, so it has 2 angular nodes and 4 − 2 − 1 = 1 radial node, giving 3 total — and n − 1 = 3, as promised. A 5s orbital has n = 5 and l = 0, so 0 angular nodes and 4 radial nodes, again 4 total.",
          ],
        },
        {
          heading: "Where the electron is most likely to be",
          body: [
            "There is a trick here that catches people out. If you ask which single point is most likely to hold a 1s electron, the answer is the nucleus itself. But that is not the useful question, because a point has no volume. The useful question is which distance from the nucleus is most likely, and that means adding up all the space at that distance — which grows as you move outward, because a sphere further out has more surface area.",
            "Combining the two effects gives the radial distribution, and it peaks at a distance rather than at zero. For a hydrogen 1s electron that peak sits at 52.9 pm, which is exactly the radius Bohr had predicted for his lowest orbit. The difference is that this is the most likely distance, not a track the electron follows.",
          ],
        },
        {
          heading: "Penetration: why 3s, 3p and 3d have different energies",
          body: [
            "In a hydrogen atom, 3s, 3p and 3d all have exactly the same energy. In any atom with more than one electron they do not, and the reason is penetration — how much of its time an electron spends close in to the nucleus, inside the cloud of the other electrons.",
            "An s orbital has the extra radial nodes, and part of it sits very close to the nucleus, where the inner electrons are not in the way and the pull is at full strength. A p orbital penetrates less, and a d orbital less again. Since being closer to the nucleus means lower energy, the order within any shell is always s < p < d < f. That ordering is exactly why electrons fill 4s before 3d.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question: "How many radial and angular nodes does a 3p orbital have?",
          answer: "One angular node and one radial node, two in total.",
          explanation:
            "For 3p, n = 3 and l = 1. Angular nodes = l = 1; radial nodes = n − l − 1 = 3 − 1 − 1 = 1. The total, 2, matches n − 1.",
        },
        {
          question: "An orbital has four lobes and one spherical node. Which orbital is it?",
          answer: "A 4d orbital.",
          explanation:
            "Four lobes means two angular nodes, so l = 2 (a d orbital). One radial node means n − l − 1 = 1, so n = 4.",
        },
        {
          question:
            "In a multi-electron atom, which is lower in energy, a 4s orbital or a 3d orbital, and why?",
          answer:
            "4s is lower, because it penetrates closer to the nucleus and is shielded less by the inner electrons.",
          explanation:
            "Even though 4s is in a higher shell, part of its electron density sits very close to the nucleus where it feels nearly the full nuclear charge. That lowers its energy below 3d in neutral atoms at the start of the transition series.",
        },
        {
          question:
            "How many orbitals are there in the 3d subshell, and how many electrons can it hold?",
          answer: "Five orbitals, holding up to 10 electrons.",
          explanation:
            "A d subshell always has five orbitals, and each orbital holds two electrons — which is why the d-block of the periodic table is ten columns wide.",
        },
        {
          question:
            "For a hydrogen 1s electron, the probability density is highest at the nucleus, yet the most probable distance from the nucleus is 52.9 pm. Explain.",
          answer:
            "Probability per unit volume is highest at the nucleus, but there is almost no volume there; further out there is much more space to be found in, so the total probability at that distance peaks at 52.9 pm.",
          explanation:
            "The amount of space available at a distance r grows as the surface area of a sphere, so multiplying the density by that available space shifts the peak away from zero.",
        },
      ],
    },
  },
  "electron-configuration": {
    easy: {
      significance: [
        "An electron configuration is a list of which orbitals an atom's electrons occupy, written in order — and it is the single most useful thing to know about an element. It tells you what group the element is in, what charge its ion will take, how big the atom is and how hard it is to pull an electron off.",
        "Nearly every periodic trend you will be asked about traces back to one quantity: effective nuclear charge, the net pull an outer electron actually feels once the inner electrons have blocked part of the nucleus. Once you can estimate that, the trends stop being arrows to memorize and become something you can reason out.",
      ],
      theory: [
        {
          heading: "Three rules for filling orbitals",
          body: [
            "The Aufbau principle says electrons fill the lowest-energy orbital available first. The filling order runs 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, 4d, 5p — note that 4s comes before 3d. The Pauli exclusion principle says each orbital holds at most two electrons, and only if their spins are opposite (drawn as one arrow up and one down). Hund's rule says that when several orbitals have the same energy, electrons spread out one to each orbital, all with the same spin, before any of them double up.",
            "Worked example: iron has 26 electrons. Filling in order gives 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶, usually abbreviated [Ar] 4s² 3d⁶ since argon accounts for the first 18. Applying Hund's rule to those six 3d electrons puts one in each of the five 3d orbitals and pairs the sixth, leaving four unpaired electrons — which is why iron is magnetic.",
          ],
        },
        {
          heading: "4s fills first, but 4s leaves first",
          body: [
            "This looks like a contradiction and is worth getting straight. In a neutral potassium or calcium atom, 4s is lower in energy than 3d, so 4s fills first. But once you start removing electrons to make a cation, the 3d orbitals have dropped below 4s, and the 4s electrons are also the ones furthest out. So they are the ones that leave.",
            "The practical rule is simple: for transition metals, take electrons out of the highest n shell first. Iron is [Ar] 4s² 3d⁶, so Fe²⁺ is [Ar] 3d⁶ (not [Ar] 4s² 3d⁴), and Fe³⁺ is [Ar] 3d⁵.",
          ],
        },
        {
          heading: "Effective nuclear charge sets every trend",
          body: [
            "Effective nuclear charge, Zeff, is the pull an outer electron actually feels. The inner-shell electrons sit between it and the nucleus and cancel out part of the positive charge, an effect called shielding. A quick estimate is Zeff ≈ (number of protons) − (number of inner-shell electrons). For sodium: 11 − 10 = 1. For chlorine: 17 − 10 = 7.",
            "Both atoms have their outer electrons in shell 3, but chlorine's are pulled in seven times harder. That single difference explains the whole period: the atomic radius falls from about 190 pm at sodium to about 100 pm at chlorine, and the energy needed to remove an electron rises from 496 kJ/mol to 1251 kJ/mol. Going down a group is the opposite case — Zeff barely changes, but each new row adds a whole shell, so atoms get bigger and electrons get easier to remove.",
          ],
        },
        {
          heading: "The exceptions worth knowing",
          body: [
            "Chromium is [Ar] 4s¹ 3d⁵ and copper is [Ar] 4s¹ 3d¹⁰, not the 4s² configurations the filling order predicts. The reason is that electrons with the same spin in different orbitals stabilize one another — an effect called exchange energy — and moving one 4s electron into 3d creates several new same-spin pairs. That gain is bigger than the small energy cost of the move, so the atom takes it. It also avoids squeezing two electrons into the same 4s orbital.",
            "Two ionization-energy exceptions follow the same logic. Oxygen's first ionization energy (1314 kJ/mol) is lower than nitrogen's (1402 kJ/mol), even though oxygen has more protons, because oxygen's fourth 2p electron has to share an orbital with another electron and the two repel — removing one relieves that. Boron's (801 kJ/mol) is lower than beryllium's (900 kJ/mol) because boron's outermost electron is in a 2p orbital, which is further out and less tightly held than beryllium's 2s.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question: "Write the ground-state electron configuration of sulfur (Z = 16).",
          answer: "1s² 2s² 2p⁶ 3s² 3p⁴, or [Ne] 3s² 3p⁴.",
          explanation:
            "Fill in order: 1s and 2s take 2 each, 2p takes 6, 3s takes 2 — that is 12 — and the remaining 4 go into 3p. By Hund's rule two of those 3p electrons are unpaired.",
        },
        {
          question: "Write the electron configuration of Fe³⁺ (iron has Z = 26).",
          answer: "[Ar] 3d⁵.",
          explanation:
            "Neutral iron is [Ar] 4s² 3d⁶. The 4s electrons are outermost and leave first, followed by one 3d electron, giving [Ar] 3d⁵ — a half-filled d subshell, which is why Fe³⁺ is so common.",
        },
        {
          question:
            "Explain why chromium's configuration is [Ar] 4s¹ 3d⁵ rather than [Ar] 4s² 3d⁴.",
          answer:
            "Moving one 4s electron into 3d gives five parallel-spin d electrons, and same-spin electrons in separate orbitals stabilize the atom (exchange energy) by more than the move costs.",
          explanation:
            'It also removes a pair of electrons from the same 4s orbital, saving their mutual repulsion. Saying only that "half-filled subshells are stable" restates the result rather than explaining it.',
        },
        {
          question: "Which atom has the larger radius, Na or Cl, and why?",
          answer:
            "Na, because its outer electron feels a much smaller effective nuclear charge (roughly 1 versus roughly 7).",
          explanation:
            "Both have their valence electrons in shell 3, so the difference is entirely the pull from the nucleus. Chlorine's stronger pull draws its electrons in, shrinking the atom from about 190 pm to about 100 pm.",
        },
        {
          question:
            "Oxygen has a higher nuclear charge than nitrogen, yet a lower first ionization energy. Explain.",
          answer:
            "Oxygen's 2p⁴ configuration forces two electrons into the same orbital, and their repulsion makes one of them easier to remove.",
          explanation:
            "Nitrogen's 2p³ has one electron in each of the three 2p orbitals with no pairing, so there is no repulsion to relieve and its outer electron is held more tightly despite the smaller nuclear charge.",
        },
      ],
    },
  },
};

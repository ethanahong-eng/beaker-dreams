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
  | "blindTitration";

export type TopicLesson = {
  /** Sections of written lesson content. */
  significance: string[];
  theory: { heading: string; body: string[] }[];
  simulation?: { key: SimKey; heading: string; caption: string };
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

export const units = [
  "Molecules & Bonding",
  "Structure & Forces",
  "Reactions & Kinetics",
  "Equilibrium & Acids",
  "Chemistry in the World",
] as const;

export const topics: Topic[] = [
  // ── Molecules & Bonding ───────────────────────────────────────────────
  {
    slug: "chemical-bonding",
    index: "01",
    unit: "Molecules & Bonding",
    title: "Ionic & Covalent Bonding",
    accent: "Bonding",
    description:
      "Why some atoms hand electrons over outright and others share them. The difference between an ionic lattice and a covalent molecule comes down to how hard each nucleus pulls.",
    topics: ["Octet rule", "Lattice energy", "Sharing vs transfer", "Bond strength"],
    lesson: {
      significance: [
        "Nearly every material property you can name — whether table salt dissolves, why diamond scratches steel, why oxygen is a gas at room temperature — traces back to the kind of bond holding the atoms together. Before chemists distinguished ionic from covalent behaviour they had no way of predicting whether a new substance would conduct, melt, or shatter.",
        "The distinction, worked out through the early twentieth century by Kossel, Lewis and later Pauling, gave chemistry its first predictive map of matter: know how the electrons are held, and you can forecast conductivity, melting point, solubility and reactivity without ever running the experiment.",
      ],
      theory: [
        {
          heading: "Transfer versus sharing",
          body: [
            "An ionic bond forms when one atom's pull on electrons vastly exceeds the other's. The electron is transferred, leaving a cation and an anion that are held together by electrostatic attraction in an extended lattice — not as discrete molecules. That lattice is why ionic solids are hard, high-melting and conduct only when molten or dissolved.",
            "A covalent bond forms when both atoms pull comparably and neither wins. The shared pair sits between the two nuclei, binding them into a discrete molecule. Intermolecular attraction between those molecules is far weaker than a lattice, which is why covalent substances are usually softer, lower-melting and non-conducting.",
          ],
        },
        {
          heading: "The octet rule and its limits",
          body: [
            "Atoms tend to gain, lose or share electrons until their valence shell resembles the nearest noble gas — eight electrons for most of the second period. The rule is a bookkeeping shortcut, not a law: boron is comfortable with six, and third-period elements like sulfur and phosphorus routinely expand beyond eight.",
            "Bond strength scales with how much energy it takes to pull the bonded atoms apart. Multiple bonds are shorter and stronger than single bonds between the same pair, which is why nitrogen gas — held by a triple bond — is so unreactive that fixing it into fertiliser took an industrial revolution.",
          ],
        },
      ],
    },
  },
  {
    slug: "lewis-structures",
    index: "02",
    unit: "Molecules & Bonding",
    title: "Lewis Structures & Formal Charge",
    accent: "Formal Charge",
    description:
      "Turn a molecular formula into a picture of where every valence electron sits, then use formal charge to pick which of several valid drawings the molecule actually prefers.",
    topics: ["Valence electrons", "Lone pairs", "Formal charge", "Expanded octets"],
    lesson: {
      significance: [
        "A Lewis structure is the closest thing chemistry has to a blueprint. Given nothing but a formula, it tells you which atoms are joined, how many bonds join them, and where the non-bonding electrons sit — everything you need before reasoning about shape, polarity or reactivity.",
        "G. N. Lewis sketched the first of these dot diagrams in 1916, years before quantum mechanics could justify them. They survived because they work: a chemist can draw one in seconds and immediately predict geometry, acidity and likely reaction sites.",
      ],
      theory: [
        {
          heading: "Building the structure",
          body: [
            "Count every valence electron in the molecule, adjusting for overall charge. Place the least electronegative atom at the centre, connect the others with single bonds, then distribute the remaining electrons as lone pairs to satisfy the outer atoms first. If the central atom is short, convert lone pairs into double or triple bonds.",
          ],
        },
        {
          heading: "Choosing between valid drawings",
          body: [
            "Formal charge = valence electrons − lone-pair electrons − half the bonding electrons. The best structure is the one where formal charges sit closest to zero, and where any negative charge lands on the most electronegative atom. This is how chemists decide, for example, that sulfate is better drawn with expanded bonding than with four single bonds and a large positive centre.",
          ],
        },
      ],
      simulation: {
        key: "vsepr",
        heading: "From dots to three dimensions",
        caption:
          "Once the electron count is settled, the domains arrange themselves in space. Add bonding pairs and lone pairs and watch the predicted geometry follow.",
      },
    },
  },
  {
    slug: "geometry",
    index: "03",
    unit: "Molecules & Bonding",
    title: "Molecule Geometry",
    accent: "Geometry",
    description:
      "Electron domains around a central atom repel each other and settle as far apart as possible. Add atoms to a live VSEPR builder and watch the correct 3D shape take form.",
    topics: ["VSEPR", "Electron domains", "Bond angles", "Lone pairs"],
    builtIn: "/geometry",
  },
  {
    slug: "hybridization",
    index: "04",
    unit: "Molecules & Bonding",
    title: "Hybridization",
    accent: "Hybridization",
    description:
      "Before bonding with each other, orbitals in atoms have to merge. See how s and p orbitals combine into sp, sp² and sp³ hybrids, and why the blend ratio fixes the angles.",
    topics: ["sp / sp² / sp³", "Orbital promotion", "π bonds", "Geometry link"],
    builtIn: "/hybridization",
  },

  // ── Structure & Forces ────────────────────────────────────────────────
  {
    slug: "polarity",
    index: "05",
    unit: "Structure & Forces",
    title: "Electronegativity & Polarity",
    accent: "Polarity",
    description:
      "Shared electrons are rarely shared evenly. Unequal pull creates bond dipoles, and whether those dipoles cancel decides if the whole molecule is polar.",
    topics: ["Electronegativity", "Dipole moment", "Symmetry", "Like dissolves like"],
    lesson: {
      significance: [
        "Polarity is the reason water dissolves salt but not oil, why soap works, and why cell membranes hold together at all. It is the single property that most often decides whether two substances will mix.",
        "Pauling's electronegativity scale, published in 1932, turned a vague intuition about 'electron-hungry' atoms into a number a chemist could subtract. That subtraction predicts bond character, solubility and boiling point across the whole periodic table.",
      ],
      theory: [
        {
          heading: "Bond dipoles",
          body: [
            "Electronegativity measures how strongly a bonded atom attracts the shared pair. A large difference produces a polar covalent bond with partial charges — written δ+ and δ− — at either end. A negligible difference produces a non-polar bond.",
          ],
        },
        {
          heading: "Why shape decides the outcome",
          body: [
            "Bond dipoles are vectors. Carbon dioxide has two strongly polar C=O bonds, yet the molecule is linear so the dipoles cancel exactly and CO₂ is non-polar. Water has the same two polar bonds but a bent shape, so they add and water becomes the most famous polar solvent in existence. Geometry, not bond type alone, determines molecular polarity.",
          ],
        },
      ],
      simulation: {
        key: "vsepr",
        heading: "Test the cancellation yourself",
        caption:
          "Build a linear molecule, then bend it by adding a lone pair. The same bonds give a very different overall polarity.",
      },
    },
  },
  {
    slug: "intermolecular-forces",
    index: "06",
    unit: "Structure & Forces",
    title: "Intermolecular Forces",
    accent: "Forces",
    description:
      "The weak attractions between whole molecules — dispersion, dipole–dipole and hydrogen bonding — set boiling points, viscosity and why geckos can climb glass.",
    topics: ["Dispersion", "Dipole–dipole", "Hydrogen bonding", "Boiling point"],
    lesson: {
      significance: [
        "Intramolecular bonds decide what a molecule is; intermolecular forces decide how it behaves in bulk. Water boils at 100 °C rather than −80 °C purely because of hydrogen bonding — a difference that makes liquid oceans, and therefore life, possible.",
        "These same forces explain protein folding, DNA's double helix, the grip of adhesive tape and why liquid nitrogen must be kept so cold. They are weak individually and overwhelming in aggregate.",
      ],
      theory: [
        {
          heading: "The three main types",
          body: [
            "London dispersion forces arise from momentary, random fluctuations in electron density and exist between all molecules. They grow with the number of electrons, which is why larger halogens are liquids and solids while fluorine is a gas.",
            "Dipole–dipole attraction acts between permanently polar molecules, aligning δ+ to δ−. Hydrogen bonding is an especially strong version of this, occurring when hydrogen bonded to N, O or F is attracted to a lone pair on a neighbouring N, O or F.",
          ],
        },
        {
          heading: "Reading a boiling point",
          body: [
            "Boiling requires supplying enough energy to overcome intermolecular attraction, so boiling point is effectively a measurement of that attraction. Compare molecules of similar mass and the one capable of hydrogen bonding will always boil higher — ethanol at 78 °C against dimethyl ether at −24 °C, despite an identical formula.",
          ],
        },
      ],
    },
  },
  {
    slug: "resonance",
    index: "07",
    unit: "Structure & Forces",
    title: "Resonance & Delocalization",
    accent: "Delocalization",
    description:
      "Some molecules refuse to be drawn with one structure. Spreading electrons over several atoms lowers energy and explains benzene's stability and the strength of carboxylic acids.",
    topics: ["Resonance hybrids", "Delocalized π", "Benzene", "Acid stability"],
    lesson: {
      significance: [
        "Benzene baffled nineteenth-century chemists: its formula suggested a highly unsaturated, reactive molecule, yet it stubbornly refused to behave like one. Kekulé's oscillating-bond proposal, later reinterpreted as delocalization, resolved the paradox and opened up aromatic chemistry — dyes, pharmaceuticals and polymers all followed.",
        "Resonance also explains acidity. An acid is strong when its conjugate base can spread the resulting negative charge over several atoms, which is exactly why acetic acid gives up its proton readily while ethanol does not.",
      ],
      theory: [
        {
          heading: "The hybrid is the reality",
          body: [
            "Individual resonance structures are drawings, not states the molecule flips between. The true molecule is a single hybrid, a weighted average of the contributors, and it is always lower in energy than any one structure suggests. That energy discount is called resonance stabilisation.",
          ],
        },
        {
          heading: "Recognising delocalization",
          body: [
            "Resonance requires a π system or lone pair adjacent to an empty or π orbital, and all contributing atoms must lie in a plane so the p orbitals can overlap. Structures with more covalent bonds, complete octets and charge on electronegative atoms contribute most heavily to the hybrid.",
          ],
        },
      ],
    },
  },

  // ── Reactions & Kinetics ──────────────────────────────────────────────
  {
    slug: "reaction-mechanisms",
    index: "08",
    unit: "Reactions & Kinetics",
    title: "Reaction Mechanisms",
    accent: "Mechanisms",
    description:
      "A balanced equation hides the story. Real reactions proceed in elementary steps through fleeting intermediates, and one slow step sets the pace for everything.",
    topics: ["Elementary steps", "Intermediates", "Rate-determining step", "Transition state"],
    lesson: {
      significance: [
        "Knowing a mechanism is the difference between observing chemistry and controlling it. Industrial processes are optimised, drugs are made selective and side-products are eliminated by identifying which step is slow and intervening there.",
        "Mechanisms cannot be observed directly — they are inferred from rate data, isotope labelling and trapped intermediates. A proposed mechanism survives only as long as it reproduces the measured rate law.",
      ],
      theory: [
        {
          heading: "Elementary steps",
          body: [
            "Each elementary step is a single molecular event: a collision, a bond breaking, a rearrangement. Unlike the overall equation, an elementary step's rate law can be written straight from its stoichiometry — a bimolecular step A + B → C is first order in each reactant.",
            "Species produced in one step and consumed in a later one are intermediates. They never appear in the overall equation and are usually too short-lived to isolate.",
          ],
        },
        {
          heading: "The rate-determining step",
          body: [
            "The slowest elementary step throttles the entire sequence, exactly as the narrowest section of a pipe limits flow. The experimentally measured rate law therefore reflects the composition of that step and everything preceding it — which is why the overall rate law rarely matches the balanced equation's coefficients.",
          ],
        },
      ],
      simulation: {
        key: "mechanism",
        heading: "Step by step in three dimensions",
        caption: "Follow a reaction through its elementary steps and watch the intermediate appear and disappear.",
      },
    },
  },
  {
    slug: "kinetics",
    index: "09",
    unit: "Reactions & Kinetics",
    title: "Collision Kinetics",
    accent: "Kinetics",
    description:
      "A reaction only fires when molecules collide with enough energy and the right orientation. Shift the distribution and watch how few collisions clear the barrier.",
    topics: ["Activation energy", "Maxwell–Boltzmann", "Catalysis", "Arrhenius"],
    builtIn: "/kinetics",
  },
  {
    slug: "rate-laws",
    index: "10",
    unit: "Reactions & Kinetics",
    title: "Rate Laws & Reaction Order",
    accent: "Rate Laws",
    description:
      "Rate laws are measured, never guessed from an equation. Learn how initial-rate experiments reveal order, and what a half-life tells you about the mechanism underneath.",
    topics: ["Initial rates", "Order", "Rate constant", "Half-life"],
    lesson: {
      significance: [
        "Rate laws are how chemistry gets quantitative about time. They set how long a drug survives in the bloodstream, how fast concrete cures, and how quickly food spoils in a warm room.",
        "Because the rate law reflects the rate-determining step, measuring it is also the primary evidence for or against a proposed mechanism — an equation can be balanced a dozen ways, but only one mechanism reproduces the observed kinetics.",
      ],
      theory: [
        {
          heading: "Order from experiment",
          body: [
            "For rate = k[A]ᵐ[B]ⁿ, the exponents m and n are the orders and are determined by experiment. In the method of initial rates you double one concentration while holding the others fixed: if the rate doubles the order is one, if it quadruples the order is two, and if nothing changes the order is zero.",
          ],
        },
        {
          heading: "Half-life as a fingerprint",
          body: [
            "First-order half-life is independent of concentration, which is why radioactive decay and most drug clearance follow clean exponential curves. Second-order half-life lengthens as reactants are consumed, and zero-order half-life shortens. Plotting the data three ways and seeing which gives a straight line identifies the order directly.",
          ],
        },
      ],
      simulation: {
        key: "collision",
        heading: "Where the rate constant comes from",
        caption:
          "Temperature and activation energy control the fraction of collisions that succeed — that fraction is what k measures.",
      },
    },
  },

  // ── Equilibrium & Acids ───────────────────────────────────────────────
  {
    slug: "equilibrium",
    index: "11",
    unit: "Equilibrium & Acids",
    title: "Dynamic Equilibrium",
    accent: "Equilibrium",
    description:
      "Watch forward and reverse rates equalize in a live 3D vessel. Disturb pressure, temperature and concentration, then compare Qc to Kc to predict the response.",
    topics: ["Le Chatelier", "Qc vs Kc", "Haber–Bosch", "Water-gas shift"],
    builtIn: "/equilibrium",
  },
  {
    slug: "acids-and-bases",
    index: "12",
    unit: "Equilibrium & Acids",
    title: "Acids, Bases & pH",
    accent: "pH",
    description:
      "Acidity is an equilibrium, not a category. Ka, pH and the strong–weak distinction all come from how far a proton-transfer reaction actually proceeds.",
    topics: ["Brønsted–Lowry", "Ka and pKa", "pH scale", "Conjugate pairs"],
    lesson: {
      significance: [
        "Blood held half a pH unit off its normal 7.4 is a medical emergency; soil pH decides which crops grow; ocean pH is falling measurably as carbon dioxide dissolves. Acid–base chemistry is equilibrium made consequential.",
        "The Brønsted–Lowry definition — an acid donates a proton, a base accepts one — replaced a patchwork of older ideas in 1923 and remains the working framework for chemists and biologists alike.",
      ],
      theory: [
        {
          heading: "Strength is an equilibrium position",
          body: [
            "A strong acid dissociates essentially completely, so its equilibrium lies far to the right. A weak acid reaches a genuine equilibrium described by Ka; the smaller the Ka, the weaker the acid. Because Ka values span many orders of magnitude, chemists use pKa = −log Ka instead.",
            "Every acid has a conjugate base, and the relationship is inverse: the stronger the acid, the weaker and more stable its conjugate base — usually because that base can delocalize the negative charge it inherits.",
          ],
        },
        {
          heading: "The pH scale",
          body: [
            "pH = −log[H₃O⁺], and in water [H₃O⁺][OH⁻] = 1.0 × 10⁻¹⁴ at 25 °C, which fixes the familiar 0–14 range and puts neutrality at 7. A single pH unit is a tenfold change in hydronium concentration, so small numeric shifts represent large chemical ones.",
          ],
        },
      ],
      simulation: {
        key: "titration",
        heading: "Titrate and watch the curve",
        caption:
          "Add base to acid and follow pH through the buffer region, the equivalence point and the final plateau.",
      },
    },
  },
  {
    slug: "buffers",
    index: "13",
    unit: "Equilibrium & Acids",
    title: "Buffers & Titration Curves",
    accent: "Buffers",
    description:
      "A weak acid sitting next to its conjugate base resists pH change. That single trick keeps blood, seawater and every biology experiment stable.",
    topics: ["Henderson–Hasselbalch", "Buffer capacity", "Equivalence point", "Indicators"],
    lesson: {
      significance: [
        "Human blood is buffered by carbonic acid and bicarbonate, holding pH between 7.35 and 7.45 despite constant acid production by metabolism. Outside that window enzymes lose their shape and stop working.",
        "The same chemistry stabilises the oceans, laboratory growth media and industrial fermentation. Titration curves are how buffer behaviour is measured and how unknown concentrations are determined.",
      ],
      theory: [
        {
          heading: "How a buffer absorbs a shock",
          body: [
            "A buffer contains meaningful amounts of both a weak acid and its conjugate base. Added acid is consumed by the base component; added base is consumed by the acid component. The ratio shifts slightly, so pH moves only slightly: pH = pKa + log([base]/[acid]).",
            "Buffer capacity is greatest when that ratio is near one — that is, when pH is close to pKa — and is exhausted once one component runs out.",
          ],
        },
        {
          heading: "Reading the curve",
          body: [
            "A weak-acid titration curve starts with a steep initial rise, flattens into the buffer region centred on the pKa, jumps sharply at the equivalence point where moles of base equal moles of acid, then flattens again. The half-equivalence point is the single most useful landmark: there, pH equals pKa exactly.",
          ],
        },
      ],
      simulation: {
        key: "blindTitration",
        heading: "Find the unknown",
        caption: "Titrate an unidentified acid and use the curve's landmarks to work out what it is.",
      },
    },
  },

  // ── Chemistry in the World ────────────────────────────────────────────
  {
    slug: "everyday",
    index: "14",
    unit: "Chemistry in the World",
    title: "Chemistry in Daily Life",
    accent: "Daily Life",
    description:
      "Long-form explainers on the chemistry that quietly shapes daily life — chirality and drug safety, microplastics, ocean acidification and blood buffers.",
    topics: ["Chirality", "Microplastics", "Ocean pH", "Blood buffers"],
    builtIn: "/everyday",
  },
];

export const topicsBySlug = new Map(topics.map((t) => [t.slug, t]));

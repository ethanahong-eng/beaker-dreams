import type { Topic } from "./types";

/** Unit: Chemical Bonding */
export const bondingTopics: Topic[] = [
  {
    slug: "chemical-bonding",
    index: "05",
    unit: "Chemical Bonding",
    title: "Bond Types & Electronegativity",
    accent: "Electronegativity",
    description:
      "Ionic and covalent are the two ends of one continuous spectrum, not two separate boxes, and Pauling's electronegativity scale is what actually places a real bond somewhere on that spectrum.",
    topics: [
      "Ionic–covalent continuum",
      "Pauling electronegativity",
      "Born–Haber cycle",
      "Lattice energy",
    ],
    lesson: {
      significance: [
        'The introductory "ionic versus covalent" dichotomy is a simplification of a single continuous variable — percent ionic character — set by the electronegativity difference between the two bonded atoms, not a hard boundary nature actually respects.',
        "Lattice energy, extracted from the Born–Haber cycle, connects the same electrostatics that predicts a single bond's polarity to bulk, measurable properties: melting point, hardness, and solubility of an entire ionic crystal.",
      ],
      theory: [
        {
          heading: "Electronegativity difference sets bond character",
          body: [
            "Pauling's original definition came from a bond-energy deficit: Δ = E(A–B) − √(E(A–A)·E(B–B)) measures the extra bond strength a real A–B bond has over the geometric mean of the two homonuclear bonds, attributed to an ionic resonance contribution. As a rough, continuous guide rather than a hard rule: ΔEN below about 0.4 is treated as nonpolar covalent, 0.4–1.7 as polar covalent, and above 1.7 as ionic.",
          ],
        },
        {
          heading: "Lattice energy and the Born–Haber cycle",
          body: [
            "Lattice energy scales as U ∝ (Z⁺Z⁻)/r₀, Coulomb's law scaled by a Madelung constant that depends on the crystal's specific packing geometry, and it cannot be measured directly. Instead it is obtained indirectly, by summing every other step of the Born–Haber cycle (sublimation, ionization, bond dissociation, electron affinity, and the crystal's measured enthalpy of formation) and enforcing conservation of energy via Hess's law.",
          ],
        },
      ],
    },
  },
  {
    slug: "hybridization",
    index: "06",
    unit: "Chemical Bonding",
    title: "Hybridization",
    accent: "Hybridization",
    description:
      "Valence bond theory mixes an atom's pure atomic orbitals into hybrid orbitals whose number and geometry come directly from its electron-domain count, not from a memorized shape. See how s, p, and d orbitals combine into sp, sp², sp³, sp³d, and sp³d² hybrids, and why the blend ratio fixes the resulting angles.",
    topics: [
      "Valence bond theory",
      "sp / sp² / sp³ / sp³d / sp³d²",
      "Orbital promotion",
      "σ vs π overlap",
    ],
    builtIn: "/hybridization",
  },
  {
    slug: "molecular-orbital-theory",
    index: "07",
    unit: "Chemical Bonding",
    title: "Molecular Orbital Theory",
    accent: "Molecular Orbital Theory",
    description:
      "Valence bond theory can't explain why O₂ is paramagnetic. Building molecular orbitals as linear combinations of atomic orbitals and filling them by energy predicts bonding, antibonding character and bond order directly — including cases localized-bond pictures get wrong.",
    topics: ["LCAO", "Bonding vs antibonding MOs", "Bond order", "Paramagnetism of O₂"],
    lesson: {
      significance: [
        "Hybridization treats every bond as localized between two specific atoms, which cannot predict molecular magnetism or account for bond orders that come out fractional. Molecular orbital theory instead treats a molecule's electrons as occupying orbitals delocalized over every nucleus at once.",
        "The clearest demonstration is O₂: its simple Lewis structure (O=O, every electron paired) predicts a diamagnetic molecule, but liquid oxygen is famously attracted to a magnet. An MO diagram gets this right by placing two electrons, unpaired, in a pair of degenerate antibonding π* orbitals.",
      ],
      theory: [
        {
          heading: "Constructing molecular orbitals from atomic orbitals",
          body: [
            "The LCAO approximation writes each molecular orbital as a weighted sum of atomic orbitals, ψ_MO = c₁φ_A + c₂φ_B. Combining two atomic orbitals in phase (constructively) produces a lower-energy bonding orbital; combining them out of phase (destructively, with a node between the nuclei) produces a higher-energy antibonding orbital, marked with an asterisk. Combining N atomic orbitals always produces exactly N molecular orbitals.",
          ],
        },
        {
          heading: "Filling MOs, bond order, and predicting magnetism",
          body: [
            "Molecular orbitals fill lowest-energy-first under the same Aufbau, Pauli, and Hund's-rule constraints that govern atomic orbitals. Bond order = ½(bonding electrons − antibonding electrons); for O₂ this correctly gives a bond order of 2 (confirmed by its measured bond length and dissociation energy) while also predicting the two unpaired π* electrons responsible for paramagnetism. The same accounting explains why He₂, with equal bonding and antibonding occupancy (bond order 0), is not a stable molecule.",
          ],
        },
      ],
    },
  },
  {
    slug: "geometry",
    index: "08",
    unit: "Chemical Bonding",
    title: "Molecule Geometry",
    accent: "Geometry",
    description:
      "Electron domains around a central atom repel each other and settle as far apart as possible — the same repulsion physics whether a domain is a lone pair, a single bond, or the merged electron cloud of a double or triple bond. Add atoms to a live VSEPR builder and watch the correct 3D shape take form.",
    topics: ["VSEPR", "Electron domains", "Bond angles", "Lone pairs"],
    builtIn: "/geometry",
  },
  {
    slug: "polarity",
    index: "09",
    unit: "Chemical Bonding",
    title: "Molecular Polarity",
    accent: "Polarity",
    description:
      "A bond dipole is a vector, not a label. Whether a molecule is polar depends on whether its individual bond dipole vectors sum to zero — a geometry problem as much as an electronegativity one.",
    topics: [
      "Bond dipole vectors",
      "Dipole moment (μ = qd)",
      "Vector cancellation",
      "Percent ionic character",
    ],
    lesson: {
      significance: [
        "Polarity decides whether water dissolves salt but not oil, why soap works, and why a cell membrane holds together — it is the single molecular property that most often decides whether two substances will mix.",
        "Pauling's electronegativity scale turned a vague intuition about \"electron-hungry\" atoms into a subtractable number, but a bond's polarity only becomes a molecule's polarity once every bond dipole in the structure is added together as a vector.",
      ],
      theory: [
        {
          heading: "Dipole moment as a vector quantity",
          body: [
            "A bond's dipole moment is μ = qδ·d — the partial charge separated, times the distance separating it, measured in debyes. A molecule's net dipole moment is the vector sum of every individual bond dipole, which is exactly why a molecule built entirely from polar bonds can still be nonpolar overall if symmetry cancels those vectors (CO₂, BF₃), while a lower-symmetry molecule with the same bond types does not (H₂O, NH₃).",
          ],
        },
        {
          heading: "From measured dipole moment to percent ionic character",
          body: [
            "Percent ionic character is estimated by comparing a bond's experimentally measured dipole moment to the dipole moment expected if the bonding electron pair had been fully transferred (100% ionic) across the same bond length. This gives HF roughly 41% ionic character and HCl roughly 18% — further evidence that the ionic/covalent line is a continuum, not a category with a sharp edge.",
          ],
        },
      ],
    },
  },
  {
    slug: "intermolecular-forces",
    index: "10",
    unit: "Chemical Bonding",
    title: "Intermolecular Forces",
    accent: "Intermolecular Forces",
    description:
      "The weak attractions between whole molecules — quantitatively described by the Lennard-Jones potential — set boiling points, viscosity, and why hydrogen bonding alone keeps Earth's oceans liquid.",
    topics: [
      "London dispersion",
      "Lennard-Jones potential",
      "Hydrogen bonding",
      "Boiling-point trends",
    ],
    lesson: {
      significance: [
        "Intramolecular bonds decide what a molecule is; intermolecular forces decide how it behaves in bulk. Water boils at 100 °C rather than roughly −80 °C purely because of hydrogen bonding — a difference that makes liquid oceans, and life as a result, possible.",
        "The same forces explain protein folding, DNA's double helix, and why liquid nitrogen must be kept so cold — individually weak, and overwhelming in aggregate.",
      ],
      theory: [
        {
          heading: "Quantifying attraction: the Lennard-Jones potential",
          body: [
            "Intermolecular potential energy as a function of separation r is modeled by V(r) = 4ε[(σ/r)¹² − (σ/r)⁶]. The attractive r⁻⁶ term follows directly from London dispersion — an induced-dipole/induced-dipole interaction derivable from second-order perturbation theory — while the repulsive r⁻¹² term is a computationally convenient stand-in for Pauli repulsion between overlapping electron clouds at short range.",
          ],
        },
        {
          heading: "Hydrogen bonding as a special-case dipole interaction",
          body: [
            "Hydrogen bonds are worth roughly 5–30 kJ/mol, well above ordinary dipole–dipole (Keesom) interactions (2–10 kJ/mol) and dispersion forces alone (0.1–2 kJ/mol), because they require both a strongly electronegative donor atom (N, O, or F) with a highly polarized X–H bond and an acceptor lone pair positioned for good directional overlap — not just a favorable charge separation.",
          ],
        },
      ],
    },
  },
  {
    slug: "lewis-structures",
    index: "11",
    unit: "Chemical Bonding",
    title: "Lewis Structures & Formal Charge",
    accent: "Formal Charge",
    description:
      "Formal charge assumes every atom completes its own shell independently from a shared electron pool — a different, deliberate bookkeeping convention from real charge distribution, and one that lets chemists pick between several valid drawings of the same skeleton.",
    topics: [
      "Octet-completion convention",
      "Formal charge = V − L − B/2",
      "Formal charge vs oxidation state",
      "Expanded octets",
    ],
    lesson: {
      significance: [
        "A Lewis structure is the closest thing chemistry has to a blueprint: given nothing but a formula, it fixes which atoms are joined, how many bonds join them, and where the non-bonding electrons sit — the starting point for reasoning about shape, polarity, or reactivity.",
        "Formal charge is not the same question as oxidation state, even though both assign a number to an atom in a bond. Oxidation state assumes every bonding pair belongs entirely to the more electronegative atom; formal charge assumes every bonding pair is split exactly in half, regardless of electronegativity. The two conventions answer different questions and routinely disagree.",
      ],
      theory: [
        {
          heading: "Building the structure",
          body: [
            "Count every valence electron in the molecule, adjusting for overall charge. Place the least electronegative atom at the center, connect the others with single bonds, then distribute the remaining electrons as lone pairs, satisfying the outer atoms first. If the central atom is short of an octet, convert an outer atom's lone pair into an additional bond.",
          ],
        },
        {
          heading: "Formal charge picks between valid drawings",
          body: [
            "Formal charge = V − L − B/2, where V is the atom's free-atom valence electron count, L its nonbonding (lone-pair) electrons, and B its bonding electrons total (double-counted, since a shared pair belongs to both atoms). The best structure among several valid drawings of the same skeleton is the one whose formal charges sit closest to zero, with any remaining negative charge on the most electronegative atom — the reasoning that correctly favors an expanded-octet structure for sulfate over one with four single bonds and a large positive center.",
          ],
        },
      ],
      simulation: {
        key: "vsepr",
        heading: "Spot the formal charge, then minimize it",
        caption:
          'Every atom here shows its formal charge as a blue "+" or red "−", computed from the same octet-completion convention used to draw a Lewis structure by hand. Toggle "Show ideal bonding" to see which bonds should change order to reach the lowest possible charge separation for the skeleton you\'ve built.',
        mode: "lewis",
      },
    },
  },
  {
    slug: "resonance",
    index: "12",
    unit: "Chemical Bonding",
    title: "Resonance & Delocalization",
    accent: "Delocalization",
    description:
      'Some molecules refuse to be drawn with one Lewis structure. Spreading electrons over several atoms lowers energy by a real, measurable amount, and Hückel\'s rule turns "is this ring aromatic" into a countable question.',
    topics: [
      "Resonance hybrid",
      "Delocalization / resonance energy",
      "Hückel's 4n+2 rule",
      "Curved-arrow formalism",
    ],
    lesson: {
      significance: [
        "Benzene baffled nineteenth-century chemists: its formula suggested a highly unsaturated, reactive molecule, yet it stubbornly refused to behave like one. Kekulé's oscillating-bond proposal, later reinterpreted as delocalization, resolved the paradox and opened up aromatic chemistry.",
        "Resonance stabilization is not a hand-wave — it is measurable. Comparing benzene's actual heat of hydrogenation to the value predicted for a hypothetical molecule with three isolated double bonds gives a resonance energy of roughly 36 kcal/mol, the real energetic payoff of delocalization.",
      ],
      theory: [
        {
          heading: "The hybrid is the reality",
          body: [
            "Individual resonance structures are drawings, not states the molecule flips between. The true molecule is a single hybrid, a weighted average of the contributing structures, and it is always lower in energy than any one contributor suggests — that energy discount is the resonance (delocalization) energy.",
          ],
        },
        {
          heading: "Hückel's rule for aromaticity",
          body: [
            "A planar, fully conjugated ring is aromatic — and gains the full stabilization of complete delocalization — only if it has 4n+2 π electrons for some integer n (2, 6, 10, 14, …); a ring with 4n π electrons instead is antiaromatic and destabilized by delocalization. Benzene's six π electrons (n=1) satisfy the rule exactly, which is why it is the textbook case rather than an exception.",
          ],
        },
      ],
      simulation: {
        key: "vsepr",
        heading: "Build a structure, spot the ambiguity",
        caption:
          "Build something like CO₂ with its bonds drawn asymmetrically, or close a ring with alternating single/double bonds like benzene — any resonance-eligible atoms and bonds glow on their own the moment they exist, instead of waiting for you to click the right atom to find them.",
        mode: "resonance",
      },
    },
  },
];

export type BuiltInPath =
  "/geometry" | "/hybridization" | "/kinetics" | "/equilibrium" | "/everyday";

export type SimKey =
  | "vsepr"
  | "hybridization"
  | "collision"
  | "equilibrium"
  | "mechanism"
  | "titration"
  | "blindTitration"
  | "orbital";

export type TopicLesson = {
  /** Sections of written lesson content. */
  significance: string[];
  theory: { heading: string; body: string[] }[];
  simulation?: {
    key: SimKey;
    heading: string;
    caption: string;
    /** Tunes the "vsepr" simulation toward what this specific lesson teaches. */
    mode?: "geometry" | "lewis" | "resonance";
  };
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
  "Atomic Structure & Orbitals",
  "Chemical Bonding",
  "Kinetics & Reaction Dynamics",
  "Equilibrium & Acid-Base Chemistry",
  "Chemistry in the World",
] as const;

export const topics: Topic[] = [
  // ── Atomic Structure & Orbitals ─────────────────────────────────────────
  {
    slug: "quantum-atom",
    index: "01",
    unit: "Atomic Structure & Orbitals",
    title: "Beyond Bohr: The Quantum Atom",
    accent: "Quantum Atom",
    description:
      "Bohr's planetary model, which was initially developed in 1913 predicted that electrons orbit around the nucleus in predictable patters.  His model helped to predict behaviors such as spectral lines for hydrogen, but it failed on more complex molecules. Scientist later confirmed that atoms have wave–particle duality thus requiring a new model.",
    topics: [
      "Wave–particle duality",
      "de Broglie wavelength",
      "Heisenberg uncertainty",
      "Failure of the Bohr model",
    ],
    lesson: {
      significance: [
        "Theoretically, an electron orbiting a nucleus should collapse: losing energy until it spirals into the nucleus. Bohr's 1913 model sidestepped the problem sidestepped this problem by suggesting that electrons can only orbit the nucleus at fixed orbits.  This correctly reproduced hydrogen's line spectrum, but since it had no real justification behind it, it failed for any atom with more than one electron.",
        'A few years after Bohr\'s model, a solution came, which involved describing atoms with both wave and particle behaviors. It was determined that electrons do not orbit fixed orbital path meaningless — not just hard to measure, but physically undefined. Every rule this unit builds (orbital shapes, nodes, periodic trends) follows from replacing "where is the electron" with "what is the probability amplitude for the electron."',
      ],
      theory: [
        {
          heading: "Why a classical orbit can't be stable",
          body: [
            "Larmor's formula gives the power radiated by an accelerating charge; plugging in an electron circling a proton at the Bohr radius predicts total energy loss and orbital collapse on a timescale of roughly 10⁻¹¹ s, which plainly contradicts the existence of stable atoms. Bohr's postulate — that angular momentum is restricted to integer multiples of ħ, L = nħ — forbids all but a discrete set of orbits and, combined with the Coulomb attraction, correctly predicts hydrogen's energy levels Eₙ = −13.6 eV/n². It gives no reason why angular momentum should be quantized in the first place, and it cannot be extended to helium's two-electron problem at all.",
          ],
        },
        {
          heading: "Matter waves and the uncertainty principle",
          body: [
            "De Broglie proposed that any particle with momentum p has an associated wavelength λ = h/p — a relation later confirmed directly by electron diffraction. A wave doesn't have a single well-defined position and momentum simultaneously, which Heisenberg made precise: Δx·Δp ≥ ħ/2. For an electron confined to an atom-sized region, this uncertainty is comparable to the electron's own momentum, so \"the electron is at this point, moving in this direction\" stops being a meaningful statement. What replaces it is a wavefunction ψ, whose squared magnitude |ψ|² gives a probability density — the object the next topic solves for directly.",
          ],
        },
      ],
    },
  },
  {
    slug: "schrodinger-atom",
    index: "02",
    unit: "Atomic Structure & Orbitals",
    title: "The Schrödinger Equation & the Hydrogen Atom",
    accent: "Schrödinger Equation",
    description:
      "The hydrogen atom is the one many-electron system chemistry can solve exactly. Separating its Schrödinger equation into radial and angular parts is where the quantum numbers n, l, and mₗ actually come from — they are not organizing labels, they are boundary conditions.",
    topics: [
      "Time-independent Schrödinger equation",
      "Separation of variables",
      "Quantum numbers",
      "Energy quantization",
    ],
    lesson: {
      significance: [
        "Every subsequent rule in this unit — orbital shapes, node-counting, periodic trends — is a stated consequence of one equation's solutions for one atom. Hydrogen is solvable in closed form only because it has exactly one electron in a purely radial (1/r) potential; every heavier atom is only ever approximated by reference to these solutions, corrected for the electrons that hydrogen doesn't have.",
        "Quantum numbers are not a bookkeeping convention chemists invented to organize the periodic table. Each one falls directly out of requiring the wavefunction to be a physically valid solution — single-valued, finite everywhere, and normalizable — of a specific differential equation.",
      ],
      theory: [
        {
          heading: "Setting up the equation",
          body: [
            "The time-independent Schrödinger equation is Ĥψ = Eψ, with the Hamiltonian for hydrogen Ĥ = −(ħ²/2m)∇² − e²/(4πε₀r): a kinetic-energy operator plus the Coulomb attraction between electron and proton. Because the potential depends only on the radial distance r, the equation is written in spherical coordinates (r, θ, φ) rather than Cartesian ones, which is what makes the next step possible.",
          ],
        },
        {
          heading: "Separation of variables and where quantum numbers come from",
          body: [
            "The wavefunction is assumed separable, ψ(r,θ,φ) = R(r)·Y(θ,φ), splitting one three-dimensional equation into an angular equation and a radial equation. Requiring Y(θ,φ) to be single-valued as φ increases by 2π forces the angular momentum quantum number l to be a non-negative integer and the magnetic quantum number mₗ to be an integer with −l ≤ mₗ ≤ l. Requiring R(r) to stay finite as r → ∞ (so the electron is actually bound) forces the principal quantum number n to be a positive integer with n > l.",
            "Solving the radial equation under those constraints gives hydrogen's energy levels Eₙ = −13.6 eV/n², depending on n alone — a special degeneracy (every l and mₗ at a given n shares the same energy) unique to the pure 1/r Coulomb potential, and one that breaks down immediately in any multi-electron atom.",
          ],
        },
      ],
    },
  },
  {
    slug: "atomic-orbitals",
    index: "03",
    unit: "Atomic Structure & Orbitals",
    title: "Orbital Shapes: s, p, d, f and Nodal Structure",
    accent: "Nodal Structure",
    description:
      "An orbital's shape is a plot of the angular solution it belongs to, and the number of nodes it has is fixed exactly by n and l. No orbital's shape or node count is arbitrary once those two numbers are set.",
    topics: [
      "Spherical harmonics",
      "Angular nodes",
      "Radial nodes",
      "Radial probability distribution",
    ],
    lesson: {
      significance: [
        "The familiar s-sphere, p-dumbbell and d-cloverleaf shapes are not drawn by convention. They are exactly |Y_l^{mₗ}(θ,φ)|² — the spherical harmonics that solve the angular equation from the previous topic — and the same functions describe angular momentum in contexts as different as a hydrogen electron and a spinning top.",
        "Counting nodes correctly is what lets a chemist read an orbital's quantum numbers straight off a picture, or predict one, and it shows up directly in real photoelectron and NMR spectroscopy data rather than only in textbook diagrams.",
      ],
      theory: [
        {
          heading: "Angular nodes fix the letter — s, p, d, f",
          body: [
            "The number of angular nodes (planes or cones on which the wavefunction is exactly zero) equals l exactly: zero for s (l=0, spherically symmetric, no nodal surface at all), one for p (l=1, a single nodal plane through the nucleus giving the two-lobed dumbbell), two for d (l=2), three for f (l=3). Each additional angular node is what adds another lobe to the shape.",
          ],
        },
        {
          heading: "Radial nodes and the universal total-node rule",
          body: [
            "The number of radial nodes — spherical shells where R(r) = 0 — equals n − l − 1. Total nodes (radial plus angular) always equal n − 1, regardless of which orbital: 2s has 1 radial node and 0 angular nodes (1 total, matching n−1=1); 2p has 0 radial and 1 angular (1 total); 3d has 0 radial and 2 angular (2 total, matching n−1=2). This single rule lets any orbital's full nodal structure be reconstructed from its name alone.",
          ],
        },
        {
          heading: "Radial probability distribution",
          body: [
            "The probability of finding the electron in a thin spherical shell at radius r is not |R(r)|² alone but r²|R(r)|² dr — the extra r² factor is the volume of that shell, which grows with distance from the nucleus. This is why an orbital like 2s, whose R(r) is actually largest at r=0, still has its most probable electron distance well away from the nucleus once that geometric factor is included.",
          ],
        },
      ],
      simulation: {
        key: "orbital",
        heading: "From wavefunction to electron cloud",
        caption:
          "Pick any hydrogen-like orbital from 1s to 4f and see its actual wavefunction plotted through the nucleus, then a real Monte Carlo sample of its 3D probability density — count the sign changes in the graph and the nodes match n − l − 1 (radial) and l (angular) exactly.",
      },
    },
  },
  {
    slug: "electron-configuration",
    index: "04",
    unit: "Atomic Structure & Orbitals",
    title: "Electron Configurations & Periodic Trends",
    accent: "Periodic Trends",
    description:
      "Filling orbitals with electrons takes three separate rules, not one, and effective nuclear charge — not the periodic table's shape — is the actual reason atomic size, ionization energy and electronegativity trend the way they do.",
    topics: [
      "Aufbau principle",
      "Pauli exclusion",
      "Hund's rule",
      "Effective nuclear charge (Zeff)",
    ],
    lesson: {
      significance: [
        "The electron-electron repulsion term makes the many-body Schrödinger equation unsolvable in closed form for any atom past hydrogen, so every real configuration is built from hydrogen-like orbitals, corrected for how much of the true nuclear charge each electron actually experiences once the other electrons are accounted for.",
        "Periodic trends that are usually memorized as directional arrows across a table are direct, computable consequences of a single number assigned to each electron: its effective nuclear charge, Zeff.",
      ],
      theory: [
        {
          heading: "Three rules for filling orbitals",
          body: [
            "The Aufbau principle fills the lowest-energy available orbitals first, in an order set empirically by increasing (n + l), then by increasing n for ties. The Pauli exclusion principle caps every orbital at two electrons, and only if their spins are opposite, since no two electrons in an atom may share all four quantum numbers. Hund's rule fills a set of degenerate orbitals (like the three 2p orbitals) singly, with parallel spins, before pairing any electron up — minimizing electron-electron repulsion and, as a side effect, giving half-filled and fully-filled subshells extra stability.",
          ],
        },
        {
          heading: "Effective nuclear charge and Slater's rules",
          body: [
            "Zeff = Z − S, where S is a shielding constant estimated from how many electrons occupy the same or inner shells, following Slater's empirical rules. It is Zeff, not the bare nuclear charge Z, that actually sets an electron's orbital energy and orbital size — the correction for shielding is not a minor footnote, it is the quantity every trend below is computed from.",
          ],
        },
        {
          heading: "Where the periodic trends actually come from",
          body: [
            "Atomic radius shrinks moving left to right across a period, because Zeff rises while the principal quantum number n stays fixed, and grows moving down a group, because n itself increases. Ionization energy and electronegativity rise wherever Zeff rises, for the same reason — with well-documented exceptions (oxygen's first ionization energy dipping below nitrogen's) explained directly by the extra stability Hund's rule gives to nitrogen's half-filled 2p subshell.",
          ],
        },
      ],
    },
  },

  // ── Chemical Bonding ──────────────────────────────────────────────────
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

  // ── Kinetics & Reaction Dynamics ────────────────────────────────────────
  {
    slug: "rate-laws",
    index: "13",
    unit: "Kinetics & Reaction Dynamics",
    title: "Reaction Rates & Rate Laws",
    accent: "Rate Laws",
    description:
      "A rate law is measured, never guessed from an equation, but once known it can be integrated by ordinary calculus — turning an instantaneous rate into a formula for concentration at any future time.",
    topics: [
      "Differential rate laws",
      "Integrated rate laws",
      "Half-life derivation",
      "Method of initial rates",
    ],
    lesson: {
      significance: [
        "Rate laws are how chemistry gets quantitative about time — how long a drug survives in the bloodstream, how fast concrete cures, how quickly food spoils in a warm room.",
        "Because a rate law reflects the rate-determining step of a mechanism, measuring it is also the primary evidence for or against a proposed mechanism: an equation can be balanced a dozen ways, but only one mechanism reproduces the observed order.",
      ],
      theory: [
        {
          heading: "Order from experiment",
          body: [
            "For rate = k[A]ᵐ[B]ⁿ, the exponents m and n are determined experimentally, not read off stoichiometry. In the method of initial rates, one concentration is doubled while the others are held fixed: if the rate doubles, that reactant's order is one; if it quadruples, the order is two; if the rate is unchanged, the order is zero.",
          ],
        },
        {
          heading: "From differential to integrated rate laws",
          body: [
            "Each order's differential rate law can be integrated directly by separation of variables. First order: −d[A]/dt = k[A] rearranges to d[A]/[A] = −k dt; integrating both sides gives ln[A] = ln[A]₀ − kt, i.e. [A] = [A]₀e^(−kt). Second order: −d[A]/dt = k[A]² rearranges to d[A]/[A]² = −k dt, integrating to 1/[A] = 1/[A]₀ + kt. Zero order integrates trivially to [A] = [A]₀ − kt.",
          ],
        },
        {
          heading: "Half-lives fall directly out of the integrated form",
          body: [
            "Setting [A] = [A]₀/2 in each integrated law gives, respectively: t½ = ln2/k for first order (independent of starting concentration — exactly why radioactive decay and most drug clearance follow a single, clean half-life); t½ = 1/(k[A]₀) for second order (lengthening as the reaction proceeds); and t½ = [A]₀/2k for zero order (shortening as the reaction proceeds). Which formula fits the data identifies the order directly, without needing to already know a mechanism.",
          ],
        },
      ],
    },
  },
  {
    slug: "kinetics",
    index: "14",
    unit: "Kinetics & Reaction Dynamics",
    title: "Collision Theory & the Arrhenius Equation",
    accent: "Arrhenius Equation",
    description:
      "A reaction only fires when molecules collide with enough energy and the right orientation. Shift the Maxwell–Boltzmann distribution and watch how few collisions clear the barrier.",
    topics: [
      "Activation energy",
      "Maxwell–Boltzmann distribution",
      "Catalysis",
      "Arrhenius equation",
    ],
    builtIn: "/kinetics",
  },
  {
    slug: "reaction-mechanisms",
    index: "15",
    unit: "Kinetics & Reaction Dynamics",
    title: "Reaction Mechanisms & the Steady-State Approximation",
    accent: "Steady-State Approximation",
    description:
      "A balanced equation hides the story. Real reactions proceed through elementary steps and fleeting intermediates, and the steady-state approximation is the tool that turns a proposed multi-step mechanism into a testable rate law.",
    topics: [
      "Elementary steps",
      "Reactive intermediates",
      "Rate-determining step",
      "Steady-state approximation",
    ],
    lesson: {
      significance: [
        "Knowing a mechanism is the difference between observing chemistry and controlling it: industrial processes are optimized, drugs are made selective, and side products are eliminated by identifying which step is slow and intervening there.",
        "Mechanisms cannot be observed directly — they are inferred from rate data, isotope labeling, and trapped intermediates. A proposed mechanism survives only as long as it reproduces the measured rate law.",
      ],
      theory: [
        {
          heading: "Elementary steps and intermediates",
          body: [
            "Each elementary step is a single molecular event — a collision, a bond breaking, a rearrangement — and unlike the overall equation, its rate law follows straight from its stoichiometry: a bimolecular step A + B → C is first order in each reactant. Species produced in one step and consumed in a later one are intermediates; they never appear in the overall equation and are usually too short-lived to isolate.",
          ],
        },
        {
          heading: "The steady-state approximation",
          body: [
            'Rather than assuming outright which step is "the" slow one, the steady-state approximation sets the net rate of change of a reactive intermediate to zero, d[intermediate]/dt ≈ 0 — valid once the intermediate is consumed almost as fast as it forms — and solves the resulting algebraic equation for the intermediate\'s concentration in terms of stable species. Substituting that back into the rate expression for the final step derives the overall rate law directly from the proposed elementary steps, without needing to guess a single rate-determining step at all.',
          ],
        },
      ],
      simulation: {
        key: "mechanism",
        heading: "Step by step in three dimensions",
        caption:
          "Follow a reaction through its elementary steps and watch the intermediate appear and disappear.",
      },
    },
  },
  {
    slug: "organic-mechanisms",
    index: "16",
    unit: "Kinetics & Reaction Dynamics",
    title: "Organic Reaction Mechanisms: SN1, SN2, E1, E2",
    accent: "SN1, SN2, E1, E2",
    description:
      "The same nucleophilic substitution can happen by two mechanistically opposite pathways, and which one wins is decided by measurable, predictable factors — substrate structure, nucleophile strength, solvent — not memorized exceptions.",
    topics: [
      "SN2 backside attack",
      "SN1 carbocation intermediate",
      "E1 / E2 elimination",
      "Stereochemical inversion",
    ],
    lesson: {
      significance: [
        "Substitution and elimination compete constantly in organic synthesis, and predicting which product forms — and with what stereochemistry — from the reaction conditions alone is one of the first genuinely predictive skills in organic chemistry.",
        "Hughes and Ingold's kinetic studies in the 1930s — some substitutions showing rate = k[substrate][nucleophile], others showing rate = k[substrate] alone — were the direct evidence that two entirely different mechanisms were operating, established decades before either transition state could be observed directly.",
      ],
      theory: [
        {
          heading: "SN2: concerted, bimolecular, backside attack",
          body: [
            "Rate = k[substrate][Nu⁻], second order overall. The nucleophile attacks from 180° opposite the leaving group in a single concerted step, inverting the stereochemistry at that carbon (Walden inversion). Favored by unhindered (methyl or primary) substrates, strong nucleophiles, and polar aprotic solvents that don't cage the nucleophile in a solvent shell.",
          ],
        },
        {
          heading: "SN1: stepwise, through a carbocation",
          body: [
            "Rate = k[substrate] only — first order, with the nucleophile absent from the rate law because it is not involved in the rate-determining step. The leaving group departs first, forming a planar carbocation intermediate that a nucleophile then attacks from either face, giving a racemized (or at least partially racemized) product. Favored by tertiary substrates (carbocation stability), weak nucleophiles, and polar protic solvents that stabilize the ionic intermediate.",
          ],
        },
        {
          heading: "The competing elimination pathways: E1 and E2",
          body: [
            "E2 is concerted, like SN2, and requires an anti-periplanar arrangement between the leaving group and the departing β-hydrogen. E1 shares SN1's carbocation intermediate, with a base removing a β-hydrogen only after that intermediate forms. Strong, bulky bases favor elimination over substitution outright, and Zaitsev's rule predicts the more substituted alkene as the major elimination product.",
          ],
        },
      ],
    },
  },
  {
    slug: "thermodynamics",
    index: "17",
    unit: "Kinetics & Reaction Dynamics",
    title: "Thermodynamics: Entropy, Enthalpy & Gibbs Free Energy",
    accent: "Gibbs Free Energy",
    description:
      "Whether a reaction happens at all — independent of how fast — is decided by one quantity, ΔG, that weighs energy released against disorder created. That same quantity is what ties kinetics back to the equilibrium constant.",
    topics: [
      "Second law of thermodynamics",
      "ΔG = ΔH − TΔS",
      "Boltzmann entropy (S = k_B ln W)",
      "ΔG° = −RT ln K",
    ],
    lesson: {
      significance: [
        "A reaction can be exothermic and still fail to proceed spontaneously, or endothermic and proceed anyway — enthalpy alone was never a sufficient criterion, which is exactly why nineteenth-century thermodynamics needed a second state function.",
        "Gibbs free energy is the single quantity that finally connects thermodynamics — does a reaction want to happen — back to the equilibrium constant K explored in the next unit, closing a loop this curriculum has been building toward since kinetics began.",
      ],
      theory: [
        {
          heading: "Entropy: Boltzmann's statistical definition",
          body: [
            "S = k_B ln W, where W is the number of microscopic arrangements consistent with a system's macroscopic state. Entropy is a direct count of probability, not a vague measure of disorder, and the second law of thermodynamics — ΔS_universe ≥ 0 for any spontaneous process — follows because higher-W states are simply overwhelmingly more likely to be observed.",
          ],
        },
        {
          heading: "Gibbs free energy and spontaneity",
          body: [
            "ΔG = ΔH − TΔS combines a reaction's enthalpy and entropy changes into a single spontaneity criterion equivalent to the second law: ΔG < 0 is spontaneous, ΔG > 0 is non-spontaneous (spontaneous in reverse), and ΔG = 0 is equilibrium. When ΔH and ΔS share the same sign, temperature can flip the sign of ΔG entirely, which is why some reactions are spontaneous only above or below a crossover temperature T = ΔH/ΔS.",
          ],
        },
        {
          heading: "The bridge to the equilibrium constant",
          body: [
            "More generally, ΔG = ΔG° + RT ln Q. At equilibrium ΔG = 0 and Q = K, which reduces this to ΔG° = −RT ln K — meaning the equilibrium constant is not an independent idea introduced separately in the next unit, but a direct restatement of a reaction's standard free energy change.",
          ],
        },
      ],
    },
  },

  // ── Equilibrium & Acid-Base Chemistry ────────────────────────────────────
  {
    slug: "equilibrium",
    index: "18",
    unit: "Equilibrium & Acid-Base Chemistry",
    title: "Dynamic Equilibrium",
    accent: "Equilibrium",
    description:
      "Watch forward and reverse rates equalize in a live 3D vessel, then connect the equilibrium constant Kc directly back to ΔG° via ΔG° = −RT ln K. Disturb pressure, temperature and concentration, and compare Qc to Kc to predict the response.",
    topics: ["Le Chatelier's principle", "Qc vs Kc", "ΔG° = −RT ln K", "Van't Hoff equation"],
    builtIn: "/equilibrium",
  },
  {
    slug: "acids-and-bases",
    index: "19",
    unit: "Equilibrium & Acid-Base Chemistry",
    title: "Acids, Bases & pH",
    accent: "pH",
    description:
      "Acidity is an equilibrium, not a category. Ka, Kb and Kw are algebraically linked, not independent facts to memorize, and a polyprotic acid is really several nested equilibria stacked on top of each other.",
    topics: ["Ka · Kb = Kw", "ΔG° = −RT ln Ka", "Polyprotic acids", "Leveling effect"],
    lesson: {
      significance: [
        "Blood held half a pH unit off its normal 7.4 is a medical emergency; soil pH decides which crops grow; ocean pH is falling measurably as carbon dioxide dissolves. Acid–base chemistry is equilibrium made consequential.",
        "The Brønsted–Lowry definition — an acid donates a proton, a base accepts one — replaced a patchwork of older ideas in 1923 and remains the working framework for chemists and biologists alike.",
      ],
      theory: [
        {
          heading: "Strength as an equilibrium position",
          body: [
            "A strong acid dissociates essentially completely, so its equilibrium lies far to the right; a weak acid reaches a genuine equilibrium described by Ka, and the smaller the Ka, the weaker the acid. Because Ka spans many orders of magnitude, chemists work with pKa = −log Ka instead, and pH = −log[H₃O⁺] with [H₃O⁺][OH⁻] = 1.0×10⁻¹⁴ at 25 °C fixes the familiar 0–14 scale.",
          ],
        },
        {
          heading: "Ka, Kb and Kw are not independent",
          body: [
            "For any conjugate acid–base pair, Ka·Kb = Kw. This is not an empirical coincidence — multiplying the acid's equilibrium expression by its conjugate base's equilibrium expression cancels the conjugate species algebraically and leaves exactly [H₃O⁺][OH⁻] = Kw. Knowing an acid's Ka therefore automatically fixes its conjugate base's Kb.",
          ],
        },
        {
          heading: "Polyprotic acids ionize in stages",
          body: [
            "A polyprotic acid like H₃PO₄ has three successive constants, Ka1 ≫ Ka2 ≫ Ka3, typically differing by a factor of roughly 10⁴–10⁵ at each stage, since removing a proton from an already-negative species is progressively harder electrostatically. Because the constants are so different, each ionization stage can almost always be treated as its own independent equilibrium rather than solved simultaneously.",
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
    index: "20",
    unit: "Equilibrium & Acid-Base Chemistry",
    title: "Buffers & Titration Curves",
    accent: "Buffers",
    description:
      "The Henderson–Hasselbalch equation is an exact algebraic identity, not an approximation, and buffer capacity is literally the derivative of added base with respect to pH — maximized exactly where that derivative is smallest.",
    topics: [
      "Henderson–Hasselbalch derivation",
      "Buffer capacity (dCb/dpH)",
      "Equivalence vs half-equivalence",
      "Polyprotic titration",
    ],
    lesson: {
      significance: [
        "Human blood is buffered by carbonic acid and bicarbonate, holding pH between 7.35 and 7.45 despite constant acid production by metabolism. Outside that window, enzymes lose their shape and stop working.",
        "The same chemistry stabilizes the oceans, laboratory growth media, and industrial fermentation — and titration curves are how buffer behavior is measured and unknown concentrations are determined.",
      ],
      theory: [
        {
          heading: "Deriving Henderson–Hasselbalch",
          body: [
            "Starting from Ka = [H₃O⁺][A⁻]/[HA], take the negative log of both sides: −log Ka = −log[H₃O⁺] − log([A⁻]/[HA]), i.e. pKa = pH − log([A⁻]/[HA]), which rearranges to pH = pKa + log([A⁻]/[HA]). This is an exact algebraic identity, not an approximation, as long as the concentrations used are the true equilibrium values rather than the initial ones.",
          ],
        },
        {
          heading: "Buffer capacity is a derivative",
          body: [
            "Buffer capacity β = dCb/dpH — how much strong base can be added per unit rise in pH — is maximized exactly at pH = pKa, where the ratio [A⁻]/[HA] is least sensitive to further addition, and falls off sharply once either component is nearly exhausted. That maximum is precisely the flat region of a titration curve, and the half-equivalence point (where pH = pKa exactly) is its center.",
          ],
        },
      ],
      simulation: {
        key: "blindTitration",
        heading: "Find the unknown",
        caption:
          "Titrate an unidentified acid and use the curve's landmarks to work out what it is.",
      },
    },
  },

  // ── Chemistry in the World ────────────────────────────────────────────
  {
    slug: "everyday",
    index: "21",
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

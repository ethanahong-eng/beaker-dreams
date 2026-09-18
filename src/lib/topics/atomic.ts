import type { Topic } from "./types";

/** Unit: Atomic Structure & Orbitals */
export const atomicTopics: Topic[] = [
  {
    slug: "quantum-atom",
    index: "01",
    unit: "Atomic Structure & Orbitals",
    title: "Beyond Bohr: The Quantum Atom",
    accent: "Quantum Atom",
    description:
      "Classical electrodynamics gives a Rutherford atom a lifetime of about 10⁻¹¹ s. Bohr's 1913 patch bought hydrogen a reprieve by decree; de Broglie's matter waves and Heisenberg's uncertainty relation replaced the decree with a reason, and replaced the orbit with a wavefunction.",
    topics: [
      "Wave–particle duality",
      "de Broglie wavelength",
      "Heisenberg uncertainty",
      "Failure of the Bohr model",
    ],
    lesson: {
      significance: [
        "Rutherford's 1911 scattering experiment left physics with an atom it could not defend. A compact positive nucleus with electrons somewhere outside it is stable under Newtonian gravity but not under Maxwell's equations: an orbiting electron accelerates, an accelerating charge radiates, and Larmor's formula puts the collapse time at roughly 10⁻¹¹ s. Bohr's response in 1913 was to postulate his way out — angular momentum comes only in multiples of ħ, and electrons in those allowed orbits simply do not radiate. The postulate was unjustified and the results were spectacular: hydrogen's Balmer and Lyman lines fell out exactly, and the Rydberg constant, until then a fitted empirical number, was suddenly predictable from m, e, ħ and ε₀ alone.",
        "The reprieve lasted about a decade. Bohr's model never produced a helium spectrum, never explained why some transitions are intense and others forbidden, and assigned the hydrogen ground state one unit of angular momentum when experiment later showed it has none. The resolution came from de Broglie's 1924 thesis, which gave every particle a wavelength λ = h/p, and from Davisson and Germer's 1927 nickel-crystal experiment, which diffracted electrons like X-rays and made the wavelength measurable. Heisenberg's uncertainty relation followed the same year. Between them they removed the orbit entirely and put a wavefunction in its place — and the same λ = h/p now sets the resolution limit of every electron microscope built since.",
      ],
      theory: [
        {
          heading: "Why a classical atom cannot survive a nanosecond",
          body: [
            "Larmor's formula gives the power radiated by a non-relativistic accelerating charge, P = e²a²/(6πε₀c³). An electron circling a proton at the Bohr radius a₀ = 52.9 pm has a centripetal acceleration near 9 × 10²² m/s², and integrating the resulting energy loss inward spirals the electron into the nucleus in about 10 picoseconds. Worse than the lifetime is the spectrum: as the orbit shrinks continuously, the orbital frequency rises continuously, so a classical atom should emit a smear of every frequency on its way down. Real hydrogen emits sharp lines at fixed wavelengths and then stops.",
            "Bohr's two postulates were aimed precisely at those two failures. Quantizing angular momentum as L = mvr = nħ selects a discrete set of radii rₙ = n²a₀, and declaring those orbits non-radiating makes them stable by fiat. Combining the quantization condition with the Coulomb force balance gives Eₙ = −13.6 eV/n² for hydrogen, and more generally Eₙ = −13.6 Z²/n² eV for any one-electron ion. A transition between levels then emits a photon of energy 13.6 eV (1/n₁² − 1/n₂²), which is the Rydberg formula with the Rydberg constant expressed in fundamental constants.",
            "Getting R_H right from first principles is not a small thing, and it is why Bohr's model survives in textbooks. But nothing in it explains where L = nħ comes from, and the model breaks the moment a second electron appears: helium has an electron–electron repulsion term that makes the problem non-separable, and the Bohr picture offers no approximation scheme, no account of spectral line intensities, no fine structure, and no mechanism for chemical bonding.",
          ],
        },
        {
          heading: "de Broglie: quantization as a standing-wave condition",
          body: [
            "De Broglie's proposal was a symmetry argument. Einstein's photoelectric work had given light, a wave, a particle momentum p = h/λ; de Broglie inverted it and gave every particle of momentum p a wavelength λ = h/p. For an electron accelerated through a potential V, λ = h/√(2meV), which works out to about 123 pm at 100 V — the same order as atomic spacings in a crystal, which is exactly why Davisson and Germer saw diffraction rings. For a 1 kg object moving at 1 m/s the same formula gives 6.6 × 10⁻³⁴ m, which is why nothing macroscopic behaves like a wave.",
            "The payoff for the atom is that Bohr's postulate stops being arbitrary. If the electron is a wave travelling around a circular orbit, the wave must close on itself to avoid destructive self-interference, which requires the circumference to hold a whole number of wavelengths: 2πr = nλ. Substituting λ = h/p gives 2πr = nh/(mv), which rearranges to mvr = nħ — exactly Bohr's condition, now derived from a wave rather than asserted.",
            "The standing-wave picture also explains why quantization does not require a special law. Any wave confined to a finite region has discrete allowed modes, whether it is an electron in an atom, a guitar string, or air in an organ pipe. Confinement plus boundary conditions produces a discrete spectrum, and the quantum numbers of the next topic are the atomic version of the harmonics of a string.",
          ],
        },
        {
          heading: "Uncertainty is a property of waves, not of clumsy measurement",
          body: [
            "Heisenberg's relation Δx·Δp ≥ ħ/2 is often taught as a statement about disturbance — the photon you bounce off the electron kicks it. That story, Heisenberg's own microscope thought-experiment, is at best a mnemonic and at worst wrong. The relation is a theorem about any pair of conjugate variables, and it follows from Fourier analysis before any measurement is mentioned: position and momentum are Fourier transforms of one another, and no function can be sharply peaked in both a variable and its transform. A pulse localized in time necessarily contains a wide band of frequencies. The same mathematics applied to ψ(x) and its momentum-space transform gives Δx·Δp ≥ ħ/2.",
            "The general statement is ΔA·ΔB ≥ ½|⟨[Â,B̂]⟩| for any two operators: incompatibility of observables is encoded in whether their operators commute, and x̂ and p̂ fail to commute by exactly iħ. Position and momentum are not jointly undetermined because instruments are imperfect; a state that has a definite value of one simply does not possess a definite value of the other. The energy–time relation ΔE·Δt ≥ ħ/2 is why short-lived excited states produce broadened spectral lines, an effect measured routinely in spectroscopy.",
            'Put numbers on an atom and the consequence for chemistry is immediate. Confining an electron to Δx ≈ 50 pm forces Δp ≳ ħ/(2Δx) ≈ 1 × 10⁻²⁴ kg·m/s, an uncertainty in speed of over 10⁶ m/s — comparable to the Bohr-model orbital speed itself. "The electron is here, moving that way" is therefore not an approximation in need of refinement; it is not a describable state. That same confinement cost also rescues the atom: squeezing the electron closer to the nucleus raises its kinetic energy as 1/Δx² while the Coulomb attraction only deepens as 1/r, so there is a finite radius that minimizes the total. Atomic size is the balance point of that trade.',
          ],
        },
        {
          heading: "What replaces the orbit",
          body: [
            "If a trajectory is not available, the complete description of the electron is a wavefunction ψ(r), a complex-valued function of position. Max Born's 1926 interpretation supplies the physical content: |ψ(r)|² is a probability density, so |ψ|² dV is the probability of finding the electron in a volume element dV, and the total probability over all space is normalized to one. Everything the electron can be asked about — average position, average energy, the chance of being found beyond a given radius — is an integral over ψ.",
            "This is what an orbital is. It is not a region the electron patrols, not a fuzzy orbit, and not a container. It is a one-electron wavefunction, and the familiar lobed pictures are contour surfaces of |ψ|², usually drawn to enclose 90% of the probability. The boundary is a choice of contour, not a physical wall; the wavefunction is nonzero, if vanishingly small, arbitrarily far from the nucleus.",
            "The remaining question is where ψ comes from. For a single electron in a Coulomb potential the answer is a differential eigenvalue problem, and its exact solution for hydrogen is what the next topic works through.",
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
        "Schrödinger published the hydrogen solution in a four-part series in 1926, and within months it had absorbed everything Bohr's model could do and everything it could not. Every subsequent rule in this unit — orbital shapes, node counting, subshell energies, the block structure of the periodic table — is a consequence of the solutions to one equation for one atom. Hydrogen is solvable in closed form only because it has exactly one electron in a purely radial 1/r potential. The moment a second electron is added, the 1/r₁₂ repulsion term couples the coordinates, no separation of variables exists, and every heavier atom is only ever approximated by reference to these same hydrogen-like solutions.",
        "That is the real reason this one derivation is worth following in detail. Hartree–Fock, density functional theory, and the basis sets in every modern computational chemistry package are all built from hydrogen-like functions, corrected for the electrons hydrogen does not have. And the quantum numbers are not a bookkeeping convention chemists invented to organize the table: each one falls out of demanding that the wavefunction be a physically admissible solution — single-valued, finite everywhere, and square-integrable — of a specific differential equation.",
      ],
      theory: [
        {
          heading: "What it means to call this an eigenvalue problem",
          body: [
            "The time-independent Schrödinger equation is Ĥψ = Eψ, with the hydrogen Hamiltonian Ĥ = −(ħ²/2μ)∇² − e²/(4πε₀r): a kinetic-energy operator plus the Coulomb attraction between electron and proton. (The mass μ is the reduced mass of the electron–proton pair, which is 0.9995 mₑ — small enough to ignore in chemistry, large enough that it shifts deuterium's spectral lines measurably from hydrogen's.)",
            'The equation says something narrower than "solve for ψ." It asks for the functions on which Ĥ acts as pure multiplication: apply the operator, get the same function back, scaled by a number. Those functions are the eigenfunctions and those numbers are the eigenvalues, and the eigenvalue E is the total energy the atom has when it is in that state — not an average over a range of possible energies but a definite value, because the state is an eigenstate of the energy operator. This is why energy is quantized rather than continuous: not every E admits an admissible solution, and the set that does is discrete for bound states.',
            "The sign convention matters. E is measured relative to a free electron and proton infinitely far apart, so every bound state has E < 0 and −E is the energy required to ionize. Above E = 0 the admissibility conditions stop restricting anything and the spectrum becomes continuous — that is the ionized atom, an unbound electron that can carry away any kinetic energy at all.",
          ],
        },
        {
          heading: "Why the equation separates, and what the separation costs",
          body: [
            "Separation of variables is not a generic trick; it works here because of a symmetry. The Coulomb potential depends on r alone and not on direction, so the Hamiltonian is invariant under any rotation about the nucleus. Rewriting ∇² in spherical coordinates makes that symmetry structural: the angular derivatives assemble into exactly the operator L̂², which commutes with Ĥ. Two operators that commute share eigenfunctions, so energy and angular momentum can be specified simultaneously, and the wavefunction can be written as a product ψ(r,θ,φ) = R(r)·Y(θ,φ).",
            "Substituting that product and dividing through leaves an equation in which one side depends only on r and the other only on angles. Two functions of independent variables can be equal for all values only if both equal the same constant, and that separation constant — which turns out to be l(l+1) — is the bridge between the two halves. It carries angular momentum into the radial equation as a centrifugal barrier term ħ²l(l+1)/(2μr²), which is why higher-l orbitals are pushed away from the nucleus.",
            "The price is exactly the thing that fails for every other atom. Add a second electron and the potential acquires a term in r₁₂, the distance between two electrons, which depends on both sets of coordinates at once. No product ansatz survives it, the separation constant does not exist, and helium has no closed-form solution to this day.",
          ],
        },
        {
          heading: "The three quantum numbers are boundary conditions, not labels",
          body: [
            "Each quantum number appears as the price of admissibility, and each comes from a different requirement. The azimuthal part of Y(θ,φ) goes as e^(imₗφ), and physical space has φ and φ + 2π as the same point, so single-valuedness forces mₗ to be an integer. The polar part is a Legendre equation whose solutions blow up at θ = 0 and π unless a series terminates; that truncation requires l to be a non-negative integer with |mₗ| ≤ l. The radial equation's solutions generically grow exponentially as r → ∞, which is not normalizable; killing the divergent term requires n to be a positive integer with n > l.",
            "None of these are assumptions put in by hand. Write down the differential equation, insist the answer be a function that describes something — single-valued, finite, and square-integrable — and the integers appear. This is the substantive difference between Bohr and Schrödinger: Bohr asserted an integer, Schrödinger derived three of them, and got the ground-state angular momentum right (l = 0 for 1s, where Bohr predicted ħ).",
            "Spin, mₛ, is the one quantum number that does not come from this equation. It emerges only from Dirac's relativistic treatment in 1928, and in non-relativistic chemistry it is grafted on as an extra two-valued degree of freedom — which is why the Pauli exclusion principle is stated as a separate rule rather than derived alongside n, l and mₗ.",
          ],
        },
        {
          heading: "Reading the answer: degeneracy that should not be there",
          body: [
            "Solving the radial equation under those constraints gives Eₙ = −(μe⁴)/(8ε₀²h²n²) = −13.6 eV/n², and the striking feature is what is missing. The energy depends on n alone. The 2s and 2p orbitals of hydrogen are exactly degenerate, as are 3s, 3p and 3d — an n²-fold degeneracy that is far larger than rotational symmetry alone can account for.",
            "Rotational symmetry guarantees only that the 2l+1 states of a given l share an energy; the extra degeneracy in l is specific to the 1/r potential and is called an accidental degeneracy, though it is not accidental at all. It reflects a hidden symmetry of the Coulomb problem, the conserved Laplace–Runge–Lenz vector, which is the same conserved quantity that keeps classical Kepler orbits from precessing.",
            "It also breaks instantly. Any deviation from a pure 1/r potential — the screening of the nucleus by other electrons in every atom heavier than hydrogen — lifts it, and the s < p < d ordering within a shell that drives the whole of electron configuration is the consequence. Hydrogen's degeneracy is the special case; the periodic table is built on its removal.",
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
        "The familiar s-sphere, p-dumbbell and d-cloverleaf are not drawing conventions. They are |Y_l^{mₗ}(θ,φ)|², the spherical harmonics that solve the angular equation of the previous topic, and the same functions describe angular momentum wherever it appears — a hydrogen electron, a rotating molecule in a microwave spectrum, the multipole expansion of a planet's gravitational field. What chemistry calls orbital shape is a general property of rotational symmetry that the atom happens to display.",
        "Node counting is the practical payoff. It lets a chemist read an orbital's quantum numbers off a picture, and it is not confined to diagrams: the shell structure that radial nodes produce is what X-ray photoelectron spectroscopy measures directly, and the differing penetration of 3s, 3p and 3d that follows from those nodes is the reason the periodic table has a d-block that starts where it does.",
      ],
      theory: [
        {
          heading: "Angular nodes fix the letter; radial nodes fix the rest",
          body: [
            "A node is a surface on which ψ is exactly zero and changes sign across it, and the two kinds come from the two factors of ψ = R(r)·Y(θ,φ). Angular nodes are planes or cones on which Y vanishes, and their count is exactly l: zero for s (l = 0, no angular dependence at all, hence a sphere), one for p (a single nodal plane through the nucleus, producing the two lobes of opposite sign), two for d, three for f. Each added angular node cuts the angular function again, which is why the lobe count climbs from 2 to 4 to 6 and up.",
            "Radial nodes are spherical shells at fixed radii where R(r) = 0, and their count is n − l − 1. The total is therefore always n − 1, independent of which orbital within a shell: 2s has 1 radial and 0 angular; 2p has 0 radial and 1 angular; 3s has 2 and 0; 3p has 1 and 1; 3d has 0 and 2. This is not a coincidence to memorize. The radial function R_{n,l} is an exponential times r^l times an associated Laguerre polynomial of degree n − l − 1, and a polynomial of degree n − l − 1 has exactly that many positive roots here, while Y_l contributes l sign changes over the angles. The two counts are forced to sum to n − 1.",
            "The rule is invertible, which is what makes it useful: any orbital's full nodal structure can be reconstructed from its name, and any picture with a known node count identifies its orbital. Four lobes in a plane with two nodal planes and no spherical node is 3d; the same four lobes with one spherical node added is 4d. The f orbitals continue the pattern with three angular nodes and correspondingly complicated lobe structures, which is why they are drawn far less often than they are used.",
          ],
        },
        {
          heading: "Where is the electron, actually? The r² factor changes the answer",
          body: [
            'There are two different questions hiding in "where is the electron," and they have different answers. The probability density at a point is |ψ(r)|², which for a 1s orbital is largest at r = 0 — the electron is more likely to be found in a given cubic picometre at the nucleus than anywhere else. But nobody measures a cubic picometre at a point; the chemically meaningful question is the probability of finding the electron somewhere in a thin shell at distance r, and a shell at radius r has surface area 4πr².',
            "That gives the radial distribution function, P(r) = 4πr²|R(r)|², and the r² factor is doing real work. Near the nucleus |R|² is large but the shell volume goes to zero; far out the shell is enormous but |R|² has decayed exponentially. The product peaks in between. For hydrogen's 1s orbital the peak sits at exactly r = a₀ = 52.9 pm, recovering the Bohr radius — not as an orbit, but as the most probable distance. The two answers are both correct and both useful: |ψ|² governs anything evaluated at the nucleus (hyperfine coupling, Mössbauer isomer shifts), while P(r) governs size, overlap and shielding.",
            "P(r) also makes radial nodes visible as structure rather than as an abstraction. A 2s radial distribution has a small inner maximum near 0.8 a₀, then drops to exactly zero at the radial node, then rises to a much larger outer maximum. That inner bump — a genuine, if small, chance of finding a 2s electron deep inside the 1s shell — is the entire mechanism of the next section.",
          ],
        },
        {
          heading: "Penetration and shielding: why s beats p beats d in real atoms",
          body: [
            "In hydrogen, 2s and 2p are degenerate. In lithium they are not, and the reason is the inner maxima. Near the nucleus a 2p orbital's radial function is suppressed by a factor of r^l = r, and more generally R_{n,l} ∝ r^l as r → 0, so the higher the angular momentum the harder the centrifugal barrier pushes the electron out of the core region. A 2s electron, with l = 0 and no such suppression, spends part of its time inside the 1s shell, where it is not screened and feels close to the full nuclear charge Z rather than the screened Z − 2.",
            "That is penetration, and it lowers the orbital's energy in proportion to how much of it happens. The ordering it produces within a shell is ns < np < nd < nf, and the effect grows with n: by the fourth shell, 4s penetrates enough to sit below 3d in the neutral atoms at the start of the transition series, which is the whole reason potassium and calcium fill 4s before scandium starts on 3d.",
            "Shielding is the same phenomenon from the other electron's point of view. An inner electron screens an outer one effectively only if it is genuinely inside it — a spatially diffuse electron in the same shell screens poorly, which is exactly what Slater's empirical 0.35-per-same-shell and 0.85-per-inner-shell coefficients encode. Penetration and shielding together are the two mechanisms that convert hydrogen's clean Eₙ = −13.6/n² into the subshell energies that the next topic fills.",
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
        "The electron–electron repulsion term makes the many-body Schrödinger equation non-separable for every atom past hydrogen, so no configuration is exact. What chemistry calls an electron configuration is a label for a single determinant built from hydrogen-like orbitals, each one corrected for how much of the nuclear charge its electron actually feels. It is an approximation that happens to be an extraordinarily good one — good enough that the periodic table's entire block structure is readable off it.",
        "The trends usually memorized as arrows across a chart are computable consequences of one number per electron: the effective nuclear charge Zeff. Slater wrote down empirical rules for estimating it in 1930, and they still reproduce the direction and rough magnitude of atomic radius, ionization energy and electronegativity across the whole table. Where the trends break — boron below beryllium, oxygen below nitrogen, chromium and copper refusing to follow the filling order — the breaks are as informative as the rules, and each one has a specific energetic cause.",
      ],
      theory: [
        {
          heading: "Three rules, and what each one is actually doing",
          body: [
            "The Aufbau principle fills the lowest-energy available orbital first, in an order approximated by increasing n + l and, for ties, by increasing n. This ordering is empirical rather than derived; it summarizes the penetration and shielding effects of the previous topic, and it is the least fundamental of the three rules.",
            "The Pauli exclusion principle is the fundamental one. It is not a cap of two electrons per orbital but a statement that the total wavefunction of a system of fermions must be antisymmetric under exchange of any two of them. The two-per-orbital limit is a corollary: an antisymmetric wavefunction vanishes identically if two electrons share all four quantum numbers. Pauli's principle is also why matter occupies volume at all, and it enters chemistry again as the short-range repulsion between closed shells.",
            "Hund's rule of maximum multiplicity fills a set of degenerate orbitals singly with parallel spins before pairing any of them. The usual justification — parallel electrons in different orbitals repel less — is only half of it. The larger effect is exchange energy, a purely quantum term with no classical analogue that stabilizes every pair of same-spin electrons by an amount K. Since a set of N parallel spins contains N(N−1)/2 such pairs, the stabilization grows quadratically with the number of unpaired electrons, which is why the effect is strongest at half-filled subshells.",
          ],
        },
        {
          heading: "Effective nuclear charge, computed rather than asserted",
          body: [
            "Zeff = Z − S, where S is the shielding constant. Slater's rules estimate S by sorting the electrons into groups ((1s)(2s,2p)(3s,3p)(3d)(4s,4p)…) and assigning 0.35 per other electron in the same group, 0.85 per electron in the shell one below (for s and p electrons), and 1.00 for everything deeper. Electrons in groups above the one in question contribute nothing.",
            "Run it on sodium's valence electron, 1s²2s²2p⁶3s¹: nothing else in the 3s,3p group, so 0 × 0.35, plus 8 × 0.85 from the n = 2 shell, plus 2 × 1.00 from 1s, giving S = 8.80 and Zeff = 11 − 8.80 = 2.20. Run it on a 3p electron in chlorine, 1s²2s²2p⁶3s²3p⁵: six other electrons in the 3s,3p group give 6 × 0.35 = 2.10, the n = 2 shell gives 8 × 0.85 = 6.80, and 1s gives 2.00, so S = 10.90 and Zeff = 17 − 10.90 = 6.10.",
            "Across one period the principal quantum number never changes, and Zeff nearly triples. That single number is why the atomic radius falls from about 190 pm at sodium to about 100 pm at chlorine, and why the first ionization energy climbs from 496 kJ/mol to 1251 kJ/mol over the same stretch. Down a group the competition runs the other way: Zeff rises slowly but n rises by a full unit, the new shell sits farther out with more nodes, and size wins — which is why radius increases down a group even though the nucleus is much more highly charged.",
          ],
        },
        {
          heading: "4s before 3d, and 4s out first: not a contradiction",
          body: [
            "The standard puzzle is that potassium and calcium fill 4s before 3d, yet Fe²⁺ is [Ar]3d⁶ rather than [Ar]3d⁴4s². Both are true, and the reason is that orbital energies are not fixed properties of an element — they depend on the nuclear charge and on which other orbitals are occupied. In neutral K and Ca the 3d orbitals are still compact and high-lying while 4s penetrates well, so 4s fills first. As Z rises across the transition series, 3d contracts and drops rapidly below 4s, so in a scandium atom the 3d level is already the lower one.",
            "Why does scandium then keep two electrons in 4s at all? Because the Aufbau ordering is a statement about total energy, not about one-electron orbital energies. The 3d orbitals are spatially compact, so putting extra electrons there costs a large electron–electron repulsion; the 4s orbital is diffuse and the repulsion penalty there is much smaller. The configuration that minimizes the sum wins, and for neutral atoms it is usually the one with a partly occupied 4s.",
            'Ionization removes that argument. Take electrons away and the repulsion penalty shrinks while the orbital-energy ordering, 3d below 4s, stays. So the electrons leave from 4s first, every time, across the whole first transition series. The correct mental model is not "4s is lower than 3d" but "4s is the outermost, most diffuse orbital in these atoms, and total energy decides what is occupied."',
          ],
        },
        {
          heading: "Chromium and copper: exchange energy, not half-full mysticism",
          body: [
            'Chromium is [Ar]3d⁵4s¹ rather than 3d⁴4s², and copper is [Ar]3d¹⁰4s¹ rather than 3d⁹4s². The usual explanation, that half-filled and filled subshells are "especially stable," restates the observation instead of explaining it. The mechanism is exchange energy, and it can be counted. In 3d⁴4s², the four parallel d electrons give 4 × 3/2 = 6 same-spin pairs; in 3d⁵4s¹, five parallel d electrons give 5 × 4/2 = 10, plus further same-spin pairing with the lone 4s electron. Each pair is worth an exchange stabilization K, so the promotion buys several K while costing only the small 4s–3d energy gap — and it simultaneously removes a pair of electrons from the same 4s orbital, saving their mutual repulsion.',
            "That accounting also explains why the exceptions are not universal. The balance between exchange gain, orbital-energy cost and pairing repulsion is close, and different elements land on different sides of it: niobium is 4d⁴5s¹, palladium is 4d¹⁰5s⁰ with no s electron at all, and platinum is 5d⁹6s¹ rather than the 5d¹⁰6s¹ the copper analogy would predict. A rule about half-filled shells cannot accommodate palladium; an energy balance can.",
            "The same exchange bookkeeping resolves the two famous ionization-energy anomalies. Boron's first ionization energy (801 kJ/mol) lies below beryllium's (900 kJ/mol) because boron's outermost electron is a poorly penetrating 2p rather than a 2s. Oxygen's (1314 kJ/mol) lies below nitrogen's (1402 kJ/mol) because oxygen's 2p⁴ forces two electrons into one orbital: removing one relieves that pairing repulsion and restores a fully parallel 2p³ set, whereas ionizing nitrogen destroys a maximally exchange-stabilized configuration. Both anomalies are electron–electron effects, and neither is visible in a Zeff argument alone.",
          ],
        },
      ],
    },
  },
];

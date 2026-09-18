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
        "A few years after Bohr's model, a solution came, which involved describing atoms with both wave and particle behaviors. It was determined that electrons do not orbit fixed path as Bohr suggested, and the actual location of an electron could not be determined (Heisenberg's Uncertainty Principle).  When we discuss orbitals and their shapes, they are not definite locations, but rather a plot of the probability of finding an electron in a certain place.",
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
];

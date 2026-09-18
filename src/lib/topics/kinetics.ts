import type { Topic } from "./types";

/** Unit: Kinetics & Reaction Dynamics */
export const kineticsTopics: Topic[] = [
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
];

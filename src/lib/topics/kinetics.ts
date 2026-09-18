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
        "Ludwig Wilhelmy measured the first rate law in 1850, following the inversion of sucrose in acid with a polarimeter and finding that the rate at every instant was proportional to the sugar still present. Thirty-four years later Jacobus van 't Hoff's Études de dynamique chimique gave the idea its modern shape — reaction order as a measured exponent, and rate constants as the quantity that actually characterises a reaction — work that would earn him the first Nobel Prize in Chemistry in 1901.",
        "Rate laws are how chemistry becomes quantitative about time. A drug's dose interval is set by its clearance kinetics: most drugs clear first order, so a fixed fraction leaves per hour and a single half-life describes the whole curve, while ethanol saturates the enzyme that metabolises it and clears zero order, at a nearly constant grams-per-hour rate no matter how much you drank. Shelf lives, concrete curing schedules, atmospheric ozone budgets and radiocarbon dates all rest on the same small set of integrated equations.",
      ],
      theory: [
        {
          heading: "Rate law and stoichiometry are unrelated quantities",
          body: [
            "For aA + bB → products, the reaction rate is defined so that it does not depend on which species you happen to watch: rate = −(1/a)d[A]/dt = −(1/b)d[B]/dt = (1/c)d[C]/dt. That definition is the only place stoichiometric coefficients enter. The rate law itself — rate = k[A]ᵐ[B]ⁿ — is an experimental result, and m and n have no general relationship to a and b.",
            "The decomposition 2N₂O₅ → 4NO₂ + O₂ is first order in N₂O₅, not second. The gas-phase formation of hydrogen bromide, H₂ + Br₂ → 2HBr, obeys rate = k[H₂][Br₂]^(1/2)/(1 + k′[HBr]/[Br₂]): a half-power, a term in the product, and no integer order at all. Coefficients cannot produce exponents like these, because a balanced equation describes bookkeeping over the whole transformation while a rate law describes one molecular event — the slowest one.",
            "The single exception proves the rule. For an elementary step, one that really is a single molecular encounter, the molecularity does fix the rate law. That is why measuring a rate law is worth so much: it is a direct experimental window onto the composition of the transition state of the rate-determining step.",
          ],
        },
        {
          heading: "How order is actually determined in the laboratory",
          body: [
            "The method of initial rates isolates one variable at a time. Run the reaction at several starting compositions, measure the slope of concentration against time extrapolated back to t = 0 — early enough that no products have accumulated and no reverse reaction interferes — and compare pairs of runs that differ in only one concentration. The order follows from the ratio directly: m = ln(rate₂/rate₁)/ln([A]₂/[A]₁). Doubling [A] and seeing the rate double gives m = 1; quadruple gives m = 2; a rate that does not move gives m = 0.",
            "The second technique tests the whole curve rather than its first instant. Each integrated rate law is linear in a different function of concentration, so plot all three: [A] against t, ln[A] against t, and 1/[A] against t. Exactly one comes out straight, and that plot identifies the order while its slope delivers k. This linearised-plot test is the stronger evidence, because it must hold over the entire run, not just at the start — a mechanism that changes as products build up will bend a plot that the initial-rate method would have certified as clean.",
            "When a reaction has several reactants, the isolation method combines the two: flood the mixture with a large excess of everything except one species, so those concentrations stay effectively constant and get absorbed into a pseudo-order rate constant. What remains is a single-reactant problem that the linearised plots can settle. Repeat for each reactant in turn and the full rate law is assembled piece by piece.",
          ],
        },
        {
          heading: "From differential to integrated rate laws",
          body: [
            "A differential rate law describes an instant; an integrated rate law describes a history. Each order separates and integrates directly. First order: −d[A]/dt = k[A] becomes d[A]/[A] = −k dt, integrating to ln[A] = ln[A]₀ − kt, that is [A] = [A]₀e^(−kt). Second order in a single reactant: −d[A]/dt = k[A]² becomes d[A]/[A]² = −k dt, integrating to 1/[A] = 1/[A]₀ + kt. Zero order integrates trivially to [A] = [A]₀ − kt.",
            "The units of k are not decorative — they encode the order and are a free consistency check on any answer. Since rate always carries units of M s⁻¹, k for an overall order n must carry M^(1−n) s⁻¹: M s⁻¹ for zero order, s⁻¹ for first, M⁻¹ s⁻¹ for second. A rate constant reported in s⁻¹ cannot belong to a second-order process.",
            "First order is the one case in which the rate constant is independent of concentration units entirely, which is why exponential decay shows up identically in radioactive nuclei, excited-state fluorescence, and drug elimination. Those systems share no chemistry at all; they share a differential equation.",
          ],
        },
        {
          heading: "Half-life depends on order, and that dependence is diagnostic",
          body: [
            "Set [A] = [A]₀/2 in each integrated law. First order gives t½ = ln2/k, with [A]₀ cancelling entirely — every half-life is the same length, which is exactly why a single number characterises radioactive decay and most drug clearance. Second order gives t½ = 1/(k[A]₀), so each successive half-life is twice as long as the one before, and the reaction develops a long, slow tail. Zero order gives t½ = [A]₀/2k, so each half-life is half the previous one and the reaction ends abruptly.",
            "Watching successive half-lives is therefore an order test that needs no plotting software and no initial-rate measurements. Constant half-life means first order; doubling means second; halving means zero. In pharmacokinetics that distinction is the difference between a safe dosing interval and an overdose: a drug that saturates its metabolic enzyme leaves zero order, and doubling the dose more than doubles the time it lingers.",
          ],
        },
        {
          heading: "What a rate law can and cannot tell you",
          body: [
            "A measured rate law constrains the transition state of the rate-determining step — its elemental composition and charge — and nothing else directly. Steps that occur after the rate-determining step are kinetically invisible, because whatever happens quickly downstream cannot control the throughput of the whole sequence. This is why a rate law can rule mechanisms out decisively but can never single one out as proven.",
            "Two further features carry information. A species that appears in the rate law but not in the balanced equation is a catalyst, and its order reveals how many molecules of it are involved before the bottleneck. A species that appears with a negative order — HBr in the hydrogen bromide rate law above — is inhibiting the reaction by consuming an intermediate, and that alone establishes that an intermediate exists. Those inferences carry directly into the mechanism chapter, where the observed rate law becomes the test every proposal has to survive.",
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
        "Knowing a mechanism is the difference between observing chemistry and controlling it. Ammonia synthesis was optimised once Haber and Bosch established that the bottleneck was dissociative adsorption of N₂ on iron rather than any step involving hydrogen; the ban on chlorofluorocarbons followed from Molina and Rowland's 1974 demonstration that a single chlorine atom runs a catalytic cycle destroying ozone thousands of times over before it is scavenged. Neither conclusion is visible in a balanced equation.",
        "Mechanisms are never observed whole. They are inferred from rate laws, isotope labelling, kinetic isotope effects, trapped or spectroscopically detected intermediates, and stereochemical outcomes — and increasingly from femtosecond spectroscopy, which since Ahmed Zewail's work in the late 1980s has resolved the passage over a transition state in real time. A proposed mechanism is a scientific hypothesis in the strict sense: it survives exactly as long as it keeps reproducing the data, and one rate law it cannot explain kills it.",
      ],
      theory: [
        {
          heading: "Elementary steps, molecularity, and what counts as an intermediate",
          body: [
            "An elementary step is a single molecular event with no isolable species in between — one bond breaking, one collision, one rearrangement. For an elementary step only, the rate law follows from the stoichiometry: unimolecular A → P gives rate = k[A]; bimolecular A + B → P gives rate = k[A][B]. Termolecular steps are written occasionally but are genuinely rare, because the probability of three bodies arriving simultaneously with the right energy and orientation is tiny; where they appear, as in atom recombination 2I + M → I₂ + M, the third body M is an inert collision partner whose only job is to carry away the released energy.",
            "A valid mechanism must satisfy two conditions: its elementary steps must sum to the observed overall equation, and the rate law it predicts must match the measured one. Species produced in one step and consumed in a later one are intermediates. They appear in the mechanism, never in the overall equation, and are usually present at vanishing concentrations.",
            "Distinguish an intermediate from a transition state. An intermediate sits in a local minimum on the potential-energy surface — it has a real, if brief, lifetime, and can in principle be trapped or detected. A transition state sits at a saddle point, a maximum along the reaction coordinate, and has no lifetime at all: it is a configuration the system passes through, not a molecule it becomes. Also distinguish an intermediate from a catalyst: a catalyst is consumed early and regenerated late, so it appears in the mechanism and may appear in the rate law, but its concentration is unchanged at the end.",
          ],
        },
        {
          heading: "The rate-determining step and the pre-equilibrium approximation",
          body: [
            "When one elementary step is far slower than the rest, it throttles the whole sequence, and the overall rate is simply that step's rate. If the slow step comes first, the rate law is read straight off it. The complication arises when the slow step is preceded by a fast, reversible one, because the slow step's rate law then contains an intermediate — a quantity no experiment reports.",
            "The pre-equilibrium approximation resolves this by assuming the fast first step stays essentially at equilibrium throughout, so [intermediate] = K₁[reactants] with K₁ = k₁/k₋₁. The oxidation 2NO + O₂ → 2NO₂ is the standard illustration. It is observed to be third order overall, rate = k[NO]²[O₂], which looks termolecular and is not: a fast pre-equilibrium 2NO ⇌ N₂O₂ followed by a slow N₂O₂ + O₂ → 2NO₂ gives rate = k₂K₁[NO]²[O₂], reproducing the observed order through two ordinary bimolecular events.",
            "The approximation is only legitimate when the intermediate really does re-equilibrate faster than it is consumed, that is when k₋₁ ≫ k₂[O₂]. Outside that regime it gives the wrong answer, and the assumption is not always easy to check in advance.",
          ],
        },
        {
          heading: "Where the steady-state approximation beats pre-equilibrium",
          body: [
            "The steady-state approximation makes a weaker assumption and therefore covers more ground. Rather than declaring which step is slow, it sets the net rate of change of each reactive intermediate to zero, d[I]/dt ≈ 0 — justified whenever the intermediate is so reactive that it is consumed almost as fast as it is formed, so its concentration stays small and nearly constant after a brief induction period. Solve the resulting algebraic equation for [I] in terms of stable species, substitute into the product-forming step, and a rate law falls out of the proposed mechanism with no guess about the bottleneck at all.",
            "The Lindemann–Hinshelwood mechanism for a gas-phase unimolecular decomposition shows why this matters. Collisional activation A + M ⇌ A* + M is followed by A* → P, and steady state on A* gives rate = k₂k₁[A][M]/(k₋₁[M] + k₂). That single expression contains two experimentally observed regimes. At high pressure, k₋₁[M] ≫ k₂, the denominator collapses to k₋₁[M], and the rate becomes k₂k₁[A]/k₋₁ — cleanly first order, with [M] cancelling out. At low pressure, k₂ ≫ k₋₁[M], and the rate becomes k₁[A][M] — second order, because activation itself has become the bottleneck. Pre-equilibrium reproduces only the high-pressure limit, since assuming the first step equilibrates is precisely the assumption that fails as pressure drops.",
            "That is the general pattern. Pre-equilibrium is a special case of the steady state, recovered whenever one return rate dominates the denominator. Whenever the competition between an intermediate's two fates changes with conditions — pressure, concentration, added inhibitor — only the steady-state expression tracks it, and the shape of the resulting denominator is itself a prediction the experiment can test.",
          ],
        },
        {
          heading: "How an observed rate law falsifies a mechanism",
          body: [
            "The logic runs one way only. Derive the rate law the mechanism predicts, compare it with the measured one, and any mismatch is fatal. Agreement is not proof, because more than one mechanism can predict the same rate law; such mechanisms are called kinetically indistinguishable, and separating them requires evidence of a different kind.",
            "Take 2NO₂ + F₂ → 2NO₂F, measured to follow rate = k[NO₂][F₂]. A single termolecular step would predict rate = k[NO₂]²[F₂], second order in NO₂, and is therefore excluded outright by the data. A two-step proposal — slow NO₂ + F₂ → NO₂F + F, then fast F + NO₂ → NO₂F — sums correctly to the overall equation and predicts exactly the observed first-order dependence on each reactant. It survives, which is a weaker and more honest claim than being true.",
            "The evidence that breaks ties comes from outside rate measurements. Isotopic labelling shows which atoms end up where. A primary kinetic isotope effect, k_H/k_D of roughly 6 to 8 at room temperature, establishes that a C–H bond is being broken in the rate-determining step. Trapping an intermediate with a reagent that intercepts it, or detecting it spectroscopically, turns a postulated species into an observed one. Stereochemical outcome, as the next topic shows, can be the sharpest discriminator of all.",
          ],
        },
        {
          heading: "Arrhenius, transition-state theory, and what a catalyst really does",
          body: [
            "Arrhenius's 1889 empirical relation, k = Ae^(−Ea/RT), separates a rate constant into a barrier term and a frequency term. The exponential is the fraction of collisions carrying at least Ea, drawn from the Maxwell–Boltzmann distribution, and it is why modest temperature increases produce dramatic rate increases: raising T fattens the high-energy tail far more than it shifts the average. Plotting ln k against 1/T gives a straight line of slope −Ea/R, which is how activation energies are measured.",
            "The pre-exponential factor A is not merely a collision frequency. Simple collision theory predicts A from the collision rate alone and routinely overestimates observed rates by orders of magnitude, so a steric factor p is introduced to account for the fraction of collisions that arrive in a reactive geometry. Transition-state theory makes that correction quantitative rather than empirical: k = (k_B T/h)e^(−ΔG‡/RT), and splitting ΔG‡ = ΔH‡ − TΔS‡ shows that the geometric requirement lives in the entropy of activation. A transition state that demands two molecules be tightly and specifically oriented has a large negative ΔS‡ and hence a small A; a unimolecular fragmentation whose transition state is looser than the reactant can have ΔS‡ positive.",
            "A catalyst does not lower the barrier on the existing path. It opens a different path — a different sequence of elementary steps, with its own intermediates and its own transition states, whose highest point lies below the uncatalysed one. The catalyst is consumed in an early step and regenerated in a later one, which is why a trace can turn over millions of molecules. Because ΔG° depends only on initial and final states, a catalyst cannot shift an equilibrium: it accelerates the forward and reverse reactions by exactly the same factor, changing how quickly equilibrium is reached and never where it lies. This is also why enzymes are described as stabilising the transition state rather than the substrate — binding the reactant too tightly deepens a well and slows the reaction down.",
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
        "Substitution and elimination compete constantly in synthesis, and predicting which product forms — and with what stereochemistry — from the reaction conditions alone is the first genuinely predictive skill organic chemistry offers. Everything downstream, from building a drug candidate to reading someone else's synthetic route, depends on it.",
        "Edward Hughes and Christopher Ingold established the framework at University College London in the 1930s, by the unglamorous route of measuring rate laws. Some substitutions gave rate = k[substrate][nucleophile]; others, on the same kind of substrate with a different alkyl group, gave rate = k[substrate] with the nucleophile entirely absent from the rate law. Two rate laws meant two mechanisms, and Ingold's names for them — SN1 and SN2, for substitution, nucleophilic, unimolecular and bimolecular — were coined decades before any transition state could be observed. Paul Walden's 1896 discovery that a substitution could invert an optically active centre supplied the stereochemical half of the proof.",
      ],
      theory: [
        {
          heading: "All four mechanisms are the same electron move, arranged differently",
          body: [
            "A nucleophile is a Lewis base looking for a nucleus: an electron-rich species donating a lone pair or π bond. An electrophile is the electron-poor partner that accepts it. In an alkyl halide the electrophilic site is the carbon bearing the leaving group, made δ+ by the electronegativity of the halogen, and the orbital that accepts the incoming electron density is the σ* antibonding orbital of the C–X bond.",
            "That orbital is the reason backside attack is not a convention but a requirement. The large lobe of σ*(C–X) points directly away from X, so the nucleophile's filled orbital overlaps it best along the line 180° opposite the leaving group. Donating electrons into an antibonding orbital simultaneously forms the new bond and breaks the old one — which is precisely what a concerted substitution is.",
            "Two independent binary choices generate the four mechanisms. Concerted or stepwise: does the leaving group depart in the same step as the new bond forms, or first, generating a carbocation? Substitution or elimination: does the reagent attack carbon as a nucleophile, or abstract a β-hydrogen as a base? SN2 is concerted substitution, rate = k[RX][Nu⁻]. SN1 is stepwise substitution, rate = k[RX], with the nucleophile absent because it enters after the rate-determining ionisation. E2 is concerted elimination, rate = k[RX][base]. E1 is stepwise elimination, rate = k[RX], sharing SN1's carbocation and therefore its rate law exactly.",
          ],
        },
        {
          heading: "Leaving-group ability is conjugate-base stability in disguise",
          body: [
            "A leaving group departs with the bonding electron pair, so it leaves as an anion or a neutral molecule that must absorb that charge. The better it stabilises the pair, the more willingly it goes — which means leaving-group ability tracks the weakness of the departing species as a base, and therefore tracks the pKa of its conjugate acid.",
            "Among the halides this gives I⁻ > Br⁻ > Cl⁻ ≫ F⁻, following the increasing size and polarisability that spread the charge out, and inversely following basicity. Sulfonates are better still: tosylate and especially triflate delocalise the negative charge over three oxygens, and triflate's conjugate acid has a pKa around −14, making it one of the best leaving groups in routine use.",
            "Hydroxide is a terrible leaving group — its conjugate acid, water, has pKa 15.7 — which is why alcohols do not undergo substitution directly. Protonating the alcohol converts the leaving group from HO⁻ to H₂O, whose conjugate acid H₃O⁺ has pKa −1.7, a swing of seventeen pKa units; converting it to a tosylate achieves the same thing without acid, and without the carbocation rearrangements strong acid invites. Amines are worse still and are usually exhaustively methylated to a quaternary ammonium first, so that a neutral amine leaves instead of an amide ion.",
          ],
        },
        {
          heading: "Carbocation stability decides whether the stepwise path exists at all",
          body: [
            "SN1 and E1 both require ionisation to a carbocation, an sp² carbon with an empty p orbital and only six valence electrons. Its stability is set by how much electron density the neighbouring groups can push into that empty orbital: alkyl groups do so by hyperconjugation, donating C–H σ density into the vacant p orbital, and by induction. The result is the familiar order tertiary > secondary > primary > methyl, spanning enormous rate differences — tert-butyl systems solvolyse millions of times faster than isopropyl ones. Resonance beats alkyl substitution entirely: allylic and benzylic cations delocalise the charge into a π system, and even primary benzylic substrates can ionise.",
            "Primary and methyl carbocations are so unstable that SN1 and E1 are simply unavailable to those substrates. That single fact does most of the work in predicting products: a primary halide reacts by SN2 or E2 or not at all, while a tertiary halide cannot react by SN2 because the crowded carbon blocks backside approach.",
            "A free carbocation also rearranges. A 1,2-hydride or 1,2-alkyl shift converts a less stable cation into a more stable one, and the migration is fast enough to compete with capture by the nucleophile. The consequence is diagnostic: if the product has a carbon skeleton different from the substrate's, a free carbocation existed, and the mechanism was SN1 or E1. Conversely, a substitution that returns a completely unrearranged skeleton where rearrangement would have been favourable is evidence against a free carbocation, and therefore evidence for a concerted path.",
          ],
        },
        {
          heading: "Stereochemistry is the sharpest evidence of all",
          body: [
            "SN2 inverts configuration at the reacting carbon, every time. The nucleophile arrives opposite the leaving group and the three remaining substituents sweep through the plane like an umbrella turning inside out — the Walden inversion. Starting from an enantiomerically pure substrate, the product is enantiomerically pure with the opposite spatial arrangement. (Whether the R/S label flips as well depends on priority order, which is a naming artefact, not a mechanistic one.)",
            "SN1 racemises, because the planar carbocation has two equivalent faces. In practice the racemisation is rarely complete: product mixtures typically show a modest excess of the inverted product, because the leaving group lingers as an ion pair on the face it just vacated and partially shields it until solvent separates the pair. That excess is itself evidence — it establishes that the cation is captured before it has become fully free and symmetric.",
            "E2 imposes the strictest geometric demand of the four: the β-hydrogen and the leaving group must be anti-periplanar, dihedral angle 180°, so that the developing C–H σ orbital aligns with σ*(C–X) as the π bond forms. In a cyclohexane ring this means both must be axial, and the requirement can override everything else. Menthyl chloride has only one β-hydrogen that can become anti-periplanar to an axial chlorine, and it eliminates slowly to give the less substituted alkene exclusively; its diastereomer neomenthyl chloride, which can place the chlorine axial with two accessible anti-periplanar hydrogens, eliminates far faster and gives the more substituted product. Same atoms, different geometry, different answer.",
          ],
        },
        {
          heading: "Zaitsev, Hofmann, and the four variables that settle every case",
          body: [
            "When more than one alkene can form, Zaitsev's rule predicts the more substituted one, because alkene stability rises with substitution through hyperconjugation. That is the outcome with small bases such as ethoxide, and with E1, where the product distribution reflects the relative stabilities of the alkenes themselves. A bulky base inverts the preference: tert-butoxide or LDA cannot reach the more hindered internal β-hydrogen and removes the more accessible terminal one instead, giving the less substituted Hofmann product. A bulky or positively charged leaving group has the same effect, which is why exhaustive methylation followed by elimination — the classical Hofmann elimination — reliably yields the terminal alkene.",
            "Four variables decide the competition. Substrate: methyl and primary can only do SN2 or E2; tertiary can do SN1, E1 or E2 but never SN2; secondary is the genuinely ambiguous case where the other three variables take over. Reagent: strong nucleophile that is a weak base favours substitution, strong base that is a poor nucleophile favours elimination, bulky base pushes elimination and pushes it toward Hofmann, and weak neutral species leave only the stepwise paths open. Solvent: polar aprotic media such as DMSO, DMF and acetone solvate the cation of a salt but leave the anion bare and hot, accelerating SN2 by orders of magnitude, while polar protic media such as water and alcohols hydrogen-bond the nucleophile into a cage and stabilise both the developing carbocation and the departing anion, favouring SN1 and E1. Temperature: elimination generates more particles and has the larger, less negative ΔS‡, so heating shifts the balance toward alkene.",
            "The explorer below puts all four on the same tetrahedral carbon in three dimensions, where the arguments above become geometry: the 180° trajectory SN2 requires and a tertiary carbon denies it, the flat carbocation SN1 and E1 share and attack from both faces, and the anti-periplanar alignment E2 will not proceed without.",
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
        "Marcellin Berthelot spent the 1860s and 1870s insisting that every spontaneous reaction must release heat. The principle was appealing, widely adopted, and wrong: ammonium nitrate dissolving in water gets cold and dissolves anyway, and ice melts on a warm day while absorbing heat. Enthalpy alone was never a sufficient criterion, which is why the century needed a second state function. Josiah Willard Gibbs supplied it between 1875 and 1878, in a paper published in the Transactions of the Connecticut Academy — a journal so obscure that the work reached working chemists only after Maxwell championed it in Britain and Wilhelm Ostwald translated it into German in 1892.",
        "Gibbs free energy is the quantity that finally connects thermodynamics to the equilibrium constant, closing a loop this curriculum has been building since kinetics began. It is also the currency of biochemistry: ATP hydrolysis is quoted at roughly −30 kJ/mol under cellular conditions not because that number is interesting in itself, but because coupling it to an unfavourable reaction is how cells make thermodynamically uphill chemistry run.",
      ],
      theory: [
        {
          heading: "Entropy is a count of microstates, not a measure of untidiness",
          body: [
            "Boltzmann's definition, S = k_B ln W, says entropy is the logarithm of W, the number of distinct microscopic arrangements — positions, momenta, and quantised energy distributions — consistent with the system's macroscopic state. Disorder is a loose analogy for this; counting is the actual content. The logarithm is not cosmetic either: microstate counts multiply when two systems are combined, and entropies must add, and only a logarithm converts one into the other.",
            "The definition delivers real numbers. For an ideal gas expanding into a vacuum, each molecule gains a factor V₂/V₁ in accessible positions, so W scales as (V₂/V₁)^N and ΔS = Nk_B ln(V₂/V₁) = nR ln(V₂/V₁). Nothing about heat or temperature enters — the gas expands because the expanded arrangement is overwhelmingly more numerous, and for a mole of gas 'overwhelmingly' means a ratio with Avogadro's number in the exponent.",
            "It also fixes an absolute zero of entropy. A perfect crystal at 0 K has exactly one accessible arrangement, W = 1, so S = 0 — the third law. This is why tables report absolute standard entropies S° for elements and compounds alike, while enthalpies can only ever be reported as differences from an arbitrary reference.",
          ],
        },
        {
          heading: "ΔS_universe is the criterion; ΔG is that criterion rewritten",
          body: [
            "The second law applies to the universe, not to the reaction flask. A process is spontaneous when ΔS_universe = ΔS_system + ΔS_surroundings > 0, and the system's own entropy is free to fall as long as the surroundings gain more. Crystallisation, protein folding and the assembly of a snowflake all lower the system's entropy and happen anyway.",
            "The surroundings' contribution is calculable. At constant temperature and pressure the heat the system releases is −ΔH, delivered to a reservoir so large that its temperature does not change, so ΔS_surroundings = −ΔH/T. Substituting gives ΔS_universe = ΔS_system − ΔH/T. Multiply through by −T, which reverses the inequality, and the right-hand side is ΔH − TΔS_system — that is, ΔG = −TΔS_universe.",
            "That identity is the whole point of Gibbs free energy. ΔG < 0 is not a separate criterion sitting alongside the second law; it is the second law, restated entirely in terms of the system, so that an experimentalist who never measures anything outside the flask can still apply it. The price is the conditions under which the substitution holds: constant temperature and constant pressure. At constant temperature and volume the corresponding function is the Helmholtz energy A = U − TS, and ΔG loses its meaning as a spontaneity test.",
          ],
        },
        {
          heading:
            "Why the enthalpy term is entropy in disguise, and why temperature can flip the sign",
          body: [
            "Read ΔG = ΔH − TΔS in the light of the identity above and the two terms stop looking like different kinds of quantity. −TΔS is the system's entropy change scaled by temperature; ΔH is the surroundings' entropy change scaled by the same temperature, with the sign flipped. Exothermic reactions are favoured not because energy is intrinsically good to lose, but because dumping heat into the surroundings increases the number of microstates available out there.",
            "Because temperature multiplies only one of the terms, it controls the balance. Both terms favourable (ΔH < 0, ΔS > 0) gives spontaneity at every temperature; both unfavourable gives spontaneity at none. When the signs match, there is a crossover temperature T = ΔH/ΔS at which ΔG = 0 and the direction reverses. Melting is the everyday case: for water, ΔH_fus = 6.01 kJ/mol and ΔS_fus = 22.0 J mol⁻¹ K⁻¹, so T = 6010/22.0 = 273 K, which is the melting point recovered from thermodynamic data alone. Above it the TΔS term wins and ice melts; below it the enthalpy term wins and water freezes.",
            "The same arithmetic governs industrial chemistry. Ammonia synthesis has ΔH < 0 and ΔS < 0, four moles of gas becoming two, so it is thermodynamically favoured only at low temperature — and kinetically hopeless there, which is the tension the Haber process resolves with a catalyst and 400–500 °C, accepting a lower equilibrium yield in exchange for reaching it at all.",
          ],
        },
        {
          heading: "ΔG° and ΔG are different quantities, and neither predicts a rate",
          body: [
            "ΔG° is a fixed number for a reaction at a given temperature: the free energy change when reactants in their standard states convert entirely to products in their standard states, 1 bar for gases and 1 M for solutes. ΔG is the instantaneous slope of free energy against extent of reaction at the composition the flask actually holds, and it changes continuously as the reaction proceeds. The two are related by ΔG = ΔG° + RT ln Q, and a reaction runs in whichever direction makes ΔG negative until ΔG reaches zero. That point is equilibrium, where Q = K and the relation collapses to ΔG° = −RT ln K. The derivation below builds that result from the combined first and second law rather than asserting it.",
            "A positive ΔG° therefore does not mean 'no reaction'. It means K < 1, so the equilibrium mixture is mostly reactants — but if Q is small enough, ΔG is still negative and the reaction proceeds. This is exactly how biochemical pathways run individually unfavourable steps: keep the product concentration low by consuming it immediately in the next step, and the step stays downhill.",
            "Thermodynamics says nothing whatever about rate. Diamond converting to graphite has ΔG° = −2.9 kJ/mol at 25 °C and is spontaneous as written; the barrier to reorganising a covalent lattice is so high that the process is unobservable on geological timescales. A stoichiometric mixture of hydrogen and oxygen has a strongly negative ΔG° and sits unchanged indefinitely until a spark supplies the activation energy. Spontaneous means thermodynamically downhill, nothing more — the height of the hill in between is a kinetics question, and the two disciplines answer entirely different questions about the same reaction.",
          ],
        },
      ],
    },
  },
];

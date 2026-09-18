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
        "Pauling introduced electronegativity in 1932 to explain a systematic accounting error. Bond energies in heteronuclear molecules were consistently larger than the geometric mean of the two corresponding homonuclear bonds, and the excess grew with how chemically dissimilar the two atoms were. Rather than treat that as noise, he treated it as a measurable quantity and built a scale out of it — one that is still, ninety years later, the single most-used number in descriptive chemistry.",
        "The scale matters because it dissolves a false dichotomy. There is no experiment that sorts bonds into ionic and covalent; there is a continuous variable, percent ionic character, that runs from 0 in H₂ to something near but never equal to 100 in CsF. The same electrostatics that sets a single bond's polarity also sets the lattice energy of a whole crystal, and lattice energy in turn predicts melting points, hardness and solubility. Born and Haber's 1919 cycle is what made that quantity accessible, since no experiment can measure it directly.",
      ],
      theory: [
        {
          heading: "The continuum is a statement about wavefunctions",
          body: [
            'In valence bond language a two-electron bond between A and B is written as a mixture of covalent and ionic terms: Ψ = ψ(A–B) + λψ(A⁺B⁻) + λ′ψ(A⁻B⁺). Pure covalent means λ = λ′ = 0 and pure ionic means the covalent term drops out; every real bond has all three present with different weights. Ionic and covalent are therefore limiting cases of one description, and asking whether a bond "is" ionic is like asking whether a vector "is" the x-axis.',
            "Pauling's definition of electronegativity comes straight out of this. The ionic terms add stabilization the purely covalent picture does not have, so define Δ = E(A–B) − √(E(A–A)·E(B–B)), the bond-energy excess over the geometric mean, and set the electronegativity difference as |χ_A − χ_B| = 0.102√Δ with Δ in kJ/mol. Fixing hydrogen at 2.20 pins the whole scale, which runs from 0.79 at caesium to 3.98 at fluorine.",
            "Because the scale is built from a difference, only differences are meaningful, and the usual cutoffs — under about 0.4 nonpolar covalent, 0.4 to 1.7 polar covalent, over 1.7 ionic — are rough guides, not boundaries. HF has ΔEN = 1.78 and is a gas of discrete molecules with roughly 41% ionic character; AlCl₃ has ΔEN = 1.55 and sublimes as covalent Al₂Cl₆ dimers. Mulliken's alternative definition, χ = (IE + EA)/2, is more physically transparent and correlates well with Pauling's after rescaling, which is reassurance that the quantity is real rather than an artefact of one definition.",
          ],
        },
        {
          heading: "Lattice energy: Coulomb's law scaled by geometry",
          body: [
            "For an ionic solid the electrostatic energy of one ion is not just its attraction to a nearest neighbour but the sum over every other ion in the crystal, alternating in sign and falling off as 1/r. That conditionally convergent sum evaluates to a pure number set by the packing geometry alone — the Madelung constant M, equal to 1.748 for rock salt, 1.763 for the caesium chloride structure and 1.638 for zinc blende. The Born–Landé expression is U = −(N_A M z₊z₋e²)/(4πε₀r₀) · (1 − 1/n), where the Born exponent n (typically 5 to 12) accounts for short-range repulsion between closed shells.",
            "Everything useful about ionic solids follows from that one formula. Lattice energy scales with the product of the charges and inversely with the interionic distance, so MgO (2+/2−, r₀ = 212 pm, U ≈ 3795 kJ/mol) is enormously more strongly bound than NaCl (1+/1−, r₀ = 282 pm, U ≈ 787 kJ/mol), and MgO melts at 2852 °C against NaCl's 801 °C. Charge dominates, since it enters as a product rather than a reciprocal.",
            "The catch is that U cannot be measured. There is no experiment that takes a crystal apart into gaseous ions in one step and reports the enthalpy.",
          ],
        },
        {
          heading: "Born–Haber: getting at an immeasurable number with Hess's law",
          body: [
            "The Born–Haber cycle is Hess's law applied to a closed loop of steps, all but one of which are measurable. Take sodium chloride. Sublimation of sodium metal costs +107 kJ/mol; ionizing gaseous sodium costs +496; breaking half a mole of Cl₂ costs +122; the electron affinity of chlorine releases −349. Those four steps convert the elements in their standard states into gaseous Na⁺ and Cl⁻, at a net cost of +376 kJ/mol. The measured standard enthalpy of formation of NaCl(s) is −411 kJ/mol, and since enthalpy is a state function the remaining leg — gaseous ions collapsing into the crystal — must be −411 − 376 = −787 kJ/mol.",
            "That is the lattice enthalpy, and it agrees closely with the Born–Landé calculation, which is the cycle's real value: it is an independent check on the electrostatic model. Where cycle and calculation disagree badly, the disagreement is diagnostic. Silver chloride's experimental lattice energy comes out well above the purely ionic prediction, and the excess is covalent character the electrostatic model leaves out — the continuum showing up as a discrepancy.",
            'The cycle also answers questions the formula alone cannot. Why is the stable sodium chloride NaCl and not NaCl₂? Not because sodium "wants a full octet": forming Na²⁺ requires a second ionization energy of 4562 kJ/mol, since that electron comes out of the neon core. No lattice energy, however large, repays it. Conversely, why does MgO exist despite Mg²⁺ costing 2189 kJ/mol to make and O²⁻ being endothermic to form? Because the doubled charges push the lattice energy near 3800 kJ/mol. The cycle turns "which compound forms" into arithmetic.',
          ],
        },
        {
          heading: "Bond energy and bond enthalpy are not the same number",
          body: [
            "Tabulated bond energies are averages, and it is worth knowing over what. The bond dissociation energy is defined for one specific bond in one specific molecule: breaking the first C–H bond in methane costs 439 kJ/mol. The next three do not cost the same, because each removal changes the fragment left behind. The total atomization enthalpy of methane is 1663 kJ/mol, so the mean C–H bond enthalpy is 1663/4 = 416 kJ/mol — the number in the table. Neither figure is wrong; they answer different questions, and using the tabulated mean for a single homolysis can be off by 20 kJ/mol or more.",
            "The distinction between energy and enthalpy is separate and smaller. Bond dissociation energy D₀ is an internal-energy change at 0 K, while tabulated bond enthalpies are ΔH at 298 K; for a diatomic splitting into two atoms the gas expands by one mole of particles, so ΔH = ΔU + RT ≈ ΔU + 2.5 kJ/mol. Spectroscopists quote a third quantity, D_e, the depth of the potential well, which exceeds D₀ by the zero-point vibrational energy — 26 kJ/mol for H₂, where D_e = 458 kJ/mol but D₀ = 432 kJ/mol.",
            "This matters whenever bond enthalpies are used to estimate a reaction enthalpy as bonds broken minus bonds formed. That method is an approximation with typical errors of 10 to 40 kJ/mol, it fails outright for anything with significant resonance stabilization (benzene's tabulated bonds under-predict its stability by about 150 kJ/mol), and it applies only to gas-phase species. Standard enthalpies of formation, where they exist, are always the better route.",
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
        "Hybridization localizes every bond between two named atoms, which is a superb bookkeeping device and a poor physical model. It cannot give a fractional bond order, cannot describe an excited state, and cannot predict magnetism. Molecular orbital theory, developed by Hund and Mulliken in the late 1920s and given its LCAO computational form by Lennard-Jones and Hückel, drops the localization assumption entirely: electrons occupy orbitals that extend over every nucleus in the molecule at once.",
        "The decisive test is oxygen. The Lewis structure O=O pairs every electron and therefore predicts a diamagnetic molecule, yet liquid O₂ visibly sticks to the poles of a magnet — a demonstration that was known and unexplained for decades. An MO diagram gets it right by putting two electrons, unpaired and parallel, into a degenerate pair of antibonding π* orbitals, while still giving the bond order of 2 that the measured bond length and dissociation energy require. This is the case where a localized picture is not merely less precise but simply wrong, and it is why every spectroscopy, photochemistry and organometallic argument since is made in MO language.",
      ],
      theory: [
        {
          heading: "LCAO, and the two conditions orbitals must meet to combine",
          body: [
            "The LCAO approximation writes each molecular orbital as a weighted sum of atomic orbitals, ψ = Σ cᵢφᵢ, and finds the coefficients variationally — the set that minimizes the energy. For two orbitals this reduces to a 2 × 2 secular determinant with solutions E± = (α ± β)/(1 ± S), where α is the energy of an electron in the isolated atomic orbital, S = ∫φ_Aφ_B dτ is the overlap integral, and β is the resonance integral that measures the interaction. Because of the 1 ± S in the denominator, the antibonding orbital is destabilized slightly more than the bonding orbital is stabilized — which is why He₂ is genuinely unbound rather than merely neutral.",
            "Combining N atomic orbitals always gives exactly N molecular orbitals; nothing is created or lost. In-phase combination piles electron density between the nuclei and lowers the energy; out-of-phase combination puts a node there, and an electron in that orbital is actively pushed out of the internuclear region.",
            "Two atomic orbitals interact appreciably only if they satisfy two conditions. They must have compatible symmetry with respect to the internuclear axis — a 2s and a 2p_z can mix, a 2s and a 2p_x cannot, because the net overlap of the latter pair is exactly zero by symmetry. And they must be close in energy, since the stabilization goes roughly as β²/ΔE. This is why core orbitals are spectators in bonding, and why hydrogen's 1s interacts with fluorine's 2p rather than with its much deeper 2s.",
          ],
        },
        {
          heading: "s–p mixing, and why B₂ and O₂ have different diagrams",
          body: [
            "In a homonuclear diatomic of period 2, σ(2s), σ*(2s), σ(2p_z) and σ*(2p_z) all share the same σ symmetry, and orbitals of the same symmetry mix. The consequence of that mixing is that σ_g(2s) is pushed down and σ_g(2p) is pushed up — far enough up, in the lighter half of the period, that it rises above the degenerate π_u(2p) pair. The mixing is large when the 2s–2p energy gap is small and negligible when the gap is large.",
            "That gap grows steadily across period 2 as Zeff rises and the poorly shielded 2s contracts faster than 2p: it is only a few electronvolts at boron and around twenty at fluorine. So Li₂ through N₂ use the mixed ordering with π below σ, and O₂ and F₂ use the unmixed ordering with σ below π. The crossover between N₂ and O₂ is not an arbitrary textbook footnote — it is the reason there are two diagrams to remember.",
            "The two orderings make different, checkable predictions. B₂ has six valence electrons; with π below σ the last two go singly into the degenerate π orbitals with parallel spins, so B₂ is paramagnetic with bond order 1 — which it is. C₂ has eight; they fill both π orbitals completely and leave σ_g(2p) empty, giving a bond order of 2 made of two π bonds and no σ bond at all, and a diamagnetic molecule. Photoelectron spectroscopy of N₂ confirms the mixed ordering directly by showing the highest-occupied orbital to be σ rather than π.",
          ],
        },
        {
          heading: "Bond order as a predictive quantity",
          body: [
            "Bond order is ½(bonding electrons − antibonding electrons), and its value is that it correlates tightly with two measurable things: bond length and dissociation energy. N₂ has bond order 3, a bond length of 110 pm and a dissociation energy of 945 kJ/mol — the strongest bond in any common diatomic, and the reason nitrogen fixation is industrially expensive. O₂ has bond order 2, 121 pm and 498 kJ/mol.",
            "The oxygen series makes the correlation unmistakable. Removing an electron from an antibonding π* orbital raises the bond order to 2.5 in O₂⁺ and shortens the bond to 112 pm; adding one gives superoxide O₂⁻ at bond order 1.5 and 133 pm; adding two gives peroxide O₂²⁻ at bond order 1 and 149 pm. Bond order falls monotonically, bond length rises monotonically, and no localized dot structure predicts the sequence.",
            "The failure cases are just as sharp. He₂ has two bonding and two antibonding electrons, bond order 0, and no chemical bond — it exists only as an extraordinarily weak van der Waals dimer at cryogenic temperatures. But He₂⁺ has bond order ½ and is a perfectly respectable, well-characterized cation. A model in which bonds come in units of shared pairs has no way to express that.",
          ],
        },
        {
          heading: "Where MO theory keeps paying: HOMO, LUMO and heteronuclear diagrams",
          body: [
            "For a heteronuclear diatomic the two atoms' orbitals sit at different energies, so the coefficients in ψ = c_Aφ_A + c_Bφ_B are unequal. The bonding orbital is weighted toward the more electronegative atom and the antibonding orbital toward the less electronegative one — which is the MO statement of bond polarity, and it recovers the ionic limit smoothly as the energy gap widens until one coefficient approaches zero.",
            "Carbon monoxide is the standard demonstration and a genuinely counterintuitive one. Oxygen is more electronegative, yet CO's highest occupied molecular orbital is a weakly antibonding σ orbital concentrated on carbon, and its lowest unoccupied orbitals are π* orbitals also weighted toward carbon. That is why metal carbonyls bond through carbon rather than oxygen, and why CO's net dipole moment is a tiny 0.11 D pointing the \"wrong\" way, with the negative end on carbon.",
            "The frontier orbitals — HOMO and LUMO — are where the rest of chemistry connects. Reactions are described as the HOMO of a nucleophile overlapping the LUMO of an electrophile, the HOMO–LUMO gap sets the wavelength a conjugated dye absorbs, and the same gap becomes the band gap of a semiconductor once the two-orbital problem is extended to 10²³ of them. The bands in a solid are molecular orbitals with the count taken to the limit.",
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
        "Polarity is the molecular property that most often decides whether two substances will mix, and the consequences are not subtle: water dissolves sodium chloride and refuses hexane, soap works because one molecule carries both kinds of end, and a lipid bilayer assembles itself because the alternative is worse. Every extraction, every chromatographic separation and every drug-formulation decision is an argument about dipole moments.",
        "The quantity itself is measurable rather than inferred. Debye showed in the 1910s that the temperature dependence of a substance's dielectric constant separates the permanent dipole moment from the induced one, and gas-phase microwave spectroscopy now measures μ to several decimal places. So the claim that CO₂ is nonpolar is not a deduction from a drawing — it is an experimental zero, and any model of bonding has to reproduce it.",
      ],
      theory: [
        {
          heading: "A bond dipole is a vector; a molecular dipole is a vector sum",
          body: [
            "The dipole moment of a separated pair of charges is μ = q·d, a vector by convention pointing from positive toward negative, and for a general charge distribution μ = Σqᵢrᵢ. The unit is the debye, D = 3.336 × 10⁻³⁰ C·m, chosen because a full electronic charge separated by 100 pm gives 4.80 D — a convenient size for real molecules.",
            "A molecule's net moment is the vector sum of its bond dipoles together with the contributions of any lone pairs. Vector addition is the entire content of the subject, and it is why the same set of bonds can give a polar or a nonpolar molecule depending only on how they are arranged. CO₂ has two strongly polar C=O bonds arranged at exactly 180°; the two vectors are equal in magnitude and opposite in direction, the sum is zero, and the measured moment is zero. Water has two O–H bonds of similar individual polarity at 104.5°; they do not cancel, the oxygen lone pairs point the same way as the resultant, and the measured moment is 1.85 D.",
            "Symmetry decides the outcome before any arithmetic is done. A molecule can have a permanent dipole only if it belongs to the point groups C₁, Cₛ, Cₙ or C_nv — that is, only if some direction in the molecule is not related by symmetry to any other. Any centre of inversion, or any two non-coincident rotation axes, forces μ = 0. CO₂ (D∞h), BF₃ (D₃h), CCl₄ (T_d), PF₅ (D₃h) and SF₆ (O_h) are all nonpolar for that reason, regardless of how polar their individual bonds are.",
          ],
        },
        {
          heading: "Bond polarity and molecular polarity answer different questions",
          body: [
            "Bond polarity is a property of two atoms and is predicted well by electronegativity difference. Molecular polarity is a property of a whole structure and requires geometry as well. Conflating them produces most of the wrong answers on this topic, and the cleanest demonstration is the ammonia–nitrogen trifluoride pair.",
            "NF₃ has far more polar bonds than NH₃: ΔEN for N–F is 0.94 while for N–H it is 0.84, and the polarity runs in opposite directions, since nitrogen is the more electronegative atom in N–H but the less electronegative in N–F. Both molecules are trigonal pyramidal with a lone pair on nitrogen. Yet NH₃ has μ = 1.47 D and NF₃ has μ = 0.23 D. In ammonia the three bond dipoles point up toward nitrogen, the same way as the lone-pair moment, and reinforce it; in NF₃ the bond dipoles point down toward the fluorines, opposing the lone pair and nearly cancelling it.",
            "Isomers make the geometric dependence unarguable, because they remove every variable except shape. cis-1,2-dichloroethene has μ = 1.90 D; trans-1,2-dichloroethene, with the identical atoms and identical bonds, has μ = 0, since its centre of inversion forces the two C–Cl dipoles to oppose. The two isomers have measurably different boiling points as a result.",
          ],
        },
        {
          heading: "Percent ionic character, computed from a measured moment",
          body: [
            "Comparing a bond's measured dipole moment to the moment it would have if the bonding pair were completely transferred puts a number on where a real bond sits between the covalent and ionic limits. For HCl, the bond length is 127.5 pm, so full transfer of one electron would give μ_ionic = (1.602 × 10⁻¹⁹ C)(1.275 × 10⁻¹⁰ m) = 2.04 × 10⁻²⁹ C·m = 6.12 D. The measured moment is 1.08 D, so the bond is 1.08/6.12 = 17.6% ionic, and the effective charge on each atom is about 0.18 e.",
            "The same calculation for HF, with 91.7 pm and a measured 1.82 D, gives 41%. Running the series HF, HCl, HBr, HI gives ionic characters that fall steadily as ΔEN falls, exactly as the continuum picture requires and with no discontinuity anywhere that would justify a hard category boundary.",
            "Two cautions keep this honest. Percent ionic character defined this way is a model-dependent number, not a measured one — lone-pair and polarization contributions are folded into the same μ, which is why CO, with a genuinely polar bond, has a near-zero moment of 0.11 D pointed toward carbon. And the macroscopic consequences of polarity scale nonlinearly with it: water's dielectric constant is 78 against carbon tetrachloride's 2.24, a factor of thirty-five that comes from a dipole moment ratio of order one and a hydrogen-bonded network that amplifies it.",
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
        "Intramolecular bonds decide what a molecule is; intermolecular forces decide how a mole of them behaves. Extrapolating the boiling points of H₂S, H₂Se and H₂Te down the group predicts water boiling somewhere near −80 °C. It boils at 100 °C instead, and the roughly 180-degree discrepancy is hydrogen bonding alone. Oceans, and therefore terrestrial life, exist because of an anomaly in one row of the periodic table.",
        "The theoretical picture came late. Van der Waals introduced the a and b parameters phenomenologically in 1873 to fix the ideal gas law without knowing what a represented, and Keesom and Debye later explained the dipolar contributions. The hard case was why argon condenses at all, since it has no dipole to speak of — London solved it in 1930 with second-order perturbation theory, showing that correlated fluctuations in two electron clouds produce a net attraction even between perfectly spherical, perfectly nonpolar atoms. The same forces are what make a gecko stick to glass and what hold a protein in its folded state.",
      ],
      theory: [
        {
          heading: "London dispersion is a correlation effect, not an averaging artefact",
          body: [
            "The usual story is that an atom's electron cloud momentarily lurches to one side, creating an instantaneous dipole that induces a matching dipole in its neighbour. That is a serviceable picture but it is not quite the mechanism, because an instantaneous dipole averages to zero and zero times an induced response is still zero. The real effect is correlation: the two clouds' fluctuations become synchronized, so that the configurations in which the dipoles are aligned favourably are visited more often than those in which they are not. The attraction survives the averaging because the correlation, not the dipole, is what is being averaged.",
            "London's second-order perturbation result for two identical atoms is E ≈ −(3/4)·I·α²/r⁶, where I is the ionization energy and α is the polarizability. The controlling variable is α — how easily the electron cloud deforms — and not molecular mass. Mass appears to work as a predictor only because heavier atoms have more electrons, held further out and less tightly, and so are more polarizable. Where the two decouple, polarizability wins.",
            "The noble gases show the correlation directly: α rises from 0.20 Å³ for helium to 0.40 for neon, 1.64 for argon, 2.48 for krypton and 4.04 for xenon, and the boiling points rise with it from 4.2 K to 27, 87, 120 and 165 K. The isomers of pentane show that mass is not the variable: n-pentane and neopentane are both C₅H₁₂ with identical mass and nearly identical polarizability, yet n-pentane boils at 36 °C and the compact, near-spherical neopentane at 9.5 °C. An extended chain can lie alongside its neighbours over its whole length; a sphere touches at a point.",
            "One consequence worth keeping: dispersion is universal. Every molecule has it, it is often the largest contribution even in polar substances, and for large molecules it dominates. HCl's dipole–dipole interaction accounts for a minority of its total attraction; the rest is dispersion.",
          ],
        },
        {
          heading: "The other two van der Waals terms, and why all three go as r⁻⁶",
          body: [
            "Keesom interactions are the attraction between two permanent dipoles, and the rotational averaging is what makes them weak. Two freely rotating dipoles sample repulsive and attractive orientations alike; the attractive ones are slightly favoured by the Boltzmann factor, leaving ⟨E⟩ ∝ −μ⁴/(kT·r⁶). This is the only intermolecular term with an explicit temperature dependence, and it weakens as things get hotter. Debye interactions are the attraction between a permanent dipole and the dipole it induces in a polarizable neighbour, E ∝ −μ²α/r⁶, and unlike Keesom they do not average away, since the induced dipole follows the inducing one.",
            "All three van der Waals contributions — Keesom, Debye and London — fall off as r⁻⁶, which is why they are collected into a single coefficient in models. The Lennard-Jones potential V(r) = 4ε[(σ/r)¹² − (σ/r)⁶] uses that r⁻⁶ attraction with an r⁻¹² repulsion, where ε is the well depth and σ the separation at which V = 0. The repulsive exponent is chosen for computational convenience rather than physics: real Pauli repulsion between overlapping closed shells is closer to exponential, but r⁻¹² is just the square of r⁻⁶ and so is nearly free to evaluate. Every molecular dynamics simulation in biochemistry runs on some version of this function.",
            "The r⁻⁶ dependence is steep, and it is why intermolecular forces are short-ranged compared with the r⁻¹ of ionic attraction. Doubling the separation cuts a van der Waals interaction by a factor of 64 and an ionic one only by half — which is the fundamental reason molecular solids are soft and low-melting while ionic solids are hard and refractory.",
          ],
        },
        {
          heading: "Hydrogen bonding: strong, directional, and partly covalent",
          body: [
            "A hydrogen bond needs a hydrogen covalently attached to a strongly electronegative atom (N, O or F) and an acceptor with an available lone pair. Typical strengths run 5 to 30 kJ/mol — roughly 20 kJ/mol per hydrogen bond in liquid water, about 29 in the HF dimer — which places them an order of magnitude above ordinary dipole–dipole interactions but still an order of magnitude below covalent bonds. The extreme case, the symmetric [F···H···F]⁻ bifluoride ion, reaches about 163 kJ/mol and is better described as a covalent three-centre bond.",
            "Simple electrostatics does not fully account for this. Three features give it away: hydrogen bonds are strongly directional, preferring near-linear X–H···Y, whereas a point-dipole interaction is not; the X–H stretching frequency drops and the bond lengthens on formation; and the H···Y distance is well inside the sum of the van der Waals radii. The accepted description adds charge transfer from the acceptor's lone pair into the σ*(X–H) antibonding orbital, which explains all three at once. Only N, O and F work because only they combine high electronegativity, small size and accessible lone pairs — chlorine is as electronegative as nitrogen but too large and too diffuse.",
            "Counting donors and acceptors explains the ranking among the anomalous hydrides better than bond strength does. Water has two O–H donors and two lone-pair acceptors, a perfect match that lets it build a fully connected three-dimensional network. HF has one donor and three acceptors, so it can only form chains; ammonia has three donors but one acceptor, so it is limited in the other direction. Both are capped at roughly one hydrogen bond per molecule while water sustains about two. That is why water boils at 100 °C while HF boils at 20 °C and NH₃ at −33 °C, even though an individual H···F bond is stronger than an individual H···O one.",
          ],
        },
        {
          heading: "Reading the boiling-point anomalies off the periodic table",
          body: [
            "Group 14's hydrides behave themselves: CH₄ (−162 °C), SiH₄ (−112), GeH₄ (−88), SnH₄ (−52) rise monotonically with polarizability, exactly as pure dispersion predicts. They have no dipole and no hydrogen bonding, which makes them the control group.",
            "The other three groups break the pattern at the first member and only the first member. Group 16: H₂S (−60), H₂Se (−41), H₂Te (−2) trend normally, then H₂O jumps to +100. Group 15: PH₃ (−88), AsH₃ (−62), SbH₃ (−17), then NH₃ at −33. Group 17: HCl (−85), HBr (−67), HI (−35), then HF at +20. In each case the dispersion trend is intact from period 3 onward, and the first-row hydride sits far above the line drawn through the others. The size of the jump ranks water > HF > NH₃, which is the donor–acceptor counting above.",
            "The effects go well beyond boiling points. Water's specific heat capacity of 4.18 J/g·K and enthalpy of vaporization of 40.7 kJ/mol buffer Earth's climate and make sweating effective. Its solid is less dense than its liquid — 0.917 g/cm³ against 1.00 — because the fully hydrogen-bonded tetrahedral lattice of ice is more open than the partly collapsed liquid, which is why ice floats and lakes freeze from the top. The same hydrogen bonds hold the two strands of DNA together with a specificity that comes from donor–acceptor pattern matching rather than from strength, and the same interaction's directionality is what makes a protein's α-helix and β-sheet the shapes they are.",
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
        "Lewis proposed the shared electron pair in 1916, nine years before there was a wave mechanics to justify it, and the notation has outlived every attempt to replace it. Given nothing but a molecular formula, a Lewis structure fixes which atoms are joined, how many pairs join them and where the non-bonding electrons sit — which is enough to predict geometry through VSEPR, polarity through vector addition and a great deal of reactivity. No more sophisticated model is as fast, and chemists who spend their days running density functional calculations still draw Lewis structures on whiteboards.",
        "It is worth being clear about what the numbers on those drawings mean. Formal charge and oxidation state both assign an integer to an atom in a bond and they routinely disagree, because they make opposite assumptions: oxidation state hands every bonding pair entirely to the more electronegative atom, formal charge splits every pair exactly down the middle regardless of electronegativity. Neither is the actual partial charge, which is a continuous quantity and depends on how you choose to partition a continuous electron density. They are conventions with different jobs, and using one where the other belongs is a common source of confusion.",
      ],
      theory: [
        {
          heading: "The octet is a consequence, and it is a local one",
          body: [
            "Eight is not a magic number. A period-2 atom has one 2s and three 2p orbitals in its valence shell, and four orbitals hold eight electrons; the octet rule is that count and nothing more. Hydrogen stops at two because it has only a 1s orbital available. Once that is clear, the exceptions stop looking like violations. Boron in BF₃ has six valence electrons because filling its octet through π donation from fluorine would build up charge separation that the electronegativity difference opposes; the molecule instead behaves as a strong Lewis acid and completes its octet the first chance it gets, which is what BF₃·NH₃ is.",
            "Odd-electron molecules cannot obey the rule at all. Nitric oxide has eleven valence electrons, so at least one is unpaired no matter how the structure is drawn, and its reactivity as a biological signalling molecule and atmospheric radical follows from exactly that. Chlorine dioxide, with nineteen, is the same situation.",
            "The procedure for building the structure is mechanical: count all valence electrons and adjust for overall charge; put the least electronegative atom (never hydrogen) at the centre; connect with single bonds; distribute the remainder as lone pairs, satisfying the outer atoms first; and if the centre is short, convert an outer lone pair into an additional bond. The judgement comes afterward, in choosing between the structures that survive.",
          ],
        },
        {
          heading: "Formal charge: what the convention assumes and what it is good for",
          body: [
            "Formal charge = V − L − B/2, where V is the free-atom valence electron count, L the number of non-bonding electrons on the atom, and B the total number of bonding electrons it participates in. The B/2 is the convention: every shared pair is split evenly, which amounts to asking what the charge would be if the bond were perfectly nonpolar. Formal charges over a whole species must sum to its overall charge, which is a useful arithmetic check.",
            "Carbon monoxide shows how far the two conventions can diverge. In :C≡O:, carbon has one lone pair and six bonding electrons, so FC = 4 − 2 − 3 = −1; oxygen likewise gets 6 − 2 − 3 = +1. The oxidation states are the opposite sign and larger: C is +2 and O is −2, because oxidation state gives all six bonding electrons to oxygen. The truth sits between them and closer to formal charge in this instance — CO's measured dipole moment is 0.11 D with the negative end on carbon, which is the direction formal charge predicts and oxidation state does not.",
            "Where formal charge earns its place is choosing between candidate structures for one skeleton. The preferred structure is the one with formal charges closest to zero, with any negative charge on the most electronegative atom and any positive charge on the least, and with like charges kept apart. Applied to the thiocyanate ion SCN⁻, that reasoning correctly puts the negative charge on sulfur in the major contributor and correctly predicts that the ion bonds to soft metals through S and to hard metals through N.",
          ],
        },
        {
          heading: "Expanded octets and the d-orbital myth",
          body: [
            "The standard explanation for SF₆, PCl₅ and the sulfate ion is that period-3 elements have empty 3d orbitals available for bonding, so the octet can expand. This explanation is, as far as high-level calculation can determine, wrong. Sulfur's 3d orbitals lie far too high in energy and are far too spatially diffuse to mix appreciably with 3s and 3p; population analyses consistently find only a few percent of an electron in them, which is the size of a polarization correction rather than a bonding contribution.",
            "The accepted alternative is the three-centre four-electron bond of Rundle and Pimentel. Three collinear p orbitals combine into one bonding, one non-bonding and one antibonding molecular orbital; four electrons fill the first two, giving a net bond order of about ½ per linkage, spread over two bonds. That model predicts exactly what is observed for XeF₂ and I₃⁻: bonds that are long and weak relative to a normal single bond, a strict requirement that the outer atoms be highly electronegative so they can carry the accumulated negative charge, and a strong preference for linear geometry. It also explains why hypervalency is common for F and O ligands and rare for anything else — a fact the d-orbital story cannot address.",
            "For sulfate the modern description is a highly ionic σ framework, closer to four S–O single bonds with a large positive formal charge on sulfur than to the two-double-bond drawing, with the short observed S–O distance of 149 pm coming from electrostatic contraction rather than π bonding. The practical point is not that the expanded-octet drawing should be abandoned — it is a good bookkeeping device and reproduces the right geometry — but that it is bookkeeping, and the physical justification usually attached to it is not the real one.",
          ],
        },
        {
          heading: "When Lewis structures stop being adequate",
          body: [
            "The model has a definite domain, and it is useful to know where the edge is. It fails whenever electrons are genuinely delocalized, which is why resonance exists as a patch — and a patch is what it is, since no single structure is correct and the hybrid is not any of them. It fails for O₂, which it draws as a doubly bonded molecule with every electron paired and which is in fact paramagnetic. It fails for electron-deficient species like diborane, where B₂H₆ has only twelve valence electrons for what looks like it needs sixteen, and the bridging hydrogens are held by three-centre two-electron bonds that a line between two atoms cannot represent.",
            "It fails for transition metal complexes, where d-orbital splitting, variable oxidation states and π backbonding are the whole story and a dot structure captures none of it. It has nothing to say about excited states, so no photochemistry or spectroscopy can be done in it. And it cannot express a fractional bond order, which rules out benzene, the carboxylate group, every aromatic system and every metal.",
            "What Lewis structures remain excellent at is exactly what Lewis designed them for: electron counting, predicting σ-bond connectivity and geometry, and identifying where lone pairs and formal charges sit so that reactivity can be anticipated. Treat the structure as a hypothesis about connectivity and electron count rather than a picture of the molecule, and it will rarely mislead.",
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
        "Benzene embarrassed nineteenth-century chemistry for forty years. C₆H₆ implies a degree of unsaturation that should make the compound wildly reactive, and instead it refused to decolourize bromine water, refused to add across its supposed double bonds, and preferred substitution to addition every time. Kekulé's 1865 ring with rapidly oscillating single and double bonds accounted for the fact that only one 1,2-disubstituted isomer exists, but it did so by proposing a physical oscillation, and that part turned out to be unnecessary. Pauling's reinterpretation in the 1930s replaced the oscillation with delocalization: not two structures alternating, but one structure that is neither.",
        "The stabilization is measurable rather than rhetorical. Hydrogenating cyclohexene releases 120 kJ/mol; three isolated double bonds should therefore release about 360, but hydrogenating benzene releases only 208. The 150 kJ/mol shortfall is energy benzene does not have to give up because it never had those localized bonds in the first place. That number, and the aromatic stability it measures, is why benzene rings are the most common structural motif in pharmaceuticals and why aromatic chemistry became a field of its own.",
      ],
      theory: [
        {
          heading: "Resonance is a deficiency of the model, not a behaviour of the molecule",
          body: [
            "Nothing oscillates. The nitrate ion does not spend a third of its time with the double bond on each oxygen; it has three identical N–O bonds of 124 pm at all times, each of bond order about 4/3. The arrows between resonance structures are not reaction arrows and the structures are not states. What is actually going on is that the localized two-centre two-electron bond, which is an approximation, is a poor basis for this molecule, and the repair is to write the true wavefunction as a linear combination of several localized basis structures: Ψ = c₁ψ₁ + c₂ψ₂ + … The individual ψᵢ are mathematical components, like the two perpendicular components of one velocity vector — the object moves in one direction, not alternately along each axis.",
            "That framing explains the rules for weighting contributors, which otherwise have to be memorized. A contributor counts more when it is lower in energy as a structure: complete octets first, then minimal formal charge, then negative formal charge on the more electronegative atom, then minimal charge separation. Equivalent structures, as in nitrate or carboxylate, contribute equally, and that equality is what forces the observed bond lengths to be equal.",
            "The structural evidence is unambiguous. Benzene's six C–C bonds are all 139 pm, between ethane's 154 and ethene's 134, and its ring is a perfect hexagon. Carbonate's three C–O bonds are all 129 pm, against roughly 143 for a C–O single bond and 123 for C=O. The acetate ion has two equal C–O bonds where acetic acid has one at 121 pm and one at 136 pm — the molecule changes its geometry on deprotonation because the charge really is shared.",
          ],
        },
        {
          heading: "Delocalization energy: what the number is and what it depends on",
          body: [
            "Delocalization energy is the difference between the real molecule's energy and the energy of the best single localized structure. Hückel theory makes this explicit for π systems. Treating benzene's six p orbitals in the Hückel approximation gives π levels at α + 2β, α + β (twice), α − β (twice) and α − 2β; six electrons fill the lowest three for a total π energy of 6α + 8β. Three isolated ethylene units would give 6α + 6β. The difference, 2β, is the delocalization energy, and with β calibrated empirically near −75 kJ/mol it reproduces the 150 kJ/mol from the hydrogenation experiment.",
            'It is worth noticing that the empirical number depends on the reference you choose. "Three isolated double bonds" is a hypothetical molecule, and different reasonable choices of reference — cyclohexatriene with strain included, or acyclic 1,3,5-hexatriene, or an atomization-based scheme — give benzene resonance energies spread over roughly 90 to 210 kJ/mol. The phenomenon is real and large; the specific figure is model-dependent, and quoting it without the reference is quoting half a statement.',
            "Delocalization also has kinetic consequences that make it visible outside a calorimeter. The C–N bond of an amide has partial double-bond character from nitrogen lone-pair donation into the carbonyl π*, which raises the barrier to rotation about it to roughly 80 kJ/mol — high enough to be measured by variable-temperature NMR, and high enough to keep the peptide bond planar. Protein secondary structure exists because of a resonance contributor.",
          ],
        },
        {
          heading: "Hückel's rule, and why antiaromatic rings are destabilized",
          body: [
            "A cyclic, planar, fully conjugated system is aromatic if it holds 4n + 2 π electrons, and antiaromatic — destabilized relative to the open-chain analogue — if it holds 4n. The origin is the pattern of Hückel π levels in a ring, which always comes out as one lowest non-degenerate level followed by degenerate pairs. Filling that pattern completely requires 2, then 6, then 10, then 14 electrons; any 4n count leaves a degenerate pair half-filled with two unpaired electrons, which is a high-energy open-shell configuration.",
            "Benzene's six electrons (n = 1) fill exactly through the second shell, which is why it is the archetype rather than a curiosity. Cyclobutadiene with four π electrons is the antiaromatic counterpart, and it escapes the penalty by distorting to a rectangle with distinct single and double bonds and remains so unstable that it can only be isolated in a matrix below 35 K. Cyclooctatetraene with eight avoids the problem differently, by puckering into a non-planar tub shape that breaks the conjugation entirely, and behaves like an ordinary polyene.",
            "The rule extends past neutral hydrocarbons, which is where it earns real predictive credit. The cyclopentadienyl anion has six π electrons and is aromatic, which makes cyclopentadiene remarkably acidic for a hydrocarbon (pKa ≈ 16, comparable to ethanol) and makes the anion the ubiquitous ligand of organometallic chemistry. The cycloheptatrienyl cation, also six, is stable enough to isolate as a salt. Pyridine's nitrogen contributes one electron to the π system and keeps its lone pair in an sp² orbital in the ring plane, so it is basic; pyrrole's nitrogen must contribute its lone pair to reach six π electrons, so pyrrole is not basic at all. Same element, opposite behaviour, decided entirely by electron counting.",
          ],
        },
        {
          heading:
            "Curved arrows are bookkeeping, and they are bookkeeping for two different things",
          body: [
            "A double-headed curved arrow denotes the movement of an electron pair, and its tail must start on something that actually holds a pair — a lone pair or a π bond, never a σ bond in this context and never an atom. Its head must point where that pair ends up. Used between resonance structures, the arrow is pure notation: it relates two components of one wavefunction and nothing moves. Used in a mechanism, it describes a real transformation in time. The same symbol is doing two jobs, and conflating them is how students end up believing resonance structures interconvert.",
            "The test that separates them is whether any nucleus moves. Resonance structures must share identical atomic positions and identical numbers of unpaired electrons, differing only in where the pairs are drawn. If atoms have to move, you are looking at isomers or tautomers in genuine equilibrium — the keto and enol forms of acetone are separate substances that interconvert at a measurable rate, not resonance contributors, because a hydrogen changes address.",
            "Delocalization is also why so much of organic reactivity is predictable. A carbocation adjacent to a π system or a lone pair is stabilized by delocalization, which is why allylic and benzylic cations form readily and why SN1 reactions are fast at those positions. An anion whose charge can be spread over electronegative atoms is a weak base and its conjugate is a strong acid, which is the difference between a carboxylic acid and an alcohol. In both cases the reactive intermediate is stabilized by the same mechanism that stabilizes benzene, and the curved arrows are how chemists keep track of it.",
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

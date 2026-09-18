import type { Topic } from "./types";

/** Unit: Equilibrium & Acid-Base Chemistry */
export const equilibriumTopics: Topic[] = [
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
        "Blood held half a pH unit off its normal 7.4 is a medical emergency; soil pH decides which crops grow and which micronutrients stay soluble; surface ocean pH has fallen about 0.1 unit since the industrial revolution, a thirty percent rise in hydrogen-ion concentration, as carbon dioxide dissolves. Acid–base chemistry is equilibrium made consequential.",
        "Johannes Brønsted in Copenhagen and Thomas Lowry in London published the proton-transfer definition independently in 1923, replacing Arrhenius's water-bound picture and making acidity a property of a reaction rather than of a substance. Gilbert Lewis published his electron-pair definition the same year, and the two have coexisted ever since because they answer different questions — Brønsted–Lowry for anything involving protons, Lewis for the far larger class of reactions in which no proton moves at all.",
      ],
      theory: [
        {
          heading: "Three definitions, each more general than the last",
          body: [
            "Arrhenius defined an acid as a substance that increases [H⁺] in water and a base as one that increases [OH⁻]. The definition is tied to one solvent and cannot classify ammonia, which contains no hydroxide, as a base at all.",
            "Brønsted and Lowry made acidity relational: an acid donates a proton, a base accepts one, and every such reaction is a competition between two bases for the same proton. HA + B ⇌ A⁻ + HB⁺ always contains two conjugate pairs, and the position of the equilibrium is set by which base holds the proton more tightly. The definition frees acid–base chemistry from water — ammonia is a base because it accepts a proton, whatever the solvent — and it makes 'strong' and 'weak' statements about an equilibrium constant rather than categories a molecule belongs to.",
            "Lewis went further: an acid accepts an electron pair, a base donates one. Every Brønsted acid contains a Lewis acid, namely the proton it hands over, but the Lewis definition additionally covers species with no proton to give. BF₃ accepting a lone pair from ammonia, Al³⁺ coordinating six waters, Zn²⁺ polarising a water molecule in the active site of carbonic anhydrase — none of these involve proton transfer, and all are acid–base chemistry in the Lewis sense. The curved-arrow formalism of organic chemistry is Lewis acid–base theory written as a picture.",
          ],
        },
        {
          heading: "Ka, Kb and Kw are one relationship, not three facts",
          body: [
            "For HA + H₂O ⇌ H₃O⁺ + A⁻, Ka = [H₃O⁺][A⁻]/[HA]. Water is absent from the expression because as the solvent its activity is essentially 1, not because it is a spectator — it is the base doing the accepting. Because Ka spans some twenty orders of magnitude across common acids, chemists work with pKa = −log Ka, and with pH = −log[H₃O⁺] on the same logarithmic footing.",
            "Multiply an acid's Ka by its conjugate base's Kb and the conjugate species cancel algebraically: ([H₃O⁺][A⁻]/[HA]) × ([HA][OH⁻]/[A⁻]) = [H₃O⁺][OH⁻] = Kw. So Ka·Kb = Kw exactly, and pKa + pKb = 14.00 at 25 °C. Knowing one constant fixes the other, and the familiar rule that a stronger acid has a weaker conjugate base is simply this product held constant.",
            "A worked case: for 0.100 M acetic acid, Ka = 1.8×10⁻⁵, the equilibrium gives x²/(0.100 − x) = 1.8×10⁻⁵. Since x is small compared with 0.100, x ≈ √(1.8×10⁻⁶) = 1.34×10⁻³ M, so pH = 2.87 and the acid is 1.3% ionised — the approximation is self-consistent because 1.3% is well under the 5% threshold at which the neglected term starts to matter. Compare 0.100 M HCl at pH 1.00: same formal concentration, two orders of magnitude difference in [H₃O⁺], entirely because of where the equilibrium sits.",
            "Kw itself is an equilibrium constant and therefore temperature dependent. Autoionisation is endothermic, so Kw rises with temperature: at 37 °C it is about 2.4×10⁻¹⁴, making neutral pH 6.81 rather than 7.00. Blood at 7.4 is thus more basic relative to neutrality than the room-temperature scale suggests, which matters when interpreting clinical acid–base data.",
          ],
        },
        {
          heading: "The levelling effect: why water cannot tell strong acids apart",
          body: [
            "Any acid stronger than H₃O⁺ transfers its proton to water completely, so what survives in solution is H₃O⁺ and nothing more acidic. HCl, HBr, HI, HNO₃ and HClO₄ all present as the same species at the same concentration and are therefore indistinguishable in water — they have been levelled to the solvent's conjugate acid. The mirror statement holds at the other end: no base stronger than OH⁻ persists, so amide (NH₂⁻), hydride and alkyllithiums are levelled to hydroxide the moment they meet water.",
            "This is a property of the solvent, not of the acids, and changing solvent resolves the degeneracy. In a differentiating solvent that is a far weaker base than water — glacial acetic acid is the classical choice — the mineral acids ionise only partially and separate into a measurable order, with perchloric acid emerging as the strongest of the common ones. That is why perchloric acid in glacial acetic acid is the standard titrant for very weak bases.",
            "The same logic explains the solvents organic chemistry uses for strong bases. To deprotonate something with a pKa of 25 you need a base whose conjugate acid has a higher pKa still, and you must run it in a solvent that will not level it — THF or liquid ammonia rather than water or ethanol. Solvent choice is not a detail of technique; it sets the acidity window the experiment can access at all.",
          ],
        },
        {
          heading: "Why strong-acid and weak-acid titration curves have different shapes",
          body: [
            "Titrating 0.100 M HCl with 0.100 M NaOH starts at pH 1.00, because dissociation is complete. pH then creeps upward as acid is consumed, jumps almost vertically through several units within a fraction of a millilitre either side of the equivalence point, and levels off in excess base. The equivalence point is exactly 7.00 at 25 °C, since the product Na⁺ and Cl⁻ are a spectator cation and the conjugate base of a strong acid, neither of which affects pH.",
            "Titrating a weak acid changes three things at once. The starting pH is higher, because only a small fraction has ionised. A buffer plateau appears in the first half of the titration, where HA and A⁻ coexist and pH moves slowly; at the half-equivalence point [HA] = [A⁻] exactly and pH = pKa, which is the most convenient experimental measurement of pKa there is. And the equivalence point lies above 7, because what is in the flask at that moment is a solution of A⁻, a genuine weak base that hydrolyses. The vertical jump is correspondingly shorter, compressed from below.",
            "Indicator choice follows directly from this. Phenolphthalein, which turns over between pH 8.2 and 10, is right for a weak acid titrated with strong base and wrong for a weak base titrated with strong acid, where the equivalence point lies below 7 and methyl red is appropriate. The weaker the acid, the smaller the jump, until at around Ka = 10⁻⁹ or below the break becomes too gradual to locate an endpoint at all.",
          ],
        },
        {
          heading: "Polyprotic acids are nested equilibria that can usually be unstacked",
          body: [
            "Phosphoric acid ionises in three stages with pKa1 = 2.12, pKa2 = 7.21 and pKa3 = 12.32 — successive constants separated by roughly five orders of magnitude each. The separation has a simple cause: pulling a proton off a species that already carries a negative charge is electrostatically harder, and gets harder again at −2.",
            "Because the stages are so well separated, they can be treated as independent rather than solved simultaneously. Essentially all the H₃O⁺ in a solution of the free acid comes from the first ionisation, and the second stage's contribution is negligible against it. At the first equivalence point the solution contains the amphiprotic species H₂PO₄⁻, which can both donate and accept a proton; the two tendencies combine to give pH ≈ (pKa1 + pKa2)/2 = (2.12 + 7.21)/2 = 4.67, independent of concentration over a wide range. A triprotic titration curve accordingly shows two usable equivalence points and two buffer plateaus, the third being lost in the levelling region near the top of the scale.",
            "Where the constants are not well separated the treatment fails and the full system of mass-balance, charge-balance and equilibrium equations must be solved together. Sulfuric acid is the common exception in the other direction: its first ionisation is complete, but the second has Ka2 ≈ 1.0×10⁻², so a 0.10 M solution is not simply 0.20 M in H₃O⁺ and the bisulfate equilibrium has to be carried explicitly.",
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
        "Lawrence Henderson worked out the relationship between carbonic acid, bicarbonate and blood pH at Harvard in 1908, and Karl Hasselbalch recast it in logarithmic form in 1917 so that clinicians could use the newly invented pH scale directly. The equation that carries both names was born in physiology, not in a chemistry department, and it is still how blood-gas results are read at a hospital bedside.",
        "Human blood is held between 7.35 and 7.45 despite metabolism producing roughly 15 moles of CO₂ a day; outside that window proteins change shape and enzymes stop working. The same chemistry stabilises the oceans, laboratory growth media, industrial fermenters and the cytoplasm of every cell, and titration curves are how buffer behaviour is measured and unknown concentrations determined.",
      ],
      theory: [
        {
          heading: "What a buffer does, and why the ratio is what matters",
          body: [
            "A buffer is a solution containing appreciable amounts of both members of a conjugate pair — a weak acid and its conjugate base. Added strong acid is intercepted by A⁻ and converted to HA; added strong base is intercepted by HA and converted to A⁻. Neither addition produces free H₃O⁺ or OH⁻ in any quantity, because a reservoir of the appropriate partner is standing by to absorb it.",
            "The pH of such a solution depends on the ratio [A⁻]/[HA], not on either concentration alone. Diluting a buffer therefore leaves its pH nearly unchanged, while diluting a strong acid changes pH directly — a genuinely different behaviour that follows from the ratio's invariance under dilution. What dilution does destroy is capacity: the same pH, less ability to hold it.",
          ],
        },
        {
          heading:
            "Henderson–Hasselbalch is exact; the approximations are in the numbers you feed it",
          body: [
            "Take Ka = [H₃O⁺][A⁻]/[HA] and the negative logarithm of both sides: pKa = pH − log([A⁻]/[HA]), rearranging to pH = pKa + log([A⁻]/[HA]). No approximation has been made. The equation is an exact restatement of the equilibrium expression, and it is exactly true provided the concentrations substituted into it are the true equilibrium concentrations.",
            "In practice nobody has those, so formal (prepared) concentrations are used instead, and that substitution is where the approximation enters. It is sound when both components are large compared with [H₃O⁺] and [OH⁻] — so that the amount of HA lost to ionisation is negligible — which in practice means buffer concentrations above roughly 10⁻³ M and a pKa comfortably inside the range 3 to 11. It fails for very dilute buffers, where water's own autoionisation is no longer negligible and the exact mass-balance and charge-balance system has to be solved, and it fails for acids so strong or weak that ionisation consumes a large fraction of one component.",
            "It also assumes concentrations stand in for activities. At the ionic strengths of biological media and most real buffers they do not: the relevant constant shifts, and an apparent pKa′ must be used instead of the thermodynamic value. The phosphate buffer used in cell culture illustrates this, with a thermodynamic pKa2 of 7.20 but an effective value closer to 6.8 at physiological ionic strength — a third of a pH unit, which is more than enough to matter.",
            "A worked case: 1.00 L containing 0.100 mol acetic acid and 0.100 mol sodium acetate has pH = pKa = 4.74, since the ratio is 1 and its logarithm is zero. Add 0.010 mol NaOH and the base converts that much acid: HA falls to 0.090 mol, A⁻ rises to 0.110 mol, and pH = 4.74 + log(0.110/0.090) = 4.74 + 0.09 = 4.83. The same 0.010 mol of NaOH added to a litre of pure water gives pOH 2.00 and pH 12.00. Nine hundredths of a unit against five units, for the identical chemical insult.",
          ],
        },
        {
          heading: "Buffer capacity is a derivative, and it peaks at pH = pKa",
          body: [
            "Buffer capacity β = dCb/dpH measures how many moles of strong base per litre must be added to raise the pH by one unit — the reciprocal of the titration curve's slope, and therefore largest exactly where that curve is flattest. Differentiating the full charge-balance expression gives β = 2.303([H₃O⁺] + [OH⁻] + C·Ka[H₃O⁺]/(Ka + [H₃O⁺])²), where C is the total concentration of the conjugate pair.",
            "The conjugate-pair term is maximised when [H₃O⁺] = Ka, that is when pH = pKa, where the fraction becomes Ka²/(2Ka)² = 1/4 and β_max = 2.303C/4 ≈ 0.58C. The result is not a coincidence of algebra: at a 1:1 ratio, converting a given amount of one component into the other changes the logarithm of the ratio by the smallest possible amount, and pH moves least. The capacity falls off symmetrically on either side, reaching about a third of its maximum one pH unit away in each direction, where the ratio has reached 10:1. That is the origin of the pKa ± 1 rule of thumb for a buffer's useful range.",
            "Capacity scales linearly with total concentration, so the two design decisions are separable: pKa sets where the buffer works, concentration sets how hard it can work there. The two leading terms in the expression also explain why very acidic and very basic solutions are themselves well buffered — below about pH 2 and above about pH 12, [H₃O⁺] or [OH⁻] alone provides substantial capacity without any conjugate pair at all.",
          ],
        },
        {
          heading: "How a buffer is actually chosen",
          body: [
            "Start with the target pH and pick a conjugate pair whose pKa is within one unit of it, as close as possible; then set the total concentration from the acid or base load the system must absorb, typically 10 to 100 mM for biochemistry. Those two steps are the easy part. The rest is chemical compatibility, and it is where buffer choice usually goes wrong.",
            "Phosphate has an ideal pKa2 for physiological work but precipitates calcium and magnesium, chelates other divalent cations, and inhibits a long list of enzymes that recognise phosphate esters. Tris has the opposite problem: its pKa is strongly temperature dependent, about −0.028 pH units per degree, so a Tris buffer adjusted to 8.0 at 25 °C is near 8.6 on ice — a shift large enough to invalidate an experiment nobody thought was temperature sensitive. Carbonate buffers exchange CO₂ with the atmosphere and drift in an open vessel.",
            "Norman Good's 1966 survey addressed exactly these failures by designing buffers to a specification: zwitterionic, water soluble, membrane impermeant, non-complexing toward metals, spectroscopically transparent, and with pKa values spread across the physiological range. HEPES, MOPS and PIPES come from that programme, and they are the default for cell work for reasons of chemistry rather than tradition.",
          ],
        },
        {
          heading: "Blood: an open buffer that outperforms its own pKa",
          body: [
            "The dominant extracellular buffer is CO₂ and bicarbonate: CO₂(aq) + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻. Because the hydration step is slow and lies far to the left, physiology lumps it into an apparent constant, pKa′ = 6.1, applied directly to dissolved CO₂. Dissolved CO₂ is in turn set by its partial pressure, [CO₂] = 0.03 × pCO₂ with pCO₂ in mmHg, giving the clinical form pH = 6.1 + log([HCO₃⁻]/(0.03 × pCO₂)). Normal values, [HCO₃⁻] = 24 mM and pCO₂ = 40 mmHg, give 0.03 × 40 = 1.2 mM, a ratio of 20, and pH = 6.1 + 1.30 = 7.40.",
            "By the criteria of the previous section this should be a poor buffer. Its pKa′ is 1.3 units away from the pH it defends, which puts it near the edge of its useful range, and the ratio of 20:1 means the bicarbonate reservoir is enormous while the acid member is scarce. As a closed system it would be a bad choice.",
            "It works because it is open at both ends, and the two members are regulated independently. The lungs control pCO₂ within seconds to minutes by changing ventilation rate — hyperventilate and the denominator falls and pH rises, which is exactly the mechanism behind the tingling fingers of a panic attack. The kidneys control [HCO₃⁻] over hours to days by reabsorbing or excreting it. A buffer whose acid can be exhaled and whose base can be manufactured is not bounded by the capacity equation at all, and the clinical vocabulary of respiratory versus metabolic acidosis and alkalosis is simply a statement of which of the two terms has moved. Haemoglobin, plasma proteins and intracellular phosphate supply the remaining fast capacity.",
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
];

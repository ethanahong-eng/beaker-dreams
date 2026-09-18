import type { TopicOverride } from "./types";
import { GibbsDerivation } from "@/components/GibbsDerivation";

export const equilibriumOverrides: Record<string, TopicOverride> = {
  "acids-and-bases": {
    easy: {
      significance: [
        "Acids and bases are not a separate branch of chemistry — they are equilibrium applied to one particular reaction, the transfer of a proton. Once you see pH as an equilibrium position rather than a label on a bottle, most of the calculations stop being memorization.",
        "This is one of the most heavily tested units on the AP exam, and it is also everywhere outside it: blood held at 7.4, soil pH deciding what will grow, and the oceans turning slowly more acidic as they absorb carbon dioxide. Getting comfortable with one weak-acid calculation carries you through most of it.",
      ],
      theory: [
        {
          heading: "An acid donates a proton, a base accepts one",
          body: [
            "In the Brønsted–Lowry definition, an acid gives away an H⁺ and a base takes one. Because the H⁺ has to go somewhere, acid–base reactions always come in pairs: HA gives up its proton and becomes A⁻, its conjugate base, while the base that took it becomes its conjugate acid. HA and A⁻ are called a conjugate pair — they differ by exactly one proton.",
            "There is a broader definition too. A Lewis acid accepts a pair of electrons and a Lewis base donates one. It covers everything Brønsted–Lowry does plus reactions where no proton moves at all, such as BF₃ bonding to NH₃.",
          ],
        },
        {
          heading: "pH is a log scale, so each unit is a factor of ten",
          body: [
            "pH = −log[H₃O⁺], and pOH = −log[OH⁻]. In water the two concentrations are locked together by [H₃O⁺][OH⁻] = 1.0×10⁻¹⁴ at 25 °C, which is the same as saying pH + pOH = 14.00. Neutral is pH 7, acidic is below 7, basic is above 7.",
            "Strong acids dissociate completely, which makes their pH a one-line calculation. For 0.010 M HNO₃, [H₃O⁺] = 0.010 M, so pH = −log(0.010) = 2.00. For a strong base, do it through pOH first: 0.0010 M NaOH gives [OH⁻] = 0.0010 M, pOH = 3.00, so pH = 14.00 − 3.00 = 11.00.",
          ],
        },
        {
          heading: "Weak acids only partly dissociate, so you need Ka",
          body: [
            "A weak acid reaches a real equilibrium, described by Ka = [H₃O⁺][A⁻]/[HA]. Small Ka means a weak acid. Because the numbers are tiny, chemists often use pKa = −log Ka instead, where a larger pKa means a weaker acid.",
            "Worked example: find the pH of 0.100 M acetic acid, Ka = 1.8×10⁻⁵. Let x be the amount that ionises. Then x²/(0.100 − x) = 1.8×10⁻⁵. Because Ka is small, x is small compared with 0.100, so approximate the denominator as 0.100: x² = 1.8×10⁻⁵ × 0.100 = 1.8×10⁻⁶, giving x = 1.3×10⁻³ M. So pH = −log(1.3×10⁻³) = 2.87. Check the approximation: 1.3×10⁻³ out of 0.100 is 1.3%, safely under 5%, so it was valid.",
            "Compare that to 0.100 M HCl, which gives pH 1.00. Same concentration on the label, but almost a hundred times more hydrogen ion in the strong acid — that difference is entirely about where the equilibrium sits.",
          ],
        },
        {
          heading: "Titration curves: what the shape tells you",
          body: [
            "In a titration you add measured amounts of base to an acid and track pH. For a strong acid with a strong base, the pH climbs slowly, then rockets almost vertically through the equivalence point — the point where you have added exactly enough base to react with all the acid — and levels off. That equivalence point is at pH 7.00.",
            "For a weak acid with a strong base the curve looks different in three ways: it starts higher, it has a flat stretch early on called the buffer region, and its equivalence point is above pH 7. It is above 7 because what is left in the flask at that point is A⁻, the conjugate base, which is itself basic. Halfway to the equivalence point there is exactly as much HA as A⁻, and there the pH equals the pKa — the easiest way to measure a pKa in the lab.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question: "What is the pH of a 0.0050 M solution of the strong base Ca(OH)₂?",
          answer: "pH = 12.00.",
          explanation:
            "Each Ca(OH)₂ releases two hydroxides, so [OH⁻] = 2 × 0.0050 = 0.010 M. Then pOH = −log(0.010) = 2.00, and pH = 14.00 − 2.00 = 12.00.",
        },
        {
          question:
            "HF has Ka = 6.8×10⁻⁴ and acetic acid has Ka = 1.8×10⁻⁵. Which is the stronger acid, and which has the stronger conjugate base?",
          answer:
            "HF is the stronger acid; acetate (the conjugate base of acetic acid) is the stronger base.",
          explanation:
            "A larger Ka means more dissociation, so HF is stronger. Ka and Kb of a conjugate pair are linked by Ka·Kb = Kw, so the weaker acid necessarily has the stronger conjugate base.",
        },
        {
          question:
            "Why is the equivalence point of a weak acid titrated with a strong base at a pH above 7?",
          answer:
            "Because the solution at that point contains the acid's conjugate base, which reacts with water to produce OH⁻.",
          explanation:
            "All the weak acid has been converted to A⁻. A⁻ is a weak base, so it takes protons from water and leaves excess hydroxide behind, pushing the pH above neutral. For a strong acid there is no such basic product, so the equivalence point sits at exactly 7.",
        },
        {
          question:
            "During the titration of a weak acid, the pH at the half-equivalence point is measured as 4.20. What is the Ka of the acid?",
          answer: "Ka = 6.3×10⁻⁵.",
          explanation:
            "At half-equivalence, half the acid has been converted, so [HA] = [A⁻] and pH = pKa. So pKa = 4.20, and Ka = 10^(−4.20) = 6.3×10⁻⁵.",
        },
        {
          question:
            "Hydrochloric, hydrobromic and nitric acid all appear equally strong when dissolved in water. Why can water not distinguish between them?",
          answer:
            "Because all three dissociate completely, leaving H₃O⁺ as the only acid present — this is the levelling effect.",
          explanation:
            "Water is a strong enough base to take the proton from any of them, so the strongest acid that can exist in water is H₃O⁺ itself. Telling them apart requires a less basic solvent, such as glacial acetic acid.",
        },
      ],
    },
  },
  buffers: {
    easy: {
      significance: [
        "A buffer is a solution that barely changes pH when you add acid or base to it. That sounds like a niche trick, but it is how every cell in your body keeps its chemistry running, and it is the reason a small mistake with a pipette does not ruin a biology experiment.",
        "On the AP exam buffers come up as calculations (find the pH of this mixture), as predictions (what happens when I add a little strong acid), and as design questions (which of these four acids should I use to make a buffer at pH 7.2). All three come from the same one-line equation.",
      ],
      theory: [
        {
          heading: "A buffer holds pH steady because it contains both partners",
          body: [
            "A buffer is a mixture of a weak acid and its conjugate base, both present in decent amounts. Acetic acid plus sodium acetate is the classic one. The two work as a team: if you add strong acid, the base member soaks it up; if you add strong base, the acid member soaks that up. Either way, very little free H₃O⁺ or OH⁻ survives.",
            "A strong acid and its own conjugate base do not work, because the conjugate base of a strong acid is not basic enough to soak anything up. HCl and NaCl is not a buffer.",
          ],
        },
        {
          heading: "Henderson–Hasselbalch does the arithmetic",
          body: [
            "The equation is pH = pKa + log([base]/[acid]). Notice what it says: the pH depends on the ratio of the two components, not on how concentrated they are. When you have equal amounts of each, the log of 1 is zero and pH = pKa exactly.",
            "Worked example: 1.00 L of solution contains 0.100 mol acetic acid and 0.100 mol sodium acetate. Acetic acid has Ka = 1.8×10⁻⁵, so pKa = 4.74, and since the amounts are equal the pH is 4.74. Now add 0.010 mol of NaOH. The base converts that much acid into its conjugate base, so acid falls to 0.090 mol and base rises to 0.110 mol. The new pH = 4.74 + log(0.110/0.090) = 4.74 + 0.09 = 4.83.",
            "For comparison, dropping that same 0.010 mol of NaOH into a litre of pure water gives pOH = 2.00 and pH = 12.00. The buffer moved by 0.09 of a unit; plain water moved by 5.",
          ],
        },
        {
          heading: "Buffer capacity: how much abuse a buffer can take",
          body: [
            "Buffer capacity is how much acid or base you can add before the pH really starts to move. Two things set it. First, total concentration — a 1.0 M buffer holds out roughly ten times longer than a 0.1 M one at the same pH. Second, the ratio — capacity is highest when the two components are equal, which means when pH = pKa.",
            "That gives the rule for choosing a buffer: pick a weak acid whose pKa is as close as possible to the pH you want, and never more than about one unit away. Beyond pKa ± 1 the ratio has passed 10:1, one component is running out, and the buffer stops working well.",
          ],
        },
        {
          heading: "The buffer that keeps you alive",
          body: [
            "Blood is buffered mainly by carbon dioxide and bicarbonate: CO₂ + H₂O ⇌ H⁺ + HCO₃⁻. Your metabolism produces acid constantly, and yet blood pH stays between 7.35 and 7.45. Outside that narrow band, proteins change shape and enzymes stop working.",
            "What makes this system unusually powerful is that your body controls both members separately. The lungs adjust CO₂ within seconds by changing how fast you breathe — breathe faster and you blow off CO₂, which raises pH. The kidneys adjust bicarbonate over hours. Most laboratory buffers are sealed in a flask and have only what you put in them; this one can be topped up and drained on demand.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "Which of these mixtures is a buffer: (a) HCl and NaCl, (b) CH₃COOH and CH₃COONa, (c) NaOH and NaCl?",
          answer: "(b) CH₃COOH and CH₃COONa.",
          explanation:
            "A buffer needs a weak acid together with its conjugate base. Cl⁻ is the conjugate base of a strong acid and is far too weak to neutralize anything, and (c) contains no conjugate pair at all.",
        },
        {
          question:
            "You need a buffer at pH 7.2. Available acids have pKa values of 3.75 (formic), 4.74 (acetic), 7.21 (dihydrogen phosphate) and 9.25 (ammonium). Which do you choose, and why?",
          answer:
            "Dihydrogen phosphate, H₂PO₄⁻, because its pKa of 7.21 is closest to the target pH.",
          explanation:
            "A buffer works best within about one pH unit of its pKa, where the two components are present in comparable amounts. The others are between 2 and 3.5 units away, so one component would be nearly exhausted from the start.",
        },
        {
          question:
            "Calculate the pH of a buffer that is 0.20 M in NH₃ and 0.40 M in NH₄Cl. The pKa of NH₄⁺ is 9.25.",
          answer: "pH = 8.95.",
          explanation:
            "pH = pKa + log([base]/[acid]) = 9.25 + log(0.20/0.40) = 9.25 + log(0.50) = 9.25 − 0.30 = 8.95. More acid than base pulls the pH below the pKa, as expected.",
        },
        {
          question:
            "A buffer is diluted with an equal volume of water. What happens to its pH, and what happens to its buffer capacity?",
          answer: "The pH stays essentially the same; the buffer capacity is cut roughly in half.",
          explanation:
            "Henderson–Hasselbalch depends on the ratio of the two components, and dilution divides both by the same factor, leaving the ratio unchanged. Capacity, though, depends on the absolute amounts available to absorb added acid or base, so it falls with concentration.",
        },
        {
          question:
            "Explain, in terms of the species present, why adding a small amount of HCl to an acetate buffer barely changes the pH.",
          answer:
            "The added H₃O⁺ is consumed by acetate ions, converting them to acetic acid instead of remaining free in solution.",
          explanation:
            "Because the strong acid is converted into a weak one, the ratio [acetate]/[acetic acid] shifts only slightly, and pH depends on the logarithm of that ratio — so even a noticeable shift in the ratio produces only a small pH change.",
        },
      ],
    },
  },
  thermodynamics: {
    extraTheory: [
      {
        heading: "Where ΔG° = −RT ln K actually comes from",
        body: (
          <div className="space-y-4">
            <p className="leading-relaxed text-muted-foreground">
              That last line isn't a separate fact to memorize alongside ΔG = ΔH − TΔS — it's a
              direct calculus consequence of two definitions and the combined first and second law,
              worked through explicitly below rather than asserted.
            </p>
            <GibbsDerivation />
          </div>
        ),
      },
    ],
    easy: {
      significance: [
        "Not every reaction that releases energy happens on its own, and not every reaction that needs energy is impossible. Whether a reaction goes forward by itself comes down to one number, ΔG, that balances the energy it releases against how much more spread out the system becomes.",
        'That same ΔG also predicts where a reaction ends up at equilibrium — a very negative ΔG° means a reaction goes almost entirely to products, connecting the "does this happen" question of thermodynamics directly to the equilibrium constant K.',
      ],
      theory: [
        {
          heading: "Entropy: a measure of spread-out energy",
          body: [
            "Entropy (S) measures how spread out or disordered a system's energy is. Melting ice, dissolving salt, and a gas expanding into a bigger container all increase entropy because each one creates more ways for the system's particles and energy to be arranged.",
            "The second law of thermodynamics says the entropy of the universe as a whole only increases, or stays the same — it never decreases on its own.",
          ],
        },
        {
          heading: "ΔG = ΔH − TΔS: the spontaneity equation",
          body: [
            "Gibbs free energy change (ΔG) combines a reaction's heat change (ΔH) and its entropy change (ΔS) into one number that predicts spontaneity. ΔG < 0 means the reaction is spontaneous as written; ΔG > 0 means it isn't (the reverse reaction is, instead); ΔG = 0 means the system is already at equilibrium.",
            "Because temperature (T) multiplies ΔS, some reactions flip from spontaneous to nonspontaneous (or the reverse) depending on temperature — this happens whenever ΔH and ΔS share the same sign. An endothermic reaction (ΔH > 0) that increases entropy (ΔS > 0), for example, is nonspontaneous at low T but becomes spontaneous once T is large enough.",
          ],
        },
        {
          heading: "Connecting ΔG° to the equilibrium constant K",
          body: [
            "ΔG° and K describe the same fact about a reaction in different units. A large negative ΔG° corresponds to a large K (the reaction favors products at equilibrium); a large positive ΔG° corresponds to a small K (the reaction barely proceeds at all).",
            'That\'s why a reaction with a very negative ΔG° is often described as going "to completion" — at equilibrium, essentially all the reactants have converted to products.',
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "A reaction has ΔH < 0 and ΔS < 0. Under what temperature conditions is it spontaneous?",
          answer: "Only at low temperatures.",
          explanation:
            "ΔG = ΔH − TΔS. With ΔH negative and ΔS negative, ΔG = (negative) + T·(positive). At low T that positive term stays small, so ΔG stays negative (spontaneous). As T rises, the T|ΔS| term eventually outweighs ΔH and ΔG turns positive (nonspontaneous).",
        },
        {
          question:
            "Which of the following increases the entropy of a system: melting, freezing, or compressing a gas?",
          answer: "Melting.",
          explanation:
            "Melting turns an ordered solid into a more disordered liquid, increasing the number of ways the molecules can be arranged. Freezing and compressing a gas both reduce the number of accessible arrangements, so entropy decreases in those cases.",
        },
        {
          question:
            "If ΔG° for a reaction is very large and positive, what does that tell you about K?",
          answer: "K is very small (K ≪ 1) — the reaction barely proceeds to products.",
          explanation:
            "ΔG° and K are directly linked by ΔG° = −RT ln K. A large positive ΔG° requires ln K to be a large negative number, which means K itself is a tiny fraction — at equilibrium the mixture is overwhelmingly reactants.",
        },
        {
          question: "A process has ΔG = 0. What does this tell you about the system?",
          answer: "The system is at equilibrium.",
          explanation:
            "ΔG = 0 is the defining condition of equilibrium: there's no net driving force pushing the reaction toward products or reactants, because both directions are equally favorable at that exact point.",
        },
      ],
    },
  },
};

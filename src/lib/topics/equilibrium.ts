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
];

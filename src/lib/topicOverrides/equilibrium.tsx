import type { TopicOverride } from "./types";
import { GibbsDerivation } from "@/components/GibbsDerivation";

export const equilibriumOverrides: Record<string, TopicOverride> = {
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

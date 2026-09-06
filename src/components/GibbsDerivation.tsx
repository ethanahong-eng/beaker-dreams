import { Math } from "@/components/Math";

type Step = {
  label: string;
  tex: string;
  body: string;
};

const STEPS: Step[] = [
  {
    label: "1. Start from the combined first and second law",
    tex: "dU = T\\,dS - P\\,dV",
    body: "For a reversible process, the first law (dU = δq + δw) combines with the second law (δq = T dS, for a reversible change) and reversible pressure–volume work (δw = −P dV) into this one fundamental relation. It holds for any closed system doing only P–V work, regardless of what physical process is happening.",
  },
  {
    label: "2. Define Gibbs free energy",
    tex: "G \\equiv H - TS = U + PV - TS",
    body: "Enthalpy H = U + PV was already built to make constant-pressure heat flow a state function. Gibbs energy adds a −TS term on top, built specifically so its own change will isolate exactly the two variables an experimentalist actually controls: pressure and temperature.",
  },
  {
    label: "3. Differentiate the definition",
    tex: "dG = dU + P\\,dV + V\\,dP - T\\,dS - S\\,dT",
    body: "Take the total differential of G = U + PV − TS using the ordinary product rule on both PV and TS — no physics yet, this is pure calculus applied to the definition.",
  },
  {
    label: "4. Substitute dU from step 1",
    tex: "dG = \\underbrace{(T\\,dS - P\\,dV)}_{dU} + P\\,dV + V\\,dP - T\\,dS - S\\,dT",
    body: "Replacing dU with the combined-law expression from step 1 lets every dS and dV term cancel exactly, leaving only dP and dT.",
  },
  {
    label: "5. The fundamental equation for G",
    tex: "dG = V\\,dP - S\\,dT",
    body: "This is the payoff of defining G the way step 2 did: its change depends on nothing but pressure and temperature. At constant temperature (dT = 0), it reduces to dG = V dP — a single-variable equation that can be integrated directly.",
  },
  {
    label: "6. Integrate at constant temperature (ideal gas)",
    tex: "\\int_{G^\\circ}^{G} dG = \\int_{P^\\circ}^{P} \\frac{nRT}{P'}\\,dP' \\;\\;\\Longrightarrow\\;\\; G = G^\\circ + nRT\\ln\\!\\frac{P}{P^\\circ}",
    body: "Substituting the ideal gas law V = nRT/P and integrating both sides from a reference pressure P° to the actual pressure P turns the differential relation into an explicit formula: free energy grows logarithmically with pressure, not linearly.",
  },
  {
    label: "7. Extend to a whole reaction",
    tex: "\\Delta G_{\\text{rxn}} = \\Delta G^\\circ_{\\text{rxn}} + RT\\ln Q",
    body: "Apply step 6 to every reactant and product, weight each by its stoichiometric coefficient, and subtract products − reactants. All the individual ln(P/P°) terms combine into a single ln Q, where Q is the reaction quotient built from those same partial pressures (or concentrations, or activities).",
  },
  {
    label: "8. Impose equilibrium",
    tex: "0 = \\Delta G^\\circ + RT\\ln K \\;\\;\\Longrightarrow\\;\\; \\Delta G^\\circ = -RT\\ln K",
    body: "At equilibrium the system has nothing left to gain by shifting further in either direction, so ΔG_rxn = 0 by definition — and Q has settled to exactly K. Substituting both into step 7 and solving for ΔG° gives the final result: the equilibrium constant is a direct, calculable consequence of a compound's standard free energy, not a separate empirical fact.",
  },
];

/** A full calculus derivation of ΔG° = −RT ln K, step by step, from the combined first/second law. */
export function GibbsDerivation() {
  return (
    <div className="space-y-8">
      {STEPS.map((step) => (
        <div key={step.label} className="border-l-2 border-border pl-6">
          <h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
            {step.label}
          </h4>
          <div className="mb-3 rounded-lg border border-border bg-card p-4 text-foreground">
            <Math tex={step.tex} />
          </div>
          <p className="leading-relaxed text-muted-foreground">{step.body}</p>
        </div>
      ))}
    </div>
  );
}

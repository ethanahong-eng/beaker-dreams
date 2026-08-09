import { createFileRoute } from "@tanstack/react-router";
import { EquilibriumSim } from "@/components/EquilibriumSim";
import seesaw from "@/assets/equilibrium-seesaw.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dynamic Equilibrium Simulation — Valence Lab" },
      {
        name: "description",
        content:
          "Manipulate temperature, pressure and concentration in a live N₂O₄ ⇌ 2NO₂ simulation and watch Le Chatelier's principle restore balance.",
      },
      { property: "og:title", content: "Dynamic Equilibrium Simulation — Valence Lab" },
      {
        property: "og:description",
        content: "A live particle simulation that explains chemical equilibrium, Qc and Kc.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-16 max-w-3xl">
        <div className="mb-4 inline-block border border-accent/20 bg-accent/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Module 04: Chemical Dynamics
        </div>
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
          Dynamic <span className="text-accent">Equilibrium</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Understand the microscopic balance where forward and reverse reaction rates equalize. Manipulate
          pressure, temperature, and concentration to witness Le Chatelier's Principle in real-time.
        </p>
      </header>

      <div id="simulation">
        <EquilibriumSim />
      </div>

      <section className="mt-24 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
        <div>
          <h2 className="mb-6 text-3xl font-bold italic">The Reaction Quotient (Qc)</h2>
          <p className="mb-6 leading-relaxed text-muted-foreground">
            Unlike the equilibrium constant Kc, which describes the stable state, the reaction quotient Qc can be
            calculated at any moment. Comparing Qc to Kc predicts which way the reaction will shift to reach
            equilibrium.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-accent">Qc &lt; Kc:</span>
              <span className="text-sm">Reaction proceeds forward (right) to form more products.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-accent">Qc &gt; Kc:</span>
              <span className="text-sm">Reaction proceeds backward (left) to form more reactants.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono font-bold text-accent">Qc = Kc:</span>
              <span className="text-sm">
                Rates are matched. Molecules keep reacting, but concentrations hold steady.
              </span>
            </li>
          </ul>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Temperature is the only control that changes Kc itself. Every other disturbance — adding reactant,
            squeezing the vessel — moves Qc and lets the system settle back to the same Kc.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8">
          <img
            src={seesaw}
            alt="Seesaw balance diagram with N2O4 on one pan and NO2 on the other, illustrating equilibrium shift"
            loading="lazy"
            width={944}
            height={704}
            className="mb-6 w-full rounded-lg"
          />
          <p className="text-center font-mono text-xs text-muted-foreground">
            Fig 1.2: Visual representation of the equilibrium seesaw.
          </p>
        </div>
      </section>
    </main>
  );
}

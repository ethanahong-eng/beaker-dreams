import { createFileRoute } from "@tanstack/react-router";
import { EquilibriumSim } from "@/components/EquilibriumSim";
import { SectionNav } from "@/components/SectionNav";
import seesaw from "@/assets/equilibrium-seesaw.jpg";

const sections = [
  { id: "significance", label: "Significance" },
  { id: "theory", label: "Theory" },
  { id: "simulation", label: "Simulation" },
];

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

      <section id="significance" aria-labelledby="significance-heading" className="mb-20 scroll-mt-24 border-t border-border pt-10">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Section 01 · Significance
        </span>
        <h2 id="significance-heading" className="mt-3 text-3xl font-bold">
          From fertilizer to a global food system
        </h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <p className="leading-relaxed text-muted-foreground">
            Chemical equilibrium became an industrial tool in the early twentieth century. Fritz Haber showed
            that nitrogen and hydrogen could be balanced under pressure to make ammonia; Carl Bosch then made the
            process work at factory scale. The resulting fertilizer transformed agriculture and helped support
            billions of people, while the same chemistry also supplied wartime explosives.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            That legacy makes equilibrium an economic and environmental question, not only a classroom rule.
            Pressure, temperature, energy prices, and continuous product removal determine how much a plant can
            produce and at what cost. Modern ammonia production remains energy intensive, so improving its
            balance is central to food security and lower-carbon industry.
          </p>
        </div>
      </section>

      <section id="theory" aria-labelledby="theory-heading" className="scroll-mt-24">
        <div className="mb-8">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            Section 02 · Theory
          </span>
          <h2 id="theory-heading" className="mt-3 text-3xl font-bold">
            Balance at the molecular scale
          </h2>
        </div>

      <section className="mb-10 grid gap-6 rounded-2xl border border-border bg-card p-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            About this demo
          </span>
          <h2 className="mt-3 text-xl font-bold">What you're looking at</h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:col-span-2">
          <p>
            The vessel holds N₂O₄ and NO₂ interconverting continuously. Nothing ever stops: every particle you
            see is still reacting, but the forward and reverse rates have matched, so the counts hold steady.
            That is what makes equilibrium <em>dynamic</em> rather than static.
          </p>
          <p>
            Each control disturbs the balance in a different way. Concentration and pressure move Qc and let the
            system relax back to the same Kc; temperature moves Kc itself, because the reaction absorbs heat in
            one direction and releases it in the other. Watch the readouts, not just the particles.
          </p>
        </div>
      </section>

      <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
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

      <section className="mt-16 grid gap-10 border-t border-border pt-16 md:grid-cols-3">
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
            Le Chatelier, precisely
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A system at equilibrium responds to a disturbance by shifting in the direction that partially
            offsets it. Partially is the key word: the system never fully undoes your change, it only moves to a
            new balance point closer to the old one.
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
            Why pressure matters here
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Two moles of NO₂ occupy more space than one mole of N₂O₄. Compress the vessel and the equilibrium
            shifts toward the side with fewer gas molecules. In a reaction with equal moles on both sides,
            pressure would do nothing at all.
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
            Where this shows up
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The Haber–Bosch process feeds roughly half the world's population by running an unfavourable
            ammonia equilibrium under high pressure with continuous product removal — Le Chatelier applied at
            industrial scale.
          </p>
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-card p-8">
        <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
          Common misconception
        </h3>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Equilibrium does not mean equal amounts. A very large Kc means products dominate; a very small one
          means the reaction barely proceeds. What is equal at equilibrium is the pair of rates, not the pair of
          concentrations. Adding a catalyst reaches that state faster without changing where it lands.
        </p>
      </section>
      </section>

      <section id="simulation" aria-labelledby="simulation-heading" className="mt-24 scroll-mt-24 border-t border-border pt-16">
        <div className="mb-10 max-w-3xl">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            Section 03 · Simulation
          </span>
          <h2 id="simulation-heading" className="mt-3 text-3xl font-bold">
            Disturb the equilibrium
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Change one condition at a time, then compare Qc with Kc to predict the direction of the shift before
            the particles settle into their new balance.
          </p>
        </div>
        <div>
          <EquilibriumSim />
        </div>
      </section>
      <SectionNav items={sections} />
    </main>
  );
}

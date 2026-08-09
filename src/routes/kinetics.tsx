import { createFileRoute } from "@tanstack/react-router";
import { RateSim } from "@/components/RateSim";

export const Route = createFileRoute("/kinetics")({
  head: () => ({
    meta: [
      { title: "Reaction Kinetics Simulation — Valence Lab" },
      {
        name: "description",
        content:
          "See how temperature, activation energy and catalysts change the fraction of successful collisions in a live kinetics simulation.",
      },
      { property: "og:title", content: "Reaction Kinetics Simulation — Valence Lab" },
      {
        property: "og:description",
        content: "An interactive Maxwell-Boltzmann distribution explaining what actually controls reaction rate.",
      },
    ],
  }),
  component: KineticsPage,
});

function KineticsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-16 max-w-3xl">
        <div className="mb-4 inline-block border border-accent/20 bg-accent/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Module 02: Reaction Rates
        </div>
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
          Collision <span className="text-accent">Kinetics</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          A reaction only happens when molecules collide with enough energy and the right orientation. Shift the
          energy distribution and watch how few — or how many — collisions clear the activation barrier.
        </p>
      </header>

      <section className="mb-10 grid gap-6 rounded-2xl border border-border bg-card p-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            About this demo
          </span>
          <h2 className="mt-3 text-xl font-bold">Reading the Maxwell–Boltzmann curve</h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:col-span-2">
          <p>
            The curve shows how kinetic energy is spread across a population of molecules at a given
            temperature. The height at any point is the number of molecules with that energy — most sit near the
            middle, a few crawl, and a long tail runs far to the right.
          </p>
          <p>
            The dashed line is the activation energy. Only the shaded area beyond it represents collisions
            energetic enough to react. Raising the temperature flattens and stretches the curve rightward;
            adding a catalyst instead slides the dashed line left. Both grow the shaded area, but only one of
            them changes the molecules themselves.
          </p>
        </div>
      </section>

      <div id="simulation">
        <RateSim />
      </div>

      <section className="mt-24 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
        <div>
          <h2 className="mb-6 text-3xl font-bold italic">Why heat multiplies rate</h2>
          <p className="leading-relaxed text-muted-foreground">
            Raising the temperature does not shift the whole curve evenly — it stretches its tail. A modest 10 K
            rise can double the number of molecules past the activation energy, which is why rates climb
            exponentially rather than linearly with temperature.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The Arrhenius equation, k = Ae^(−Ea/RT), makes this explicit. Because Ea sits in an exponent,
            temperature and activation energy do not nudge the rate — they scale it. Halving Ea does far more
            than halving the time a reaction takes.
          </p>
        </div>
        <div>
          <h2 className="mb-6 text-3xl font-bold italic">What a catalyst really does</h2>
          <p className="leading-relaxed text-muted-foreground">
            A catalyst never adds energy. It opens a different pathway with a lower barrier, so the same
            population of molecules suddenly qualifies. Toggle the catalyst and note the shaded area grows while
            the curve itself stays put.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            A catalyst is also regenerated, so a tiny amount services an enormous number of cycles — and it
            lowers the barrier equally in both directions, speeding the reaction toward equilibrium without ever
            changing where that equilibrium lies.
          </p>
        </div>
      </section>

      <section className="mt-16 grid gap-10 border-t border-border pt-16 md:grid-cols-3">
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
            Collision theory
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Energy is necessary but not sufficient. Molecules must also meet in the right orientation, captured
            by the steric factor. Bulky reactants can have a large energetic population above Ea and still react
            slowly because most encounters are geometrically useless.
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
            Rate laws and order
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Rate laws are measured, not read off a balanced equation. A reaction may be first order in one
            reactant and zero order in another, which usually means the second reactant only appears after the
            slow, rate-determining step.
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
            Try this
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Set Ea to 60 kJ/mol and step the temperature from 300 K to 310 K, watching the percentage above Ea.
            Then return to 300 K and switch on the catalyst — note how much temperature it substitutes for.
          </p>
        </div>
      </section>
    </main>
  );
}

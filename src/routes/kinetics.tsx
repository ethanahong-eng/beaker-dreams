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
        </div>
        <div>
          <h2 className="mb-6 text-3xl font-bold italic">What a catalyst really does</h2>
          <p className="leading-relaxed text-muted-foreground">
            A catalyst never adds energy. It opens a different pathway with a lower barrier, so the same
            population of molecules suddenly qualifies. Toggle the catalyst and note the shaded area grows while
            the curve itself stays put.
          </p>
        </div>
      </section>
    </main>
  );
}

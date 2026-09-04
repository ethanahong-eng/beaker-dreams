import { createFileRoute } from "@tanstack/react-router";
import { RateSim } from "@/components/RateSim";
import { CollisionSim } from "@/components/CollisionSim";
import { ReactionMechanism3D } from "@/components/ReactionMechanism3D";
import { SectionNav } from "@/components/SectionNav";

const sections = [
  { id: "significance", label: "Significance" },
  { id: "theory", label: "Theory" },
  { id: "simulation", label: "Simulation" },
  { id: "collisions", label: "Collision lab" },
  { id: "mechanism", label: "Reaction mechanism" },
];

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
        content:
          "An interactive Maxwell-Boltzmann distribution explaining what actually controls reaction rate.",
      },
    ],
  }),
  component: KineticsPage,
});

function KineticsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-16 max-w-3xl border-b border-border pb-12">
        <div className="mb-5 inline-block border-y border-border px-4 py-2 text-[10px] font-bold uppercase text-accent">
          Module 03: Reaction Rates
        </div>
        <h1 className="mb-6 font-display text-5xl font-bold md:text-6xl">
          Collision <span className="text-accent">Kinetics</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          A reaction only happens when molecules collide with enough energy and the right
          orientation. Shift the energy distribution and watch how few — or how many — collisions
          clear the activation barrier.
        </p>
      </header>

      <section
        id="significance"
        aria-labelledby="significance-heading"
        className="mb-20 scroll-mt-24 pt-2"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Section 01 · Significance
        </span>
        <h2 id="significance-heading" className="mt-3 text-3xl font-bold">
          Controlling time, safety, and scarcity
        </h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <p className="leading-relaxed text-muted-foreground">
            Nineteenth-century chemists including Jacobus van ’t Hoff and Svante Arrhenius turned
            reaction speed into something measurable, linking temperature to the energy barrier a
            reaction must cross. That work gave industry a way to predict shelf life, design safer
            processes, and make medicines consistently.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Kinetics shapes daily access to food, clean water, fuel, and pharmaceuticals.
            Refrigeration slows spoilage but demands energy; catalysts reduce industrial
            temperatures and costs but often depend on scarce metals. Choosing how fast chemistry
            should run therefore carries economic, environmental, and public-health consequences.
          </p>
        </div>
      </section>

      <section id="theory" aria-labelledby="theory-heading" className="scroll-mt-24">
        <div className="mb-8">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            Section 02 · Theory
          </span>
          <h2 id="theory-heading" className="mt-3 text-3xl font-bold">
            Energy, collisions, and pathways
          </h2>
        </div>

        <section className="mb-10 grid gap-6 border border-border bg-card/70 p-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
              About this demo
            </span>
            <h2 className="mt-3 text-xl font-bold">Reading the Maxwell–Boltzmann curve</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:col-span-2">
            <p>
              The curve shows how kinetic energy is spread across a population of molecules at a
              given temperature. The height at any point is the number of molecules with that energy
              — most sit near the middle, a few crawl, and a long tail runs far to the right.
            </p>
            <p>
              The dashed line is the activation energy. Only the shaded area beyond it represents
              collisions energetic enough to react. Raising the temperature flattens and stretches
              the curve rightward; adding a catalyst instead slides the dashed line left. Both grow
              the shaded area, but only one of them changes the molecules themselves.
            </p>
          </div>
        </section>

        <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold italic">Why heat multiplies rate</h2>
            <p className="leading-relaxed text-muted-foreground">
              Raising the temperature does not shift the whole curve evenly — it stretches its tail.
              A modest 10 K rise can double the number of molecules past the activation energy,
              which is why rates climb exponentially rather than linearly with temperature.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The Arrhenius equation, k = Ae^(−Ea/RT), makes this explicit. Because Ea sits in an
              exponent, temperature and activation energy do not nudge the rate — they scale it.
              Halving Ea does far more than halving the time a reaction takes.
            </p>
          </div>
          <div>
            <h2 className="mb-6 text-3xl font-bold italic">What a catalyst really does</h2>
            <p className="leading-relaxed text-muted-foreground">
              A catalyst never adds energy. It opens a different pathway with a lower barrier, so
              the same population of molecules suddenly qualifies. Toggle the catalyst and note the
              shaded area grows while the curve itself stays put.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A catalyst is also regenerated, so a tiny amount services an enormous number of cycles
              — and it lowers the barrier equally in both directions, speeding the reaction toward
              equilibrium without ever changing where that equilibrium lies.
            </p>
          </div>
        </section>

        <section className="mt-16 grid gap-10 border-t border-border pt-16 md:grid-cols-3">
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
              Collision theory
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Energy is necessary but not sufficient. Molecules must also meet in the right
              orientation, captured by the steric factor. Bulky reactants can have a large energetic
              population above Ea and still react slowly because most encounters are geometrically
              useless.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
              Rate laws and order
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Rate laws are measured, not read off a balanced equation. A reaction may be first
              order in one reactant and zero order in another, which usually means the second
              reactant only appears after the slow, rate-determining step.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
              Try this
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Set Ea to 60 kJ/mol and step the temperature from 300 K to 310 K, watching the
              percentage above Ea. Then return to 300 K and switch on the catalyst — note how much
              temperature it substitutes for.
            </p>
          </div>
        </section>
      </section>

      <section
        id="simulation"
        aria-labelledby="simulation-heading"
        className="mt-24 scroll-mt-24 border-t border-border pt-16"
      >
        <div className="mb-10 max-w-3xl">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            Section 03 · Simulation
          </span>
          <h2 id="simulation-heading" className="mt-3 text-3xl font-bold">
            Shift the energy distribution
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Adjust temperature and activation energy, then compare those changes with a catalyst to
            see how each alters the fraction of collisions able to react.
          </p>
        </div>
        <div>
          <RateSim />
        </div>
      </section>

      <section
        id="collisions"
        aria-labelledby="collisions-heading"
        className="mt-24 scroll-mt-24 border-t border-border pt-16"
      >
        <div className="mb-10 max-w-3xl">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            Section 04 · Collision Lab
          </span>
          <h2 id="collisions-heading" className="mt-3 text-3xl font-bold">
            Watch individual collisions succeed or fail
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The curve above shows the population's energy distribution. This is what a single
            collision looks like: each A + B hit is checked for both enough energy and a good enough
            alignment between the two particles' reactive faces — gray means the collision was too
            weak, yellow means it had the energy but missed the angle, and green means it actually
            reacted. Tune the steric factor to see how much orientation alone can throttle a
            reaction that has plenty of energy to spare.
          </p>
        </div>
        <div>
          <CollisionSim />
        </div>
      </section>

      <section
        id="mechanism"
        aria-labelledby="mechanism-heading"
        className="mt-24 scroll-mt-24 border-t border-border pt-16"
      >
        <div className="mb-10 max-w-3xl">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            Section 05 · Reaction Mechanism
          </span>
          <h2 id="mechanism-heading" className="mt-3 text-3xl font-bold">
            Watch a reaction happen, atom by atom
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The collision lab treats "enough energy" and "the right orientation" as abstract
            pass/fail checks. Here they are the same two requirements, but on an actual reaction: a
            bromide ion substituting for chloride on a carbon atom (SN2). Watch what a real
            collision looks like in three dimensions — the incoming ion has to arrive from directly
            opposite the leaving group, at enough speed to reach bonding distance, or nothing
            happens at all.
          </p>
        </div>
        <div>
          <ReactionMechanism3D />
        </div>
      </section>
      <SectionNav items={sections} />
    </main>
  );
}

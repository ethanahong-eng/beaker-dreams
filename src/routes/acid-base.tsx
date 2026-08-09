import { createFileRoute } from "@tanstack/react-router";
import { TitrationSim } from "@/components/TitrationSim";

export const Route = createFileRoute("/acid-base")({
  head: () => ({
    meta: [
      { title: "Acid–Base Titration Simulation — Valence Lab" },
      {
        name: "description",
        content:
          "Titrate a weak or strong acid against 1.0 M NaOH and watch the buffer region, equivalence point and pH jump appear live.",
      },
      { property: "og:title", content: "Acid–Base Titration Simulation — Valence Lab" },
      {
        property: "og:description",
        content: "An interactive titration curve explaining pKa, buffers and equivalence points.",
      },
    ],
  }),
  component: AcidBasePage,
});

function AcidBasePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-16 max-w-3xl">
        <div className="mb-4 inline-block border border-accent/20 bg-accent/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Module 03: Proton Transfer
        </div>
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
          Acid–Base <span className="text-accent">Systems</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          pH is an equilibrium in disguise. Add base drop by drop and watch a weak acid resist change through its
          buffer region, then collapse into a near-vertical jump at the equivalence point.
        </p>
      </header>

      <div id="simulation">
        <TitrationSim />
      </div>

      <section className="mt-24 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
        <div>
          <h2 className="mb-6 text-3xl font-bold italic">The half-equivalence trick</h2>
          <p className="leading-relaxed text-muted-foreground">
            At 12.5 mL — half the titrant needed — exactly half the acid is deprotonated, so pH equals pKa. Drag
            the burette slider there and compare the readout with the pKa you set.
          </p>
        </div>
        <div>
          <h2 className="mb-6 text-3xl font-bold italic">Why weak acids end above pH 7</h2>
          <p className="leading-relaxed text-muted-foreground">
            At equivalence, all that remains is the conjugate base, which pulls protons back off water. That is
            why a weak-acid equivalence point sits basic, while a strong acid lands squarely at 7.
          </p>
        </div>
      </section>
    </main>
  );
}

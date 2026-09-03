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

      <section aria-labelledby="significance-heading" className="mb-20 border-t border-border pt-10">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Section 01 · Significance
        </span>
        <h2 id="significance-heading" className="mt-3 text-3xl font-bold">
          Measuring health, water, and industry
        </h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <p className="leading-relaxed text-muted-foreground">
            Long before pH meters, analysts used titration to determine the strength and purity of acids and
            bases. Søren Sørensen introduced the pH scale in 1909 while studying proteins at the Carlsberg
            Laboratory, giving medicine, agriculture, and manufacturing a shared language for acidity.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Today, acid–base measurements protect drinking water, guide soil treatment, verify medicines, and
            monitor blood chemistry. Reliable testing affects public health and food production, while poor
            control can corrode infrastructure or damage ecosystems. The simple curve below represents decisions
            made every day in clinics, treatment plants, and quality-control laboratories.
          </p>
        </div>
      </section>

      <section aria-labelledby="theory-heading">
        <div className="mb-8">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            Section 02 · Theory
          </span>
          <h2 id="theory-heading" className="mt-3 text-3xl font-bold">
            Proton transfer and buffer balance
          </h2>
        </div>

      <section className="mb-10 grid gap-6 rounded-2xl border border-border bg-card p-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            About this demo
          </span>
          <h2 className="mt-3 text-xl font-bold">Reading a titration curve</h2>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:col-span-2">
          <p>
            The horizontal axis is the volume of base added; the vertical axis is the pH of the flask. A curve
            has three regions worth naming: a gentle buffer plateau, a near-vertical jump, and a slow basic
            tail once the acid is exhausted.
          </p>
          <p>
            Lower the pKa and the whole curve drops and steepens toward strong-acid behaviour. Raise it and the
            plateau lifts, the jump shortens, and the equivalence point drifts further above pH 7. Watch the
            steep section carefully — its height determines which indicator would actually work.
          </p>
        </div>
      </section>

      <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
        <div>
          <h2 className="mb-6 text-3xl font-bold italic">The half-equivalence trick</h2>
          <p className="leading-relaxed text-muted-foreground">
            At 12.5 mL — half the titrant needed — exactly half the acid is deprotonated, so pH equals pKa. Drag
            the burette slider there and compare the readout with the pKa you set.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            This falls straight out of the Henderson–Hasselbalch equation, pH = pKa + log([A⁻]/[HA]). When the
            two concentrations are equal the logarithm is zero. It is also the flattest part of the curve, which
            is why buffers are formulated at roughly a 1:1 ratio.
          </p>
        </div>
        <div>
          <h2 className="mb-6 text-3xl font-bold italic">Why weak acids end above pH 7</h2>
          <p className="leading-relaxed text-muted-foreground">
            At equivalence, all that remains is the conjugate base, which pulls protons back off water. That is
            why a weak-acid equivalence point sits basic, while a strong acid lands squarely at 7.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Equivalence is a stoichiometric statement — moles of base equal moles of acid — not a promise of
            neutrality. The endpoint you actually observe is wherever the indicator changes colour, so a good
            titration chooses an indicator whose range falls inside the vertical jump.
          </p>
        </div>
      </section>

      <section className="mt-16 grid gap-10 border-t border-border pt-16 md:grid-cols-3">
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
            What pH actually measures
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            pH is a logarithm, so a drop of one unit is a tenfold rise in hydrogen ion concentration. Stomach
            acid near pH 1.5 is roughly a million times more acidic than blood at 7.4 — a difference that sounds
            modest only because of the scale.
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
            Buffer capacity
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A buffer resists change only while both partners are present in quantity. Push past roughly one pH
            unit either side of the pKa and capacity collapses — the reason the curve's plateau ends so abruptly.
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
            Try this
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Run the same titration at pKa 3 and pKa 8. Compare how tall the vertical jump is in each case, then
            ask which one would be harder to read accurately with a colour indicator.
          </p>
        </div>
      </section>
      </section>

      <section aria-labelledby="simulation-heading" className="mt-24 border-t border-border pt-16">
        <div className="mb-10 max-w-3xl">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            Section 03 · Simulation
          </span>
          <h2 id="simulation-heading" className="mt-3 text-3xl font-bold">
            Build a titration curve
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Add base gradually and track the buffer region, half-equivalence point, and final pH jump. Compare a
            weak acid with a strong acid to see why equivalence does not always mean neutrality.
          </p>
        </div>
        <div id="simulation">
          <TitrationSim />
        </div>
      </section>
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { SectionNav } from "@/components/SectionNav";

const sections = [
  { id: "significance", label: "Significance" },
  { id: "theory", label: "Theory" },
  { id: "simulation", label: "Simulation" },
];

export const Route = createFileRoute("/hybridization")({
  head: () => ({
    meta: [
      { title: "Hybridization & Molecular Geometry — Valence Lab" },
      {
        name: "description",
        content:
          "How atomic orbitals mix into sp, sp2 and sp3 hybrids — and why the resulting bond angles dictate the 3D shape and reactivity of every molecule you build.",
      },
      { property: "og:title", content: "Hybridization & Molecular Geometry — Valence Lab" },
      {
        property: "og:description",
        content:
          "From methane's tetrahedron to ethyne's line: orbital hybridization explained, with its link to VSEPR geometry.",
      },
    ],
  }),
  component: HybridizationPage,
});

function HybridizationPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-16 max-w-3xl">
        <div className="mb-4 inline-block border border-accent/20 bg-accent/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Module 02: Orbital Mixing
        </div>
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
          Hybridization & <span className="text-accent">Form</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Atoms don't bond with the orbitals they're handed. They merge them first. The way an atom
          blends its s and p orbitals into hybrids decides the angles, the shape, and ultimately the
          chemistry of the molecule that forms around it.
        </p>
      </header>

      <section
        id="significance"
        aria-labelledby="significance-heading"
        className="mb-20 scroll-mt-24 border-t border-border pt-10"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Section 01 · Significance
        </span>
        <h2 id="significance-heading" className="mt-3 text-3xl font-bold">
          The shape that decides everything
        </h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <p className="leading-relaxed text-muted-foreground">
            For most of the 19th century chemists could measure what a molecule <em>did</em> but not
            why it looked the way it did. Methane stubbornly formed four identical bonds at 109.5°
            even though carbon's valence electrons sat in different energy levels. That paradox
            blocked any real theory of reactivity — you cannot predict how a drug binds or how a
            polymer folds without knowing the angles of the underlying skeleton.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Linus Pauling resolved it in 1931 by proposing that atomic orbitals <em>hybridize</em> —
            combine into a new, equivalent set pointed exactly where the bonds need to go. The idea
            unified structure with function and underpins modern drug design, catalysis, and
            materials science. Today the same principle lets chemists reason backward from a desired
            reaction to the geometry required to make it happen, which is why pharmaceutical
            stereochemistry is governed by it at every step.
          </p>
        </div>
      </section>

      <section id="theory" aria-labelledby="theory-heading" className="scroll-mt-24">
        <div className="mb-8">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            Section 02 · Theory
          </span>
          <h2 id="theory-heading" className="mt-3 text-3xl font-bold">
            Mixing orbitals to match the shape
          </h2>
        </div>

        <section className="mb-10 grid gap-6 rounded-2xl border border-border bg-card p-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
              About this demo
            </span>
            <h2 className="mt-3 text-xl font-bold">From orbitals to geometry</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:col-span-2">
            <p>
              A carbon atom's ground-state configuration leaves two electrons in 2p and none ready
              in 2s for bonding — the wrong picture for four equal bonds. Hybridization promotes and
              recombines these orbitals into a set of identical hybrids, each one a weighted blend of
              one s and some number of p orbitals.
            </p>
            <p>
              The blend ratio fixes the geometry: one s + one p gives two hybrids 180° apart (sp,
              linear); one s + two p gives three at 120° (sp², trigonal planar); one s + three p
              gives four at 109.5° (sp³, tetrahedral). Pick the hybridization and the molecule's
              skeleton is essentially decided.
            </p>
          </div>
        </section>

        <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold italic">Why promotion is worth the energy</h2>
            <p className="leading-relaxed text-muted-foreground">
              Promoting an electron to a higher orbital costs energy, so hybridization only happens
              because the bonds it enables pay that cost back — and then some. Four strong,
              equivalent bonds at tetrahedral angles store far less strain than two mismatched ones,
              which is why carbon so reliably forms sp³ hybrids even when the bookkeeping looks
              unfavorable at first glance.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              This balance is the whole reason hybridization exists at all: it is not a rule imposed
              on atoms, but the energetically cheapest way for them to satisfy their valence.
            </p>
          </div>
          <div>
            <h2 className="mb-6 text-3xl font-bold italic">Hybridization meets VSEPR</h2>
            <p className="leading-relaxed text-muted-foreground">
              Hybridization sets the ideal angles; VSEPR explains how lone pairs bend them. In water
              the oxygen is sp³, so the ideal H–O–H angle is 109.5° — but two lone pairs repel harder
              than bonding pairs and squeeze the angle down to about 104.5°.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Read the two together and a molecule's shape follows from a single chain of reasoning:
              count electron domains, assign hybridization, then let lone pairs compress the angles
              until repulsions balance.
            </p>
          </div>
        </section>

        <section className="mt-16 grid gap-10 border-t border-border pt-16 md:grid-cols-3">
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
              sp — linear
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Two hybrid orbitals 180° apart, as in ethyne (C₂H₂). Each carbon keeps two unhybridized
              p orbitals, which overlap sideways to form the second and third bonds of the triple
              bond.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
              sp² — trigonal planar
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Three hybrids at 120° leave one p orbital free for a π bond, as in ethene. The leftover
              p orbitals above and below the plane are what make double bonds shorter, stronger, and
              unable to rotate freely.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
              sp³ — tetrahedral
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Four hybrids at 109.5° with no remaining p orbitals, so no π bonds: just single bonds
              in every direction, as in methane. It is the most common framework in organic
              chemistry.
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
            Build a hybrid, watch it form
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The interactive builder for this module is coming soon. It will let you choose a bonding
            scheme, promote and recombine orbitals into sp, sp² or sp³ hybrids, and see the resulting
            molecule take shape in real time.
          </p>
        </div>
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full border border-border" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Simulation in progress
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back — the hybridization builder lands here.
            </p>
          </div>
        </div>
      </section>
      <SectionNav items={sections} />
    </main>
  );
}

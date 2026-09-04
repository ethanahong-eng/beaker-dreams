import { createFileRoute } from "@tanstack/react-router";
import { VseprBuilder } from "@/components/VseprBuilder";
import { SectionNav } from "@/components/SectionNav";

const sections = [
  { id: "theory", label: "Theory" },
  { id: "builder", label: "Molecule builder" },
];

export const Route = createFileRoute("/geometry")({
  head: () => ({
    meta: [
      { title: "VSEPR Molecule Builder — Valence Lab" },
      {
        name: "description",
        content:
          "Build molecules by choosing bonding and lone pairs, then watch real electron repulsion settle into the correct 3D shape.",
      },
      { property: "og:title", content: "VSEPR Molecule Builder — Valence Lab" },
      {
        property: "og:description",
        content: "An interactive electron-repulsion simulation for predicting molecular geometry.",
      },
    ],
  }),
  component: GeometryPage,
});

function GeometryPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-16 max-w-3xl">
        <div className="mb-4 inline-block border border-accent/20 bg-accent/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Module 01: Molecular Architecture
        </div>
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
          Molecule <span className="text-accent">Geometry</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Electron domains around a central atom repel each other and settle as far apart as
          possible. That single rule — VSEPR theory — predicts a molecule's 3D shape from nothing
          but how many bonding pairs and lone pairs it has.
        </p>
      </header>

      <section
        id="theory"
        aria-labelledby="theory-heading"
        className="mb-20 scroll-mt-24 border-t border-border pt-10"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Section 01 · Theory
        </span>
        <h2 id="theory-heading" className="mt-3 text-3xl font-bold">
          Repulsion, not memorization
        </h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <p className="leading-relaxed text-muted-foreground">
            Most students learn VSEPR as a lookup table: four domains means tetrahedral, five means
            trigonal bipyramidal, and so on. But the shapes aren't arbitrary — they're what you get
            when you let point charges on a sphere push each other as far apart as possible and let
            them settle.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Lone pairs occupy more space than bonding pairs, since they aren't stretched between two
            nuclei, so they repel harder. That single asymmetry is why ammonia's bond angle sits
            below the ideal tetrahedral angle, and why water's sits lower still. The builder below
            simulates that repulsion directly rather than asserting the answer.
          </p>
        </div>
      </section>

      <section
        id="builder"
        aria-labelledby="builder-heading"
        className="scroll-mt-24 border-t border-border pt-16"
      >
        <div className="mb-10 max-w-3xl">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            Section 02 · Builder
          </span>
          <h2 id="builder-heading" className="mt-3 text-3xl font-bold">
            Build a molecule, one electron domain at a time
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Add bonding pairs and lone pairs and watch the shape settle live. Switch to Challenge
            mode to be given a real molecule's formula and try to reproduce its geometry from
            scratch.
          </p>
        </div>
        <div>
          <VseprBuilder />
        </div>
      </section>
      <SectionNav items={sections} />
    </main>
  );
}

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
          "Build real multi-atom molecules — chains, branches, and all — atom by atom, and watch valence electron bookkeeping and real repulsion physics settle every center into its correct 3D shape, lone pairs included.",
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
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <p className="leading-relaxed text-muted-foreground">
            A real molecule with more than one heavy atom isn't one VSEPR problem — it's several,
            stitched together bond by bond. A working full quantum-mechanical calculation (DFT or
            even a minimal ab initio method) needs iterative matrix diagonalization over basis-set
            integrals, which takes seconds to minutes even on server hardware — far too slow to
            redraw live as a student drags atoms around in a browser with no backend.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            So the builder runs the same real electron-domain repulsion physics independently at
            every bonded center, then rotates each atom's whole local result as a rigid unit to line
            it up with the shared bond back to its neighbor — the same distance-geometry shortcut
            real cheminformatics tools like RDKit's ETKDG use to generate fast 3D structures without
            full quantum optimization. It's honest chemistry, just not the slowest possible version
            of it. The one thing this approach can't decide on its own — the twist around a bond,
            which real molecules are also free to rotate through — is exposed directly as its own
            tool rather than guessed.
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
            Build a molecule, one real atom at a time
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Click an atom in the toolkit to place it, then click again to attach the next one to
            whichever atom is selected — build carbon chains, branches, whatever you like, up to 15
            atoms, capped so the physics stays fast and the structure stays legible. Every
            attachment is checked against both atoms' valence electrons before it's allowed to form,
            and lone pairs are never set by hand — they're whatever electrons are left over once the
            bonds are drawn.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The tool bar adds the rest of a real molecular-modeling kit: cycle a bond between
            single, double, and triple (σ vs. π), bond two existing atoms directly to close a ring,
            remove a leaf atom, measure the real angle between any three bonded atoms, or rotate a
            bond's torsion to explore the one degree of freedom VSEPR alone can't pin down. One ring
            is supported at a time, drawn as a flat regular polygon rather than a real chair or boat
            pucker. Select an atom whose bonds have a genuine ambiguity — like the two ends of a
            symmetric double bond, or a fully alternating ring — and the panel calls out the
            resonance directly: real molecules delocalize evenly across those bonds instead of
            picking one arrangement. A running total bond energy, estimated from real bond
            dissociation energies, shows how that energy shifts as the structure changes. Switch to
            Challenge mode to be given a real molecule's formula and build it atom by atom.
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

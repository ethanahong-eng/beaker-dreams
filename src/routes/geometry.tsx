import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { VseprBuilder } from "@/components/VseprBuilder";
import { SectionNav } from "@/components/SectionNav";
import { NextTopicNav } from "@/components/NextTopicNav";
import { ReviewLevelToggle } from "@/components/ReviewLevelToggle";
import { ReviewQuestions } from "@/components/ReviewQuestions";
import type { EasyContent, Level } from "@/lib/reviewContent";

const sections = [
  { id: "theory", label: "Theory" },
  { id: "builder", label: "Molecule builder" },
];

// This page has no significance section in hard mode, and its theory
// section is plain paragraph pairs with no sub-headings at all -- the easy
// tier matches that exact plainness rather than inventing structure that
// isn't there, so the "heading" fields below are unused (the paragraphs
// are rendered flat, not through the shared headed-block LessonBody).
const EASY: EasyContent = {
  theory: [
    {
      heading: "AP Review",
      body: [
        "VSEPR theory predicts a molecule's 3D shape using one simple idea: the negatively charged domains around a central atom — bonds and lone pairs alike — repel each other and spread out as far apart as possible. Count the domains, and the shape follows automatically.",
        "Two domains give a linear shape (180°), three give trigonal planar (120°), and four give tetrahedral (109.5°) — the same starting geometries whether every domain is a bond or some are lone pairs.",
        "Lone pairs take up more space than bonding pairs because they aren't stretched between two nuclei, so they push harder on their neighbors. That's why ammonia (NH₃, one lone pair) has a bond angle slightly less than 109.5°, and water (H₂O, two lone pairs) is compressed even further, to about 104.5°.",
        "The overall arrangement of domains (electron geometry) and the shape you'd see tracing only the atoms (molecular geometry) can differ once lone pairs are involved — a lone pair still occupies a direction in space and still repels, it's just invisible once you look at where the atoms themselves ended up.",
      ],
    },
  ],
  reviewQuestions: [
    {
      question:
        "A central atom has 4 bonding domains and 0 lone pairs. What molecular geometry results?",
      answer: "Tetrahedral",
      explanation:
        "Four electron domains spread out as far as possible in 3D space. Since all four are bonding pairs, the molecular geometry matches the electron geometry exactly.",
    },
    {
      question:
        "Why does water (H₂O, ~104.5°) have a smaller bond angle than ammonia (NH₃, ~107°), even though both start from a tetrahedral electron geometry?",
      answer:
        "Water has two lone pairs versus ammonia's one, and lone pairs repel more strongly than bonding pairs, compressing the angle further.",
      explanation:
        "Each additional lone pair adds extra repulsion that isn't balanced by a nucleus on the other end, pushing the remaining bonds closer together.",
    },
    {
      question:
        "A central atom has 3 bonding domains and 1 lone pair. What is its molecular geometry?",
      answer: "Trigonal pyramidal",
      explanation:
        "The electron geometry of all 4 domains is tetrahedral, but since one domain is a lone pair (invisible when tracing only atoms), the visible molecular shape is trigonal pyramidal — the classic ammonia shape.",
    },
    {
      question: "Why do lone pairs repel more strongly than bonding pairs?",
      answer:
        "A lone pair is held by only one nucleus rather than stretched between two, so its electron density is more concentrated and pushes harder on neighboring domains.",
      explanation:
        "A bonding pair's electron density is shared between (and pulled toward) two nuclei, spreading it out and reducing its repulsive push compared to a lone pair anchored to just one atom.",
    },
  ],
};

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
  const [level, setLevel] = useState<Level>("hard");
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-16 max-w-3xl border-b border-border pb-12">
        <div className="mb-5 inline-block border-y border-border px-4 py-2 text-[10px] font-bold uppercase text-accent">
          TOPIC 08: MOLECULAR ARCHITECTURE
        </div>
        <h1 className="mb-6 font-display text-5xl font-bold md:text-6xl">
          Molecule <span className="text-accent">Geometry</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Electron domains around a central atom repel each other and settle as far apart as
          possible. That single rule — VSEPR theory — predicts a molecule's 3D shape from nothing
          but how many bonding pairs and lone pairs it has.
        </p>
      </header>

      <ReviewLevelToggle level={level} onChange={setLevel} />

      <section id="theory" aria-labelledby="theory-heading" className="mb-20 scroll-mt-24 pt-2">
        <span className="text-[10px] font-bold uppercase text-accent">Section 01 · Theory</span>
        <h2 id="theory-heading" className="mt-3 text-3xl font-bold">
          Repulsion, not memorization
        </h2>
        {level === "easy" ? (
          <>
            <div className="mt-8 grid gap-10 md:grid-cols-2">
              {EASY.theory
                .flatMap((b) => b.body)
                .map((p, i) => (
                  <p key={i} className="leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
            </div>
            <ReviewQuestions questions={EASY.reviewQuestions} />
          </>
        ) : (
          <>
            <div className="mt-8 grid gap-10 md:grid-cols-2">
              <p className="leading-relaxed text-muted-foreground">
                Most students learn VSEPR as a lookup table: four domains means tetrahedral, five
                means trigonal bipyramidal, and so on. But the shapes aren't arbitrary — they're
                what you get when you let point charges on a sphere push each other as far apart as
                possible and let them settle.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Lone pairs occupy more space than bonding pairs, since they aren't stretched between
                two nuclei, so they repel harder. That single asymmetry is why ammonia's bond angle
                sits below the ideal tetrahedral angle, and why water's sits lower still. The
                builder below simulates that repulsion directly rather than asserting the answer.
              </p>
            </div>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              <p className="leading-relaxed text-muted-foreground">
                A real molecule with more than one heavy atom isn't one VSEPR problem — it's
                several, stitched together bond by bond. A working full quantum-mechanical
                calculation (DFT or even a minimal ab initio method) needs iterative matrix
                diagonalization over basis-set integrals, which takes seconds to minutes even on
                server hardware — far too slow to redraw live as a student drags atoms around in a
                browser with no backend.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                So the builder runs the same real electron-domain repulsion physics independently at
                every bonded center, then rotates each atom's whole local result as a rigid unit to
                line it up with the shared bond back to its neighbor — the same distance-geometry
                shortcut real cheminformatics tools like RDKit's ETKDG use to generate fast 3D
                structures without full quantum optimization. It's honest chemistry, just not the
                slowest possible version of it. The one thing this approach can't decide on its own
                — the twist around a bond, which real molecules are also free to rotate through — is
                exposed directly as its own tool rather than guessed.
              </p>
            </div>
          </>
        )}
      </section>

      <section
        id="builder"
        aria-labelledby="builder-heading"
        className="scroll-mt-24 border-t border-border pt-16"
      >
        <div className="mb-10 max-w-3xl">
          <span className="text-[10px] font-bold uppercase text-accent">Section 02 · Builder</span>
          <h2 id="builder-heading" className="mt-3 text-3xl font-bold">
            Build a molecule, one real atom at a time
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Click an atom in the toolkit to place it, then click again to attach the next one to
            whichever atom is selected. Hold <span className="text-accent">Shift</span> while
            clicking to keep building off the atom you already have selected instead of jumping to
            the one you just placed — the fast way to grow a rich, single-center molecule (many
            substituents around one atom, the classic VSEPR case) rather than drifting into a long
            chain by default. Chains and branches are still fully supported; letting go of Shift
            just moves on to whichever atom you added last. Up to 15 atoms total, capped so the
            physics stays fast and the structure stays legible. Every attachment is checked against
            both atoms' valence electrons before it's allowed to form, and lone pairs are never set
            by hand — they're whatever electrons are left over once the bonds are drawn.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The tool bar adds the rest of a real molecular-modeling kit: cycle a bond between
            single, double, and triple (σ vs. π), bond two existing atoms directly to close a ring,
            remove a leaf atom, measure the real angle between any three bonded atoms, or rotate a
            bond's torsion to explore the one degree of freedom VSEPR alone can't pin down. One ring
            is supported at a time; an even-membered ring actually puckers out of plane — a real
            chair, for an all-single-bond six-ring — just far enough for each ring atom's own
            simulated bond angle to be reached, while a ring whose atoms already want ~120° (an
            aromatic ring) solves out flat. Select an atom whose bonds have a genuine ambiguity —
            like the two ends of a symmetric double bond, or a fully alternating ring — and the
            panel calls out the resonance directly: real molecules delocalize evenly across those
            bonds instead of picking one arrangement. A running total bond energy, estimated from
            real bond dissociation energies, shows how that energy shifts as the structure changes.
            Switch to Challenge mode to be given a real molecule's formula and build it atom by
            atom.
          </p>
        </div>
        <div>
          <VseprBuilder mode="geometry" />
        </div>
      </section>

      <NextTopicNav currentSlug="geometry" />

      <SectionNav items={sections} />
    </main>
  );
}

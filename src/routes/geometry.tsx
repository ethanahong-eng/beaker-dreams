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
        "VSEPR theory predicts a molecule's 3D shape using one simple idea: the negatively charged domains around a central atom — bonds and lone pairs alike — repel each other and spread out as far apart as possible. A domain is one group of electrons: a lone pair, a single bond, or a whole double or triple bond (a double bond counts once, because both of its pairs sit in the same direction). Count the domains, and the shape follows automatically.",
        "Two domains give a linear shape (180°), three give trigonal planar (120°), and four give tetrahedral (109.5°) — the same starting geometries whether every domain is a bond or some are lone pairs.",
        "Five domains give a trigonal bipyramid: three positions in a flat triangle 120° apart, plus one directly above and one directly below at 90°. Six give an octahedron, with every neighbor at 90°. These show up for central atoms past the second row, like sulfur, phosphorus, or xenon, which can hold more than eight valence electrons.",
        "Lone pairs take up more space than bonding pairs because they aren't stretched between two nuclei, so they push harder on their neighbors. That's why ammonia (NH₃, one lone pair) has a bond angle slightly less than 109.5°, and water (H₂O, two lone pairs) is compressed even further, to about 104.5°.",
        "The overall arrangement of domains (electron geometry) and the shape you'd see tracing only the atoms (molecular geometry) can differ once lone pairs are involved — a lone pair still occupies a direction in space and still repels, it's just invisible once you look at where the atoms themselves ended up.",
        "Work one all the way through: SF₄. Sulfur brings 6 valence electrons and each fluorine brings 7, so there are 6 + 4 × 7 = 34 electrons to place. The four S–F single bonds use 8 of them. Giving each fluorine three lone pairs of its own uses 24 more. That leaves 34 − 8 − 24 = 2 electrons, which stay on sulfur as one lone pair. So sulfur has 4 bonding domains + 1 lone pair = 5 domains: the electron geometry is trigonal bipyramidal, the lone pair takes the roomier equatorial position, and the molecular geometry — tracing only the atoms — is a seesaw.",
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
      question:
        "SF₄ has four bonded fluorines and one lone pair on sulfur. Name its electron geometry and its molecular geometry.",
      answer: "Trigonal bipyramidal electron geometry; seesaw molecular geometry.",
      explanation:
        "Five domains always arrange as a trigonal bipyramid. The lone pair takes an equatorial position, where it has only two neighbors at 90° instead of three, and ignoring it leaves the four fluorines in a seesaw shape.",
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
                means trigonal bipyramidal, and so on. But the table is the answer to a minimization
                problem, not an axiom. Scatter n identical repelling points on the surface of a
                sphere, let them relax until the total repulsion — the sum of 1/r over every pair —
                is as small as it can be, and the arrangements that fall out are exactly the
                familiar ones: antipodal for two, an equilateral triangle for three, a tetrahedron
                for four (cos θ = −1/3, so θ = 109.47°), a trigonal bipyramid for five, an
                octahedron for six.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                The repulsion is not really Coulombic, though, and that distinction matters. Two
                electrons of the same spin are kept apart far more effectively by the Pauli
                exclusion principle than by their charge: antisymmetry of the wavefunction forces
                the probability of finding them at the same point to vanish outright. Ronald
                Gillespie, who gave the model its modern form in the 1950s, later grounded it in the
                Laplacian of the electron density, which shows real local concentrations of charge
                around a central atom pointing in exactly the directions VSEPR draws its domains,
                lone pairs included. The domains are not fictions; they are a coarse map of where
                electron density genuinely piles up.
              </p>
            </div>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              <p className="leading-relaxed text-muted-foreground">
                A lone pair occupies more angular space than a bonding pair because of where its
                density sits. Bonding density is drawn outward and shared with a second nucleus, so
                close to the central atom it subtends a narrow cone. A lone pair answers to one
                nucleus only, stays in close, and spreads sideways — a fatter cone with a wider
                bite. That ordering, lone pair–lone pair beating lone pair–bond beating bond–bond,
                is the whole content of the model's one correction term, and it predicts the
                observed squeeze: methane's 109.47° gives way to ammonia's 107.8° with one lone
                pair, and to water's 104.5° with two.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                The same reasoning predicts a second, subtler effect. Swap a hydrogen for a more
                electronegative substituent and the bonding density is pulled further from the
                central atom, narrowing its bite and letting the remaining domains close in: OF₂
                tightens to 103.3° while Cl₂O opens to 110.9°, both from a nominally tetrahedral
                oxygen with two lone pairs. VSEPR gets the direction of that trend right, which is a
                large part of why it has survived seventy years of better theories.
              </p>
            </div>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              <p className="leading-relaxed text-muted-foreground">
                Electron geometry counts every domain; molecular geometry names only the arrangement
                of nuclei. They coincide when there are no lone pairs and diverge the instant there
                is one. CH₄, NH₃ and H₂O all have tetrahedral electron geometry, and are called
                tetrahedral, trigonal pyramidal and bent respectively — three names for one
                underlying arrangement, because a diffraction experiment locates nuclei and cannot
                see a lone pair at all.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Five domains are the interesting case, because the trigonal bipyramid is the one
                common geometry whose sites are not equivalent. An axial position has three
                neighbours at 90°; an equatorial position has only two. The bulkiest domain
                therefore takes an equatorial seat, and that single rule generates the entire
                series: SF₄ is a seesaw, ClF₃ is T-shaped, XeF₂ is linear. The distortions are
                measurable and point the right way — in SF₄ the axial F–S–F angle bends from 180° to
                173.1° and the equatorial one from 120° to 101.6°, both leaning away from the lone
                pair.
              </p>
            </div>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              <p className="leading-relaxed text-muted-foreground">
                VSEPR is a heuristic, not a theory, and it is worth knowing where it breaks. The
                hydrides of the heavier p-block elements are the cleanest failure: PH₃ bonds at
                93.3° and H₂S at 92.1°, nowhere near the roughly 107° the model insists on. Those
                angles sit close to 90° because the central atom barely mixes its s and p orbitals
                and bonds with something near pure p character — a fact about orbitals, which VSEPR
                never asks about and therefore cannot anticipate.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Other failures are stranger. TeCl₆²⁻ and SbBr₆³⁻ are regular octahedra even though
                the central atom carries a lone pair the model says must distort them; that pair is
                stereochemically inactive, tucked into a nearly spherical s orbital. Gaseous CaF₂,
                SrF₂ and BaF₂ are bent rather than linear, because the metal core polarizes and
                empty d orbitals get involved. Transition-metal complexes are governed by
                ligand-field stabilization and d-electron count instead, which is how square-planar
                d⁸ species like [PtCl₄]²⁻ exist at all. VSEPR predicts none of it. It is a rule that
                summarizes what quantum mechanics produces for one well-behaved corner of the
                periodic table — enormously useful, and not an account of bonding.
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

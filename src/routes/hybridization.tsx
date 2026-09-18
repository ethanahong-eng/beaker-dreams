import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HybridizationSim } from "@/components/HybridizationSim";
import { SectionNav } from "@/components/SectionNav";
import { NextTopicNav } from "@/components/NextTopicNav";
import { LessonBody } from "@/components/LessonBody";
import { ReviewLevelToggle } from "@/components/ReviewLevelToggle";
import { ReviewQuestions } from "@/components/ReviewQuestions";
import type { EasyContent, Level } from "@/lib/reviewContent";

const sections = [
  { id: "significance", label: "Significance" },
  { id: "theory", label: "Theory" },
  { id: "simulation", label: "Simulation" },
];

const EASY: EasyContent = {
  significance: [
    "Chemists describe bonding by imagining an atom's s and p orbitals blended together into a new set that points exactly where the bonds need to go. That blend — hybridization — is what explains why molecules have the specific 3D shapes and bond angles they do, instead of the angles you would guess from the raw orbitals.",
    "Knowing an atom's hybridization tells you its shape (linear, trigonal planar, or tetrahedral) and whether it can form double or triple bonds, which is why hybridization comes right after Lewis structures and VSEPR in almost every intro chemistry sequence.",
  ],
  theory: [
    {
      heading: "Why the blend is needed",
      body: [
        "An atom's unblended orbitals (s and p) don't point in the right directions to make the bonds a molecule actually has. Carbon's p orbitals, for instance, are at 90° to each other, but methane's four bonds are 109.5° apart and all identical. Hybridization mixes one s orbital with one, two, or three p orbitals to create a new set of identical, equally spaced orbitals aimed exactly where the bonds go.",
        "To assign it, count electron domains — a domain is a lone pair, a single bond, or a whole double or triple bond. The number of domains is the number of hybrid orbitals needed, and that fixes both the label and the angle.",
      ],
    },
    {
      heading: "The three hybridizations you need to know",
      body: [
        "sp (linear, 180° apart): one s + one p orbital, for a central atom with two domains and no lone pairs, like the carbon in CO₂.",
        "sp² (trigonal planar, 120° apart): one s + two p orbitals, for three domains, like boron in BF₃ or either carbon in a C=C double bond.",
        "sp³ (tetrahedral, 109.5° apart): one s + three p orbitals, for four domains, whether they are all bonds or a mix of bonds and lone pairs, like carbon in CH₄ or nitrogen in NH₃.",
      ],
    },
    {
      heading: "Hybridization decides how many bonds an atom can form",
      body: [
        "A hybridized atom's leftover, unblended p orbitals are what allow π bonds — the second and third bonds of a double or triple bond, formed by two p orbitals overlapping side by side rather than end to end. The first bond between any two atoms is always a σ bond, formed by overlap straight along the line joining the nuclei.",
        "sp³ carbon has no leftover p orbitals, so it forms single bonds only. sp² carbon has one leftover p orbital, enough for one π bond, so it can form a double bond. sp carbon has two leftover p orbitals, enough for two π bonds, so it can form a triple bond.",
      ],
    },
    {
      heading: "Work one through: ethene, and why double bonds are rigid",
      body: [
        "Take ethene, C₂H₄. Each carbon is bonded to two hydrogens and to the other carbon: three groups, so three domains, so sp². That predicts 120° angles, and the measured H–C–H angle is 117.4° — close enough that the model is doing real work.",
        "Each of those carbons has one p orbital left over, and the two overlap sideways to make the π bond. Twisting the molecule about the C=C axis would pull that overlap apart, so the two ends of a double bond cannot rotate past each other at ordinary temperatures. That is why 2-butene exists as two separate, bottleable compounds, cis and trans, while single-bonded butane's ends spin freely billions of times a second.",
      ],
    },
  ],
  reviewQuestions: [
    {
      question:
        "A carbon atom forms four single bonds and no double bonds. What is its hybridization?",
      answer: "sp³",
      explanation:
        "Four single bonds means four equivalent bonding directions with no leftover p orbital for a π bond — the defining pattern of sp³ hybridization (tetrahedral, 109.5° bond angles).",
    },
    {
      question: "What is the approximate bond angle around an sp² hybridized atom?",
      answer: "120°",
      explanation:
        "sp² hybridization comes from mixing one s and two p orbitals into three equivalent orbitals, which spread as far apart as possible in a plane — 120° apart, giving a trigonal planar shape.",
    },
    {
      question: "Why can't an sp carbon form more than two σ bonds?",
      answer:
        "sp hybridization only produces two hybrid orbitals, leaving just two directions for σ bonds.",
      explanation:
        "Any additional bonds must be π bonds formed from the two unhybridized p orbitals — exactly the pattern in a triple bond like acetylene (C₂H₂): one σ bond from an sp hybrid plus two π bonds from the leftover p orbitals.",
    },
    {
      question:
        "A nitrogen atom has 3 bonding pairs and 1 lone pair around it. What hybridization fits?",
      answer: "sp³",
      explanation:
        "Total electron domains — 3 bonds + 1 lone pair = 4 domains — determine hybridization, not just the number of bonds. Four domains always corresponds to sp³, whether they're bonding pairs or lone pairs.",
    },
    {
      question:
        "The two ends of a C–C single bond rotate freely, but the two ends of a C=C double bond do not. Why?",
      answer:
        "Rotating a single bond leaves its σ overlap untouched, but rotating a double bond would twist apart the side-by-side p orbital overlap of the π bond and break it.",
      explanation:
        "A σ bond is symmetric about the line joining the nuclei, so turning it changes nothing. A π bond depends on two p orbitals staying parallel, so a twist destroys it — which is exactly why cis and trans alkenes are separate, isolable compounds.",
    },
  ],
};

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
  const [level, setLevel] = useState<Level>("hard");
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-16 max-w-3xl border-b border-border pb-12">
        <div className="mb-5 inline-block border-y border-border px-4 py-2 text-[10px] font-bold uppercase text-accent">
          TOPIC 06: ORBITAL MIXING
        </div>
        <h1 className="mb-6 font-display text-5xl font-bold md:text-6xl">
          Hybridization & <span className="text-accent">Form</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Atoms don't bond with the orbitals they're handed. They merge them first. The way an atom
          blends its s and p orbitals into hybrids decides the angles, the shape, and ultimately the
          chemistry of the molecule that forms around it.
        </p>
      </header>

      <ReviewLevelToggle level={level} onChange={setLevel} />

      <section
        id="significance"
        aria-labelledby="significance-heading"
        className="mb-20 scroll-mt-24 pt-2"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Section 01 · Significance
        </span>
        <h2 id="significance-heading" className="mt-3 text-3xl font-bold">
          The shape that decides everything
        </h2>
        {level === "easy" ? (
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            {EASY.significance!.map((p, i) => (
              <p key={i} className="leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <p className="leading-relaxed text-muted-foreground">
              For most of the 19th century chemists could measure what a molecule <em>did</em> but
              not why it looked the way it did. Van 't Hoff and Le Bel had argued in 1874 that
              carbon's four bonds point at the corners of a tetrahedron, and the optical evidence
              was overwhelming — but nothing in the new quantum mechanics of the 1920s explained it.
              Carbon's valence electrons sit in orbitals of two different energies and, read
              literally, should give two bonds at right angles. Methane stubbornly gives four
              identical bonds at 109.5°.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Linus Pauling closed the gap in 1931, in the first of the papers that became{" "}
              <em>The Nature of the Chemical Bond</em>, by showing that the s and p functions can be
              recombined into an equivalent set aimed exactly where the bonds go — work that won him
              the 1954 Nobel Prize. John Slater reached the same result independently the same year.
              The pay-off was not the tetrahedron itself but a vocabulary for reasoning from
              structure to reactivity, which is why hybridization still underwrites drug design,
              catalysis and materials science: given a reaction you want, it tells you the geometry
              the molecule has to be built around.
            </p>
          </div>
        )}
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

        {level === "easy" ? (
          <>
            <LessonBody theory={EASY.theory} />
            <ReviewQuestions questions={EASY.reviewQuestions} />
          </>
        ) : (
          <>
            <section className="mb-10 grid gap-6 border border-border bg-card/70 p-8 md:grid-cols-3">
              <div className="md:col-span-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
                  About this demo
                </span>
                <h2 className="mt-3 text-xl font-bold">From orbitals to geometry</h2>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:col-span-2">
                <p>
                  Carbon's ground state is 1s² 2s² 2p², with two unpaired p electrons at right
                  angles to one another. Read literally, that atom should form two bonds about 90°
                  apart. Methane forms four indistinguishable bonds at 109.47°. Hybridization is the
                  bookkeeping that closes the gap: build a new set of orbitals as linear
                  combinations of the one 2s and the three 2p functions, and the set points at the
                  corners of a tetrahedron.
                </p>
                <p>
                  The mixing ratio fixes the angle exactly. Write each hybrid as √a times the s
                  orbital plus √(1−a) times a p orbital, where a is the fraction of s character.
                  Requiring two such hybrids to be orthogonal gives a + (1−a) cos θ = 0, so cos θ =
                  −a/(1−a). Set a = 1/2 and θ comes out 180° (sp, linear); a = 1/3 gives 120° (sp²,
                  trigonal planar); a = 1/4 gives cos θ = −1/3, or 109.47° (sp³, tetrahedral). The
                  geometry is not a second assumption bolted on — it is what orthogonality costs.
                </p>
                <p>
                  Run the relation backwards and it becomes a measurement. Water's H–O–H angle is
                  104.5°, so cos θ = −0.250 and a ≈ 0.20: oxygen's bonding hybrids carry about 20% s
                  character, closer to sp⁴ than to the sp³ every textbook assigns them. The missing
                  s character has gone into the two lone pairs. That is Bent's rule in one line — s
                  density concentrates in the orbitals pointing toward whatever pulls on it least.
                </p>
              </div>
            </section>

            <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">
                  Hybridization is a change of basis, not an event
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  The usual story — promote an electron from 2s to 2p, pay the energy, mix the
                  orbitals, cash in on four bonds — is a narrative laid over a stationary state.
                  Nothing happens in sequence, because nothing happens at all: the atom in the
                  molecule is not passing through stages. A closed-shell wavefunction is a Slater
                  determinant, and any unitary transformation among its occupied orbitals leaves
                  that determinant, and every observable computed from it, exactly unchanged. Mixing
                  s and p into hybrids is one such transformation. It changes the description, not
                  the molecule.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  That is why the promotion energy never shows up as a real cost in a careful
                  calculation: it is an artifact of having insisted on a particular starting set of
                  orbitals. What is physically real is the total electron density, the total energy,
                  and the geometry you can measure. Hybridization is the choice of coordinates in
                  which those come out looking like a handful of equivalent, directional, localized
                  bonds — which happens to be exactly how chemists think.
                </p>
              </div>
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">Hybridization meets VSEPR</h2>
                <p className="leading-relaxed text-muted-foreground">
                  The two models answer different questions and are usually taught as though they
                  answered the same one. VSEPR counts electron domains and predicts an angle.
                  Hybridization takes an angle and tells you what mixture of s and p produces it.
                  Given water's 104.5°, hybridization does not derive that number — it absorbs it,
                  and the 20% s character falls out of the measurement rather than predicting it.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Read in that order the chain is honest: count domains, let repulsion set the
                  approximate geometry, then read off how the s and p character must be distributed.
                  Bent's rule turns that into a prediction — s character migrates toward the least
                  electronegative substituents, so NF₃ closes to 102.5° while NH₃ sits at 107.8°,
                  because fluorine drags p character into the N–F bonds and leaves nitrogen's lone
                  pair fat with s.
                </p>
              </div>
            </section>

            <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">
                  Why a single bond turns and a double bond cannot
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  A σ bond is built from overlap along the internuclear axis, and that overlap is
                  cylindrically symmetric: rotate one end and nothing about it changes. Ethane's
                  barrier to internal rotation is only about 12 kJ/mol, which at room temperature
                  its methyl groups clear something like 10¹¹ times a second. Free rotation about
                  single bonds is why conformational analysis is a subject at all.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  A π bond is built from two p orbitals overlapping sideways, above and below that
                  axis. Twist by an angle and the overlap falls off as its cosine, so the π bonding
                  energy dies away roughly as cos². At 90° the two p orbitals are orthogonal, the π
                  bond is simply gone, and what is left is a diradical. Ethene's rotational barrier
                  is therefore about 270 kJ/mol — a bond you would have to break, not merely strain.
                  That one number is why alkenes come in cis and trans forms that can be bottled
                  separately, and why the C=C bond in retinal flips only when a photon promotes an
                  electron into the π* orbital and cancels the bond order holding it rigid. That
                  photoisomerization is the first chemical step of vision.
                </p>
              </div>
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">Where the picture runs out</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Molecular orbital theory needs no hybrids whatsoever. It builds delocalized
                  orbitals spanning the whole molecule, classified by symmetry, and it is what you
                  reach for when you want spectra or ionization energies. Methane is the standard
                  test case. If its four C–H bonds came from four equivalent sp³ orbitals you would
                  expect one photoelectron band; the experiment gives two, near 14 eV and 23 eV,
                  matching the t₂ and a₁ symmetry orbitals MO theory predicts. The four bonds are
                  equivalent. The four orbitals are not observables.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Hybridization survives that because localized bonds are how reactivity is actually
                  reasoned about, and the two pictures are related by precisely the unitary
                  transformation described above — neither is truer. What does not survive is the
                  extension to "sp³d" and "sp³d²" for SF₄ and SF₆: sulfur's 3d orbitals lie far too
                  high in energy to contribute meaningfully, and modern calculations describe
                  hypervalent main-group molecules with three-centre four-electron bonds built from
                  s and p alone. Those labels persist in textbooks as geometry mnemonics, not as
                  descriptions of the bonding.
                </p>
              </div>
            </section>

            <section className="mt-16 grid gap-10 border-t border-border pt-16 md:grid-cols-3">
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
                  sp — linear
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Two hybrid orbitals 180° apart, as in ethyne (C₂H₂). Each carbon keeps two
                  unhybridized p orbitals, which overlap sideways to form the second and third bonds
                  of the triple bond and pull the C≡C distance in to 120 pm. Half s character also
                  holds the bonding electrons close to the nucleus, which is why a terminal alkyne
                  C–H (pKa ≈ 25) is some nineteen orders of magnitude more acidic than an alkene's
                  (pKa ≈ 44).
                </p>
              </div>
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
                  sp² — trigonal planar
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Three hybrids at 120° leave one p orbital free for a π bond, as in ethene, where
                  the C=C bond measures 134 pm against 154 pm for a C–C single bond. The leftover p
                  orbitals above and below the plane are what make double bonds shorter, stronger
                  and unable to rotate — and, when several sp² centres line up, what lets a π system
                  delocalize into an aromatic ring.
                </p>
              </div>
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
                  sp³ — tetrahedral
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Four hybrids at 109.47° with no p orbital left over, so no π bond is possible:
                  single bonds in every direction, as in methane and ethane. It is the most common
                  framework in organic chemistry, and the one where rotation about every bond is
                  essentially free, so a molecule is a population of conformers rather than a single
                  shape.
                </p>
              </div>
            </section>
          </>
        )}
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
            Watch orbitals merge into geometry
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Pick a hybridization scheme and the energy-level diagram animates the actual mixing —
            the s orbital and however many p (and d) orbitals it takes sliding together into one
            degenerate hybrid level, with any leftover pure orbitals staying put. The 3D view below
            it updates from the very same electron-domain count, so the quantum-mechanical
            explanation and the shape it produces are always looking at the same molecule.
          </p>
        </div>
        <div>
          <HybridizationSim />
        </div>
      </section>

      <NextTopicNav currentSlug="hybridization" />

      <SectionNav items={sections} />
    </main>
  );
}

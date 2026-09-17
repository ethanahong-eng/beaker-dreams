import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CollisionSim } from "@/components/CollisionSim";
import { ReactionMechanism3D } from "@/components/ReactionMechanism3D";
import { SectionNav } from "@/components/SectionNav";
import { NextTopicNav } from "@/components/NextTopicNav";
import { LessonBody } from "@/components/LessonBody";
import { ReviewLevelToggle } from "@/components/ReviewLevelToggle";
import { ReviewQuestions } from "@/components/ReviewQuestions";
import type { EasyContent, Level } from "@/lib/reviewContent";

const sections = [
  { id: "significance", label: "Significance" },
  { id: "theory", label: "Theory" },
  { id: "mechanism", label: "Reaction mechanism" },
  { id: "collisions", label: "Collision lab" },
];

const EASY: EasyContent = {
  significance: [
    "How fast a reaction happens matters just as much as whether it happens at all. Kinetics is the study of reaction speed, and it explains everything from how long food stays fresh in the fridge to how quickly a medicine takes effect once it's in your body.",
    "Industries depend on controlling rate directly: a factory needs a reaction to run fast enough to be profitable but slow enough to be safe, and pharmaceutical companies need a drug to break down in the body at a predictable, consistent speed. Kinetics is what lets chemists dial that speed in on purpose instead of just hoping for the best.",
  ],
  theory: [
    {
      heading: "Collision theory: two conditions, not one",
      body: [
        "For a reaction to occur, two molecules first have to collide — but not every collision leads to a reaction. Two conditions must both be met: the molecules must collide with enough energy to break existing bonds (called the activation energy), and they must collide in the right orientation, with their reactive parts facing each other.",
        "A collision that's energetic enough but pointed the wrong way just bounces apart unchanged. This is why some reactions between small, simple molecules happen easily, while reactions between large, bulky molecules can be slow even when there's plenty of energy available — the odds of lining up correctly are lower.",
      ],
    },
    {
      heading: "Why a small temperature increase causes a big rate increase",
      body: [
        "At any given temperature, molecules in a sample have a range of kinetic energies — most have a moderate amount, and only a smaller fraction have enough to clear the activation energy barrier. Raising the temperature shifts that whole distribution toward higher energies.",
        "Because the number of molecules with 'enough' energy grows steeply rather than evenly as temperature rises, even a modest temperature increase can noticeably speed up a reaction. That's why reaction rate is so sensitive to temperature: you're not just giving every molecule a little more energy, you're dramatically increasing the share of molecules that already clear the bar.",
      ],
    },
    {
      heading: "What a catalyst actually does",
      body: [
        "A catalyst speeds up a reaction by providing an alternate reaction pathway with a lower activation energy. With a lower energy requirement, a much larger fraction of molecules now have enough energy to react, so the reaction proceeds faster.",
        "A catalyst is not used up in the reaction — it participates and is then regenerated, so a small amount can keep working on molecule after molecule. It also does not change the equilibrium position of a reaction: it doesn't make a reaction more product-favored, it just gets the reaction to whatever equilibrium it was already heading toward more quickly.",
      ],
    },
  ],
  reviewQuestions: [
    {
      question:
        "According to collision theory, what two conditions must be met for a reaction to occur when two molecules collide?",
      answer: "Sufficient energy (activation energy) and proper orientation.",
      explanation:
        "A collision with enough energy but the wrong orientation fails, and a perfectly oriented collision without enough energy also fails. Both conditions are required at once.",
    },
    {
      question: "How does a catalyst increase reaction rate?",
      answer:
        "It provides an alternate pathway with a lower activation energy, without being consumed.",
      explanation:
        "Lowering the activation energy means more molecules already have enough energy to react at a given temperature, so the reaction speeds up. The catalyst itself is regenerated, not used up.",
    },
    {
      question:
        "Why does a small increase in temperature often cause a large increase in reaction rate?",
      answer:
        "A small temperature rise sharply increases the fraction of molecules with enough energy to react, not just their average energy.",
      explanation:
        "The number of molecules clearing the activation energy threshold grows steeply with temperature, so rate increases are much larger than the temperature change itself would suggest.",
    },
    {
      question: "Does a catalyst change the equilibrium position of a reaction?",
      answer: "No — it only changes how quickly equilibrium is reached.",
      explanation:
        "A catalyst lowers the activation energy for both the forward and reverse reactions equally, so it speeds up the approach to equilibrium without shifting where that equilibrium lies.",
    },
    {
      question:
        "Two molecules collide with more than enough energy to react, but no reaction occurs. What's the most likely explanation?",
      answer: "The molecules were not oriented correctly at the moment of collision.",
      explanation:
        "Energy alone is not sufficient. If the reactive parts of the molecules were not facing each other, the collision fails regardless of how much energy it carried.",
    },
  ],
};

export const Route = createFileRoute("/kinetics")({
  head: () => ({
    meta: [
      { title: "Reaction Kinetics Simulation — Valence Lab" },
      {
        name: "description",
        content:
          "Watch a real SN2 substitution succeed or fail atom by atom, then see the same energy-and-orientation requirements checked across a whole population of colliding molecules.",
      },
      { property: "og:title", content: "Reaction Kinetics Simulation — Valence Lab" },
      {
        property: "og:description",
        content:
          "A 3D reaction mechanism and a live collision simulator explaining what actually controls reaction rate.",
      },
    ],
  }),
  component: KineticsPage,
});

function KineticsPage() {
  const [level, setLevel] = useState<Level>("hard");
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-16 max-w-3xl border-b border-border pb-12">
        <div className="mb-5 inline-block border-y border-border px-4 py-2 text-[10px] font-bold uppercase text-accent">
          TOPIC 14: REACTION RATES
        </div>
        <h1 className="mb-6 font-display text-5xl font-bold md:text-6xl">
          Collision <span className="text-accent">Kinetics</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          A reaction only happens when molecules collide with enough energy and the right
          orientation. Watch a single real reaction succeed or fail atom by atom, then see those
          same two requirements checked across a whole population of colliding molecules.
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
          Controlling time, safety, and scarcity
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
        )}
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
                  Key idea
                </span>
                <h2 className="mt-3 text-xl font-bold">Reading the Maxwell–Boltzmann curve</h2>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:col-span-2">
                <p>
                  The curve shows how kinetic energy is spread across a population of molecules at a
                  given temperature. The height at any point is the number of molecules with that
                  energy — most sit near the middle, a few crawl, and a long tail runs far to the
                  right.
                </p>
                <p>
                  The dashed line is the activation energy. Only the shaded area beyond it
                  represents collisions energetic enough to react. Raising the temperature flattens
                  and stretches the curve rightward; adding a catalyst instead slides the dashed
                  line left. Both grow the shaded area, but only one of them changes the molecules
                  themselves.
                </p>
              </div>
            </section>

            <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">Why heat multiplies rate</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Raising the temperature does not shift the whole curve evenly — it stretches its
                  tail. A modest 10 K rise can double the number of molecules past the activation
                  energy, which is why rates climb exponentially rather than linearly with
                  temperature.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  The Arrhenius equation, k = Ae^(−Ea/RT), makes this explicit. Because Ea sits in
                  an exponent, temperature and activation energy do not nudge the rate — they scale
                  it. Halving Ea does far more than halving the time a reaction takes.
                </p>
              </div>
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">What a catalyst really does</h2>
                <p className="leading-relaxed text-muted-foreground">
                  A catalyst never adds energy. It opens a different pathway with a lower barrier,
                  so the same population of molecules suddenly qualifies — the shaded area beyond Ea
                  grows, even though the underlying energy curve never moves.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  A catalyst is also regenerated, so a tiny amount services an enormous number of
                  cycles — and it lowers the barrier equally in both directions, speeding the
                  reaction toward equilibrium without ever changing where that equilibrium lies.
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
                  orientation, captured by the steric factor. Bulky reactants can have a large
                  energetic population above Ea and still react slowly because most encounters are
                  geometrically useless.
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
                  Below
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Watch a single real reaction succeed or fail atom by atom, then see the same
                  energy-and-orientation requirements checked across a whole population of colliding
                  molecules at once.
                </p>
              </div>
            </section>
          </>
        )}
      </section>

      <section
        id="mechanism"
        aria-labelledby="mechanism-heading"
        className="mt-24 scroll-mt-24 border-t border-border pt-16"
      >
        <div className="mb-10 max-w-3xl">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            Section 03 · Reaction Mechanism
          </span>
          <h2 id="mechanism-heading" className="mt-3 text-3xl font-bold">
            Watch a reaction happen, atom by atom
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            A collision only succeeds when two conditions are both met: enough energy to react, and
            the right orientation to react. Here they're checked on an actual reaction — a bromide
            ion substituting for chloride on a carbon atom (SN2) — instead of as an abstract
            pass/fail. Watch what a real collision looks like in three dimensions: the incoming ion
            has to arrive from directly opposite the leaving group, at enough speed to reach bonding
            distance, or nothing happens at all.
          </p>
        </div>
        <div>
          <ReactionMechanism3D />
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
            The reaction above shows those same two requirements — energy and orientation — on one
            real collision. Here they're checked across a whole population at once: each A + B hit
            is tested for both enough energy and a good enough alignment between the two particles'
            reactive faces — gray means the collision was too weak, yellow means it had the energy
            but missed the angle, and green means it actually reacted. Tune the steric factor to see
            how much orientation alone can throttle a reaction that has plenty of energy to spare.
          </p>
        </div>
        <div>
          <CollisionSim />
        </div>
      </section>

      <NextTopicNav currentSlug="kinetics" />

      <SectionNav items={sections} />
    </main>
  );
}

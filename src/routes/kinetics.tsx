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
        "For a reaction to occur, two molecules first have to collide — but not every collision leads to a reaction. Two conditions must both be met: the molecules must collide with enough energy to break existing bonds (that minimum is called the activation energy, written Ea), and they must collide in the right orientation, with their reactive parts facing each other.",
        "A collision that's energetic enough but pointed the wrong way just bounces apart unchanged. This is why some reactions between small, simple molecules happen easily, while reactions between large, bulky molecules can be slow even when there's plenty of energy available — the odds of lining up correctly are lower.",
      ],
    },
    {
      heading: "Why a small temperature increase causes a big rate increase",
      body: [
        "At any given temperature, molecules in a sample have a range of kinetic energies — most have a moderate amount, and only a smaller fraction have enough to clear the activation energy barrier. Raising the temperature shifts that whole distribution toward higher energies.",
        "Because the number of molecules with 'enough' energy grows steeply rather than evenly as temperature rises, even a modest temperature increase can noticeably speed up a reaction. A useful rule of thumb: for a typical reaction near room temperature, a 10 °C rise roughly doubles the rate. That's not because every molecule got twice as fast — molecular speeds rise by less than 2% over that range — it's because the share of molecules that already clear the bar roughly doubles.",
      ],
    },
    {
      heading: "What a catalyst actually does",
      body: [
        "A catalyst speeds up a reaction by providing an alternate reaction pathway with a lower activation energy. With a lower energy requirement, a much larger fraction of molecules now have enough energy to react, so the reaction proceeds faster.",
        "A catalyst is not used up in the reaction — it participates and is then regenerated, so a small amount can keep working on molecule after molecule. It also does not change the equilibrium position of a reaction: it doesn't make a reaction more product-favored, it just gets the reaction to whatever equilibrium it was already heading toward more quickly.",
      ],
    },
    {
      heading: "Rate laws come from experiments, not from the balanced equation",
      body: [
        "A rate law says how a reaction's speed depends on the concentration of each reactant, and it has to be measured. You cannot read it off the balanced equation. The standard method is to change one reactant's concentration at a time, hold the others fixed, and see what the rate does. The exponent on each reactant is called its order, and the exponents added together give the overall order.",
        "Work one through. For 2 NO + O₂ → 2 NO₂, doubling [O₂] while holding [NO] fixed doubles the rate, so the reaction is first order in O₂ (2¹ = 2). Doubling [NO] while holding [O₂] fixed multiplies the rate by 4, and since 2² = 4 the reaction is second order in NO. The rate law is rate = k[NO]²[O₂], and the overall order is 2 + 1 = 3. Notice it does not match the coefficients in the balanced equation in any obvious way — that is exactly why it has to be measured.",
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
        "In an experiment, doubling [A] at constant [B] multiplies the rate by 4, while doubling [B] at constant [A] leaves the rate unchanged. What is the rate law?",
      answer: "rate = k[A]² — second order in A, zero order in B.",
      explanation:
        "A fourfold change in rate for a doubled concentration means the exponent is 2, since 2² = 4. No change at all when [B] doubles means the exponent on B is 0, which usually means B only gets involved after the slow, rate-determining step.",
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
                  The curve shows how kinetic energy is distributed across a population of molecules
                  at one temperature. In three dimensions it goes as √E times e^(−E/RT): the square
                  root lifts it off zero at the origin, the exponential drags it back down, and the
                  product peaks at RT/2 before decaying into a long tail running far to the right.
                  Most molecules sit near the peak. The ones that react live in the tail.
                </p>
                <p>
                  The dashed line is the activation energy Ea, and only the area beyond it counts.
                  Whenever Ea is much larger than RT — which is almost always, since RT is just 2.5
                  kJ/mol at room temperature while barriers typically run 50 to 150 kJ/mol — that
                  area is very well approximated by e^(−Ea/RT). At 298 K with Ea = 50 kJ/mol, that
                  fraction works out to roughly 2 in 10⁹. Reactions happen anyway because each
                  molecule is colliding about a billion times a second.
                </p>
                <p>
                  Raising the temperature stretches the tail rather than sliding the whole curve
                  rightward; adding a catalyst leaves the curve untouched and moves the dashed line
                  left instead. Both enlarge the shaded area. Only one of them changes the
                  molecules, and only one of them changes which reaction you are running.
                </p>
              </div>
            </section>

            <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">Why heat multiplies rate</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Warm a gas from 300 K to 310 K and the mean molecular speed, which goes as √T,
                  rises by less than 2%. Collisions get barely more frequent. Yet a reaction with Ea
                  = 50 kJ/mol very nearly doubles in rate. Essentially none of that comes from more
                  collisions — it all comes from the exponential.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Put the numbers in. Ea/R is 6014 K, so the Boltzmann factor moves from e^(−20.05)
                  to e^(−19.40), a ratio of e^0.65 ≈ 1.9. That is the origin of the old rule that 10
                  °C doubles a rate — and also its limit, since the rule only holds for barriers
                  near 50 kJ/mol near room temperature. A reaction with Ea = 100 kJ/mol speeds up
                  closer to fourfold over the same interval. The Arrhenius form k = Ae^(−Ea/RT) says
                  all of this at once: Ea and T sit in an exponent, so they scale the rate rather
                  than nudging it.
                </p>
              </div>
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">What a catalyst really does</h2>
                <p className="leading-relaxed text-muted-foreground">
                  A catalyst never adds energy. It opens a different route to the same products, one
                  whose highest point is lower, so the same unchanged population of molecules
                  suddenly qualifies — the shaded area beyond Ea grows while the energy curve never
                  moves. Because the catalyst is regenerated each cycle, a trace of it services an
                  enormous throughput: a single catalase molecule decomposes on the order of 10⁷
                  hydrogen peroxide molecules per second.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  The reason a catalyst cannot move an equilibrium is thermodynamic, not kinetic.
                  Forward and reverse reactions pass through the same transition state, so lowering
                  it lowers both barriers by the same amount; kf and kr are multiplied by an
                  identical factor and K = kf/kr is untouched. If that were not so you could shift
                  an equilibrium by adding and removing a catalyst, run the cycle repeatedly, and
                  extract work from nothing. Pauling's 1948 insight explains why the barrier drops
                  at all: a good catalyst binds the transition state more tightly than it binds the
                  reactants, which is precisely what lowering ΔG‡ means — and precisely why
                  transition-state analogues make such ferociously potent enzyme inhibitors.
                </p>
              </div>
            </section>

            <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">What Ea actually is</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Activation energy is defined operationally, not by looking at a potential-energy
                  surface. Plot ln k against 1/T and Ea is −R times the slope. That the plot comes
                  out straight at all is an empirical finding rather than a law, and for plenty of
                  reactions it curves, because the prefactor A carries its own temperature
                  dependence that Arrhenius folded away.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Transition state theory, worked out by Eyring and by Evans and Polanyi in 1935,
                  replaces the picture with k = (kB T/h) e^(−ΔG‡/RT), where ΔG‡ is the free energy
                  of the transition state relative to the reactants. Splitting ΔG‡ into ΔH‡ − TΔS‡
                  separates the two things Arrhenius lumps together: ΔH‡ is roughly the barrier
                  height that Ea measures, and ΔS‡ is the price in disorder that reaching the
                  transition state demands.
                </p>
              </div>
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">
                  Why the steric factor is really an entropy
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  Simple collision theory computes a rate from hard-sphere collision frequency: at 1
                  atm and room temperature each molecule is struck roughly 10⁹ times a second, so if
                  every sufficiently energetic collision reacted, most gas-phase reactions would be
                  over in microseconds. They are not, so the theory is patched with a steric factor
                  ρ, a correction running from about 1 for an atom meeting an atom down to 10⁻⁵ or
                  smaller for reactions between large, floppy molecules.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  That patch has a proper name in transition state theory: it is e^(ΔS‡/R).
                  Demanding that two molecules meet in one specific relative orientation is
                  demanding that they surrender rotational and translational freedom, and
                  surrendering freedom is a negative entropy of activation. Collision theory sees
                  geometry; thermodynamics sees the identical constraint as a count of accessible
                  arrangements. The steric factor in the simulation below is the same number,
                  exposed as a dial.
                </p>
              </div>
            </section>

            <section className="mt-16 grid gap-10 border-t border-border pt-16 md:grid-cols-3">
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
                  Collision theory
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Energy is necessary and not sufficient, and where the energy sits matters as much
                  as how much there is. Polanyi's rules, extracted from molecular-beam experiments,
                  say that a reaction with an early barrier is driven best by translational energy
                  while one with a late barrier is driven best by vibration in the bond about to
                  break. Bulky reactants can hold a large population above Ea and still crawl,
                  because most encounters are geometrically useless.
                </p>
              </div>
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
                  Rate laws and order
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Rate laws are measured, never read off a balanced equation; exponents match
                  coefficients only for an elementary step. A reactant that first appears after the
                  rate-determining step comes out zero order, since it cannot make the slow step any
                  faster, and one consumed in a fast pre-equilibrium can come out fractional. The
                  steady-state approximation — setting the net rate of change of a reactive
                  intermediate to zero — is how a proposed mechanism gets converted into a rate law
                  you can test against data.
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

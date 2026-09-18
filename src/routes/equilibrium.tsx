import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EquilibriumSim } from "@/components/EquilibriumSim";
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
    'Most reactions don\'t run to completion — they run until the forward and reverse reactions are happening at the same rate, then stop changing. That balance point, equilibrium, is why a sealed bottle of soda keeps its fizz for a while and why industrial reactors are designed around a specific temperature and pressure instead of just "more heat, more product."',
    "The water-gas shift reaction, CO + H₂O ⇌ CO₂ + H₂, is a real example: it's how industry squeezes extra hydrogen out of leftover carbon monoxide. Knowing how to predict which way an equilibrium will shift when you change a condition is what lets engineers (and AP Chemistry students) control reactions instead of just watching them happen.",
  ],
  theory: [
    {
      heading: "Equilibrium means equal rates, not equal amounts",
      body: [
        "A reaction at equilibrium has not stopped. Both the forward reaction and the reverse reaction are still running — they are just running at the same rate, so every molecule consumed is replaced as fast as it disappears and the measured concentrations hold steady. That is what the word dynamic means here.",
        "Equilibrium also does not mean there are equal amounts of reactants and products. A large K means the mixture at equilibrium is mostly products; a small K means it barely gets going and stays mostly reactants. What is equal at equilibrium is the pair of rates, not the pair of concentrations.",
      ],
    },
    {
      heading: "Qc vs. Kc: predicting which way a reaction shifts",
      body: [
        "Kc is the value of the reaction quotient once a reaction has settled into equilibrium — it's fixed for a given reaction at a given temperature. Qc is calculated the exact same way (products over reactants, each raised to its coefficient) but can be computed at any moment, not just at equilibrium.",
        "Comparing the two tells you which direction the reaction still needs to move: if Qc < Kc, there aren't enough products yet, so the reaction shifts forward to make more. If Qc > Kc, there are too many products, so it shifts in reverse to make more reactants. If Qc = Kc, the system is already at equilibrium and there's no net shift in either direction.",
        "Work one through. For CO + H₂O ⇌ CO₂ + H₂, Kc is about 9 at 700 K. Suppose at some moment the vessel holds [CO] = 0.10 M, [H₂O] = 0.10 M, [CO₂] = 0.20 M and [H₂] = 0.20 M. Then Qc = (0.20)(0.20) / [(0.10)(0.10)] = 0.04 / 0.01 = 4. Since 4 is smaller than 9, there is not enough product yet, so the reaction runs forward — making CO₂ and H₂ and consuming CO and H₂O — until Qc has climbed to 9 and stops changing.",
      ],
    },
    {
      heading: "Le Chatelier's principle: how disturbances shift the balance",
      body: [
        "Le Chatelier's principle says that when you disturb a system at equilibrium, it shifts in whichever direction partially cancels out that disturbance. Add more of a reactant and the system shifts forward to consume some of it; remove a product and the system shifts forward to replace some of it.",
        "Pressure works the same way, but only when the two sides of the equation have different numbers of gas moles. Compressing the container favors whichever side has fewer gas molecules, since shifting that way relieves some of the added pressure. If both sides have the same number of gas moles — like CO + H₂O ⇌ CO₂ + H₂ — squeezing the container speeds up both directions equally and the equilibrium position doesn't move at all.",
        "Temperature changes shift equilibrium too, but they're different from every other disturbance: they don't just move the position, they change the value of K itself (more on that next).",
      ],
    },
    {
      heading: "Why temperature is the exception",
      body: [
        "Changing concentration or pressure moves Qc away from Kc and lets the reaction shift back to the same Kc it started with — the constant itself never changes. Temperature is the one variable that actually changes the value of K.",
        "Which way K moves depends on whether the reaction is exothermic (it releases heat) or endothermic (it absorbs heat). You can treat heat as if it were a reactant or product: in an exothermic reaction heat is released, so it behaves like a product, and raising the temperature is like adding more of a product — the equilibrium shifts backward toward reactants, decreasing K. In an endothermic reaction heat is absorbed, so it behaves like a reactant, and raising the temperature shifts the equilibrium forward toward products, increasing K. Cooling does the opposite in each case.",
        "This is exactly why industrial shift reactors are built in two stages. The water-gas shift is exothermic, so a hot reactor reaches equilibrium quickly but that equilibrium sits in a bad place, while a cool reactor has a much more favorable K but takes longer to get there. Running one of each in series gets both.",
      ],
    },
  ],
  reviewQuestions: [
    {
      question:
        "For a reaction where Qc > Kc, which direction will the reaction shift to reach equilibrium?",
      answer: "In reverse (toward reactants)",
      explanation:
        "Qc > Kc means there is currently too much product relative to reactant compared to the equilibrium ratio, so the reaction runs in reverse until Qc drops back down to Kc.",
    },
    {
      question:
        "A reaction has the same number of moles of gas on both sides of the equation. What happens to its equilibrium position if you increase the container pressure?",
      answer: "Nothing — the equilibrium position doesn't shift.",
      explanation:
        "Pressure changes only shift equilibrium when the two sides have different numbers of gas moles, since shifting toward the side with fewer moles is what relieves the added pressure. With equal moles on both sides, compression speeds up the forward and reverse reactions equally, so the ratio of products to reactants never changes.",
    },
    {
      question:
        "For an exothermic reaction, does increasing the temperature increase or decrease K?",
      answer: "Decrease K",
      explanation:
        "In an exothermic reaction heat is a product, so raising the temperature acts like adding more product. The equilibrium shifts backward toward reactants, which means less product relative to reactant at the new equilibrium — a smaller K.",
    },
    {
      question:
        "At 700 K, Kc = 9 for CO + H₂O ⇌ CO₂ + H₂. A vessel holds 0.10 M CO, 0.10 M H₂O, 0.20 M CO₂ and 0.20 M H₂. Which way does the reaction shift?",
      answer: "Forward, toward products.",
      explanation:
        "Qc = (0.20)(0.20) / [(0.10)(0.10)] = 4. Since Qc (4) is less than Kc (9), the mixture holds too little product, so the reaction runs forward until Qc rises to 9.",
    },
    {
      question: "Does adding a catalyst change the value of Kc?",
      answer: "No.",
      explanation:
        "A catalyst speeds up both the forward and reverse reactions equally, so the system reaches equilibrium faster — but it doesn't change where that equilibrium lies. Only temperature changes K.",
    },
  ],
};

export const Route = createFileRoute("/equilibrium")({
  head: () => ({
    meta: [
      { title: "Dynamic Equilibrium Simulation — Valence Lab" },
      {
        name: "description",
        content:
          "Manipulate temperature, pressure and concentration in a live, rotatable 3D CO + H₂O ⇌ CO₂ + H₂ simulation and watch Le Chatelier's principle restore balance.",
      },
      { property: "og:title", content: "Dynamic Equilibrium Simulation — Valence Lab" },
      {
        property: "og:description",
        content: "A live particle simulation that explains chemical equilibrium, Qc and Kc.",
      },
    ],
  }),
  component: EquilibriumPage,
});

function EquilibriumPage() {
  const [level, setLevel] = useState<Level>("hard");
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-16 max-w-3xl border-b border-border pb-12">
        <div className="mb-5 inline-block border-y border-border px-4 py-2 text-[10px] font-bold uppercase text-accent">
          TOPIC 18: CHEMICAL DYNAMICS
        </div>
        <h1 className="mb-6 font-display text-5xl font-bold md:text-6xl">
          Dynamic <span className="text-accent">Equilibrium</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Understand the microscopic balance where forward and reverse reaction rates equalize.
          Manipulate pressure, temperature, and concentration to witness Le Chatelier's Principle in
          real-time.
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
          The reaction that makes the world's hydrogen
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
              Steam reforming turns natural gas into syngas — a mixture of carbon monoxide and
              hydrogen — but the leftover CO is a poison to downstream catalysts and a wasted source
              of fuel. The water-gas shift reaction, CO + H₂O ⇌ CO₂ + H₂, solves both problems at
              once: react that CO with steam and it becomes more H₂ plus CO₂ that is far easier to
              remove. It is the equilibrium quietly running upstream of the Haber–Bosch process,
              supplying the hydrogen that Haber–Bosch combines with nitrogen to make ammonia.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              That makes it an equilibrium with real economic and environmental stakes, not only a
              classroom rule. Industrial shift reactors run two stages — hot for speed, cool for a
              favorable equilibrium position — because temperature pulls those two goals in opposite
              directions. The same reaction now sits at the center of "blue hydrogen" and
              carbon-capture proposals, since the CO₂ it produces is far easier to separate and
              store than CO ever was.
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
            Balance at the molecular scale
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
                <h2 className="mt-3 text-xl font-bold">What you're looking at</h2>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:col-span-2">
                <p>
                  The vessel holds CO, H₂O, CO₂, and H₂ interconverting continuously in a container
                  you can rotate and zoom around. Every collision between a CO and an H₂O molecule
                  is a chance for the forward reaction; every collision between a CO₂ and an H₂ is a
                  chance for the reverse. Both are checked, and both happen, in the very same
                  instant — the orange flashes are the forward reaction firing, the blue flashes are
                  the reverse. Nothing ever stops: at equilibrium the two rates have simply matched,
                  which is what makes it <em>dynamic</em> rather than static.
                </p>
                <p>
                  Each control disturbs the balance in a different way. Concentration and pressure
                  move Qc and let the system relax back to the same Kc; temperature moves Kc itself,
                  because this reaction releases heat running forward and absorbs it running in
                  reverse. Watch the readouts, not just the particles.
                </p>
              </div>
            </section>

            <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">
                  Equilibrium is two reactions running, not one stopped
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  Nothing about equilibrium is static, and the algebra shows why. For an elementary
                  step the forward rate is kf[CO][H₂O] and the reverse rate is kr[CO₂][H₂]. Set them
                  equal, rearrange, and the concentration terms collect into [CO₂][H₂] divided by
                  [CO][H₂O] — the equilibrium expression — while the rate constants collect into
                  kf/kr. Kc is a ratio of two rate constants. Concentrations stop changing because
                  the rates have matched, not because the molecules have stopped.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Real reactions run through several elementary steps, and the principle of detailed
                  balance extends the result: at equilibrium every individual step is separately
                  balanced against its own reverse, and the overall K is the product of the
                  step-by-step constants. That principle is also the cleanest argument for why a
                  catalyst cannot move an equilibrium — it lowers one step's barrier from both
                  directions at once, multiplying kf and kr by the same factor and leaving the ratio
                  exactly where it was.
                </p>
              </div>
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">What Q actually measures</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Q has the same algebraic form as K but can be evaluated at any instant, and the
                  reason comparing them works is not a convention. Substitute ΔG° = −RT ln K into ΔG
                  = ΔG° + RT ln Q and the two logarithms collapse:{" "}
                  <span className="text-accent">ΔG = RT ln(Q/K)</span>. The free-energy driving
                  force on a reaction is literally the logarithmic distance from equilibrium.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Everything else follows from the sign. A Q below K makes the logarithm negative,
                  so ΔG is negative and the forward reaction is spontaneous; a Q above K flips every
                  sign; Q equal to K sets ΔG to zero, which is what equilibrium means
                  thermodynamically. The comparison rule is a consequence of that expression, and
                  the expression carries something the rule does not — how hard the system is being
                  pushed, and therefore how much work the reaction could still do.
                </p>
              </div>
            </section>

            <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">The Reaction Quotient (Qc)</h2>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  In practice you rarely evaluate ΔG. You compute Qc from the concentrations in
                  front of you, compare it with Kc, and read the direction off the comparison — the
                  operational form of the free-energy statement above.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="font-mono font-bold text-accent">{"Qc < Kc:"}</span>
                    <span className="text-sm">
                      Reaction proceeds forward (right) to form more products.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono font-bold text-accent">{"Qc > Kc:"}</span>
                    <span className="text-sm">
                      Reaction proceeds backward (left) to form more reactants.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono font-bold text-accent">{"Qc = Kc:"}</span>
                    <span className="text-sm">
                      Rates are matched. Molecules keep reacting, but concentrations hold steady.
                    </span>
                  </li>
                </ul>
                <p className="mt-6 leading-relaxed text-muted-foreground">
                  Temperature is the only control that changes Kc itself. Every other disturbance —
                  adding reactant, squeezing the vessel — moves Qc and lets the system settle back
                  to the same Kc.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-8">
                <svg
                  viewBox="0 0 400 290"
                  className="mb-6 w-full"
                  role="img"
                  aria-labelledby="seesaw-title"
                >
                  <title id="seesaw-title">
                    Seesaw balance diagram with CO + H2O on one pan and CO2 + H2 on the other,
                    illustrating equilibrium shift
                  </title>
                  <line
                    x1="80"
                    y1="110"
                    x2="320"
                    y2="70"
                    stroke="var(--foreground)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M170,240 L200,90 L230,240"
                    fill="none"
                    stroke="var(--foreground)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="150"
                    y1="240"
                    x2="250"
                    y2="240"
                    stroke="var(--foreground)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="200"
                    cy="90"
                    r="6"
                    fill="var(--card)"
                    stroke="var(--foreground)"
                    strokeWidth="3"
                  />

                  <line
                    x1="80"
                    y1="110"
                    x2="55"
                    y2="190"
                    stroke="var(--muted-foreground)"
                    strokeWidth="2"
                  />
                  <line
                    x1="80"
                    y1="110"
                    x2="105"
                    y2="190"
                    stroke="var(--muted-foreground)"
                    strokeWidth="2"
                  />
                  <path
                    d="M55,190 Q80,212 105,190"
                    fill="none"
                    stroke="var(--foreground)"
                    strokeWidth="2.5"
                  />
                  <text
                    x="80"
                    y="228"
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="700"
                    fill="var(--foreground)"
                    fontFamily="var(--font-mono)"
                  >
                    CO + H₂O
                  </text>

                  <line
                    x1="320"
                    y1="70"
                    x2="295"
                    y2="190"
                    stroke="var(--muted-foreground)"
                    strokeWidth="2"
                  />
                  <line
                    x1="320"
                    y1="70"
                    x2="345"
                    y2="190"
                    stroke="var(--muted-foreground)"
                    strokeWidth="2"
                  />
                  <path
                    d="M295,190 Q320,212 345,190"
                    fill="none"
                    stroke="var(--foreground)"
                    strokeWidth="2.5"
                  />
                  <text
                    x="320"
                    y="228"
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="700"
                    fill="var(--accent)"
                    fontFamily="var(--font-mono)"
                  >
                    CO₂ + H₂
                  </text>

                  <line
                    x1="20"
                    y1="245"
                    x2="380"
                    y2="245"
                    stroke="var(--muted-foreground)"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                  />

                  <g
                    stroke="var(--accent)"
                    strokeWidth="3"
                    fill="var(--accent)"
                    strokeLinecap="round"
                  >
                    <line x1="150" y1="25" x2="215" y2="25" />
                    <polygon points="215,17 233,25 215,33" />
                    <line x1="150" y1="272" x2="215" y2="272" />
                    <polygon points="215,264 233,272 215,280" />
                  </g>
                </svg>
                <p className="text-center font-mono text-xs text-muted-foreground">
                  Fig 1.2: Visual representation of the equilibrium seesaw.
                </p>
              </div>
            </section>

            <section className="mt-16 grid gap-10 border-t border-border pt-16 md:grid-cols-3">
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
                  Le Chatelier, precisely
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  A system at equilibrium responds to a disturbance by shifting in the direction
                  that partially offsets it. Partially is the key word: the system never fully
                  undoes your change, it only settles at a new balance point nearer the old one. But
                  the principle is a summary of outcomes, not a first principle — the law underneath
                  is that at constant temperature and pressure a system moves to minimize Gibbs free
                  energy, and the slogan about relieving a disturbance is what that minimization
                  usually looks like. Usually, not always: for N₂ + 3H₂ ⇌ 2NH₃ held at constant
                  pressure, adding N₂ to a mixture already more than half N₂ shifts the reaction
                  backward, producing still more N₂, because the added gas dilutes the others faster
                  than it enriches itself.
                </p>
              </div>
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
                  Why pressure does nothing here
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  One mole of CO plus one mole of H₂O becomes one mole of CO₂ plus one mole of H₂ —
                  the same number of gas molecules on both sides. Squeeze the vessel in the
                  simulation and pressure climbs, collisions get more frequent, and the reaction
                  runs faster in both directions at once, but the equilibrium ratio never moves.
                  Compressing a reaction only shifts it when the two sides disagree on how many
                  molecules they occupy. Inert gas is the same story told twice: add argon at fixed
                  volume and nothing happens, because every partial pressure is unchanged and Q
                  never moves; add it at fixed pressure and the vessel expands, every partial
                  pressure falls, and a reaction with unequal mole counts genuinely does shift. No
                  amount of reasoning about relieving stress distinguishes those two cases. The
                  free-energy criterion does it immediately.
                </p>
              </div>
              <div>
                <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
                  Where this shows up
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Industrial shift reactors sit downstream of steam reforming, converting leftover
                  CO into more hydrogen before it ever reaches a Haber–Bosch ammonia converter or a
                  fuel cell. Because pressure can't help an equal-mole equilibrium, engineers lean
                  on catalysts and staged cooling instead — Le Chatelier's absence is as instructive
                  as its presence.
                </p>
              </div>
            </section>

            <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">Where Kc actually comes from</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Kc is not an independent postulate — it is a restatement of Gibbs free energy. At
                  any point in a reaction, ΔG = ΔG° + RT ln Q. At equilibrium the system has nothing
                  left to gain by shifting further, so ΔG = 0 and Q has settled to K, which reduces
                  the equation to <span className="text-accent">ΔG° = −RT ln K</span>. A large
                  negative ΔG° forces K to be enormous; a positive ΔG° forces K below 1. The
                  equilibrium constant explored in this simulation is thermodynamics wearing a
                  different name.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  That identity also disposes of two rules that otherwise look arbitrary. K carries
                  no units because it is properly built from activities rather than concentrations,
                  and an activity is a ratio of a species' state to a chosen standard state, so
                  every unit cancels before the logarithm is taken — which is fortunate, since the
                  logarithm of a quantity with units is meaningless. And pure solids and pure
                  liquids drop out of the expression because their activity is 1: adding more solid
                  changes no intensive property of it, so it cannot move a quantity that measures
                  how far the system sits from balance.
                </p>
              </div>
              <div>
                <h2 className="mb-6 text-3xl font-bold italic">Why temperature is different</h2>
                <p className="leading-relaxed text-muted-foreground">
                  Every other disturbance in the simulation moves Qc without moving Kc at all.
                  Temperature is the one variable that changes K itself, and how much is quantified
                  by the van 't Hoff equation, ln(K₂/K₁) = −(ΔH°/R)(1/T₂ − 1/T₁) — derived by
                  combining ΔG° = ΔH° − TΔS° with ΔG° = −RT ln K and assuming ΔH° and ΔS° are
                  roughly temperature-independent. For this exothermic shift reaction, ΔH° &lt; 0,
                  so raising T makes ln K decrease: exactly why heating the vessel favors CO and H₂O
                  over CO₂ and H₂, even though it speeds up both directions at once.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  The size of the effect is startling. Feed ΔH° = −41.2 kJ/mol for the shift
                  reaction into that expression and K falls by more than four orders of magnitude
                  between 298 K and 700 K, from roughly 10⁵ down to single digits. That single
                  number is why industrial shift reactors are built in two stages: a hot stage
                  around 400 °C for rate, then a cooler stage near 200 °C to finish the conversion
                  at a K worth having. No single temperature gives you both, and no catalyst can
                  rescue you, because a catalyst moves rate without moving K.
                </p>
              </div>
            </section>

            <section className="mt-16 rounded-2xl border border-border bg-card p-8">
              <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
                Common misconception
              </h3>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Equilibrium does not mean equal amounts. A very large Kc means products dominate; a
                very small one means the reaction barely proceeds. What is equal at equilibrium is
                the pair of rates, not the pair of concentrations. Adding a catalyst reaches that
                state faster without changing where it lands. The second half of the misconception
                is that the reaction has stopped: the concentrations are constant, but both
                directions are still firing, continuously and at matched rates, which is precisely
                what the orange and blue flashes in the simulation are showing you.
              </p>
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
            Disturb the equilibrium
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Change one condition at a time, then compare Qc with Kc to predict the direction of the
            shift before the particles settle into their new balance.
          </p>
        </div>
        <div>
          <EquilibriumSim />
        </div>
      </section>

      <NextTopicNav currentSlug="equilibrium" />

      <SectionNav items={sections} />
    </main>
  );
}

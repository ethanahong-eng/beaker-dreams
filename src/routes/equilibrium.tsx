import { createFileRoute } from "@tanstack/react-router";
import { EquilibriumSim } from "@/components/EquilibriumSim";
import { SectionNav } from "@/components/SectionNav";

const sections = [
  { id: "significance", label: "Significance" },
  { id: "theory", label: "Theory" },
  { id: "simulation", label: "Simulation" },
];

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
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-16 max-w-3xl border-b border-border pb-12">
        <div className="mb-5 inline-block border-y border-border px-4 py-2 text-[10px] font-bold uppercase text-accent">
          TOPIC 04: CHEMICAL DYNAMICS
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
            carbon-capture proposals, since the CO₂ it produces is far easier to separate and store
            than CO ever was.
          </p>
        </div>
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

        <section className="mb-10 grid gap-6 border border-border bg-card/70 p-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
              About this demo
            </span>
            <h2 className="mt-3 text-xl font-bold">What you're looking at</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:col-span-2">
            <p>
              The vessel holds CO, H₂O, CO₂, and H₂ interconverting continuously in a container you
              can rotate and zoom around. Every collision between a CO and an H₂O molecule is a
              chance for the forward reaction; every collision between a CO₂ and an H₂ is a chance
              for the reverse. Both are checked, and both happen, in the very same instant — the
              orange flashes are the forward reaction firing, the blue flashes are the reverse.
              Nothing ever stops: at equilibrium the two rates have simply matched, which is what
              makes it <em>dynamic</em> rather than static.
            </p>
            <p>
              Each control disturbs the balance in a different way. Concentration and pressure move
              Qc and let the system relax back to the same Kc; temperature moves Kc itself, because
              this reaction releases heat running forward and absorbs it running in reverse. Watch
              the readouts, not just the particles.
            </p>
          </div>
        </section>

        <section className="mt-16 grid gap-16 border-t border-border pt-16 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold italic">The Reaction Quotient (Qc)</h2>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              Unlike the equilibrium constant Kc, which describes the stable state, the reaction
              quotient Qc can be calculated at any moment. Comparing Qc to Kc predicts which way the
              reaction will shift to reach equilibrium.
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
              adding reactant, squeezing the vessel — moves Qc and lets the system settle back to
              the same Kc.
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

              <g stroke="var(--accent)" strokeWidth="3" fill="var(--accent)" strokeLinecap="round">
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
              A system at equilibrium responds to a disturbance by shifting in the direction that
              partially offsets it. Partially is the key word: the system never fully undoes your
              change, it only moves to a new balance point closer to the old one.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
              Why pressure does nothing here
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              One mole of CO plus one mole of H₂O becomes one mole of CO₂ plus one mole of H₂ — the
              same number of gas molecules on both sides. Squeeze the vessel in the simulation and
              pressure climbs, collisions get more frequent, and the reaction runs faster in both
              directions at once, but the equilibrium ratio never moves. Compressing a reaction only
              shifts it when the two sides disagree on how many molecules they occupy.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
              Where this shows up
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Industrial shift reactors sit downstream of steam reforming, converting leftover CO
              into more hydrogen before it ever reaches a Haber–Bosch ammonia converter or a fuel
              cell. Because pressure can't help an equal-mole equilibrium, engineers lean on
              catalysts and staged cooling instead — Le Chatelier's absence is as instructive as its
              presence.
            </p>
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-border bg-card p-8">
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-accent">
            Common misconception
          </h3>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Equilibrium does not mean equal amounts. A very large Kc means products dominate; a very
            small one means the reaction barely proceeds. What is equal at equilibrium is the pair
            of rates, not the pair of concentrations. Adding a catalyst reaches that state faster
            without changing where it lands.
          </p>
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
      <SectionNav items={sections} />
    </main>
  );
}

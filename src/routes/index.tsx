import { createFileRoute, Link } from "@tanstack/react-router";

type Module = {
  to: "/geometry" | "/hybridization" | "/kinetics" | "/equilibrium" | "/everyday";
  index: string;
  tag: string;
  title: string;
  accent: string;
  description: string;
  topics: string[];
};

const modules: Module[] = [
  {
    to: "/geometry",
    index: "01",
    tag: "Module 01 · Molecular Architecture",
    title: "Molecule Geometry",
    accent: "Geometry",
    description:
      "Electron domains around a central atom repel each other.  In order to find the lowest possible energy state, molecules will place themselves as far away as possible from each other, resulting in predictable Add bonding and lone pairs to a live VSEPR builder and watch real electron repulsion predict the correct 3D shape.",
    topics: ["VSEPR", "Electron domains", "Bond angles", "Lone pairs"],
  },
  {
    to: "/hybridization",
    index: "02",
    tag: "Module 02 · Orbital Mixing",
    title: "Hybridization",
    accent: "Hybridization",
    description:
      "Before bonding with each other, orbitals in atoms have to merge. See how s and p orbitals combine into sp, sp² and sp³ hybrids, and why the blend ratio fixes the molecule's angles and shape.",
    topics: ["sp / sp² / sp³", "Orbital promotion", "π bonds", "Geometry link"],
  },
  {
    to: "/kinetics",
    index: "03",
    tag: "Module 03 · Reaction Rates",
    title: "Collision Kinetics",
    accent: "Kinetics",
    description:
      "A reaction only fires when molecules collide with enough energy and the right orientation. Shift the Maxwell–Boltzmann distribution, raise activation energy, or add a catalyst to see how few collisions actually clear the barrier.",
    topics: ["Activation energy", "Maxwell–Boltzmann", "Catalysis", "Arrhenius"],
  },
  {
    to: "/equilibrium",
    index: "04",
    tag: "Module 04 · Chemical Dynamics",
    title: "Dynamic Equilibrium",
    accent: "Equilibrium",
    description:
      "Watch forward and reverse reaction rates equalize in a live, rotatable 3D vessel. Disturb pressure, temperature and concentration, then compare Qc to Kc to predict how Le Chatelier's principle restores balance.",
    topics: ["Le Chatelier", "Qc vs Kc", "Haber–Bosch", "Water-gas shift"],
  },
  {
    to: "/everyday",
    index: "05",
    tag: "Module 05 · In the World",
    title: "Chemistry in Daily Life",
    accent: "Daily Life",
    description:
      "Long-form explainers on the chemistry that quietly shapes daily life — chirality and drug safety, why plastics become microplastics, ocean acidification, blood buffers and the Montreal Protocol. Less simulation, more awareness.",
    topics: ["Chirality", "Microplastics", "Ocean pH", "Blood buffers"],
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Valence Lab — Interactive Chemistry Simulations" },
      {
        name: "description",
        content:
          "Learn hard chemistry topics through interactive simulations: molecular geometry, orbital hybridization, reaction kinetics and dynamic equilibrium — plus the chemistry that shapes daily life.",
      },
      { property: "og:title", content: "Valence Lab — Interactive Chemistry Simulations" },
      {
        property: "og:description",
        content:
          "Interactive chemistry lessons with live simulations of molecular geometry, hybridization, kinetics and equilibrium, plus explainers on the chemistry of daily life.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      {/* Hero */}
      <section className="mb-24 border-b border-border pb-16 text-center">
        <div className="mb-8 inline-flex items-center gap-3 border-y border-border px-6 py-3">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-[10px] font-bold uppercase text-muted-foreground">
            INTERACTIVE CHEMISTRY
          </span>
        </div>
         <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl">
           Molecular structures and behaviors
         </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg italic leading-relaxed text-muted-foreground">
           Chemistry doesn't have to be confusing with the right visuals.  Each module here pairs a
           live simulation with the history and theory behind it.  Not only will you better understand
           the chemistry principles, but you'll also learn how and why
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/geometry"
            className="border border-primary bg-primary px-7 py-3 text-xs font-bold uppercase text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
          >
             DIGITAL LAB
          </Link>
          <Link
            to="/everyday"
            className="border border-primary bg-transparent px-7 py-3 text-xs font-bold uppercase text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
             DAILY-LIFE APPLICATION
          </Link>
        </div>
      </section>

      {/* Stat strip */}
      <section className="mb-24 grid grid-cols-2 border border-border bg-card/60 md:grid-cols-4">
        {[
          { k: "4", v: "Interactive modules" },
          { k: "3", v: "SIMULATIONS" },
          { k: "6", v: "Daily-life essays" },
          { k: "0", v: "Equations to memorize first" },
        ].map((s) => (
          <div key={s.v} className="border-b border-r border-border p-8 text-center md:border-b-0">
            <div className="font-display text-4xl font-bold text-primary">{s.k}</div>
            <div className="mt-2 text-[10px] font-bold uppercase text-muted-foreground">
              {s.v}
            </div>
          </div>
        ))}
      </section>

      {/* Modules */}
      <section className="mb-20">
        <div className="mb-12 flex items-end justify-between border-b border-primary pb-4">
          <h2 className="font-display text-3xl font-bold text-primary">
            Modules
          </h2>
          <span className="text-[10px] font-bold uppercase text-muted-foreground">
            05 / 05
          </span>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {modules.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group relative flex flex-col border border-border bg-card/70 p-8 transition-all hover:border-primary hover:shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  {m.tag}
                </span>
                <span className="font-display text-3xl font-bold text-border transition-colors group-hover:text-accent">
                  {m.index}
                </span>
              </div>
              <h3 className="mb-4 font-display text-2xl font-bold">
                {m.title.replace(m.accent, "")}
                <span className="text-accent">{m.accent}</span>
              </h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                {m.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {m.topics.map((t) => (
                  <span
                    key={t}
                    className="border border-border px-3 py-1 text-[10px] font-bold uppercase text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span className="mt-6 inline-flex w-fit items-center gap-2 border-b border-accent pb-1 text-[10px] font-bold uppercase text-accent">
                Enter module
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Approach */}
      <section className="mb-20 grid gap-12 border-t border-border pt-16 md:grid-cols-3">
        <div className="md:col-span-1">
          <span className="text-[10px] font-bold uppercase text-accent">
            How the lab works
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold">Learn about a topic, how it works, then apply those skills in a digital lab</h2>
        </div>
        <div className="space-y-8 md:col-span-2">
          {[
            {
              n: "01",
              t: "Significance",
              d: "Every module opens with the history and stakes — why this reaction fed a city, ruined a drug, or decided a treaty — so the equation has a reason before you touch a slider.",
            },
            {
              n: "02",
              t: "Theory",
              d: "Plain-language derivations sit next to the demo, defining Qc, activation energy, and pKa in the same frame where you'll see them move.",
            },
            {
              n: "03",
              t: "Simulation",
              d: "Interactive, real-time visualizations let you disturb a system and watch Le Chatelier's principle, catalysis, or buffering push it back toward balance.",
            },
          ].map((s) => (
            <div key={s.n} className="flex gap-6">
              <span className="font-display text-sm font-bold text-accent">{s.n}</span>
              <div>
                <h3 className="mb-2 font-bold">{s.t}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

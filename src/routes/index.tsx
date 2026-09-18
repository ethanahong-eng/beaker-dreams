import { createFileRoute, Link } from "@tanstack/react-router";
import { topics as allTopics, unitsOf, type Topic } from "@/lib/topics";
import { TopicLink } from "@/components/TopicLink";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Valence Lab — Interactive Chemistry Simulations" },
      {
        name: "description",
        content:
          "Learn chemistry from the atom up, at a college level: solving the Schrödinger equation, molecular geometry, orbital hybridization, reaction kinetics and dynamic equilibrium — plus the chemistry that shapes daily life.",
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
  errorComponent: LibraryError,
  component: HomePage,
});

function LibraryError() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-display text-4xl font-bold">Lessons unavailable</h1>
      <p className="mt-4 text-muted-foreground">
        The lesson library couldn't be loaded just now. Please refresh the page.
      </p>
    </main>
  );
}

function HomePage() {
  const topics = allTopics;
  const leadUnit = topics.find((t) => t.builtIn === "/everyday")?.unit;
  const units = unitsOf(topics, leadUnit);

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      {/* Hero */}
      <section className="mb-24 border-b border-border pb-16 text-center">
        <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl">Chemistry</h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg italic leading-relaxed text-muted-foreground">
          Chemistry doesn't have to be confusing with the right visuals. Each page here pairs a live
          simulation with the history and theory behind it. Not only will you better understand the
          chemistry principles, but you'll also learn how and why
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {topics[0] ? (
            <TopicLink
              topic={topics[0]}
              className="border border-primary bg-primary px-7 py-3 text-xs font-bold uppercase text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
            >
              DIGITAL LAB
            </TopicLink>
          ) : null}
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
          { k: String(topics.length), v: "Topics" },
          { k: String(units.length), v: "Units" },
          { k: "7", v: "SIMULATIONS" },
          { k: "0", v: "Formulas handed down without derivation" },
        ].map((s) => (
          <div key={s.v} className="border-b border-r border-border p-8 text-center md:border-b-0">
            <div className="font-display text-4xl font-bold text-primary">{s.k}</div>
            <div className="mt-2 text-[10px] font-bold uppercase text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </section>

      {/* Topic library */}
      <section className="mb-20">
        <div className="mb-12 flex items-end justify-between border-b border-primary pb-4">
          <h2 className="font-display text-3xl font-bold text-primary">Lessons</h2>
          <span className="text-[10px] font-bold uppercase text-muted-foreground">
            {topics.length} topics · {units.length} units
          </span>
        </div>

        <div className="space-y-16">
          {units.map((unit) => {
            const unitTopics = topics.filter((t) => t.unit === unit);
            if (unitTopics.length === 0) return null;
            return (
              <div key={unit}>
                <div className="mb-8 flex items-center gap-4">
                  <h3 className="font-display text-xl font-bold">{unit}</h3>
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {unitTopics.length} topics
                  </span>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  {unitTopics.map((t) => (
                    <TopicCard key={t.slug} topic={t} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function TopicCard({ topic }: { topic: Topic }) {
  const [before, after] = topic.title.split(topic.accent);
  const cardClass =
    "group relative flex flex-col border border-border bg-card/70 p-8 transition-all hover:border-primary hover:shadow-sm";

  const inner = (
    <>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-muted-foreground">
          {`TOPIC ${topic.index} · ${topic.unit}`}
        </span>
        <span className="font-display text-3xl font-bold text-border transition-colors group-hover:text-accent">
          {topic.index}
        </span>
      </div>
      <h3 className="mb-4 font-display text-2xl font-bold">
        {before}
        <span className="text-accent">{topic.accent}</span>
        {after}
      </h3>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
        {topic.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {topic.topics.map((t) => (
          <span
            key={t}
            className="border border-border px-3 py-1 text-[10px] font-bold uppercase text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
      <span className="mt-6 inline-flex w-fit items-center gap-2 border-b border-accent pb-1 text-[10px] font-bold uppercase text-accent">
        Open lesson
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </>
  );

  return (
    <TopicLink topic={topic} className={cardClass}>
      {inner}
    </TopicLink>
  );
}

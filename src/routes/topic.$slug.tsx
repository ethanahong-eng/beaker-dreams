import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SectionNav } from "@/components/SectionNav";
import { NextTopicNav } from "@/components/NextTopicNav";
import { VseprBuilder } from "@/components/VseprBuilder";
import { HybridizationSim } from "@/components/HybridizationSim";
import { CollisionSim } from "@/components/CollisionSim";
import { EquilibriumSim } from "@/components/EquilibriumSim";
import { ReactionMechanism3D } from "@/components/ReactionMechanism3D";
import { TitrationSim } from "@/components/TitrationSim";
import { BlindTitrationSim } from "@/components/BlindTitrationSim";
import { OrbitalSim } from "@/components/OrbitalSim";
import { LessonBody } from "@/components/LessonBody";
import { ReviewLevelToggle } from "@/components/ReviewLevelToggle";
import { ReviewQuestions } from "@/components/ReviewQuestions";
import { topicsQueryOptions } from "@/lib/topics-query";
import { TOPIC_OVERRIDES } from "@/lib/topicOverrides";
import type { SimKey } from "@/lib/topics";
import type { Level } from "@/lib/reviewContent";

export const Route = createFileRoute("/topic/$slug")({
  loader: async ({ params, context }) => {
    const topics = await context.queryClient.ensureQueryData(topicsQueryOptions);
    const topic = topics.find((t) => t.slug === params.slug);
    if (!topic || !topic.lesson) throw notFound();
    return { topic };
  },
  head: ({ loaderData }) => {
    const topic = loaderData?.topic;
    if (!topic) {
      return {
        meta: [{ title: "Topic not found — Valence Lab" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${topic.title} — Valence Lab`;
    return {
      meta: [
        { title },
        { name: "description", content: topic.description },
        { property: "og:title", content: title },
        { property: "og:description", content: topic.description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: TopicNotFound,
  errorComponent: TopicNotFound,
  component: TopicPage,
});

function renderSim(key: SimKey, mode?: "geometry" | "lewis" | "resonance") {
  switch (key) {
    case "vsepr":
      return mode ? <VseprBuilder mode={mode} /> : <VseprBuilder />;
    case "hybridization":
      return <HybridizationSim />;
    case "collision":
      return <CollisionSim />;
    case "equilibrium":
      return <EquilibriumSim />;
    case "mechanism":
      return <ReactionMechanism3D />;
    case "titration":
      return <TitrationSim />;
    case "blindTitration":
      return <BlindTitrationSim />;
    case "orbital":
      return <OrbitalSim />;
    default:
      return null;
  }
}

function TopicNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-display text-4xl font-bold">Topic not found</h1>
      <p className="mt-4 text-muted-foreground">
        That lesson doesn't exist yet. Browse the full list of topics instead.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block border border-primary px-6 py-3 text-xs font-bold uppercase text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        Back to all topics
      </Link>
    </main>
  );
}

function TopicPage() {
  const { topic } = Route.useLoaderData();
  const lesson = topic.lesson!;
  // Additive, code-only extensions keyed by slug -- see topicOverrides.tsx
  // for why (the lesson content and its simulation slot now live in a
  // database this codebase can only read, so a topic can't be edited from
  // here directly, but it can be extended without touching that data).
  const override = TOPIC_OVERRIDES[topic.slug];
  const [level, setLevel] = useState<Level>("hard");
  const easy = level === "easy" ? override?.easy : undefined;
  const simulation =
    override?.simulation ??
    (lesson.simulation
      ? {
          heading: lesson.simulation.heading,
          caption: lesson.simulation.caption,
          render: () => renderSim(lesson.simulation!.key, lesson.simulation!.mode),
        }
      : null);

  const sections = [
    { id: "significance", label: "Significance" },
    { id: "theory", label: "Theory" },
    ...(simulation ? [{ id: "simulation", label: "Simulation" }] : []),
  ];

  const [before, after] = topic.title.split(topic.accent);

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-16 max-w-3xl border-b border-border pb-12">
        <div className="mb-5 inline-block border-y border-border px-4 py-2 text-[10px] font-bold uppercase text-accent">
          {`TOPIC ${topic.index}: ${topic.unit}`}
        </div>
        <h1 className="mb-6 font-display text-5xl font-bold md:text-6xl">
          {before}
          <span className="text-accent">{topic.accent}</span>
          {after}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{topic.description}</p>
      </header>

      {override?.easy && <ReviewLevelToggle level={level} onChange={setLevel} />}

      <section
        id="significance"
        aria-labelledby="significance-heading"
        className="mb-20 scroll-mt-24 pt-2"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Section 01 · Significance
        </span>
        <h2 id="significance-heading" className="mt-3 text-3xl font-bold">
          Why it matters
        </h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {(easy?.significance ?? lesson.significance).map((p) => (
            <p key={p.slice(0, 40)} className="leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section id="theory" aria-labelledby="theory-heading" className="mb-20 scroll-mt-24 pt-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
          Section 02 · Theory
        </span>
        <h2 id="theory-heading" className="mt-3 text-3xl font-bold">
          The underlying principle
        </h2>
        {easy ? (
          <div className="mt-8">
            <LessonBody theory={easy.theory} />
            <ReviewQuestions questions={easy.reviewQuestions} />
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {lesson.theory.map((block) => (
              <div key={block.heading} className="border-l-2 border-border pl-6">
                <h3 className="mb-4 font-display text-xl font-bold">{block.heading}</h3>
                <div className="space-y-4">
                  {block.body.map((p) => (
                    <p key={p.slice(0, 40)} className="leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {override?.extraTheory?.map((block) => (
              <div key={block.heading} className="border-l-2 border-border pl-6">
                <h3 className="mb-4 font-display text-xl font-bold">{block.heading}</h3>
                {block.body}
              </div>
            ))}
          </div>
        )}
      </section>

      {simulation ? (
        <section
          id="simulation"
          aria-labelledby="simulation-heading"
          className="mb-20 scroll-mt-24 pt-2"
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
            Section 03 · Simulation
          </span>
          <h2 id="simulation-heading" className="mt-3 text-3xl font-bold">
            {simulation.heading}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            {simulation.caption}
          </p>
          <div className="mt-10">{simulation.render()}</div>
        </section>
      ) : null}

      <NextTopicNav currentSlug={topic.slug} />

      <SectionNav items={sections} />
    </main>
  );
}

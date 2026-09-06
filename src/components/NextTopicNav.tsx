import { Link } from "@tanstack/react-router";
import type { Topic } from "@/lib/topics";
import { TopicLink } from "@/components/TopicLink";

/** Footer nav shown at the bottom of every topic page: back to the library, and on to the next lesson in the curriculum. */
export function NextTopicNav({ topics, currentSlug }: { topics: Topic[]; currentSlug: string }) {
  const index = topics.findIndex((t) => t.slug === currentSlug);
  const next = index >= 0 ? topics[index + 1] : undefined;

  return (
    <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 border-b border-accent pb-1 text-[10px] font-bold uppercase text-accent"
      >
        ← All topics
      </Link>
      {next ? (
        <TopicLink
          topic={next}
          className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 text-xs font-bold uppercase text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
        >
          Next: {next.title}
          <span aria-hidden="true">→</span>
        </TopicLink>
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          That's the last topic in the curriculum
        </span>
      )}
    </div>
  );
}

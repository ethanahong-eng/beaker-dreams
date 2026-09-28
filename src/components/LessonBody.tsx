// Shared prose renderer for a Significance + Theory pair, extracted from
// topic.$slug.tsx's TopicPage so every page's "AP Review" tier renders
// with the exact same visual structure, instead of each page hand-rolling
// its own markup for what is the same category of content everywhere.
import { getFigure } from "@/components/figures/registry";
import type { TheoryBlock } from "@/lib/topics/types";

export function LessonBody({
  significance,
  theory,
}: {
  significance?: string[];
  theory: TheoryBlock[];
}) {
  return (
    <>
      {significance && significance.length > 0 && (
        <div className="mb-10 grid gap-10 md:grid-cols-2">
          {significance.map((p, i) => (
            <p key={i} className="leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
      )}
      <div className="space-y-10">
        {theory.map((block) => (
          <div key={block.heading} className="border-l-2 border-border pl-6">
            <h3 className="mb-4 font-display text-xl font-bold">{block.heading}</h3>
            <div className="space-y-4">
              {block.body.map((p, i) => (
                <p key={i} className="leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
              {block.figure && <FigureSlot figureKey={block.figure} />}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Renders a theory block's diagram. An unknown key renders nothing rather
 * than throwing -- a missing illustration should never take a lesson page
 * down. The integration check catches dangling keys at build time instead.
 */
function FigureSlot({ figureKey }: { figureKey: string }) {
  const Fig = getFigure(figureKey);
  if (!Fig) return null;
  return <Fig />;
}

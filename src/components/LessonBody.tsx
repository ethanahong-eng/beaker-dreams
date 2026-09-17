// Shared prose renderer for a Significance + Theory pair, extracted from
// topic.$slug.tsx's TopicPage so every page's "AP Review" tier renders
// with the exact same visual structure, instead of each page hand-rolling
// its own markup for what is the same category of content everywhere.
export function LessonBody({
  significance,
  theory,
}: {
  significance?: string[];
  theory: { heading: string; body: string[] }[];
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
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

import { useState } from "react";
import type { ReviewQuestion } from "@/lib/reviewContent";

function QuestionCard({ item }: { item: ReviewQuestion }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="font-medium">{item.question}</p>
      <button
        onClick={() => setRevealed((r) => !r)}
        aria-expanded={revealed}
        className="mt-3 rounded-full border border-border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-secondary"
      >
        {revealed ? "Hide answer" : "Show answer"}
      </button>
      {revealed && (
        <div className="mt-3 border-l-2 border-accent pl-4">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
            {item.answer}
          </p>
          {item.explanation && (
            <p className="mt-2 leading-relaxed text-muted-foreground">{item.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}

/** A few click-to-reveal AP-style review questions, shown only in "easy" mode. */
export function ReviewQuestions({ questions }: { questions: ReviewQuestion[] }) {
  if (questions.length === 0) return null;
  return (
    <div className="mt-10 space-y-4 border-t border-border pt-10">
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
        Quick review
      </span>
      <div className="space-y-3">
        {questions.map((q) => (
          <QuestionCard key={q.question} item={q} />
        ))}
      </div>
    </div>
  );
}

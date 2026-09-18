// Shared shape for every topic page's optional "AP Review" (easy) tier.
// The "hard" tier is always whatever content already exists on that page
// (bespoke JSX for the built-in routes, or the lesson data in
// src/lib/topics/ for topic.$slug.tsx) -- untouched. This type only
// describes the simplified alternative shown alongside it.
export type Level = "hard" | "easy";

export type ReviewQuestion = {
  question: string;
  answer: string;
  explanation?: string;
};

export type EasyContent = {
  // Optional: a page whose hard tier has no significance section (e.g.
  // geometry.tsx) shouldn't invent one for the easy tier either.
  significance?: string[];
  theory: { heading: string; body: string[] }[];
  reviewQuestions: ReviewQuestion[];
};

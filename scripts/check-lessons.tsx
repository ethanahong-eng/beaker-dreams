/**
 * Integration check for the lesson library. Run with: bun run check
 *
 * This exists because `vite build` cannot run in every environment (the
 * Lovable vite config package is not always installable), so `tsc` alone
 * would let a whole class of content regressions through: a topic that lost
 * its AP Review tier, an override keyed to a slug that no longer exists, a
 * figure key with no diagram behind it, markdown accidentally written into a
 * plain-text body. None of those are type errors; all of them are broken
 * pages.
 */
import type { FC } from "react";
import { renderToString } from "react-dom/server";
import { topics, units, unitsOf, topicsBySlug } from "@/lib/topics";
import { TOPIC_OVERRIDES } from "@/lib/topicOverrides";
import { FIGURES, FIGURE_KEYS } from "@/components/figures/registry";
import type { TheoryBlock } from "@/lib/topics/types";

let failures = 0;
const fail = (m: string) => {
  failures++;
  console.log("  FAIL  " + m);
};
const ok = (m: string) => console.log("  ok    " + m);
const note = (m: string) => console.log("  note  " + m);
/** Reports one check. Kept a statement rather than a ternary so lint stays quiet. */
function check(passed: boolean, okMsg: string, failMsg: string) {
  if (passed) ok(okMsg);
  else fail(failMsg);
}

const lessons = topics.filter((t) => !t.builtIn);
const builtIn = topics.filter((t) => t.builtIn);

console.log("\n=== Structure ===");
check(
  topicsBySlug.size === topics.length,
  `${topics.length} topics, no duplicate slugs`,
  "duplicate slugs",
);
check(unitsOf().length === units.length, `${units.length} units`, "unit mismatch");
ok(`${builtIn.length} built-in routes, ${lessons.length} lesson pages`);
for (const t of topics) {
  if (!t.title.includes(t.accent)) fail(`${t.slug}: accent "${t.accent}" not found in title`);
}
const declared = new Set(units as readonly string[]);
const stray = [...new Set(topics.map((t) => t.unit))].filter((u) => !declared.has(u));
check(stray.length === 0, "every topic's unit is declared", `stray units: ${stray.join(", ")}`);

console.log("\n=== Both review tiers present ===");
const noEasy = lessons.filter((t) => !TOPIC_OVERRIDES[t.slug]?.easy).map((t) => t.slug);
check(
  noEasy.length === 0,
  `all ${lessons.length} lesson pages have a Deep Dive and an AP Review tier`,
  `missing AP Review: ${noEasy.join(", ")}`,
);
for (const t of lessons) {
  const l = t.lesson;
  if (!l?.significance?.length) fail(`${t.slug}: empty significance`);
  if (!l?.theory?.length) fail(`${t.slug}: empty theory`);
  const e = TOPIC_OVERRIDES[t.slug]?.easy;
  if (e && !e.reviewQuestions?.length) fail(`${t.slug}: AP tier has no review questions`);
  if (e?.significance && !(l?.significance?.length ?? 0)) {
    fail(`${t.slug}: AP tier invents a significance section the Deep Dive tier lacks`);
  }
}

console.log("\n=== Overrides resolve ===");
for (const slug of Object.keys(TOPIC_OVERRIDES)) {
  if (!topicsBySlug.has(slug)) fail(`override "${slug}" matches no topic — it will never render`);
}
ok(`${Object.keys(TOPIC_OVERRIDES).length} override keys checked`);

console.log("\n=== Figures ===");
const allBlocks: { slug: string; tier: string; block: TheoryBlock }[] = [];
for (const t of lessons) {
  for (const block of t.lesson?.theory ?? []) allBlocks.push({ slug: t.slug, tier: "deep", block });
  for (const block of TOPIC_OVERRIDES[t.slug]?.easy?.theory ?? [])
    allBlocks.push({ slug: t.slug, tier: "ap", block });
}
const referenced = new Set<string>();
for (const { slug, tier, block } of allBlocks) {
  if (!block.figure) continue;
  referenced.add(block.figure);
  if (!FIGURE_KEYS.includes(block.figure)) {
    fail(`${slug} (${tier}) references figure "${block.figure}", which is not in the registry`);
  }
}
const orphans = FIGURE_KEYS.filter((k) => !referenced.has(k));
if (orphans.length === 0) {
  ok(`${FIGURE_KEYS.length} figures, all referenced by a lesson`);
} else {
  note(
    `${orphans.length} figure(s) not referenced from lesson data (fine if used directly in a route): ${orphans.join(", ")}`,
  );
}

const illustrated = allBlocks.filter((b) => b.block.figure).length;
note(
  `${illustrated} of ${allBlocks.length} theory blocks illustrated (${Math.round((illustrated / allBlocks.length) * 100)}%)`,
);
const barePages = lessons.filter(
  (t) =>
    !(t.lesson?.theory ?? []).some((b) => b.figure) &&
    !(TOPIC_OVERRIDES[t.slug]?.easy?.theory ?? []).some((b) => b.figure) &&
    !t.lesson?.simulation &&
    !TOPIC_OVERRIDES[t.slug]?.simulation,
);
check(
  barePages.length === 0,
  "no lesson page is entirely text",
  `pages with no figure and no simulation: ${barePages.map((t) => t.slug).join(", ")}`,
);

console.log("\n=== Figures render ===");
let figBad = 0;
for (const key of FIGURE_KEYS) {
  const Fig = (FIGURES as unknown as Record<string, FC>)[key]!;
  try {
    const a = renderToString(<Fig />);
    const b = renderToString(<Fig />);
    const issues: string[] = [];
    if (a !== b) issues.push("non-deterministic (would cause a hydration mismatch)");
    if (/\bNaN\b/.test(a)) issues.push("NaN in output");
    if (/(?:fill|stroke)="#[0-9a-fA-F]{3,8}"/.test(a))
      issues.push("raw hex colour — use the --fig-* tokens");
    if (!/role="img"/.test(a)) issues.push("no role=img");
    if (!/aria-label="[^"]{20,}/.test(a)) issues.push("missing or too-short aria-label");
    if (issues.length) {
      figBad++;
      fail(`figure "${key}": ${issues.join("; ")}`);
    }
  } catch (e) {
    figBad++;
    fail(`figure "${key}" threw: ${(e as Error).message}`);
  }
}
if (figBad === 0 && FIGURE_KEYS.length > 0)
  ok(`all ${FIGURE_KEYS.length} figures render deterministically and accessibly`);

console.log("\n=== Plain-text bodies ===");
const bad: string[] = [];
const scan = (where: string, s: string) => {
  if (/\*\*|\\\(|\\frac|\$\$/.test(s) || /^\s*[-*]\s/.test(s))
    bad.push(`${where}: markdown or LaTeX in a plain string`);
};
for (const t of lessons) {
  for (const p of t.lesson?.significance ?? []) scan(`${t.slug} significance`, p);
  for (const b of t.lesson?.theory ?? []) for (const p of b.body) scan(`${t.slug} ${b.heading}`, p);
  const e = TOPIC_OVERRIDES[t.slug]?.easy;
  for (const p of e?.significance ?? []) scan(`${t.slug} AP significance`, p);
  for (const b of e?.theory ?? []) for (const p of b.body) scan(`${t.slug} AP ${b.heading}`, p);
}
if (bad.length === 0) ok("no markdown or LaTeX leaked into plain-text bodies");
else bad.forEach(fail);

if (failures > 0) {
  // Thrown rather than process.exit: this project has no @types/node, and a
  // throw still gives bun a non-zero exit for CI.
  throw new Error(`${failures} lesson check(s) failed — see the FAIL lines above`);
}
console.log("\nALL CHECKS PASSED\n");

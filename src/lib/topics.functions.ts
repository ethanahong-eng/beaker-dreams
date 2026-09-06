import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { BuiltInPath, Topic, TopicLesson } from "./topics";

type TopicRow = {
  slug: string;
  index_label: string;
  unit: string;
  title: string;
  accent: string | null;
  description: string | null;
  tags: string[] | null;
  built_in: string | null;
  lesson: TopicLesson | null;
};

/** Public read of the lesson library. Anyone can view published lessons. */
export const listTopics = createServerFn({ method: "GET" }).handler(async (): Promise<Topic[]> => {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

  const supabasePublic = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const { data, error } = await supabasePublic
    .from("topics")
    .select("slug, index_label, unit, title, accent, description, tags, built_in, lesson")
    .eq("published", true)
    .order("unit_order", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as TopicRow[]).map((row) => ({
    slug: row.slug,
    index: row.index_label,
    unit: row.unit,
    title: row.title,
    accent: row.accent ?? "",
    description: row.description ?? "",
    topics: row.tags ?? [],
    ...(row.built_in ? { builtIn: row.built_in as BuiltInPath } : {}),
    ...(row.lesson ? { lesson: row.lesson } : {}),
  }));
});

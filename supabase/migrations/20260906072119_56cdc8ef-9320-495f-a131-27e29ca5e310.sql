CREATE TABLE public.topics (
  slug text PRIMARY KEY,
  index_label text NOT NULL,
  unit text NOT NULL,
  unit_order integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  accent text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  built_in text,
  lesson jsonb,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.topics TO anon;
GRANT SELECT ON public.topics TO authenticated;
GRANT ALL ON public.topics TO service_role;

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published topics"
  ON public.topics FOR SELECT
  TO anon, authenticated
  USING (published);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON public.topics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
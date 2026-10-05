CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 100),
  contact_info text NOT NULL CHECK (char_length(contact_info) BETWEEN 1 AND 200),
  description text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 3000),
  evidence_url text
);
GRANT INSERT ON public.reports TO anon, authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit report" ON public.reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone can upload report evidence" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'report-evidence');
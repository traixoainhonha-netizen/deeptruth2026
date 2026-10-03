CREATE TABLE public.quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  score int NOT NULL CHECK (score >= 0 AND score <= 100),
  total int NOT NULL CHECK (total > 0 AND total <= 100),
  level text NOT NULL CHECK (char_length(level) <= 100),
  answers jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.quiz_results TO anon, authenticated;
GRANT ALL ON public.quiz_results TO service_role;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert quiz results" ON public.quiz_results FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.report_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  contact text NOT NULL CHECK (char_length(contact) BETWEEN 1 AND 200),
  description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 3000),
  evidence_path text CHECK (char_length(evidence_path) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.report_submissions TO anon, authenticated;
GRANT ALL ON public.report_submissions TO service_role;
ALTER TABLE public.report_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit reports" ON public.report_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 600),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews readable" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone can post review" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

INSERT INTO public.reviews (name, rating, content) VALUES
('Minh Anh – 11A2', 5, 'Phần thử thách rất cuốn! Mình mới biết là deepfake có thể giả cả giọng nói người thân.'),
('Quốc Bảo – 10A5', 5, 'Quy tắc 3 giây & 2 kênh dễ nhớ ghê, mình đã chia sẻ cho cả nhà.'),
('Thu Hà – 12A1', 4, 'Cẩm nang rõ ràng, giao diện dễ thương. Mong có thêm nhiều ví dụ video hơn nữa.');

CREATE POLICY "anyone can upload evidence" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'evidence');
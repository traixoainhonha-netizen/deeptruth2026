-- DeepTruth: live deepfake threat map (crowdsourced reports + community danger scoring)
-- and hardening of the reviews table that backs the review archive.
-- Every statement is idempotent so the file can be re-applied safely.

-- Shared helpers --------------------------------------------------------------

-- The server owns created_at: clients cannot backdate rows or pin them to the top.
CREATE OR REPLACE FUNCTION public.set_created_at_now()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.created_at := now();
  RETURN NEW;
END;
$$;

-- Public content must never carry phone numbers, emails or ID/bank numbers.
-- Mirrors containsPersonalInfo() in src/components/deeptruth/threat-map/model.ts.
CREATE OR REPLACE FUNCTION public.contains_personal_info(p_text text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT p_text IS NOT NULL AND (
    p_text ~* '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}'
    OR regexp_replace(p_text, '(?<=[0-9])[ .-](?=[0-9])', '', 'g') ~ '(^|[^0-9])(\+?84|0)[0-9]{9,10}([^0-9]|$)'
    OR regexp_replace(p_text, '(?<=[0-9])[ .-](?=[0-9])', '', 'g') ~ '[0-9]{12,}'
  );
$$;

-- Reviews: moderation flag, server-side timestamps, indexes and aggregate stats -

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

DROP TRIGGER IF EXISTS reviews_set_created_at ON public.reviews;
CREATE TRIGGER reviews_set_created_at
  BEFORE INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_created_at_now();

DROP POLICY IF EXISTS "reviews readable" ON public.reviews;
CREATE POLICY "reviews readable" ON public.reviews
  FOR SELECT TO anon, authenticated USING (is_hidden = false);

DROP POLICY IF EXISTS "anyone can post review" ON public.reviews;
CREATE POLICY "anyone can post review" ON public.reviews
  FOR INSERT TO anon, authenticated WITH CHECK (is_hidden = false);

CREATE INDEX IF NOT EXISTS reviews_visible_created_at_idx
  ON public.reviews (created_at DESC) WHERE is_hidden = false;
CREATE INDEX IF NOT EXISTS reviews_visible_rating_idx
  ON public.reviews (rating, created_at DESC) WHERE is_hidden = false;

CREATE OR REPLACE VIEW public.review_stats WITH (security_invoker = true) AS
SELECT
  count(*)::int AS total,
  coalesce(round(avg(rating), 2), 0)::numeric(3, 2) AS average,
  count(*) FILTER (WHERE rating = 1)::int AS star_1,
  count(*) FILTER (WHERE rating = 2)::int AS star_2,
  count(*) FILTER (WHERE rating = 3)::int AS star_3,
  count(*) FILTER (WHERE rating = 4)::int AS star_4,
  count(*) FILTER (WHERE rating = 5)::int AS star_5,
  max(created_at) AS last_review_at
FROM public.reviews
WHERE is_hidden = false;

REVOKE ALL ON public.review_stats FROM anon, authenticated;
GRANT SELECT ON public.review_stats TO anon, authenticated;
GRANT ALL ON public.review_stats TO service_role;

COMMENT ON TABLE public.reviews IS 'Kho lưu trữ đánh giá website DeepTruth. Ẩn một đánh giá bằng cách đặt is_hidden = true.';
COMMENT ON COLUMN public.reviews.name IS 'Biệt danh do người dùng nhập, hoặc "Người dùng ẩn danh".';
COMMENT ON COLUMN public.reviews.rating IS 'Số sao từ 1 đến 5.';
COMMENT ON COLUMN public.reviews.content IS 'Nội dung đánh giá (tối đa 600 ký tự).';
COMMENT ON COLUMN public.reviews.is_hidden IS 'true = ẩn khỏi website (kiểm duyệt).';
COMMENT ON VIEW public.review_stats IS 'Thống kê đánh giá: tổng số, điểm trung bình và phân bố theo số sao.';

-- Threat map: reference regions ------------------------------------------------

CREATE TABLE IF NOT EXISTS public.threat_regions (
  code text PRIMARY KEY CHECK (code ~ '^[a-z0-9-]{2,40}$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  area text NOT NULL CHECK (area IN ('north', 'central', 'highlands', 'south', 'online')),
  latitude double precision CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision CHECK (longitude BETWEEN -180 AND 180),
  sort_order int NOT NULL DEFAULT 0,
  CONSTRAINT threat_regions_coordinates_pair CHECK ((latitude IS NULL) = (longitude IS NULL))
);

INSERT INTO public.threat_regions (code, name, area, latitude, longitude, sort_order) VALUES
  ('ha-noi', 'Hà Nội', 'north', 21.0285, 105.8542, 10),
  ('hai-phong', 'Hải Phòng', 'north', 20.8449, 106.6881, 20),
  ('ha-long', 'Hạ Long', 'north', 20.9517, 107.0800, 30),
  ('bac-ninh', 'Bắc Ninh', 'north', 21.1861, 106.0763, 40),
  ('thai-nguyen', 'Thái Nguyên', 'north', 21.5942, 105.8482, 50),
  ('nam-dinh', 'Nam Định', 'north', 20.4200, 106.1683, 60),
  ('lao-cai', 'Lào Cai', 'north', 22.4856, 103.9707, 70),
  ('dien-bien-phu', 'Điện Biên Phủ', 'north', 21.3860, 103.0230, 80),
  ('thanh-hoa', 'Thanh Hóa', 'central', 19.8067, 105.7852, 110),
  ('vinh', 'Vinh', 'central', 18.6796, 105.6813, 120),
  ('ha-tinh', 'Hà Tĩnh', 'central', 18.3428, 105.9057, 130),
  ('dong-hoi', 'Đồng Hới', 'central', 17.4689, 106.6223, 140),
  ('hue', 'Huế', 'central', 16.4637, 107.5909, 150),
  ('da-nang', 'Đà Nẵng', 'central', 16.0544, 108.2022, 160),
  ('quy-nhon', 'Quy Nhơn', 'central', 13.7820, 109.2196, 170),
  ('nha-trang', 'Nha Trang', 'central', 12.2388, 109.1967, 180),
  ('phan-thiet', 'Phan Thiết', 'central', 10.9289, 108.1021, 190),
  ('pleiku', 'Pleiku', 'highlands', 13.9833, 108.0000, 210),
  ('buon-ma-thuot', 'Buôn Ma Thuột', 'highlands', 12.6667, 108.0500, 220),
  ('da-lat', 'Đà Lạt', 'highlands', 11.9404, 108.4583, 230),
  ('tp-hcm', 'TP. Hồ Chí Minh', 'south', 10.7769, 106.7009, 310),
  ('bien-hoa', 'Biên Hòa', 'south', 10.9574, 106.8426, 320),
  ('thu-dau-mot', 'Thủ Dầu Một', 'south', 10.9804, 106.6519, 330),
  ('vung-tau', 'Vũng Tàu', 'south', 10.3460, 107.0843, 340),
  ('tay-ninh', 'Tây Ninh', 'south', 11.3100, 106.0983, 350),
  ('my-tho', 'Mỹ Tho', 'south', 10.3600, 106.3600, 360),
  ('can-tho', 'Cần Thơ', 'south', 10.0452, 105.7469, 370),
  ('long-xuyen', 'Long Xuyên', 'south', 10.3864, 105.4352, 380),
  ('rach-gia', 'Rạch Giá', 'south', 10.0125, 105.0809, 390),
  ('phu-quoc', 'Phú Quốc', 'south', 10.2899, 103.9840, 400),
  ('ca-mau', 'Cà Mau', 'south', 9.1769, 105.1524, 410),
  ('truc-tuyen', 'Trên mạng / không rõ vị trí', 'online', NULL, NULL, 900)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  area = EXCLUDED.area,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  sort_order = EXCLUDED.sort_order;

ALTER TABLE public.threat_regions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "threat regions readable" ON public.threat_regions;
CREATE POLICY "threat regions readable" ON public.threat_regions
  FOR SELECT TO anon, authenticated USING (true);
REVOKE ALL ON public.threat_regions FROM anon, authenticated;
GRANT SELECT ON public.threat_regions TO anon, authenticated;
GRANT ALL ON public.threat_regions TO service_role;

COMMENT ON TABLE public.threat_regions IS 'Danh mục khu vực (thành phố) dùng để định vị báo cáo trên bản đồ cảnh báo.';

-- Threat map: crowdsourced reports ---------------------------------------------

CREATE TABLE IF NOT EXISTS public.threat_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  category text NOT NULL CHECK (category IN ('money_transfer', 'celebrity_impersonation', 'voice_clone', 'defamation', 'other')),
  channel text NOT NULL CHECK (channel IN ('video_call', 'phone_call', 'social_media', 'messaging_app', 'other')),
  region_code text NOT NULL REFERENCES public.threat_regions (code) ON UPDATE CASCADE,
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 5 AND 120),
  description text NOT NULL CHECK (char_length(btrim(description)) BETWEEN 20 AND 1500),
  vote_count int NOT NULL DEFAULT 0,
  danger_total int NOT NULL DEFAULT 0,
  danger_score numeric GENERATED ALWAYS AS (
    CASE WHEN vote_count > 0 THEN round(danger_total::numeric / vote_count, 2) END
  ) STORED,
  is_hidden boolean NOT NULL DEFAULT false,
  CONSTRAINT threat_reports_totals_consistent CHECK (
    vote_count >= 0 AND danger_total BETWEEN vote_count AND vote_count * 5
  )
);

DROP TRIGGER IF EXISTS threat_reports_set_created_at ON public.threat_reports;
CREATE TRIGGER threat_reports_set_created_at
  BEFORE INSERT ON public.threat_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_created_at_now();

CREATE INDEX IF NOT EXISTS threat_reports_visible_created_at_idx
  ON public.threat_reports (created_at DESC) WHERE is_hidden = false;
CREATE INDEX IF NOT EXISTS threat_reports_visible_category_idx
  ON public.threat_reports (category, created_at DESC) WHERE is_hidden = false;
CREATE INDEX IF NOT EXISTS threat_reports_visible_region_idx
  ON public.threat_reports (region_code) WHERE is_hidden = false;

-- Reads are public; every write goes through submit_threat_report / vote_threat.
ALTER TABLE public.threat_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "threat reports readable" ON public.threat_reports;
CREATE POLICY "threat reports readable" ON public.threat_reports
  FOR SELECT TO anon, authenticated USING (is_hidden = false);
REVOKE ALL ON public.threat_reports FROM anon, authenticated;
GRANT SELECT ON public.threat_reports TO anon, authenticated;
GRANT ALL ON public.threat_reports TO service_role;

COMMENT ON TABLE public.threat_reports IS 'Báo cáo Deepfake do cộng đồng gửi cho bản đồ cảnh báo. Ẩn báo cáo vi phạm bằng is_hidden = true.';
COMMENT ON COLUMN public.threat_reports.category IS 'money_transfer | celebrity_impersonation | voice_clone | defamation | other';
COMMENT ON COLUMN public.threat_reports.channel IS 'video_call | phone_call | social_media | messaging_app | other';
COMMENT ON COLUMN public.threat_reports.danger_score IS 'Điểm nguy hiểm trung bình (1–5) do cộng đồng chấm; tự tính từ danger_total / vote_count.';
COMMENT ON COLUMN public.threat_reports.is_hidden IS 'true = ẩn khỏi bản đồ (kiểm duyệt).';

-- Threat map: community danger votes -------------------------------------------

CREATE TABLE IF NOT EXISTS public.threat_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  threat_id uuid NOT NULL REFERENCES public.threat_reports (id) ON DELETE CASCADE,
  voter_token uuid NOT NULL,
  danger_score smallint NOT NULL CHECK (danger_score BETWEEN 1 AND 5),
  is_reporter boolean NOT NULL DEFAULT false,
  CONSTRAINT threat_votes_one_per_voter UNIQUE (threat_id, voter_token)
);

CREATE INDEX IF NOT EXISTS threat_votes_reporter_recent_idx
  ON public.threat_votes (voter_token, created_at DESC) WHERE is_reporter;

DROP TRIGGER IF EXISTS threat_votes_set_created_at ON public.threat_votes;
CREATE TRIGGER threat_votes_set_created_at
  BEFORE INSERT ON public.threat_votes
  FOR EACH ROW EXECUTE FUNCTION public.set_created_at_now();

-- Keeps threat_reports.vote_count / danger_total exact for every write path,
-- including manual edits from the dashboard.
CREATE OR REPLACE FUNCTION public.threat_votes_sync_totals()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP IN ('DELETE', 'UPDATE') THEN
    UPDATE public.threat_reports
      SET vote_count = vote_count - 1, danger_total = danger_total - OLD.danger_score
      WHERE id = OLD.threat_id;
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    UPDATE public.threat_reports
      SET vote_count = vote_count + 1, danger_total = danger_total + NEW.danger_score
      WHERE id = NEW.threat_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS threat_votes_sync_totals ON public.threat_votes;
CREATE TRIGGER threat_votes_sync_totals
  AFTER INSERT OR DELETE OR UPDATE OF threat_id, danger_score ON public.threat_votes
  FOR EACH ROW EXECUTE FUNCTION public.threat_votes_sync_totals();

-- Voter tokens stay private: no direct access for anon or authenticated users.
ALTER TABLE public.threat_votes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.threat_votes FROM anon, authenticated;
GRANT ALL ON public.threat_votes TO service_role;

COMMENT ON TABLE public.threat_votes IS 'Phiếu chấm điểm nguy hiểm (1–5) cho từng báo cáo; mỗi trình duyệt chấm một lần cho mỗi báo cáo.';
COMMENT ON COLUMN public.threat_votes.voter_token IS 'Mã ẩn danh ngẫu nhiên lưu trong trình duyệt, không gắn với danh tính.';
COMMENT ON COLUMN public.threat_votes.is_reporter IS 'true = điểm tự đánh giá của chính người gửi báo cáo.';

-- Threat map: write API ---------------------------------------------------------

CREATE OR REPLACE FUNCTION public.submit_threat_report(
  p_category text,
  p_channel text,
  p_region_code text,
  p_title text,
  p_description text,
  p_danger_score int,
  p_voter_token uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_title text := btrim(coalesce(p_title, ''));
  v_description text := btrim(coalesce(p_description, ''));
  v_id uuid;
BEGIN
  IF p_voter_token IS NULL THEN
    RAISE EXCEPTION 'invalid_voter_token' USING ERRCODE = '22023';
  END IF;
  IF p_danger_score IS NULL OR p_danger_score NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'invalid_danger_score' USING ERRCODE = '22023';
  END IF;
  IF public.contains_personal_info(v_title || ' ' || v_description) THEN
    RAISE EXCEPTION 'personal_info_detected' USING ERRCODE = '22023';
  END IF;

  -- Anti-spam: 3 reports per browser per 10 minutes, 20 reports per minute overall.
  IF (SELECT count(*) FROM public.threat_votes
      WHERE voter_token = p_voter_token AND is_reporter
        AND created_at > now() - interval '10 minutes') >= 3
     OR (SELECT count(*) FROM public.threat_reports
         WHERE created_at > now() - interval '1 minute') >= 20 THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = '54000';
  END IF;

  INSERT INTO public.threat_reports (category, channel, region_code, title, description)
  VALUES (p_category, p_channel, p_region_code, v_title, v_description)
  RETURNING id INTO v_id;

  INSERT INTO public.threat_votes (threat_id, voter_token, danger_score, is_reporter)
  VALUES (v_id, p_voter_token, p_danger_score, true);

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.vote_threat(
  p_threat_id uuid,
  p_voter_token uuid,
  p_danger_score int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_inserted boolean;
  v_vote_count int;
  v_danger_total int;
  v_danger_score numeric;
BEGIN
  IF p_voter_token IS NULL THEN
    RAISE EXCEPTION 'invalid_voter_token' USING ERRCODE = '22023';
  END IF;
  IF p_danger_score IS NULL OR p_danger_score NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'invalid_danger_score' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.threat_reports WHERE id = p_threat_id AND NOT is_hidden) THEN
    RAISE EXCEPTION 'threat_not_found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.threat_votes (threat_id, voter_token, danger_score)
  VALUES (p_threat_id, p_voter_token, p_danger_score)
  ON CONFLICT ON CONSTRAINT threat_votes_one_per_voter DO NOTHING;
  v_inserted := FOUND;

  SELECT vote_count, danger_total, danger_score INTO v_vote_count, v_danger_total, v_danger_score
  FROM public.threat_reports WHERE id = p_threat_id;

  RETURN jsonb_build_object(
    'status', CASE WHEN v_inserted THEN 'ok' ELSE 'duplicate' END,
    'vote_count', v_vote_count,
    'danger_total', v_danger_total,
    'danger_score', v_danger_score
  );
END;
$$;

-- Internal helpers are not part of the public API.
REVOKE ALL ON FUNCTION public.set_created_at_now() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.contains_personal_info(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.threat_votes_sync_totals() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.submit_threat_report(text, text, text, text, text, int, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.vote_threat(uuid, uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_threat_report(text, text, text, text, text, int, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.vote_threat(uuid, uuid, int) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.submit_threat_report(text, text, text, text, text, int, uuid) IS 'Gửi báo cáo Deepfake mới kèm điểm nguy hiểm tự đánh giá (kiểm tra dữ liệu, chống spam, chặn thông tin cá nhân).';
COMMENT ON FUNCTION public.vote_threat(uuid, uuid, int) IS 'Chấm điểm nguy hiểm cho một báo cáo; mỗi trình duyệt chấm một lần.';

-- Threat map: aggregate views for the globe and the dashboard ------------------

CREATE OR REPLACE VIEW public.threat_region_stats WITH (security_invoker = true) AS
SELECT
  r.code AS region_code,
  r.name,
  r.area,
  r.latitude,
  r.longitude,
  count(t.id)::int AS report_count,
  count(t.id) FILTER (WHERE t.created_at > now() - interval '7 days')::int AS reports_last_7d,
  round(avg(t.danger_score), 2) AS avg_danger,
  max(t.created_at) AS last_reported_at
FROM public.threat_regions r
JOIN public.threat_reports t ON t.region_code = r.code AND t.is_hidden = false
GROUP BY r.code, r.name, r.area, r.latitude, r.longitude;

CREATE OR REPLACE VIEW public.threat_category_stats WITH (security_invoker = true) AS
SELECT
  t.category,
  count(*)::int AS report_count,
  count(*) FILTER (WHERE t.created_at > now() - interval '7 days')::int AS reports_last_7d,
  round(avg(t.danger_score), 2) AS avg_danger,
  max(t.created_at) AS last_reported_at
FROM public.threat_reports t
WHERE t.is_hidden = false
GROUP BY t.category;

REVOKE ALL ON public.threat_region_stats, public.threat_category_stats FROM anon, authenticated;
GRANT SELECT ON public.threat_region_stats, public.threat_category_stats TO anon, authenticated;
GRANT ALL ON public.threat_region_stats, public.threat_category_stats TO service_role;

COMMENT ON VIEW public.threat_region_stats IS 'Số báo cáo và mức nguy hiểm trung bình theo khu vực (dữ liệu cho quả cầu 3D).';
COMMENT ON VIEW public.threat_category_stats IS 'Số báo cáo và mức nguy hiểm trung bình theo thủ đoạn Deepfake.';

-- Realtime: new reports and score changes stream to every open map -------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'threat_reports'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.threat_reports;
  END IF;
END;
$$;

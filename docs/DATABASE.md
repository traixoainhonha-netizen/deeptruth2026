# Cơ sở dữ liệu DeepTruth

Tài liệu dành cho Nhóm NCKH: dữ liệu được lưu ở đâu, cách xem, xuất, kiểm duyệt và cách
kích hoạt các bảng mới.

## Dữ liệu được lưu ở đâu?

Toàn bộ dữ liệu nằm trong **Lovable Cloud** — cơ sở dữ liệu Supabase tích hợp sẵn của dự án
(mã dự án `hyireybnpzhfhabqxcrs`, xem `supabase/config.toml`).

> Đây **không** phải dự án Supabase riêng được kết nối qua tab *Connectors*. Website không dùng
> kết nối đó.

**Cách mở:** Lovable → mở dự án → tab **Cloud** → **Database** → **Tables**.

## Các bảng

| Bảng / View | Nội dung | Ai đọc/ghi được |
|---|---|---|
| `reviews` | Đánh giá website (biệt danh, số sao, nội dung) | Mọi người đọc & gửi; ẩn bằng `is_hidden` |
| `review_stats` *(view)* | Tổng số, điểm trung bình, phân bố 1–5 sao | Chỉ đọc |
| `quiz_results` | Kết quả thử thách Thật – Giả (ẩn danh) | Chỉ gửi, không ai đọc từ website |
| `reports` | Báo cáo bảo mật gửi Nhóm NCKH | Chỉ gửi; chỉ xem trong Lovable Cloud |
| `threat_regions` | 32 khu vực (thành phố) có toạ độ cho bản đồ | Chỉ đọc |
| `threat_reports` | Báo cáo Deepfake cộng đồng trên bản đồ | Đọc công khai; ghi qua hàm `submit_threat_report` |
| `threat_votes` | Phiếu chấm mức nguy hiểm 1–5 | Không ai đọc được từ website (bảo vệ mã ẩn danh) |
| `threat_region_stats` *(view)* | Thống kê theo khu vực (dữ liệu quả cầu 3D) | Chỉ đọc |
| `threat_category_stats` *(view)* | Thống kê theo thủ đoạn | Chỉ đọc |

Mỗi bảng/cột đều có mô tả tiếng Việt (hiện trong trình xem bảng của Lovable Cloud).

## Kho lưu trữ đánh giá

- **Trên website:** trang `/danh-gia` — xem thống kê, tìm kiếm, lọc theo số sao, phân trang và
  **tải CSV** (mở được bằng Excel, giữ đúng tiếng Việt).
- **Trong Lovable Cloud:** bảng `reviews`.
- **Ẩn một đánh giá không phù hợp:** đặt cột `is_hidden = true` (không cần xoá).

## Bản đồ cảnh báo Deepfake

- Người dùng gửi báo cáo ẩn danh qua hàm `submit_threat_report`. Hàm này:
  - kiểm tra dữ liệu (thủ đoạn, kênh, khu vực, độ dài nội dung);
  - **từ chối nội dung chứa số điện thoại, email, số tài khoản/CCCD** (bản đồ là công khai);
  - chống spam: tối đa 3 báo cáo/trình duyệt/10 phút và 20 báo cáo/phút toàn hệ thống.
- Cộng đồng chấm mức nguy hiểm qua hàm `vote_threat` — mỗi trình duyệt chấm 1 lần/báo cáo.
- Điểm (`vote_count`, `danger_total`, `danger_score`) được trigger cập nhật tự động, kể cả khi
  sửa/xoá phiếu thủ công trong Lovable Cloud.
- **Kiểm duyệt:** đặt `is_hidden = true` trên `threat_reports` để gỡ báo cáo khỏi bản đồ.

## Kích hoạt các bảng mới (migration `0002`)

Các bảng của bản đồ cảnh báo và phần nâng cấp đánh giá nằm trong
`drizzle/migrations/0002_threat_map_review_archive.sql`.

1. Sau khi code được đồng bộ vào Lovable, mở trang **Bản đồ cảnh báo**.
2. Nếu thấy dòng *"Bản đồ cảnh báo đang được khởi tạo"* tức là migration **chưa** chạy. Khi đó:
   - nhờ Lovable trong khung chat: *"Apply the pending database migration
     `drizzle/migrations/0002_threat_map_review_archive.sql`"*, **hoặc**
   - mở Lovable Cloud → **SQL**, dán toàn bộ nội dung file và chạy.
3. File được viết **idempotent** — chạy lại nhiều lần vẫn an toàn.

Trước khi migration chạy, website vẫn hoạt động bình thường: phần đánh giá tự tính thống kê,
bản đồ hiển thị trạng thái chờ thay vì báo lỗi.

## Câu lệnh SQL hữu ích

```sql
-- Thống kê đánh giá
SELECT * FROM public.review_stats;

-- Ẩn một đánh giá
UPDATE public.reviews SET is_hidden = true WHERE id = '<id>';

-- Báo cáo Deepfake mới nhất kèm khu vực
SELECT t.created_at, t.category, r.name AS khu_vuc, t.title, t.danger_score, t.vote_count
FROM public.threat_reports t JOIN public.threat_regions r ON r.code = t.region_code
ORDER BY t.created_at DESC LIMIT 50;

-- Thủ đoạn phổ biến nhất
SELECT * FROM public.threat_category_stats ORDER BY report_count DESC;
```

## Bảo mật

- Mọi bảng bật **Row Level Security**; người dùng web chỉ có đúng quyền liệt kê ở bảng trên.
- `.env` chỉ chứa khoá **publishable** (khoá công khai, vốn được nhúng vào trình duyệt) — dữ
  liệu được bảo vệ bởi RLS, không phải bởi việc giấu khoá. Khoá service-role không có trong repo.
- Migration đã được kiểm thử tự động trên PostgreSQL 17 (59 kịch bản, gồm cả các thao tác tấn
  công như ghi thẳng vào bảng, sửa bộ đếm, đọc mã ẩn danh).

# DeepTruth

Dự án nghiên cứu khoa học giúp học sinh nhận biết và phòng chống Deepfake.

**Live app**: https://deeptruth2026.lovable.app

## Các trang

| Đường dẫn | Trang | Nội dung |
|---|---|---|
| `/` | Trang chủ | Giới thiệu, hành trình 5 bước, xem trước bản đồ và đánh giá |
| `/cam-nang` | Cẩm nang | 4 chương kiến thức, mục lục theo dõi vị trí đọc |
| `/thu-thach` | Thật hay giả | Thử thách nhận biết video/hình ảnh, kết quả lưu ẩn danh |
| `/ban-do` | Bản đồ cảnh báo | Quả cầu 3D, báo cáo cộng đồng thời gian thực, chấm điểm nguy hiểm |
| `/bao-cao` | Báo cáo & Hỗ trợ | Đường dây nóng, báo cáo bảo mật kèm bằng chứng |
| `/danh-gia` | Kho lưu trữ đánh giá | Thống kê, tìm kiếm, lọc, phân trang, xuất CSV |

## Công nghệ

TanStack Start (React 19, SSR) · Tailwind CSS 4 · Supabase (Lovable Cloud) · TanStack Query ·
cobe (WebGL globe) · Lenis (smooth scroll).

Hiệu năng: mỗi trang là một chunk riêng, tải trước khi rê chuột vào link; quả cầu 3D, Lenis và
thư viện form chỉ tải khi cần; ảnh WebP đúng kích thước hiển thị.

## Cơ sở dữ liệu

Xem [docs/DATABASE.md](docs/DATABASE.md): nơi lưu dữ liệu, các bảng, cách xem/xuất/kiểm duyệt
đánh giá và cách kích hoạt migration của bản đồ cảnh báo.

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ddc41278-5cc5-4369-a038-685744d16ad3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

Kiểm tra trước khi đẩy code:

```sh
npm run test
npm run build
```

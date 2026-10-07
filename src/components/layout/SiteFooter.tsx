import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-128.webp";
import { JOURNEY } from "./site-nav";

const linkClass = "opacity-75 transition-opacity hover:opacity-100";

export function SiteFooter() {
  return (
    <footer className="bg-footer px-4 pb-8 pt-16 text-footer-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
              <img src={logo} alt="" aria-hidden width={111} height={128} className="h-9 w-auto" />
              DeepTruth
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-70">
              Dự án nghiên cứu khoa học phi lợi nhuận giúp học sinh nhận biết và phòng chống
              Deepfake.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50">Hành trình</p>
            <nav aria-label="Các trang" className="mt-4 grid gap-2 text-sm">
              {JOURNEY.map((p) => (
                <Link key={p.to} to={p.to} className={linkClass}>
                  {p.step.index}. {p.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50">
              Dữ liệu cộng đồng
            </p>
            <nav aria-label="Dữ liệu cộng đồng" className="mt-4 grid gap-2 text-sm">
              <Link to="/ban-do" className={linkClass}>
                Bản đồ cảnh báo Deepfake
              </Link>
              <Link to="/danh-gia" className={linkClass}>
                Kho lưu trữ đánh giá
              </Link>
              <Link to="/bao-cao" className={linkClass}>
                Gửi báo cáo bảo mật
              </Link>
            </nav>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50">Đường dây nóng</p>
            <ul className="mt-4 grid gap-2 text-sm opacity-80">
              <li>Công an: 113</li>
              <li>Bảo vệ trẻ em: 111</li>
              <li>canhbao.khonggianmang.vn</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-footer-foreground/15 pt-6 text-center text-xs opacity-60">
          © {new Date().getFullYear()} DeepTruth. Mọi quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}

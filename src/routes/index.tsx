import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import hero from "@/assets/hero.png";
import logo from "@/assets/logo.png";
import { Handbook } from "@/components/deeptruth/Handbook";
import { Quiz } from "@/components/deeptruth/Quiz";
import { Report } from "@/components/deeptruth/Report";
import { Reviews } from "@/components/deeptruth/Reviews";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DeepTruth – Bạn đang nhìn thấy thật hay giả?" },
      { name: "description", content: "Dự án NCKH giúp học sinh nhận biết và phòng chống Deepfake: cẩm nang, thử thách thật – giả và kênh báo cáo." },
      { property: "og:title", content: "DeepTruth – Cùng khám phá Deepfake" },
      { property: "og:description", content: "Cẩm nang, thử thách nhận biết và báo cáo Deepfake dành cho học sinh." },
    ],
  }),
  component: Index,
});

const nav = [
  ["Trang chủ", "#trang-chu"],
  ["Cẩm nang", "#cam-nang"],
  ["Thật hay giả", "#thu-thach"],
  ["Báo cáo", "#bao-cao"],
] as const;

function Index() {
  return (
    <div className="tech-bg min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <a href="#trang-chu" className="flex shrink-0 items-center gap-2 font-display text-lg font-extrabold text-primary">
            <img src={logo} alt="Logo DeepTruth" className="h-9 w-auto" /> DeepTruth
          </a>
          <nav className="flex gap-3 overflow-x-auto text-sm font-medium md:gap-6">
            {nav.map(([l, h]) => <a key={h} href={h} className="whitespace-nowrap hover:text-primary">{l}</a>)}
          </nav>
        </div>
      </header>

      <section id="trang-chu" className="px-4 pb-16 pt-12 md:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div className="text-center md:text-left">
            <span className="inline-block rounded-full bg-secondary px-4 py-1.5 text-sm font-bold text-primary">Cùng khám phá Deepfake nhé!</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-primary md:text-6xl">Bạn đang nhìn thấy thật hay giả?</h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Hãy để chúng tôi đồng hành cùng bạn trong việc nhận diện và hiểu rõ hơn về Deepfake — chủ động trước những nội dung do AI tạo ra.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <a href="#cam-nang" className="btn-pill">Khám phá ngay</a>
              <a href="#thu-thach" className="btn-pill">Thử thách nhận biết</a>
            </div>
          </div>
          <img src={hero} alt="Học sinh soi kính lúp vào khuôn mặt nửa thật nửa giả trên điện thoại" width={1024} height={1024} className="mx-auto w-full max-w-md" />
        </div>
      </section>

      <div className="bg-background">
        <Handbook />
        <Quiz />
        <Report />
        <Reviews />
      </div>

      <footer className="bg-footer px-4 pb-8 pt-14 text-footer-foreground">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="flex items-center gap-2 font-display text-xl font-extrabold"><img src={logo} alt="Logo DeepTruth" className="h-9 w-auto" /> DeepTruth</p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-70">Dự án nghiên cứu khoa học phi lợi nhuận giúp học sinh nhận biết và phòng chống Deepfake.</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-50">Khám phá</p>
              <nav className="mt-4 grid gap-2 text-sm">
                {nav.map(([l, h]) => <a key={h} href={h} className="opacity-80 transition hover:opacity-100">{l}</a>)}
                <a href="#danh-gia" className="opacity-80 transition hover:opacity-100">Đánh giá</a>
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
    </div>
  );
}

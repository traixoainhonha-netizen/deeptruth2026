import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone, ShieldAlert } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

export function ReportCta() {
  return (
    <section className="px-4 pb-24">
      <Reveal
        variant="scale"
        className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground md:px-12"
      >
        <div
          aria-hidden
          className="aurora-a absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="aurora-b absolute -bottom-32 left-1/3 -z-10 h-80 w-80 rounded-full bg-black/10 blur-2xl"
        />
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] opacity-80">
              <ShieldAlert className="h-4 w-4" aria-hidden /> Bước 4 · Hành động
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Gặp sự cố Deepfake? Đừng im lặng.
            </h2>
            <p className="mt-3 max-w-2xl opacity-85">
              Liên hệ ngay đường dây nóng hoặc gửi báo cáo bảo mật cho Nhóm NCKH — mọi thông tin chỉ
              nhóm nghiên cứu được xem.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
              <a
                href="tel:113"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 transition-colors hover:bg-white/25"
              >
                <Phone className="h-4 w-4" aria-hidden /> Công an 113
              </a>
              <a
                href="tel:111"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 transition-colors hover:bg-white/25"
              >
                <Phone className="h-4 w-4" aria-hidden /> Bảo vệ trẻ em 111
              </a>
            </div>
          </div>
          <Link
            to="/bao-cao"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-background px-7 py-4 font-bold text-primary shadow-[var(--shadow-lift)] transition-transform duration-300 hover:-translate-y-1 active:scale-95"
          >
            Gửi báo cáo
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

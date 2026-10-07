import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import {
  ArrowRight,
  ExternalLink,
  FileCheck2,
  Globe,
  Loader2,
  Lock,
  Phone,
  Radar,
  ShieldAlert,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/motion/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { randomUuid } from "@/lib/uuid";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const schema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên").max(100),
  contact: z.string().trim().min(1, "Vui lòng nhập trường / liên hệ").max(200),
  description: z.string().trim().min(10, "Mô tả ít nhất 10 ký tự").max(3000),
});

const hotlines = [
  { icon: Phone, title: "113", desc: "Công an – báo tin khẩn cấp", href: "tel:113" },
  {
    icon: ShieldAlert,
    title: "111",
    desc: "Tổng đài quốc gia bảo vệ trẻ em (miễn phí)",
    href: "tel:111",
  },
  {
    icon: Globe,
    title: "canhbao.khonggianmang.vn",
    desc: "Cổng cảnh báo an toàn thông tin",
    href: "https://canhbao.khonggianmang.vn",
  },
];

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function ReportForm() {
  const [form, setForm] = useState({ name: "", contact: "", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "ok">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ");
    if (file && file.size > MAX_FILE_BYTES) return setError("Tệp tối đa 10MB");
    setStatus("sending");
    let evidence_url: string | null = null;
    if (file) {
      const ext =
        file.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "bin";
      const path = `${randomUuid()}.${ext}`;
      const up = await supabase.storage
        .from("report-evidence")
        .upload(path, file, file.type ? { contentType: file.type } : {});
      if (up.error) {
        setStatus("idle");
        return setError("Không tải được tệp lên, vui lòng thử lại.");
      }
      evidence_url = `report-evidence/${path}`;
    }
    const { error: err } = await supabase.from("reports").insert({
      full_name: parsed.data.name,
      contact_info: parsed.data.contact,
      description: parsed.data.description,
      evidence_url,
    });
    if (err) {
      setStatus("idle");
      return setError("Gửi chưa thành công, vui lòng thử lại.");
    }
    setStatus("ok");
    setForm({ name: "", contact: "", description: "" });
    setFile(null);
    toast.success("Báo cáo đã được gửi bảo mật tới Nhóm NCKH.");
  }

  return (
    <form onSubmit={submit} className="card-soft space-y-4 p-6 md:p-8" noValidate>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-lg font-bold">Gửi báo cáo cho Nhóm NCKH</p>
          <p className="text-sm text-muted-foreground">Bảo mật — chỉ nhóm nghiên cứu được xem.</p>
        </div>
      </div>
      <input
        className="field"
        placeholder="Họ và tên"
        aria-label="Họ và tên"
        maxLength={100}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="field"
        placeholder="Trường / Số điện thoại / Email"
        aria-label="Thông tin liên hệ"
        maxLength={200}
        value={form.contact}
        onChange={(e) => setForm({ ...form, contact: e.target.value })}
      />
      <div>
        <textarea
          className="field min-h-36"
          placeholder="Mô tả sự việc..."
          aria-label="Mô tả sự việc"
          maxLength={3000}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {form.description.length}/3000
        </p>
      </div>
      {file ? (
        <div className="flex items-center gap-3 rounded-xl border bg-secondary px-4 py-3 text-sm">
          <FileCheck2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <span className="min-w-0 flex-1 truncate font-semibold">{file.name}</span>
          <span
            className={cn(
              "shrink-0 text-xs",
              file.size > MAX_FILE_BYTES ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {formatSize(file.size)}
          </span>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full hover:bg-background"
            aria-label="Bỏ tệp đính kèm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="field flex cursor-pointer items-center gap-3 border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary/40">
          <Upload className="h-4 w-4 shrink-0" />
          <span className="truncate">Tải lên bằng chứng (ảnh, video, âm thanh – tối đa 10MB)</span>
          <input
            type="file"
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
      {error && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      {status === "ok" && (
        <p role="status" className="text-sm font-semibold text-success">
          Báo cáo của bạn đã được gửi thành công và bảo mật tuyệt đối!
        </p>
      )}
      <button className="btn-pill w-full" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Đang gửi...
          </>
        ) : (
          "Gửi báo cáo"
        )}
      </button>
    </form>
  );
}

export function Report() {
  return (
    <div className="px-4 py-16">
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[1fr_1.25fr]">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-primary">Đường dây nóng khẩn cấp</h2>
            <div className="mt-4 space-y-3">
              {hotlines.map((h, i) => {
                const external = h.href.startsWith("http");
                return (
                  <Reveal key={h.title} delay={i * 80}>
                    <a
                      href={h.href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      data-spotlight
                      className="card-soft card-hover group flex items-center gap-4 p-4"
                    >
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary transition-transform duration-300 group-hover:scale-110">
                        <h.icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block break-words font-bold text-primary">{h.title}</span>
                        <span className="block text-sm text-muted-foreground">{h.desc}</span>
                      </span>
                      {external ? (
                        <ExternalLink
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      ) : (
                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      )}
                    </a>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary">Chọn kênh phù hợp</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Reveal className="rounded-2xl border border-primary/40 bg-secondary p-5">
                <Lock className="h-5 w-5 text-primary" aria-hidden />
                <p className="mt-2 font-bold">Báo cáo bảo mật</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dành cho nạn nhân hoặc người cần hỗ trợ. Có thể đính kèm bằng chứng; chỉ Nhóm NCKH
                  xem được.
                </p>
              </Reveal>
              <Reveal delay={80}>
                <Link to="/ban-do" className="card-soft card-hover group block h-full p-5">
                  <Radar className="h-5 w-5 text-primary" aria-hidden />
                  <span className="mt-2 block font-bold">Cảnh báo cộng đồng</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Chia sẻ ẩn danh thủ đoạn bạn gặp để cảnh báo mọi người trên bản đồ.
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Mở bản đồ
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            </div>
          </div>
        </div>

        <Reveal variant="right" className="lg:sticky lg:top-24">
          <ReportForm />
        </Reveal>
      </div>
    </div>
  );
}

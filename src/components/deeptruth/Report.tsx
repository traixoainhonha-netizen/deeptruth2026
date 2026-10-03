import { useState } from "react";
import { z } from "zod";
import { Phone, ShieldAlert, Globe, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên").max(100),
  contact: z.string().trim().min(1, "Vui lòng nhập trường / liên hệ").max(200),
  description: z.string().trim().min(10, "Mô tả ít nhất 10 ký tự").max(3000),
});

const hotlines = [
  { icon: Phone, title: "113", desc: "Công an – báo tin khẩn cấp" },
  { icon: ShieldAlert, title: "111", desc: "Tổng đài quốc gia bảo vệ trẻ em (miễn phí)" },
  { icon: Globe, title: "canhbao.khonggianmang.vn", desc: "Cổng cảnh báo an toàn thông tin" },
];

export function Report() {
  const [form, setForm] = useState({ name: "", contact: "", description: "" });
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "ok">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    if (file && file.size > 10 * 1024 * 1024) return setError("Tệp tối đa 10MB");
    setStatus("sending");
    let evidence_path: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "bin";
      const path = `${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("evidence").upload(path, file);
      if (up.error) { setStatus("idle"); return setError("Không tải được tệp lên, vui lòng thử lại."); }
      evidence_path = path;
    }
    const { error: err } = await supabase.from("report_submissions").insert({ ...parsed.data, evidence_path });
    if (err) { setStatus("idle"); return setError("Gửi chưa thành công, vui lòng thử lại."); }
    setStatus("ok");
    setForm({ name: "", contact: "", description: "" });
    setFile(null);
  }

  return (
    <section id="bao-cao" className="scroll-mt-20 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">Phần 3</p>
        <h2 className="mt-2 text-center text-3xl font-bold text-primary md:text-4xl">Báo cáo & Hỗ trợ</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <p className="font-bold">Đường dây nóng khẩn cấp</p>
            {hotlines.map((h) => (
              <div key={h.title} className="card-soft flex items-center gap-4 p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><h.icon className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <p className="break-words font-bold text-primary">{h.title}</p>
                  <p className="text-sm text-muted-foreground">{h.desc}</p>
                </div>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">Báo cáo của bạn được bảo mật và chỉ Nhóm NCKH xem được.</p>
          </div>
          <form onSubmit={submit} className="card-soft space-y-4 p-6">
            <p className="text-lg font-bold">Gửi báo cáo cho Nhóm NCKH</p>
            <input className="field" placeholder="Họ và tên" maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="field" placeholder="Trường / Số điện thoại / Email" maxLength={200} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            <textarea className="field min-h-32" placeholder="Mô tả sự việc..." maxLength={3000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="field flex cursor-pointer items-center gap-3 text-muted-foreground">
              <Upload className="h-4 w-4 shrink-0" />
              <span className="truncate">{file ? file.name : "Tải lên bằng chứng (ảnh, video, âm thanh – tối đa 10MB)"}</span>
              <input type="file" className="hidden" accept="image/*,video/*,audio/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
            {status === "ok" && <p className="text-sm font-semibold text-success">Đã gửi! Nhóm NCKH sẽ xem xét báo cáo của bạn.</p>}
            <button className="btn-pill w-full" disabled={status === "sending"}>{status === "sending" ? "Đang gửi..." : "Gửi báo cáo"}</button>
          </form>
        </div>
      </div>
    </section>
  );
}

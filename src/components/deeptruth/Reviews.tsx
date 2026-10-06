import { useEffect, useState } from "react";
import { z } from "zod";
import { Star, ChevronDown, ChevronUp, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Review = { id: string; name: string; rating: number; content: string; created_at: string };

const ANON = "Người dùng ẩn danh";

const schema = z.object({
  name: z.string().trim().max(60),
  content: z.string().trim().min(3, "Viết vài dòng nhé").max(600),
  rating: z.number().int().min(1).max(5),
});

function Stars({ n, onPick }: { n: number; onPick?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button type="button" key={i} disabled={!onPick} onClick={() => onPick?.(i)} aria-label={`${i} sao`}>
          <Star className={`h-5 w-5 ${i <= n ? "fill-warning text-warning" : "text-border"}`} />
        </button>
      ))}
    </div>
  );
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ name: "", content: "", rating: 5 });
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(1000)
      .then(({ data }) => data && setReviews(data));
    const ch = supabase
      .channel("reviews-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reviews" }, (p) => {
        const r = p.new as Review;
        setReviews((prev) => (prev.some((x) => x.id === r.id) ? prev : [r, ...prev]));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setMsg(parsed.error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ");
    setSending(true);
    const id = crypto.randomUUID();
    const row = { id, ...parsed.data, name: parsed.data.name || ANON };
    const { error } = await supabase.from("reviews").insert(row);
    setSending(false);
    if (error) return setMsg("Gửi chưa thành công, thử lại nhé.");
    setReviews((prev) => (prev.some((x) => x.id === id) ? prev : [{ ...row, created_at: new Date().toISOString() }, ...prev]));
    setForm({ name: "", content: "", rating: 5 });
    setMsg("Cảm ơn bạn đã đánh giá! 💚");
  }

  const [count, setCount] = useState(3);
  const visible = reviews.slice(0, count);

  return (
    <section id="danh-gia" className="scroll-mt-20 bg-muted px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-primary md:text-4xl">Đánh giá từ người dùng</h2>
        {reviews.length > 0 && (() => {
          const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
          return (
            <div className="card-soft mx-auto mt-6 flex w-fit flex-col items-center gap-2 px-8 py-4 sm:flex-row sm:gap-4">
              <p className="font-bold">Đánh giá trung bình: <span className="text-2xl text-primary">{avg.toFixed(1)}</span> / 5 sao</p>
              <Stars n={Math.round(avg)} />
              <p className="text-sm text-muted-foreground">({reviews.length} đánh giá)</p>
            </div>
          );
        })()}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => (
            <div key={r.id} className="card-soft flex flex-col p-5">
              <Stars n={r.rating} />
              <p className="mt-3 flex-1 text-sm leading-relaxed">“{r.content}”</p>
              <p className="mt-3 flex items-center gap-2 text-sm font-bold text-primary">
                <UserRound className="h-4 w-4" /> {r.name?.trim() || ANON}
              </p>
            </div>
          ))}
        </div>
        {reviews.length > 3 && (
          <div className="mt-6 flex justify-center gap-3">
            {count < reviews.length && (
              <button type="button" onClick={() => setCount(count + 6)} className="btn-pill-outline">
                Xem thêm ({reviews.length - count}) <ChevronDown className="h-4 w-4" />
              </button>
            )}
            {count > 3 && (
              <button type="button" onClick={() => setCount(3)} className="btn-pill-outline">
                Thu gọn <ChevronUp className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <form onSubmit={submit} className="card-soft mx-auto mt-10 max-w-xl space-y-4 p-6">
          <p className="text-lg font-bold">Gửi đánh giá của bạn</p>
          <Stars n={form.rating} onPick={(rating) => setForm({ ...form, rating })} />
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Biệt danh hoặc Tên viết tắt (Không bắt buộc)</span>
            <input className="field" placeholder="VD: M.A, Thành viên #10A5 — để trống để ẩn danh" maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <textarea className="field min-h-24" placeholder="Cảm nhận của bạn..." maxLength={600} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <p className="text-xs text-muted-foreground">Chúng tôi không thu thập thông tin cá nhân. Để trống tên, bạn sẽ hiển thị là “{ANON}”.</p>
          {msg && <p className="text-sm font-semibold text-primary">{msg}</p>}
          <button className="btn-pill w-full" disabled={sending}>{sending ? "Đang gửi..." : "Gửi đánh giá"}</button>
        </form>
      </div>
    </section>
  );
}

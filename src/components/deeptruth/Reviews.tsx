import { useEffect, useState } from "react";
import { z } from "zod";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Review = { id: string; name: string; rating: number; content: string; created_at: string };

const schema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên").max(60),
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
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(30)
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
    const { error } = await supabase.from("reviews").insert({ id, ...parsed.data });
    setSending(false);
    if (error) return setMsg("Gửi chưa thành công, thử lại nhé.");
    setReviews((prev) => (prev.some((x) => x.id === id) ? prev : [{ id, ...parsed.data, created_at: new Date().toISOString() }, ...prev]));
    setForm({ name: "", content: "", rating: 5 });
    setMsg("Cảm ơn bạn đã đánh giá! 💚");
  }

  return (
    <section id="danh-gia" className="scroll-mt-20 bg-muted px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-primary md:text-4xl">Đánh giá từ người dùng</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.id} className="card-soft p-5">
              <Stars n={r.rating} />
              <p className="mt-3 text-sm leading-relaxed">“{r.content}”</p>
              <p className="mt-3 text-sm font-bold text-primary">{r.name}</p>
            </div>
          ))}
        </div>
        <form onSubmit={submit} className="card-soft mx-auto mt-10 max-w-xl space-y-4 p-6">
          <p className="text-lg font-bold">Gửi đánh giá của bạn</p>
          <Stars n={form.rating} onPick={(rating) => setForm({ ...form, rating })} />
          <input className="field" placeholder="Tên của bạn (VD: Lan – 11A3)" maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className="field min-h-24" placeholder="Cảm nhận của bạn..." maxLength={600} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          {msg && <p className="text-sm font-semibold text-primary">{msg}</p>}
          <button className="btn-pill w-full" disabled={sending}>{sending ? "Đang gửi..." : "Gửi đánh giá"}</button>
        </form>
      </div>
    </section>
  );
}

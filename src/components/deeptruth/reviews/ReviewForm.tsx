import { useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ANON_NAME } from "./api";
import { useSubmitReview } from "./hooks";
import { StarPicker } from "./Stars";

const schema = z.object({
  name: z.string().trim().max(60, "Biệt danh tối đa 60 ký tự"),
  content: z.string().trim().min(3, "Viết vài dòng nhé").max(600, "Tối đa 600 ký tự"),
  rating: z.number().int().min(1, "Chọn số sao").max(5),
});

export function ReviewForm() {
  const [form, setForm] = useState({ name: "", content: "", rating: 5 });
  const [error, setError] = useState("");
  const submit = useSubmitReview();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ");
      return;
    }
    setError("");
    submit.mutate(parsed.data, {
      onSuccess: () => {
        setForm({ name: "", content: "", rating: 5 });
        toast.success("Cảm ơn bạn đã đánh giá! 💚");
      },
      onError: () => setError("Gửi chưa thành công, thử lại nhé."),
    });
  }

  return (
    <form onSubmit={onSubmit} className="card-soft space-y-4 p-6" noValidate>
      <p className="text-lg font-bold">Gửi đánh giá của bạn</p>
      <StarPicker value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
      <label className="block space-y-1">
        <span className="text-sm font-semibold">Biệt danh hoặc Tên viết tắt (Không bắt buộc)</span>
        <input
          className="field"
          placeholder="VD: M.A, Thành viên #10A5 — để trống để ẩn danh"
          maxLength={60}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <label className="block space-y-1">
        <span className="flex items-baseline justify-between text-sm font-semibold">
          Cảm nhận của bạn
          <span className="text-xs font-normal text-muted-foreground">
            {form.content.length}/600
          </span>
        </span>
        <textarea
          className="field min-h-28"
          placeholder="Điều bạn thích, điều cần cải thiện…"
          maxLength={600}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        Chúng tôi không thu thập thông tin cá nhân. Để trống tên, bạn sẽ hiển thị là “{ANON_NAME}”.
      </p>
      {error && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      <button className="btn-pill w-full" disabled={submit.isPending}>
        {submit.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Đang gửi…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Gửi đánh giá
          </>
        )}
      </button>
    </form>
  );
}

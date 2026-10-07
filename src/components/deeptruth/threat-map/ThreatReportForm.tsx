import { useMemo, useState, type FormEvent } from "react";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toThreatError, type ThreatRegion } from "./api";
import { useSubmitThreatReport } from "./hooks";
import {
  AREA_LABELS,
  CATEGORY_META,
  CHANNEL_META,
  DANGER_LEVELS,
  PERSONAL_INFO_MESSAGE,
  REGION_AREAS,
  THREAT_CATEGORIES,
  THREAT_CHANNELS,
  containsPersonalInfo,
  dangerColor,
  type ThreatCategory,
  type ThreatChannel,
} from "./model";
import { threatReportSchema, type ThreatReportInput } from "./schema";

type FieldErrors = Partial<Record<keyof ThreatReportInput, string>>;

type Draft = {
  category: ThreatCategory | "";
  channel: ThreatChannel | "";
  regionCode: string;
  title: string;
  description: string;
  danger: number;
};

const EMPTY: Draft = {
  category: "",
  channel: "",
  regionCode: "",
  title: "",
  description: "",
  danger: 0,
};

type Props = {
  regions: ThreatRegion[];
  onSubmitted: (id: string, input: ThreatReportInput) => void;
};

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm font-semibold text-destructive">{message}</p>;
}

export function ThreatReportForm({ regions, onSubmitted }: Props) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const submit = useSubmitThreatReport();

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const hasPersonalInfo = useMemo(
    () => containsPersonalInfo(`${draft.title} ${draft.description}`),
    [draft.title, draft.description],
  );

  const regionGroups = useMemo(
    () =>
      REGION_AREAS.map((area) => ({ area, items: regions.filter((r) => r.area === area) })).filter(
        (g) => g.items.length > 0,
      ),
    [regions],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const parsed = threatReportSchema.safeParse(draft);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ThreatReportInput | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    submit.mutate(parsed.data, {
      onSuccess: ({ id }) => {
        setDraft(EMPTY);
        onSubmitted(id, parsed.data);
      },
      onError: (error) => setFormError(toThreatError(error).message),
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <fieldset>
        <legend className="text-sm font-bold">1. Thủ đoạn Deepfake bạn gặp</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {THREAT_CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c];
            const Icon = meta.icon;
            return (
              <label key={c} className="group cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={c}
                  checked={draft.category === c}
                  onChange={() => set("category", c)}
                  className="peer sr-only"
                />
                <span className="flex h-full gap-3 rounded-xl border p-3 transition-all duration-200 group-hover:border-primary/40 peer-checked:border-primary peer-checked:bg-secondary peer-checked:shadow-[var(--shadow-soft)] peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                    style={{
                      color: meta.color,
                      backgroundColor: `color-mix(in oklab, ${meta.color} 15%, transparent)`,
                    }}
                  >
                    <Icon className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{meta.label}</span>
                    <span className="block text-xs leading-snug text-muted-foreground">
                      {meta.description}
                    </span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <FieldError message={errors.category} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="text-sm font-bold">2. Kênh xuất hiện</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {THREAT_CHANNELS.map((ch) => (
              <label key={ch} className="cursor-pointer">
                <input
                  type="radio"
                  name="channel"
                  value={ch}
                  checked={draft.channel === ch}
                  onChange={() => set("channel", ch)}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors hover:border-primary/40 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                  {CHANNEL_META[ch].label}
                </span>
              </label>
            ))}
          </div>
          <FieldError message={errors.channel} />
        </fieldset>

        <div>
          <label htmlFor="threat-region" className="text-sm font-bold">
            3. Khu vực gần nhất
          </label>
          <select
            id="threat-region"
            className="field mt-3"
            value={draft.regionCode}
            onChange={(e) => set("regionCode", e.target.value)}
            disabled={regions.length === 0}
            aria-invalid={!!errors.regionCode}
          >
            <option value="">{regions.length ? "Chọn thành phố / khu vực" : "Đang tải…"}</option>
            {regionGroups.map((g) => (
              <optgroup key={g.area} label={AREA_LABELS[g.area]}>
                {g.items.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Chỉ cần thành phố gần nhất — chúng tôi không thu thập vị trí chính xác.
          </p>
          <FieldError message={errors.regionCode} />
        </div>
      </div>

      <div>
        <label
          htmlFor="threat-title"
          className="flex items-baseline justify-between text-sm font-bold"
        >
          4. Tiêu đề ngắn
          <span className="text-xs font-normal text-muted-foreground">
            {draft.title.length}/120
          </span>
        </label>
        <input
          id="threat-title"
          className="field mt-2"
          maxLength={120}
          placeholder="VD: Giả giọng con gọi xin tiền đóng học phí"
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
          aria-invalid={!!errors.title}
        />
        <FieldError message={errors.title} />
      </div>

      <div>
        <label
          htmlFor="threat-description"
          className="flex items-baseline justify-between text-sm font-bold"
        >
          5. Diễn biến sự việc
          <span className="text-xs font-normal text-muted-foreground">
            {draft.description.length}/1500
          </span>
        </label>
        <textarea
          id="threat-description"
          className="field mt-2 min-h-32"
          maxLength={1500}
          placeholder="Kẻ gian liên hệ qua đâu, giả danh ai, dấu hiệu bạn nhận ra là giả…"
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          aria-invalid={!!errors.description}
          aria-describedby="threat-privacy"
        />
        <FieldError message={errors.description} />
        <p
          id="threat-privacy"
          className={cn(
            "mt-2 flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed transition-colors",
            hasPersonalInfo
              ? "border-destructive/50 bg-destructive/10 text-destructive"
              : "border-border bg-muted text-muted-foreground",
          )}
          role={hasPersonalInfo ? "alert" : undefined}
        >
          {hasPersonalInfo ? (
            <ShieldAlert className="mt-px h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <ShieldCheck className="mt-px h-4 w-4 shrink-0" aria-hidden />
          )}
          {hasPersonalInfo
            ? PERSONAL_INFO_MESSAGE
            : "Báo cáo được công khai ẩn danh trên bản đồ. Không ghi tên thật, số điện thoại, email hay số tài khoản của bất kỳ ai."}
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-bold">6. Theo bạn, mức độ nguy hiểm là</legend>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {DANGER_LEVELS.map((l) => (
            <label key={l.value} className="cursor-pointer">
              <input
                type="radio"
                name="danger"
                value={l.value}
                checked={draft.danger === l.value}
                onChange={() => set("danger", l.value)}
                className="peer sr-only"
              />
              <span
                className="flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 peer-checked:-translate-y-0.5 peer-checked:border-transparent peer-checked:text-black/85 peer-checked:shadow-[var(--shadow-soft)] peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                style={
                  draft.danger === l.value ? { backgroundColor: dangerColor(l.value) } : undefined
                }
              >
                <span className="font-display text-lg font-extrabold">{l.value}</span>
                <span className="text-[11px] font-semibold leading-tight">{l.label}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError message={errors.danger} />
      </fieldset>

      {formError && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm font-semibold text-destructive"
        >
          {formError}
        </p>
      )}

      <button
        type="submit"
        className="btn-pill w-full"
        disabled={submit.isPending || hasPersonalInfo}
      >
        {submit.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Đang gửi…
          </>
        ) : (
          "Gửi cảnh báo lên bản đồ"
        )}
      </button>
    </form>
  );
}

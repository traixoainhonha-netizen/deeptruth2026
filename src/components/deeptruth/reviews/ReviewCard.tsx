import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime, timeAgo } from "@/lib/time";
import { ANON_NAME, displayName, type Review } from "./api";
import { StarRating } from "./Stars";

const AVATAR_HUES = [160, 200, 280, 25, 75, 330];

function Avatar({ name }: { name: string }) {
  if (name === ANON_NAME) {
    return (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-primary">
        <UserRound className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  const initials = name
    .split(/[\s.–-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const hue =
    AVATAR_HUES[[...name].reduce((h, ch) => h + ch.charCodeAt(0), 0) % AVATAR_HUES.length];
  return (
    <span
      aria-hidden
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: `oklch(0.55 0.12 ${hue})` }}
    >
      {initials || "?"}
    </span>
  );
}

export function ReviewCard({
  review,
  now,
  className,
}: {
  review: Review;
  now: number;
  className?: string;
}) {
  const name = displayName(review.name);
  return (
    <article className={cn("card-soft card-hover flex h-full flex-col p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <StarRating value={review.rating} className="text-base" />
        <time
          dateTime={review.created_at}
          title={formatDateTime(review.created_at)}
          className="text-xs text-muted-foreground"
        >
          {timeAgo(review.created_at, now)}
        </time>
      </div>
      <p className="mt-3 flex-1 whitespace-pre-line break-words text-sm leading-relaxed">
        “{review.content}”
      </p>
      <p className="mt-4 flex items-center gap-2.5 text-sm font-bold text-primary">
        <Avatar name={name} />
        <span className="min-w-0 break-words">{name}</span>
      </p>
    </article>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="card-soft p-5" aria-hidden>
      <div className="skeleton-shimmer h-4 w-24 rounded-full" />
      <div className="skeleton-shimmer mt-4 h-3 w-full rounded-full" />
      <div className="skeleton-shimmer mt-2 h-3 w-5/6 rounded-full" />
      <div className="skeleton-shimmer mt-2 h-3 w-2/3 rounded-full" />
      <div className="mt-5 flex items-center gap-2">
        <div className="skeleton-shimmer h-9 w-9 rounded-full" />
        <div className="skeleton-shimmer h-3 w-28 rounded-full" />
      </div>
    </div>
  );
}

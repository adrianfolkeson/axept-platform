import { StarsDisplay } from "@/components/ui/stars";
import { formatDate } from "@/lib/utils/format";
import type { ReviewWithAuthor } from "../queries";

interface Props {
  reviews: ReviewWithAuthor[];
}

export function ReviewList({ reviews }: Props) {
  if (reviews.length === 0) {
    return <p className="text-sm text-mute">Inga omdömen ännu.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {reviews.map((r) => (
        <li key={r.id} className="flex gap-4 py-4">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-panel">
            {r.author.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.author.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-mute">
                {r.author.full_name[0]}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-medium">{r.author.full_name}</p>
              <span className="text-xs text-mute">{formatDate(r.created_at)}</span>
            </div>
            <div className="mt-0.5">
              <StarsDisplay value={r.rating} />
            </div>
            {r.body && (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">
                {r.body}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

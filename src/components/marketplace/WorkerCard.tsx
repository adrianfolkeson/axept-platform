import Link from "next/link";
import { formatSek } from "@/lib/utils/format";
import { RatingSummary } from "@/features/reviews/components/RatingSummary";
import type { RatingAggregate } from "@/features/reviews/queries";

export interface WorkerCardData {
  id: string;
  headline: string;
  skills: string[];
  experience_years: number;
  hourly_rate_sek: number | null;
  available: boolean;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    city: string | null;
    region: string | null;
  };
}

export function WorkerCard({ data, rating }: { data: WorkerCardData; rating?: RatingAggregate }) {
  return (
    <Link
      href={`/marketplace/workers/${data.id}`}
      className="group flex h-full flex-col rounded-xl border border-border bg-bg p-4 transition active:bg-panel sm:p-5 sm:hover:border-accent/40 sm:hover:shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-panel">
          {data.profile.avatar_url ? (
            // plain img to avoid Image config for arbitrary URLs in dev
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-mute">
              {data.profile.full_name[0]}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate font-semibold">{data.profile.full_name}</h3>
            {data.available ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                Tillgänglig
              </span>
            ) : (
              <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-mute">
                Upptagen
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-mute">{data.headline}</p>
          {rating && (
            <div className="mt-1">
              <RatingSummary aggregate={rating} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {data.skills.slice(0, 4).map((s) => (
          <span
            key={s}
            className="rounded-full border border-border bg-panel px-2 py-0.5 text-[11px] text-mute"
          >
            {s}
          </span>
        ))}
        {data.skills.length > 4 && (
          <span className="text-[11px] text-mute">+{data.skills.length - 4}</span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
        <span className="text-mute">
          {data.profile.city ?? "—"}
          {data.profile.region ? ` · ${data.profile.region}` : ""}
        </span>
        <span className="font-medium">
          {data.hourly_rate_sek != null ? `${formatSek(data.hourly_rate_sek)}/h` : "Pris vid förfrågan"}
        </span>
      </div>
    </Link>
  );
}

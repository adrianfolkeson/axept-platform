import Link from "next/link";
import { categoryLabel, formatSek } from "@/lib/utils/format";
import { RatingSummary } from "@/features/reviews/components/RatingSummary";
import type { RatingAggregate } from "@/features/reviews/queries";

export interface EquipmentCardData {
  id: string;
  title: string;
  category: string;
  city: string | null;
  region: string | null;
  daily_rate_sek: number;
  weekly_rate_sek: number | null;
  primary_image_url: string | null;
}

export function EquipmentCard({
  data,
  rating
}: {
  data: EquipmentCardData;
  rating?: RatingAggregate;
}) {
  return (
    <Link
      href={`/marketplace/equipment/${data.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-bg transition active:bg-panel sm:hover:border-accent/40 sm:hover:shadow-sm"
    >
      <div className="relative aspect-[4/3] bg-panel">
        {data.primary_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.primary_image_url}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-mute">
            Ingen bild
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
          {categoryLabel(data.category)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="truncate font-semibold">{data.title}</h3>
        <p className="text-sm text-mute">
          {data.city ?? "—"}
          {data.region ? ` · ${data.region}` : ""}
        </p>
        {rating && <RatingSummary aggregate={rating} />}
        <p className="pt-1 text-sm font-medium">
          {formatSek(data.daily_rate_sek)}<span className="text-mute"> / dag</span>
        </p>
      </div>
    </Link>
  );
}

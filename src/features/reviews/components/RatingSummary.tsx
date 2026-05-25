import { StarsDisplay } from "@/components/ui/stars";
import type { RatingAggregate } from "../queries";

interface Props {
  aggregate: RatingAggregate;
  size?: "sm" | "md";
}

export function RatingSummary({ aggregate, size = "sm" }: Props) {
  if (aggregate.count === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-mute">
        Inga omdömen
      </span>
    );
  }
  const px = size === "md" ? 16 : 13;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-mute">
      <StarsDisplay value={aggregate.avg} size={px} />
      <span className="tabular-nums">
        {aggregate.avg.toFixed(1)} ({aggregate.count})
      </span>
    </span>
  );
}

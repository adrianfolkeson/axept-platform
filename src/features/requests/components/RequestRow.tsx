import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { targetLabel, type RequestSummary } from "../queries";

interface Props {
  request: RequestSummary;
  perspective: "incoming" | "outgoing";
}

export function RequestRow({ request, perspective }: Props) {
  const counterpart =
    perspective === "incoming"
      ? request.requester.full_name
      : targetLabel(request);

  return (
    <Link
      href={`/requests/${request.id}`}
      className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 transition last:border-0 active:bg-panel sm:hover:bg-panel/60"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate font-medium">{counterpart}</p>
          <RequestStatusBadge status={request.status} />
        </div>
        <p className="mt-1 truncate text-xs text-mute">
          {request.worker_profile_id ? "Arbetare" : "Maskin"} ·{" "}
          {formatDate(request.start_date)} → {formatDate(request.end_date)}
        </p>
      </div>
      <span className="shrink-0 text-xs text-mute">{formatDate(request.created_at)}</span>
    </Link>
  );
}

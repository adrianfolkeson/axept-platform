import { STATUS_BADGE, STATUS_LABEL, type RequestStatus } from "../state-machine";

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

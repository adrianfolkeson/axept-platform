import {
  TRANSITIONS,
  TRANSITION_LABEL,
  type Party,
  type RequestStatus
} from "../state-machine";
import {
  acceptRequestAction,
  cancelRequestAction,
  completeRequestAction,
  declineRequestAction
} from "../actions";

interface Props {
  requestId: string;
  status: RequestStatus;
  party: Party;
}

const ACTION_FOR: Record<string, (formData: FormData) => Promise<void>> = {
  accepted: acceptRequestAction,
  declined: declineRequestAction,
  cancelled: cancelRequestAction,
  completed: completeRequestAction
};

const VARIANT_FOR: Record<string, string> = {
  accepted: "bg-emerald-600 text-white hover:bg-emerald-700",
  declined: "bg-rose-600 text-white hover:bg-rose-700",
  cancelled: "border border-border bg-bg hover:bg-panel",
  completed: "bg-brand text-brand-fg hover:opacity-90"
};

export function RequestActionBar({ requestId, status, party }: Props) {
  const targets = Object.entries(TRANSITIONS[status])
    .filter(([, parties]) => parties && parties.includes(party))
    .map(([to]) => to as RequestStatus);

  if (targets.length === 0) {
    return (
      <p className="text-sm text-mute">Inga åtgärder tillgängliga för denna förfrågan.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {targets.map((to) => {
        const action = ACTION_FOR[to];
        if (!action) return null;
        return (
          <form key={to} action={action} className="w-full sm:w-auto">
            <input type="hidden" name="id" value={requestId} />
            <button
              type="submit"
              className={`inline-flex h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-medium sm:w-auto ${VARIANT_FOR[to] ?? "bg-ink text-white"}`}
            >
              {TRANSITION_LABEL[to]}
            </button>
          </form>
        );
      })}
    </div>
  );
}

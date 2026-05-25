export type RequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled"
  | "completed";

export type Party = "requester" | "target";

/**
 * Allowed transitions. Source-of-truth for both UI (which buttons render)
 * and server actions (which transitions are permitted). Keep additive only.
 */
export const TRANSITIONS: Record<RequestStatus, Partial<Record<RequestStatus, Party[]>>> = {
  pending: {
    accepted: ["target"],
    declined: ["target"],
    cancelled: ["requester"]
  },
  accepted: {
    completed: ["requester", "target"],
    cancelled: ["requester"]
  },
  declined: {},
  cancelled: {},
  completed: {}
};

export const TERMINAL: RequestStatus[] = ["declined", "cancelled", "completed"];

export function canTransition(
  from: RequestStatus,
  to: RequestStatus,
  party: Party
): boolean {
  const allowed = TRANSITIONS[from]?.[to];
  return !!allowed && allowed.includes(party);
}

export function isTerminal(status: RequestStatus): boolean {
  return TERMINAL.includes(status);
}

export const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Väntar svar",
  accepted: "Accepterad",
  declined: "Avböjd",
  cancelled: "Avbruten",
  completed: "Slutförd"
};

export const STATUS_BADGE: Record<RequestStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  declined: "bg-rose-50 text-rose-700",
  cancelled: "bg-panel text-mute",
  completed: "bg-blue-50 text-blue-700"
};

export const TRANSITION_LABEL: Record<RequestStatus, string> = {
  accepted: "Acceptera",
  declined: "Avböj",
  cancelled: "Avbryt",
  completed: "Markera som slutförd",
  pending: "Väntar"
};

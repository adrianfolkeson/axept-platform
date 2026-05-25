import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import {
  getRequestById,
  targetHref,
  targetLabel,
  targetUserId
} from "@/features/requests/queries";
import { RequestActionBar } from "@/features/requests/components/RequestActionBar";
import { RequestStatusBadge } from "@/features/requests/components/RequestStatusBadge";
import { getReviewByRequest } from "@/features/reviews/queries";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { StarsDisplay } from "@/components/ui/stars";
import { Section } from "@/components/ui/section";
import { formatDate } from "@/lib/utils/format";
import type { Party } from "@/features/requests/state-machine";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;
  const req = await getRequestById(id);
  if (!req) notFound();

  const tUserId = targetUserId(req);
  let party: Party | null = null;
  if (session.id === req.requester_id) party = "requester";
  else if (tUserId && session.id === tUserId) party = "target";
  if (!party) notFound(); // RLS should have already prevented this, but be defensive.

  const counterpart =
    party === "requester" ? targetLabel(req) : req.requester.full_name;
  const ref = targetHref(req);

  // Reviews only for requester on completed requests
  const existingReview =
    party === "requester" && req.status === "completed"
      ? await getReviewByRequest(req.id, session.id)
      : null;
  const subjectType: "worker" | "equipment" | null = req.worker_profile_id
    ? "worker"
    : req.equipment_id
    ? "equipment"
    : null;
  const subjectId = req.worker_profile_id ?? req.equipment_id ?? null;

  return (
    <div className="space-y-6">
      <Link
        href={party === "requester" ? "/requests?tab=outgoing" : "/requests?tab=incoming"}
        className="text-sm text-mute hover:text-ink"
      >
        ← Tillbaka till förfrågningar
      </Link>

      <header className="space-y-2 rounded-xl border border-border bg-bg p-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{counterpart}</h1>
          <RequestStatusBadge status={req.status} />
        </div>
        <p className="text-sm text-mute">
          {req.worker_profile_id ? "Arbetare" : "Maskin"} ·{" "}
          {formatDate(req.start_date)} → {formatDate(req.end_date)}
        </p>
        {ref && party === "requester" && (
          <Link href={ref} className="text-sm text-accent hover:underline">
            Visa annons →
          </Link>
        )}
      </header>

      {req.message && (
        <Section title="Meddelande">
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{req.message}</p>
        </Section>
      )}

      <Section title="Åtgärder">
        <RequestActionBar requestId={req.id} status={req.status} party={party} />
        {req.status === "accepted" && (
          <p className="mt-4 text-xs text-mute">
            Konversation skapad — gå till{" "}
            <Link href="/messages" className="text-accent hover:underline">
              meddelanden
            </Link>{" "}
            för att fortsätta dialogen.
          </p>
        )}
      </Section>

      {party === "requester" && req.status === "completed" && subjectType && subjectId && (
        <Section
          title={existingReview ? "Ditt omdöme" : "Lämna omdöme"}
          description={
            existingReview
              ? undefined
              : "Hjälp andra på Axept genom att dela din erfarenhet."
          }
        >
          {existingReview ? (
            <div className="space-y-3">
              <StarsDisplay value={existingReview.rating} size={20} />
              {existingReview.body && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                  {existingReview.body}
                </p>
              )}
              <p className="text-xs text-mute">
                Skapat {formatDate(existingReview.created_at)}
              </p>
            </div>
          ) : (
            <ReviewForm
              requestId={req.id}
              subjectType={subjectType}
              subjectId={subjectId}
              counterpartName={counterpart}
            />
          )}
        </Section>
      )}
    </div>
  );
}

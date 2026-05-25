import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getEquipmentById } from "@/features/equipment/queries";
import { RequestCTA } from "@/features/requests/components/RequestCTA";
import {
  getRatingForEquipment,
  listReviewsForEquipment
} from "@/features/reviews/queries";
import { ReviewList } from "@/features/reviews/components/ReviewList";
import { RatingSummary } from "@/features/reviews/components/RatingSummary";
import { Section } from "@/components/ui/section";
import { categoryLabel, formatSek } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function EquipmentDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;
  const eq = await getEquipmentById(id);
  if (!eq || eq.status !== "active") notFound();
  const [rating, reviews] = await Promise.all([
    getRatingForEquipment(eq.id),
    listReviewsForEquipment(eq.id)
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-panel">
            {eq.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={eq.images[0].url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-mute">
                Ingen bild
              </div>
            )}
          </div>
          {eq.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {eq.images.slice(1, 5).map((img) => (
                <div
                  key={img.id}
                  className="aspect-square overflow-hidden rounded-md border border-border bg-panel"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <span className="rounded-full border border-border bg-panel px-2 py-0.5 text-[11px] font-medium text-mute">
              {categoryLabel(eq.category)}
            </span>
            <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{eq.title}</h1>
            <p className="text-sm text-mute">
              {eq.city ?? "—"}
              {eq.region ? ` · ${eq.region}` : ""}
            </p>
            <div className="mt-1.5">
              <RatingSummary aggregate={rating} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg p-5">
            <dl className="space-y-2 text-sm">
              <Row label="Dygnspris" value={formatSek(eq.daily_rate_sek)} />
              <Row label="Veckopris" value={formatSek(eq.weekly_rate_sek)} />
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-bg p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-panel">
                {eq.owner.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={eq.owner.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-mute">
                    {eq.owner.full_name[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{eq.owner.full_name}</p>
                <p className="text-xs text-mute">
                  {eq.owner.city ?? "—"}
                  {eq.owner.region ? ` · ${eq.owner.region}` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Section title="Beskrivning">
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
          {eq.description ?? "Ingen beskrivning."}
        </p>
      </Section>

      <Section title="Skicka förfrågan" description="Välj datum så får ägaren ett meddelande.">
        <RequestCTA
          session={session}
          targetType="equipment"
          targetId={eq.id}
          targetUserId={eq.owner.id}
        />
      </Section>

      <Section title="Omdömen">
        <ReviewList reviews={reviews} />
      </Section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-mute">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

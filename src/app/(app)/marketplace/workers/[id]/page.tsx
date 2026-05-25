import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getWorkerById } from "@/features/workers/marketplace";
import { RequestCTA } from "@/features/requests/components/RequestCTA";
import {
  getRatingForWorker,
  listReviewsForWorker
} from "@/features/reviews/queries";
import { ReviewList } from "@/features/reviews/components/ReviewList";
import { RatingSummary } from "@/features/reviews/components/RatingSummary";
import { Section } from "@/components/ui/section";
import { formatDate, formatSek } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function WorkerDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;
  const worker = await getWorkerById(id);
  if (!worker) notFound();
  const [rating, reviews] = await Promise.all([
    getRatingForWorker(worker.id),
    listReviewsForWorker(worker.id)
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-start gap-5 rounded-xl border border-border bg-bg p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-6">
        <div className="flex gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-panel sm:h-16 sm:w-16">
            {worker.profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={worker.profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg text-mute">
                {worker.profile.full_name[0]}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {worker.profile.full_name}
            </h1>
            <p className="text-sm text-mute">{worker.headline}</p>
            <p className="mt-1 text-xs text-mute">
              {worker.profile.city ?? "—"}
              {worker.profile.region ? ` · ${worker.profile.region}` : ""}
              {worker.profile.verified && (
                <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                  Verifierad
                </span>
              )}
            </p>
            <div className="mt-1.5">
              <RatingSummary aggregate={rating} />
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end sm:gap-1">
          <p className="text-lg font-semibold sm:text-xl">
            {worker.hourly_rate_sek != null
              ? `${formatSek(worker.hourly_rate_sek)}/h`
              : "Pris vid förfrågan"}
          </p>
          {worker.available ? (
            <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              Tillgänglig
            </span>
          ) : (
            <span className="inline-block rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-mute">
              Upptagen
            </span>
          )}
        </div>
      </header>

      <Section title="Om">
        <p className="text-sm leading-relaxed text-ink">
          {worker.profile.bio ?? "Ingen beskrivning ännu."}
        </p>
      </Section>

      <Section title="Kompetenser">
        {worker.skills.length === 0 ? (
          <p className="text-sm text-mute">Inga kompetenser angivna.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {worker.skills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-panel px-3 py-1 text-xs"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </Section>

      <Section title="Erfarenhet">
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <Stat label="År i yrket" value={`${worker.experience_years}`} />
          <Stat
            label="Reseradius"
            value={worker.travel_radius_km != null ? `${worker.travel_radius_km} km` : "—"}
          />
          <Stat label="Tillgänglig från" value={formatDate(worker.available_from)} />
        </dl>
      </Section>

      <Section
        title="Skicka förfrågan"
        description="Föreslå datum så återkommer arbetaren med besked."
      >
        <RequestCTA
          session={session}
          targetType="worker"
          targetId={worker.id}
          targetUserId={worker.profile.id}
        />
      </Section>

      <Section title="Omdömen">
        <ReviewList reviews={reviews} />
      </Section>

      <Section title="Certifikat">
        {worker.certifications.length === 0 ? (
          <p className="text-sm text-mute">Inga verifierade certifikat.</p>
        ) : (
          <ul className="divide-y divide-border">
            {worker.certifications.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-mute">
                    {c.issuer ?? "—"} · utgår {formatDate(c.expires_at)}
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                  Verifierad
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-mute">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

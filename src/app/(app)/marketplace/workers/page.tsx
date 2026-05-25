import { requireUser } from "@/lib/auth/session";
import { listMarketplaceWorkers } from "@/features/workers/marketplace";
import { getRatingsForWorkers } from "@/features/reviews/queries";
import { WorkerCard } from "@/components/marketplace/WorkerCard";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { FilterBar } from "@/components/marketplace/FilterBar";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    region?: string;
    city?: string;
    skill?: string;
    available?: string;
  }>;
}

export default async function WorkersPage({ searchParams }: PageProps) {
  await requireUser();
  const params = await searchParams;
  const workers = await listMarketplaceWorkers({
    region: params.region,
    city: params.city,
    skill: params.skill,
    available: params.available === "true" ? true : undefined,
    limit: 48
  });
  const ratings = await getRatingsForWorkers(workers.map((w) => w.id));

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Arbetare</h1>
        <p className="text-sm text-mute">{workers.length} resultat</p>
      </header>

      <FilterBar
        fields={[
          { name: "region", label: "Region", type: "text", placeholder: "Stockholms län…" },
          { name: "city", label: "Stad", type: "text", placeholder: "Stockholm…" },
          { name: "skill", label: "Kompetens", type: "text", placeholder: "snickeri…" },
          {
            name: "available",
            label: "Tillgänglighet",
            type: "select",
            options: [{ value: "true", label: "Endast tillgängliga" }]
          }
        ]}
      />

      {workers.length === 0 ? (
        <EmptyState title="Inga arbetare matchar" description="Justera filtren och försök igen." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((w) => (
            <WorkerCard key={w.id} data={w} rating={ratings.get(w.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

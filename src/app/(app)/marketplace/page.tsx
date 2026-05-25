import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listMarketplaceWorkers } from "@/features/workers/marketplace";
import { listMarketplaceEquipment } from "@/features/equipment/queries";
import {
  getRatingsForEquipment,
  getRatingsForWorkers
} from "@/features/reviews/queries";
import { WorkerCard } from "@/components/marketplace/WorkerCard";
import { EquipmentCard } from "@/components/marketplace/EquipmentCard";
import { EmptyState } from "@/components/marketplace/EmptyState";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  await requireUser();
  const [workers, equipment] = await Promise.all([
    listMarketplaceWorkers({ limit: 6 }),
    listMarketplaceEquipment({ limit: 6 })
  ]);
  const [workerRatings, equipmentRatings] = await Promise.all([
    getRatingsForWorkers(workers.map((w) => w.id)),
    getRatingsForEquipment(equipment.map((e) => e.id))
  ]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Marknadsplatsen</h1>
        <p className="text-sm text-mute">Hitta arbetare och maskiner i din region.</p>
      </header>

      <Block
        title="Arbetare"
        href="/marketplace/workers"
        empty={workers.length === 0}
        emptyTitle="Inga arbetare ännu"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((w) => (
            <WorkerCard key={w.id} data={w} rating={workerRatings.get(w.id)} />
          ))}
        </div>
      </Block>

      <Block
        title="Maskiner"
        href="/marketplace/equipment"
        empty={equipment.length === 0}
        emptyTitle="Inga maskiner ännu"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipment.map((e) => (
            <EquipmentCard key={e.id} data={e} rating={equipmentRatings.get(e.id)} />
          ))}
        </div>
      </Block>
    </div>
  );
}

function Block({
  title,
  href,
  empty,
  emptyTitle,
  children
}: {
  title: string;
  href: string;
  empty: boolean;
  emptyTitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
        <Link
          href={href}
          className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-accent hover:bg-panel"
        >
          Visa alla →
        </Link>
      </div>
      {empty ? <EmptyState title={emptyTitle} /> : children}
    </section>
  );
}

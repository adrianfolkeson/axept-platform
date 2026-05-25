import { requireUser } from "@/lib/auth/session";
import { listMarketplaceEquipment } from "@/features/equipment/queries";
import { EQUIPMENT_CATEGORIES } from "@/features/equipment/schemas";
import { getRatingsForEquipment } from "@/features/reviews/queries";
import { EquipmentCard } from "@/components/marketplace/EquipmentCard";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { categoryLabel } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    region?: string;
    city?: string;
    category?: string;
  }>;
}

export default async function EquipmentListPage({ searchParams }: PageProps) {
  await requireUser();
  const params = await searchParams;
  const items = await listMarketplaceEquipment({
    region: params.region,
    city: params.city,
    category: params.category,
    limit: 48
  });
  const ratings = await getRatingsForEquipment(items.map((e) => e.id));

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Maskiner</h1>
        <p className="text-sm text-mute">{items.length} resultat</p>
      </header>

      <FilterBar
        fields={[
          { name: "region", label: "Region", type: "text", placeholder: "Stockholms län…" },
          { name: "city", label: "Stad", type: "text", placeholder: "Stockholm…" },
          {
            name: "category",
            label: "Kategori",
            type: "select",
            options: EQUIPMENT_CATEGORIES.map((c) => ({ value: c, label: categoryLabel(c) }))
          }
        ]}
      />

      {items.length === 0 ? (
        <EmptyState title="Inga maskiner matchar" description="Justera filtren och försök igen." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <EquipmentCard key={e.id} data={e} rating={ratings.get(e.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

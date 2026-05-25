import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import {
  getEquipmentById,
  type EquipmentDetail
} from "@/features/equipment/queries";
import { updateEquipmentAction } from "@/features/equipment/actions";
import { EquipmentForm } from "@/features/equipment/components/EquipmentForm";
import { EquipmentImageManager } from "@/features/equipment/components/EquipmentImageManager";
import { Section } from "@/components/ui/section";

export const dynamic = "force-dynamic";

export default async function EditEquipmentPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("equipment_owner");
  const { id } = await params;
  const eq: EquipmentDetail | null = await getEquipmentById(id);
  if (!eq || eq.owner_id !== session.id) notFound();

  const action = updateEquipmentAction.bind(null, eq.id);

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{eq.title}</h1>
        <p className="text-sm text-mute">Redigera annons</p>
      </header>

      <Section title="Bilder" description="Den första bilden visas som omslag.">
        <EquipmentImageManager equipmentId={eq.id} images={eq.images} />
      </Section>

      <Section title="Detaljer">
        <EquipmentForm equipment={eq} action={action} submitLabel="Spara ändringar" />
      </Section>
    </div>
  );
}

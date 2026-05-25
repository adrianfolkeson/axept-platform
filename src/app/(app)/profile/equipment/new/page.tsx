import { requireRole } from "@/lib/auth/session";
import { EquipmentForm } from "@/features/equipment/components/EquipmentForm";
import { createEquipmentAction } from "@/features/equipment/actions";
import { Section } from "@/components/ui/section";

export const dynamic = "force-dynamic";

export default async function NewEquipmentPage() {
  await requireRole("equipment_owner");
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ny annons</h1>
        <p className="text-sm text-mute">
          Du kan ladda upp bilder efter att grundinformationen sparats.
        </p>
      </header>

      <Section title="Grundinformation">
        <EquipmentForm action={createEquipmentAction} submitLabel="Skapa annons" />
      </Section>
    </div>
  );
}

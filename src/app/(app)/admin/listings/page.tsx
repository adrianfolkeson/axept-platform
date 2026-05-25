import Link from "next/link";
import { listAdminEquipment } from "@/features/admin/queries";
import { setEquipmentStatusAction } from "@/features/admin/actions";
import { AdminTable } from "@/features/admin/components/AdminTable";
import { categoryLabel, formatDate, formatSek } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  active: "Aktiv",
  paused: "Pausad",
  archived: "Arkiverad"
};

export default async function AdminListingsPage() {
  const rows = await listAdminEquipment();

  return (
    <AdminTable
      rows={rows}
      rowKey={(r) => r.id}
      empty="Inga annonser."
      columns={[
        {
          key: "title",
          header: "Annons",
          cell: (r) => (
            <div>
              <Link
                href={`/marketplace/equipment/${r.id}`}
                className="font-medium hover:underline"
              >
                {r.title}
              </Link>
              <p className="text-xs text-mute">
                {categoryLabel(r.category)} · {formatSek(r.daily_rate_sek)}/dag
              </p>
            </div>
          )
        },
        { key: "owner", header: "Ägare", cell: (r) => r.owner_name },
        {
          key: "location",
          header: "Plats",
          cell: (r) =>
            `${r.city ?? "—"}${r.region ? ` · ${r.region}` : ""}`
        },
        { key: "created", header: "Skapat", cell: (r) => formatDate(r.created_at) },
        {
          key: "status",
          header: "Status",
          align: "right",
          cell: (r) => (
            <form action={setEquipmentStatusAction} className="inline-flex items-center gap-2">
              <input type="hidden" name="id" value={r.id} />
              <select
                name="status"
                defaultValue={r.status}
                className="h-8 rounded-md border border-border bg-bg px-2 text-xs"
              >
                {Object.entries(STATUS_LABEL).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="h-8 rounded-md bg-ink px-3 text-xs font-medium text-white hover:opacity-90"
              >
                Spara
              </button>
            </form>
          )
        }
      ]}
    />
  );
}

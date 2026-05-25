import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { listOwnerEquipment } from "@/features/equipment/queries";
import { deleteEquipmentAction } from "@/features/equipment/actions";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { categoryLabel, formatSek } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  paused: "bg-amber-50 text-amber-700",
  archived: "bg-panel text-mute"
};

const STATUS_LABEL: Record<string, string> = {
  active: "Aktiv",
  paused: "Pausad",
  archived: "Arkiverad"
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        STATUS_BADGE[status] ?? "bg-panel text-mute"
      }`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export default async function OwnerEquipmentPage() {
  const session = await requireRole("equipment_owner");
  const items = await listOwnerEquipment(session.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Mina maskiner
          </h1>
          <p className="text-sm text-mute">{items.length} annonser totalt</p>
        </div>
        <Link
          href="/profile/equipment/new"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-fg hover:opacity-90 sm:w-auto"
        >
          + Ny annons
        </Link>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="Inga annonser ännu"
          description="Skapa din första annons och börja synas i marknadsplatsen."
          actionLabel="Skapa annons"
          actionHref="/profile/equipment/new"
        />
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <ul className="space-y-3 md:hidden">
            {items.map((e) => (
              <li
                key={e.id}
                className="rounded-xl border border-border bg-bg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/profile/equipment/${e.id}/edit`}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate font-medium">{e.title}</p>
                    <p className="mt-0.5 text-xs text-mute">
                      {categoryLabel(e.category)} · {formatSek(e.daily_rate_sek)}/dag
                    </p>
                  </Link>
                  <StatusBadge status={e.status} />
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/profile/equipment/${e.id}/edit`}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border bg-bg text-sm font-medium hover:bg-panel"
                  >
                    Redigera
                  </Link>
                  <form action={deleteEquipmentAction} className="flex-1">
                    <input type="hidden" name="id" value={e.id} />
                    <button
                      type="submit"
                      className="inline-flex h-11 w-full items-center justify-center rounded-md border border-rose-200 text-sm font-medium text-rose-600 hover:bg-rose-50"
                      aria-label={`Ta bort ${e.title}`}
                    >
                      Ta bort
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>

          {/* Tablet+: table */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-bg md:block">
            <table className="w-full text-sm">
              <thead className="bg-panel text-xs uppercase tracking-wide text-mute">
                <tr>
                  <th className="px-4 py-3 text-left">Titel</th>
                  <th className="px-4 py-3 text-left">Kategori</th>
                  <th className="px-4 py-3 text-left">Pris/dag</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/profile/equipment/${e.id}/edit`}
                        className="hover:underline"
                      >
                        {e.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-mute">{categoryLabel(e.category)}</td>
                    <td className="px-4 py-3">{formatSek(e.daily_rate_sek)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/profile/equipment/${e.id}/edit`}
                          className="inline-flex h-9 items-center rounded-md px-3 text-accent hover:bg-panel"
                        >
                          Redigera
                        </Link>
                        <form action={deleteEquipmentAction}>
                          <input type="hidden" name="id" value={e.id} />
                          <button
                            type="submit"
                            className="inline-flex h-9 items-center rounded-md px-3 text-red-600 hover:bg-rose-50"
                            aria-label={`Ta bort ${e.title}`}
                          >
                            Ta bort
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

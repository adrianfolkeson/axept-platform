import { listAdminUsers } from "@/features/admin/queries";
import {
  setProfileBannedAction,
  setProfileVerifiedAction
} from "@/features/admin/actions";
import { AdminTable } from "@/features/admin/components/AdminTable";
import { ToggleButton } from "@/features/admin/components/ToggleButton";
import { formatDate, roleLabel } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const rows = await listAdminUsers();

  return (
    <AdminTable
      rows={rows}
      rowKey={(r) => r.id}
      empty="Inga användare."
      columns={[
        {
          key: "name",
          header: "Namn",
          cell: (r) => (
            <div>
              <p className="font-medium">{r.full_name}</p>
              <p className="text-xs text-mute">
                {r.city ?? "—"}
                {r.region ? ` · ${r.region}` : ""}
              </p>
            </div>
          )
        },
        { key: "role", header: "Roll", cell: (r) => roleLabel(r.role) },
        { key: "created", header: "Skapat", cell: (r) => formatDate(r.created_at) },
        {
          key: "verified",
          header: "Verifierad",
          cell: (r) => (
            <ToggleButton
              id={r.id}
              current={r.verified}
              action={setProfileVerifiedAction}
              onLabel="Verifierad"
              offLabel="Verifiera"
            />
          )
        },
        {
          key: "banned",
          header: "Status",
          align: "right",
          cell: (r) => (
            <ToggleButton
              id={r.id}
              current={r.banned}
              action={setProfileBannedAction}
              onLabel="Bannad"
              offLabel="Banna"
            />
          )
        }
      ]}
    />
  );
}

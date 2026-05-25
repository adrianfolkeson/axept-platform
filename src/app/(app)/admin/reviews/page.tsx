import { listAdminReviews } from "@/features/admin/queries";
import { adminDeleteReviewAction } from "@/features/admin/actions";
import { AdminTable } from "@/features/admin/components/AdminTable";
import { StarsDisplay } from "@/components/ui/stars";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const rows = await listAdminReviews();

  return (
    <AdminTable
      rows={rows}
      rowKey={(r) => r.id}
      empty="Inga omdömen."
      columns={[
        {
          key: "subject",
          header: "Mottagare",
          cell: (r) => (
            <div>
              <p className="font-medium">{r.subject_label}</p>
              <p className="text-xs text-mute">
                {r.subject_type === "worker" ? "Arbetare" : "Maskin"}
              </p>
            </div>
          )
        },
        { key: "author", header: "Skribent", cell: (r) => r.author_name },
        {
          key: "rating",
          header: "Betyg",
          cell: (r) => <StarsDisplay value={r.rating} />
        },
        {
          key: "body",
          header: "Text",
          cell: (r) => (
            <span className="line-clamp-2 max-w-xs text-sm text-ink">
              {r.body ?? "—"}
            </span>
          )
        },
        { key: "created", header: "Skapat", cell: (r) => formatDate(r.created_at) },
        {
          key: "actions",
          header: "",
          align: "right",
          cell: (r) => (
            <form action={adminDeleteReviewAction}>
              <input type="hidden" name="id" value={r.id} />
              <button
                type="submit"
                className="rounded-md border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                Radera
              </button>
            </form>
          )
        }
      ]}
    />
  );
}

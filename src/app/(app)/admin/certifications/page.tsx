import Link from "next/link";
import { listAdminCertifications } from "@/features/admin/queries";
import { setCertificationVerifiedAction } from "@/features/admin/actions";
import { AdminTable } from "@/features/admin/components/AdminTable";
import { ToggleButton } from "@/features/admin/components/ToggleButton";
import { CertFileLink } from "@/features/admin/components/CertFileLink";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ filter?: "pending" | "all" }>;
}

export default async function AdminCertificationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = params.filter === "all" ? "all" : "pending";
  const rows = await listAdminCertifications(filter === "pending");

  return (
    <div className="space-y-4">
      <nav className="flex gap-1 text-sm">
        <TabLink href="/admin/certifications" active={filter === "pending"}>
          Att granska
        </TabLink>
        <TabLink href="/admin/certifications?filter=all" active={filter === "all"}>
          Alla
        </TabLink>
      </nav>

      <AdminTable
        rows={rows}
        rowKey={(r) => r.id}
        empty="Inga certifikat att granska."
        columns={[
          {
            key: "cert",
            header: "Certifikat",
            cell: (r) => (
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-mute">
                  {r.issuer ?? "—"} · utgår {formatDate(r.expires_at)}
                </p>
              </div>
            )
          },
          { key: "owner", header: "Arbetare", cell: (r) => r.worker_name },
          { key: "uploaded", header: "Uppladdat", cell: (r) => formatDate(r.created_at) },
          {
            key: "file",
            header: "Fil",
            cell: (r) => (r.file_url ? <CertFileLink path={r.file_url} /> : "—")
          },
          {
            key: "verify",
            header: "Status",
            align: "right",
            cell: (r) => (
              <ToggleButton
                id={r.id}
                current={r.verified}
                action={setCertificationVerifiedAction}
                onLabel="Verifierat"
                offLabel="Verifiera"
              />
            )
          }
        ]}
      />
    </div>
  );
}

function TabLink({
  href,
  active,
  children
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`-mb-px border-b-2 px-3 py-1.5 ${
        active ? "border-ink text-ink" : "border-transparent text-mute hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

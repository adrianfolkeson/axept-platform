import Link from "next/link";
import { getAdminCounts } from "@/features/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const counts = await getAdminCounts();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card label="Användare" value={counts.users} href="/admin/users" />
      <Card label="Bannade" value={counts.banned_users} href="/admin/users" tone="warning" />
      <Card
        label="Certifikat att granska"
        value={counts.pending_certifications}
        href="/admin/certifications"
        tone={counts.pending_certifications > 0 ? "alert" : undefined}
      />
      <Card label="Aktiva annonser" value={counts.active_equipment} href="/admin/listings" />
      <Card label="Omdömen" value={counts.reviews} href="/admin/reviews" />
    </div>
  );
}

function Card({
  label,
  value,
  href,
  tone
}: {
  label: string;
  value: number;
  href: string;
  tone?: "alert" | "warning";
}) {
  const ring =
    tone === "alert"
      ? "ring-1 ring-rose-200"
      : tone === "warning"
      ? "ring-1 ring-amber-200"
      : "";
  return (
    <Link
      href={href}
      className={`block rounded-xl border border-border bg-bg p-5 transition hover:border-accent/40 ${ring}`}
    >
      <p className="text-xs uppercase tracking-wide text-mute">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
    </Link>
  );
}

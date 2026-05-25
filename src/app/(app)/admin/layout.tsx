import Link from "next/link";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Översikt" },
  { href: "/admin/users", label: "Användare" },
  { href: "/admin/listings", label: "Annonser" },
  { href: "/admin/certifications", label: "Certifikat" },
  { href: "/admin/reviews", label: "Omdömen" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">Admin</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Moderation</h1>
        </div>
      </header>

      <nav className="-mx-4 overflow-x-auto border-b border-border sm:mx-0">
        <div className="flex min-w-max gap-1 px-4 sm:px-0">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="inline-flex h-11 items-center rounded-t-md px-3 text-sm font-medium text-mute hover:bg-panel hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>

      <div>{children}</div>
    </div>
  );
}

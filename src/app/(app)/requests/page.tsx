import { requireUser } from "@/lib/auth/session";
import {
  listIncomingRequests,
  listOutgoingRequests
} from "@/features/requests/queries";
import { RequestRow } from "@/features/requests/components/RequestRow";
import { EmptyState } from "@/components/marketplace/EmptyState";

export const dynamic = "force-dynamic";

type Tab = "incoming" | "outgoing";

interface PageProps {
  searchParams: Promise<{ tab?: Tab }>;
}

export default async function RequestsPage({ searchParams }: PageProps) {
  const session = await requireUser();
  const params = await searchParams;
  const tab: Tab = params.tab === "outgoing" ? "outgoing" : "incoming";

  const [incoming, outgoing] = await Promise.all([
    listIncomingRequests(session.id),
    listOutgoingRequests(session.id)
  ]);

  const rows = tab === "incoming" ? incoming : outgoing;

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Förfrågningar</h1>
        <p className="text-sm text-mute">Hantera bokningar du fått och skickat.</p>
      </header>

      <nav className="flex border-b border-border text-sm">
        <TabLink href="/requests?tab=incoming" active={tab === "incoming"} count={incoming.length}>
          Inkommande
        </TabLink>
        <TabLink href="/requests?tab=outgoing" active={tab === "outgoing"} count={outgoing.length}>
          Skickade
        </TabLink>
      </nav>

      {rows.length === 0 ? (
        <EmptyState
          title={
            tab === "incoming"
              ? "Inga inkommande förfrågningar ännu"
              : "Du har inte skickat några förfrågningar ännu"
          }
          description={
            tab === "incoming"
              ? "När någon vill boka dig eller dina maskiner dyker det upp här."
              : "Bläddra i marknadsplatsen för att skicka din första förfrågan."
          }
          actionLabel={tab === "outgoing" ? "Till marknadsplatsen" : undefined}
          actionHref={tab === "outgoing" ? "/marketplace" : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-bg">
          {rows.map((r) => (
            <RequestRow key={r.id} request={r} perspective={tab} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabLink({
  href,
  active,
  count,
  children
}: {
  href: string;
  active: boolean;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 font-medium ${
        active
          ? "border-ink text-ink"
          : "border-transparent text-mute hover:text-ink"
      }`}
    >
      {children}
      <span className="rounded-full bg-panel px-1.5 py-0.5 text-[11px] font-medium text-mute">
        {count}
      </span>
    </a>
  );
}

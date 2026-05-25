import { requireUser } from "@/lib/auth/session";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administratör",
  company: "Byggföretag",
  worker: "Arbetare",
  equipment_owner: "Maskinägare"
};

export default async function DashboardPage() {
  const session = await requireUser();

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <p className="text-sm text-mute">Inloggad som {ROLE_LABEL[session.role]}</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Hej, {session.full_name}</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Marknadsplats" href="/marketplace" body="Bläddra bland arbetare och maskiner." />
        <Card title="Förfrågningar" href="/requests" body="Hantera bokningar du skickat och fått." />
        <Card title="Meddelanden" href="/messages" body="Konversationer med dina kontakter." />
      </section>
    </div>
  );
}

function Card({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <a
      href={href}
      className="block rounded-xl border border-border bg-bg p-5 transition hover:border-accent/40 hover:bg-panel"
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-mute">{body}</p>
    </a>
  );
}

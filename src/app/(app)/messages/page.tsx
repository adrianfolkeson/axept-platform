import { requireUser } from "@/lib/auth/session";
import { listConversations } from "@/features/messages/queries";
import { ConversationListItem } from "@/features/messages/components/ConversationListItem";
import { EmptyState } from "@/components/marketplace/EmptyState";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await requireUser();
  const conversations = await listConversations(session.id);

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Meddelanden</h1>
        <p className="text-sm text-mute">{conversations.length} konversationer</p>
      </header>

      {conversations.length === 0 ? (
        <EmptyState
          title="Inga konversationer ännu"
          description="Konversationer skapas automatiskt när en förfrågan accepteras."
          actionLabel="Till marknadsplatsen"
          actionHref="/marketplace"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-bg">
          {conversations.map((c) => (
            <ConversationListItem key={c.id} item={c} userId={session.id} />
          ))}
        </div>
      )}
    </div>
  );
}

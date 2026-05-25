import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getConversationForUser } from "@/features/messages/queries";
import { MessageThread } from "@/features/messages/components/MessageThread";
import { MessageComposer } from "@/features/messages/components/MessageComposer";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const { id } = await params;
  const conv = await getConversationForUser(id, session.id);
  if (!conv) notFound();

  return (
    <div className="flex h-[calc(100dvh-10rem)] flex-col overflow-hidden rounded-xl border border-border bg-bg sm:h-[calc(100dvh-8rem)]">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href="/messages"
          aria-label="Tillbaka"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-mute hover:bg-panel hover:text-ink"
        >
          ←
        </Link>
        <div className="h-9 w-9 overflow-hidden rounded-full border border-border bg-panel">
          {conv.counterpart.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={conv.counterpart.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-mute">
              {conv.counterpart.full_name[0]}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{conv.counterpart.full_name}</p>
          {conv.request_id && (
            <Link
              href={`/requests/${conv.request_id}`}
              className="text-xs text-mute hover:text-ink"
            >
              Visa förfrågan →
            </Link>
          )}
        </div>
      </header>

      <MessageThread
        conversationId={conv.id}
        userId={session.id}
        initialMessages={conv.messages}
      />

      <MessageComposer conversationId={conv.id} />
    </div>
  );
}

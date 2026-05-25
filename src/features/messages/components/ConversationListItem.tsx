import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import type { ConversationListItem as Item } from "../queries";

export function ConversationListItem({
  item,
  userId
}: {
  item: Item;
  userId: string;
}) {
  const preview = item.last_message
    ? (item.last_message.sender_id === userId ? "Du: " : "") +
      item.last_message.body
    : "Inga meddelanden ännu";

  return (
    <Link
      href={`/messages/${item.id}`}
      className="flex items-center gap-4 border-b border-border px-4 py-4 transition last:border-0 active:bg-panel sm:hover:bg-panel/60"
    >
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-panel">
        {item.counterpart.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.counterpart.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-mute">
            {item.counterpart.full_name[0]}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-medium">{item.counterpart.full_name}</p>
          <span className="shrink-0 text-xs text-mute">
            {formatDate(item.last_message_at ?? item.created_at)}
          </span>
        </div>
        <p className="truncate text-sm text-mute">{preview}</p>
      </div>

      {item.unread_count > 0 && (
        <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-brand-fg">
          {item.unread_count}
        </span>
      )}
    </Link>
  );
}

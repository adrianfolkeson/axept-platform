import { cn } from "@/lib/utils/cn";
import type { MessageRow } from "../queries";

interface Props {
  message: MessageRow;
  mine: boolean;
}

const TIME = new Intl.DateTimeFormat("sv-SE", { hour: "2-digit", minute: "2-digit" });

export function MessageBubble({ message, mine }: Props) {
  return (
    <div className={cn("flex w-full", mine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[75%] space-y-1", mine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "whitespace-pre-line rounded-2xl px-4 py-2 text-sm",
            mine
              ? "rounded-br-sm bg-ink text-white"
              : "rounded-bl-sm border border-border bg-bg text-ink"
          )}
        >
          {message.body}
        </div>
        <p className={cn("px-1 text-[11px]", mine ? "text-right text-mute" : "text-mute")}>
          {TIME.format(new Date(message.created_at))}
          {mine && message.read_at ? " · Läst" : ""}
        </p>
      </div>
    </div>
  );
}

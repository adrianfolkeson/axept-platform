"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { markConversationReadAction } from "../actions";
import { MessageBubble } from "./MessageBubble";
import type { MessageRow } from "../queries";

interface Props {
  conversationId: string;
  userId: string;
  initialMessages: MessageRow[];
}

/**
 * Scoped realtime: one channel per conversation. INSERT events append to state;
 * UPDATE events sync read_at on outgoing messages. No global presence, no typing.
 */
export function MessageThread({ conversationId, userId, initialMessages }: Props) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement | null>(null);

  // Sort guard — keep ascending by created_at.
  const sorted = useMemo(
    () => [...messages].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [messages]
  );

  // Scroll to bottom on new message.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sorted.length]);

  // Mark as read on mount + when new incoming messages arrive.
  useEffect(() => {
    const hasUnreadIncoming = sorted.some(
      (m) => m.sender_id !== userId && m.read_at == null
    );
    if (!hasUnreadIncoming) return;
    startTransition(() => {
      void markConversationReadAction(conversationId);
    });
  }, [sorted, userId, conversationId]);

  // Subscribe to realtime — scoped to this conversation only.
  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    const channel = sb
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const row = payload.new as MessageRow;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const row = payload.new as MessageRow;
          setMessages((prev) => prev.map((m) => (m.id === row.id ? row : m)));
        }
      )
      .subscribe();

    return () => {
      void sb.removeChannel(channel);
    };
  }, [conversationId]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-mute">
        Inga meddelanden ännu — skriv det första nedan.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
      {sorted.map((m) => (
        <MessageBubble key={m.id} message={m} mine={m.sender_id === userId} />
      ))}
      <div ref={endRef} />
    </div>
  );
}

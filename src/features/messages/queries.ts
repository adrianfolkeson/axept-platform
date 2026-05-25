import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface ConversationListItem {
  id: string;
  request_id: string | null;
  last_message_at: string | null;
  created_at: string;
  counterpart: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  last_message: {
    body: string;
    sender_id: string;
    created_at: string;
  } | null;
  unread_count: number;
}

export interface ConversationDetail {
  id: string;
  request_id: string | null;
  participant_a: string;
  participant_b: string;
  counterpart: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  messages: MessageRow[];
}

interface ConversationRow {
  id: string;
  request_id: string | null;
  participant_a: string;
  participant_b: string;
  last_message_at: string | null;
  created_at: string;
  participant_a_profile: { id: string; full_name: string; avatar_url: string | null } | null;
  participant_b_profile: { id: string; full_name: string; avatar_url: string | null } | null;
}

export async function listConversations(userId: string): Promise<ConversationListItem[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("conversations")
    .select(
      `id, request_id, participant_a, participant_b, last_message_at, created_at,
       participant_a_profile:profiles!conversations_participant_a_fkey
         (id, full_name, avatar_url),
       participant_b_profile:profiles!conversations_participant_b_fkey
         (id, full_name, avatar_url)`
    )
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const rows = data as unknown as ConversationRow[];
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);

  // Last message per conversation
  const { data: lastMsgs } = await sb
    .from("messages")
    .select("conversation_id, body, sender_id, created_at")
    .in("conversation_id", ids)
    .order("created_at", { ascending: false });

  const lastByConv = new Map<string, ConversationListItem["last_message"]>();
  for (const m of (lastMsgs ?? []) as Array<{
    conversation_id: string;
    body: string;
    sender_id: string;
    created_at: string;
  }>) {
    if (!lastByConv.has(m.conversation_id)) {
      lastByConv.set(m.conversation_id, {
        body: m.body,
        sender_id: m.sender_id,
        created_at: m.created_at
      });
    }
  }

  // Unread count per conversation (messages from someone else, read_at null)
  const { data: unreadRows } = await sb
    .from("messages")
    .select("conversation_id")
    .in("conversation_id", ids)
    .is("read_at", null)
    .neq("sender_id", userId);
  const unreadByConv = new Map<string, number>();
  for (const r of (unreadRows ?? []) as Array<{ conversation_id: string }>) {
    unreadByConv.set(r.conversation_id, (unreadByConv.get(r.conversation_id) ?? 0) + 1);
  }

  return rows.map((r) => {
    const isA = r.participant_a === userId;
    const counterpart = isA ? r.participant_b_profile : r.participant_a_profile;
    return {
      id: r.id,
      request_id: r.request_id,
      last_message_at: r.last_message_at,
      created_at: r.created_at,
      counterpart: counterpart ?? { id: "", full_name: "Okänd", avatar_url: null },
      last_message: lastByConv.get(r.id) ?? null,
      unread_count: unreadByConv.get(r.id) ?? 0
    };
  });
}

export async function getConversationForUser(
  conversationId: string,
  userId: string
): Promise<ConversationDetail | null> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("conversations")
    .select(
      `id, request_id, participant_a, participant_b,
       participant_a_profile:profiles!conversations_participant_a_fkey
         (id, full_name, avatar_url),
       participant_b_profile:profiles!conversations_participant_b_fkey
         (id, full_name, avatar_url)`
    )
    .eq("id", conversationId)
    .maybeSingle();
  if (error || !data) return null;

  const row = data as unknown as ConversationRow;
  if (row.participant_a !== userId && row.participant_b !== userId) return null;

  const isA = row.participant_a === userId;
  const counterpart = isA ? row.participant_b_profile : row.participant_a_profile;

  const { data: msgs } = await sb
    .from("messages")
    .select("id, conversation_id, sender_id, body, read_at, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return {
    id: row.id,
    request_id: row.request_id,
    participant_a: row.participant_a,
    participant_b: row.participant_b,
    counterpart: counterpart ?? { id: "", full_name: "Okänd", avatar_url: null },
    messages: ((msgs ?? []) as unknown) as MessageRow[]
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { SendMessageSchema } from "./schemas";

export type ActionState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

function flattenErrors(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

async function isParticipant(conversationId: string, userId: string): Promise<boolean> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
    .maybeSingle();
  return !!data;
}

export async function sendMessageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireUser();

  const parsed = SendMessageSchema.safeParse({
    conversation_id: formData.get("conversation_id"),
    body: formData.get("body")
  });
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  const ok = await isParticipant(parsed.data.conversation_id, session.id);
  if (!ok) return { error: "Du har inte tillgång till denna konversation." };

  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("messages").insert({
    conversation_id: parsed.data.conversation_id,
    sender_id: session.id,
    body: parsed.data.body.trim()
  });
  if (error) return { error: error.message };

  revalidatePath("/messages");
  revalidatePath(`/messages/${parsed.data.conversation_id}`);
  return { ok: true };
}

/**
 * Mark all unread messages in a conversation (not sent by me) as read.
 * Idempotent. Safe to call on every thread mount + on incoming realtime event.
 */
export async function markConversationReadAction(conversationId: string): Promise<ActionState> {
  const session = await requireUser();
  const ok = await isParticipant(conversationId, session.id);
  if (!ok) return { error: "Inte deltagare i konversationen." };

  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", session.id)
    .is("read_at", null);
  if (error) return { error: error.message };

  revalidatePath("/messages");
  return { ok: true };
}

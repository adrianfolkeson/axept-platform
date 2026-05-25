"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { CreateRequestSchema } from "./schemas";
import {
  canTransition,
  isTerminal,
  type Party,
  type RequestStatus
} from "./state-machine";

export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  request_id?: string;
};

function flattenErrors(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

async function resolveTargetUserId(
  targetType: "worker" | "equipment",
  targetId: string
): Promise<string | null> {
  const sb = await createSupabaseServerClient();
  if (targetType === "worker") {
    const { data } = await sb
      .from("worker_profiles")
      .select("profile_id")
      .eq("id", targetId)
      .maybeSingle();
    return (data?.profile_id as string) ?? null;
  }
  const { data } = await sb
    .from("equipment")
    .select("owner_id, status")
    .eq("id", targetId)
    .maybeSingle();
  if (!data || data.status !== "active") return null;
  return data.owner_id as string;
}

export async function createRequestAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireUser();

  const parsed = CreateRequestSchema.safeParse({
    target_type: formData.get("target_type"),
    target_id: formData.get("target_id"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    message: formData.get("message") ?? ""
  });
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  const targetUserId = await resolveTargetUserId(
    parsed.data.target_type,
    parsed.data.target_id
  );
  if (!targetUserId) return { error: "Annonsen hittades inte." };
  if (targetUserId === session.id) {
    return { error: "Du kan inte skicka förfrågan till dig själv." };
  }

  const sb = await createSupabaseServerClient();
  const insertPayload = {
    requester_id: session.id,
    worker_profile_id: parsed.data.target_type === "worker" ? parsed.data.target_id : null,
    equipment_id: parsed.data.target_type === "equipment" ? parsed.data.target_id : null,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
    message: parsed.data.message ? parsed.data.message.trim() : null,
    status: "pending" as const
  };

  const { data, error } = await sb
    .from("booking_requests")
    .insert(insertPayload)
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "Kunde inte skapa förfrågan." };

  revalidatePath("/requests");
  return { ok: true, request_id: data.id as string };
}

async function ensureConversation(requestId: string, a: string, b: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { data: existing } = await sb
    .from("conversations")
    .select("id")
    .eq("request_id", requestId)
    .maybeSingle();
  if (existing) return;

  await sb.from("conversations").insert({
    request_id: requestId,
    participant_a: a,
    participant_b: b
  });
}

interface TransitionContext {
  requestId: string;
  to: RequestStatus;
}

async function transition({ requestId, to }: TransitionContext): Promise<ActionState> {
  const session = await requireUser();
  const sb = await createSupabaseServerClient();

  const { data: req, error: readErr } = await sb
    .from("booking_requests")
    .select("id, status, requester_id, worker_profile_id, equipment_id")
    .eq("id", requestId)
    .maybeSingle();
  if (readErr || !req) return { error: "Förfrågan hittades inte." };

  const status = req.status as RequestStatus;
  if (isTerminal(status)) return { error: "Förfrågan är redan avslutad." };

  // Resolve target user
  let targetId: string | null = null;
  if (req.worker_profile_id) {
    const { data } = await sb
      .from("worker_profiles")
      .select("profile_id")
      .eq("id", req.worker_profile_id)
      .maybeSingle();
    targetId = (data?.profile_id as string) ?? null;
  } else if (req.equipment_id) {
    const { data } = await sb
      .from("equipment")
      .select("owner_id")
      .eq("id", req.equipment_id)
      .maybeSingle();
    targetId = (data?.owner_id as string) ?? null;
  }
  if (!targetId) return { error: "Mottagaren hittades inte." };

  let party: Party;
  if (session.id === req.requester_id) party = "requester";
  else if (session.id === targetId) party = "target";
  else return { error: "Du har inte rätt att ändra denna förfrågan." };

  if (!canTransition(status, to, party)) {
    return { error: "Den här ändringen är inte tillåten." };
  }

  const { error: upErr } = await sb
    .from("booking_requests")
    .update({ status: to })
    .eq("id", requestId);
  if (upErr) return { error: upErr.message };

  if (to === "accepted") {
    await ensureConversation(requestId, req.requester_id as string, targetId);
  }

  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
  return { ok: true };
}

export async function acceptRequestAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await transition({ requestId: id, to: "accepted" });
  redirect(`/requests/${id}`);
}

export async function declineRequestAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await transition({ requestId: id, to: "declined" });
  redirect(`/requests/${id}`);
}

export async function cancelRequestAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await transition({ requestId: id, to: "cancelled" });
  redirect(`/requests/${id}`);
}

export async function completeRequestAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await transition({ requestId: id, to: "completed" });
  redirect(`/requests/${id}`);
}

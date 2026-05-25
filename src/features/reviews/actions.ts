"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { CreateReviewSchema } from "./schemas";

export type ActionState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

function flattenErrors(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function nullable(v: string | null | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

export async function createReviewAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireUser();

  const parsed = CreateReviewSchema.safeParse({
    request_id: formData.get("request_id"),
    subject_type: formData.get("subject_type"),
    subject_id: formData.get("subject_id"),
    rating: formData.get("rating"),
    body: formData.get("body") ?? ""
  });
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  const sb = await createSupabaseServerClient();

  // Re-verify ownership and request state. DB policy also enforces this.
  const { data: req, error: reqErr } = await sb
    .from("booking_requests")
    .select("id, requester_id, status, worker_profile_id, equipment_id")
    .eq("id", parsed.data.request_id)
    .maybeSingle();
  if (reqErr || !req) return { error: "Förfrågan hittades inte." };
  if (req.requester_id !== session.id) {
    return { error: "Endast beställaren kan lämna omdöme." };
  }
  if (req.status !== "completed") {
    return { error: "Förfrågan måste vara slutförd för att kunna omdömas." };
  }

  // Subject must match the request target
  const expectedWorkerId = req.worker_profile_id as string | null;
  const expectedEquipmentId = req.equipment_id as string | null;
  if (parsed.data.subject_type === "worker") {
    if (!expectedWorkerId || expectedWorkerId !== parsed.data.subject_id) {
      return { error: "Felaktigt omdömesobjekt." };
    }
  } else {
    if (!expectedEquipmentId || expectedEquipmentId !== parsed.data.subject_id) {
      return { error: "Felaktigt omdömesobjekt." };
    }
  }

  const insertPayload = {
    author_id: session.id,
    request_id: parsed.data.request_id,
    worker_profile_id: parsed.data.subject_type === "worker" ? parsed.data.subject_id : null,
    equipment_id: parsed.data.subject_type === "equipment" ? parsed.data.subject_id : null,
    rating: parsed.data.rating,
    body: nullable(parsed.data.body)
  };

  const { error } = await sb.from("reviews").insert(insertPayload);
  if (error) {
    // 23505 = unique_violation (one review per (author_id, request_id))
    if (error.code === "23505") return { error: "Du har redan lämnat omdöme för denna förfrågan." };
    return { error: error.message };
  }

  revalidatePath(`/requests/${parsed.data.request_id}`);
  if (parsed.data.subject_type === "worker") {
    revalidatePath(`/marketplace/workers/${parsed.data.subject_id}`);
  } else {
    revalidatePath(`/marketplace/equipment/${parsed.data.subject_id}`);
  }
  return { ok: true };
}

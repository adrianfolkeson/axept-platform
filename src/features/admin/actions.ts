"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * All admin mutations:
 *   1. requireRole('admin') — session/role check on every call
 *   2. use service-role client to bypass RLS for cross-tenant writes
 *   3. revalidate affected admin paths
 *
 * Keep payloads small (just ids + booleans). No bulk ops in MVP.
 */

function bool(v: FormDataEntryValue | null): boolean {
  return v === "true" || v === "on" || v === "1";
}

export async function setProfileVerifiedAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const next = bool(formData.get("next"));
  if (!id) return;
  const sb = createSupabaseAdminClient();
  await sb.from("profiles").update({ verified: next }).eq("id", id);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function setProfileBannedAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const next = bool(formData.get("next"));
  if (!id) return;
  const sb = createSupabaseAdminClient();
  await sb.from("profiles").update({ banned: next }).eq("id", id);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function setEquipmentStatusAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["active", "paused", "archived"].includes(status)) return;
  const sb = createSupabaseAdminClient();
  await sb.from("equipment").update({ status }).eq("id", id);
  revalidatePath("/admin/listings");
  revalidatePath(`/marketplace/equipment/${id}`);
  revalidatePath("/marketplace/equipment");
}

export async function setCertificationVerifiedAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const next = bool(formData.get("next"));
  if (!id) return;
  const sb = createSupabaseAdminClient();
  await sb.from("certifications").update({ verified: next }).eq("id", id);
  revalidatePath("/admin/certifications");
  revalidatePath("/admin");
}

export async function adminDeleteReviewAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = createSupabaseAdminClient();
  await sb.from("reviews").delete().eq("id", id);
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { EquipmentSchema } from "./schemas";

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

function parseForm(formData: FormData) {
  return EquipmentSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    daily_rate_sek: formData.get("daily_rate_sek") ?? "",
    weekly_rate_sek: formData.get("weekly_rate_sek") ?? "",
    city: formData.get("city") ?? "",
    region: formData.get("region") ?? "",
    status: formData.get("status") ?? "active"
  });
}

export async function createEquipmentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("equipment_owner");
  const parsed = parseForm(formData);
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("equipment")
    .insert({
      owner_id: session.id,
      title: parsed.data.title,
      category: parsed.data.category,
      description: nullable(parsed.data.description),
      daily_rate_sek: parsed.data.daily_rate_sek ?? 0,
      weekly_rate_sek: parsed.data.weekly_rate_sek,
      city: nullable(parsed.data.city),
      region: nullable(parsed.data.region),
      status: parsed.data.status
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Kunde inte spara" };

  revalidatePath("/profile/equipment");
  revalidatePath("/marketplace/equipment");
  redirect(`/profile/equipment/${data.id}/edit`);
}

export async function updateEquipmentAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("equipment_owner");
  const parsed = parseForm(formData);
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("equipment")
    .update({
      title: parsed.data.title,
      category: parsed.data.category,
      description: nullable(parsed.data.description),
      daily_rate_sek: parsed.data.daily_rate_sek ?? 0,
      weekly_rate_sek: parsed.data.weekly_rate_sek,
      city: nullable(parsed.data.city),
      region: nullable(parsed.data.region),
      status: parsed.data.status
    })
    .eq("id", id)
    .eq("owner_id", session.id);

  if (error) return { error: error.message };

  revalidatePath("/profile/equipment");
  revalidatePath(`/profile/equipment/${id}/edit`);
  revalidatePath(`/marketplace/equipment/${id}`);
  return { ok: true };
}

export async function deleteEquipmentAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const session = await requireRole("equipment_owner");
  const sb = await createSupabaseServerClient();
  await sb.from("equipment").delete().eq("id", id).eq("owner_id", session.id);
  revalidatePath("/profile/equipment");
  redirect("/profile/equipment");
}

export async function attachEquipmentImageAction(equipmentId: string, url: string): Promise<ActionState> {
  const session = await requireRole("equipment_owner");
  const sb = await createSupabaseServerClient();

  // verify ownership before insert (RLS also enforces)
  const { data: own } = await sb
    .from("equipment")
    .select("id")
    .eq("id", equipmentId)
    .eq("owner_id", session.id)
    .maybeSingle();
  if (!own) return { error: "Inte din annons" };

  const { data: maxRow } = await sb
    .from("equipment_images")
    .select("sort_order")
    .eq("equipment_id", equipmentId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = ((maxRow?.[0]?.sort_order as number) ?? -1) + 1;

  const { error } = await sb
    .from("equipment_images")
    .insert({ equipment_id: equipmentId, url, sort_order: nextOrder });
  if (error) return { error: error.message };

  revalidatePath(`/profile/equipment/${equipmentId}/edit`);
  revalidatePath(`/marketplace/equipment/${equipmentId}`);
  return { ok: true };
}

export async function deleteEquipmentImageAction(formData: FormData): Promise<void> {
  const imageId = String(formData.get("image_id") ?? "");
  const equipmentId = String(formData.get("equipment_id") ?? "");
  if (!imageId || !equipmentId) return;

  const session = await requireRole("equipment_owner");
  const sb = await createSupabaseServerClient();

  const { data: own } = await sb
    .from("equipment")
    .select("id")
    .eq("id", equipmentId)
    .eq("owner_id", session.id)
    .maybeSingle();
  if (!own) return;

  await sb.from("equipment_images").delete().eq("id", imageId).eq("equipment_id", equipmentId);
  revalidatePath(`/profile/equipment/${equipmentId}/edit`);
  revalidatePath(`/marketplace/equipment/${equipmentId}`);
}

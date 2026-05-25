"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { CertificationSchema } from "./schemas";

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

async function ownWorkerProfileId(): Promise<string | null> {
  const session = await requireRole("worker");
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("worker_profiles")
    .select("id")
    .eq("profile_id", session.id)
    .maybeSingle();
  return (data?.id as string) ?? null;
}

export async function addCertificationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const workerProfileId = await ownWorkerProfileId();
  if (!workerProfileId) {
    return { error: "Skapa din arbetarprofil först under Min profil." };
  }

  const parsed = CertificationSchema.safeParse({
    title: formData.get("title"),
    issuer: formData.get("issuer") ?? "",
    issued_at: (formData.get("issued_at") as string | null) ?? "",
    expires_at: (formData.get("expires_at") as string | null) ?? "",
    file_url: (formData.get("file_url") as string | null) ?? ""
  });
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  const sb = await createSupabaseServerClient();
  const { error } = await sb.from("certifications").insert({
    worker_profile_id: workerProfileId,
    title: parsed.data.title,
    issuer: nullable(parsed.data.issuer),
    issued_at: parsed.data.issued_at,
    expires_at: parsed.data.expires_at,
    file_url: nullable(parsed.data.file_url)
  });

  if (error) return { error: error.message };
  revalidatePath("/profile/certifications");
  return { ok: true };
}

export async function deleteCertificationAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const session = await requireRole("worker");
  const sb = await createSupabaseServerClient();

  const { data: cert } = await sb
    .from("certifications")
    .select("id, worker_profile_id, worker_profiles!inner(profile_id)")
    .eq("id", id)
    .maybeSingle();
  if (!cert) return;

  const owner = (cert as unknown as { worker_profiles: { profile_id: string } }).worker_profiles
    .profile_id;
  if (owner !== session.id) return;

  await sb.from("certifications").delete().eq("id", id);
  revalidatePath("/profile/certifications");
}

export async function createSignedCertUrlAction(filePath: string): Promise<string | null> {
  await requireRole("worker");
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb.storage
    .from("certifications")
    .createSignedUrl(filePath, 60 * 10);
  if (error || !data) return null;
  return data.signedUrl;
}

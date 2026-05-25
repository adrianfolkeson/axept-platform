"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { ProfileSchema, AvatarUrlSchema } from "./schemas";

export type ActionState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

function flattenErrors(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function nullable(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireUser();

  const parsed = ProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") ?? "",
    city: formData.get("city") ?? "",
    region: formData.get("region") ?? "",
    bio: formData.get("bio") ?? ""
  });
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: nullable(parsed.data.phone ?? null),
      city: nullable(parsed.data.city ?? null),
      region: nullable(parsed.data.region ?? null),
      bio: nullable(parsed.data.bio ?? null)
    })
    .eq("id", session.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setAvatarAction(avatarUrl: string): Promise<ActionState> {
  const session = await requireUser();
  const parsed = AvatarUrlSchema.safeParse({ avatar_url: avatarUrl });
  if (!parsed.success) return { error: "Ogiltig URL" };

  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("profiles")
    .update({ avatar_url: parsed.data.avatar_url })
    .eq("id", session.id);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}

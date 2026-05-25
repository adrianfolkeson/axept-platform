"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { CompanySchema } from "./schemas";

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

export async function upsertCompanyAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("company");

  const parsed = CompanySchema.safeParse({
    name: formData.get("name"),
    org_number: formData.get("org_number") ?? "",
    website: formData.get("website") ?? "",
    description: formData.get("description") ?? "",
    hq_city: formData.get("hq_city") ?? "",
    hq_region: formData.get("hq_region") ?? ""
  });
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("companies")
    .upsert(
      {
        owner_id: session.id,
        name: parsed.data.name,
        org_number: nullable(parsed.data.org_number),
        website: nullable(parsed.data.website),
        description: nullable(parsed.data.description),
        hq_city: nullable(parsed.data.hq_city),
        hq_region: nullable(parsed.data.hq_region)
      },
      { onConflict: "owner_id" }
    );

  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}

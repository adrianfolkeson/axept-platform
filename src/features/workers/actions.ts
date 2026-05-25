"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { WorkerProfileSchema } from "./schemas";

export type ActionState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

function flattenErrors(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function upsertWorkerProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("worker");

  const parsed = WorkerProfileSchema.safeParse({
    headline: formData.get("headline"),
    skills: formData.get("skills") ?? "",
    experience_years: formData.get("experience_years") ?? "0",
    hourly_rate_sek: formData.get("hourly_rate_sek") ?? "",
    available: formData.get("available") ?? null,
    travel_radius_km: formData.get("travel_radius_km") ?? ""
  });
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("worker_profiles")
    .upsert(
      {
        profile_id: session.id,
        headline: parsed.data.headline,
        skills: parsed.data.skills,
        experience_years: parsed.data.experience_years,
        hourly_rate_sek: parsed.data.hourly_rate_sek,
        available: parsed.data.available,
        travel_radius_km: parsed.data.travel_radius_km
      },
      { onConflict: "profile_id" }
    );

  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}

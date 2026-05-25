import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface WorkerProfileRecord {
  id: string;
  profile_id: string;
  headline: string;
  skills: string[];
  experience_years: number;
  hourly_rate_sek: number | null;
  available: boolean;
  available_from: string | null;
  travel_radius_km: number | null;
}

export async function getWorkerProfileByUser(
  userId: string
): Promise<WorkerProfileRecord | null> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("worker_profiles")
    .select(
      "id, profile_id, headline, skills, experience_years, hourly_rate_sek, available, available_from, travel_radius_km"
    )
    .eq("profile_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as WorkerProfileRecord;
}

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface CertificationRow {
  id: string;
  worker_profile_id: string;
  title: string;
  issuer: string | null;
  issued_at: string | null;
  expires_at: string | null;
  file_url: string | null;
  verified: boolean;
  created_at: string;
}

export async function listCertificationsByWorker(
  workerProfileId: string
): Promise<CertificationRow[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("certifications")
    .select(
      "id, worker_profile_id, title, issuer, issued_at, expires_at, file_url, verified, created_at"
    )
    .eq("worker_profile_id", workerProfileId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as unknown as CertificationRow[];
}

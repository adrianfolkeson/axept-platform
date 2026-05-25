import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface CompanyRecord {
  id: string;
  owner_id: string;
  name: string;
  org_number: string | null;
  website: string | null;
  description: string | null;
  hq_city: string | null;
  hq_region: string | null;
}

export async function getCompanyByOwner(ownerId: string): Promise<CompanyRecord | null> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("companies")
    .select("id, owner_id, name, org_number, website, description, hq_city, hq_region")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as CompanyRecord;
}

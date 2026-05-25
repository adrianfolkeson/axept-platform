import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ProfileRecord {
  id: string;
  role: "admin" | "company" | "worker" | "equipment_owner";
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  region: string | null;
  verified: boolean;
  banned: boolean;
}

export async function getProfile(userId: string): Promise<ProfileRecord | null> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("profiles")
    .select("id, role, full_name, phone, avatar_url, bio, city, region, verified, banned")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return data as unknown as ProfileRecord;
}

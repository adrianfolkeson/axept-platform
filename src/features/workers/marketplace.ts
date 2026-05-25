import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WorkerCardData } from "@/components/marketplace/WorkerCard";

export interface WorkerDetail {
  id: string;
  headline: string;
  skills: string[];
  experience_years: number;
  hourly_rate_sek: number | null;
  available: boolean;
  travel_radius_km: number | null;
  available_from: string | null;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    city: string | null;
    region: string | null;
    bio: string | null;
    verified: boolean;
  };
  certifications: Array<{
    id: string;
    title: string;
    issuer: string | null;
    issued_at: string | null;
    expires_at: string | null;
    verified: boolean;
  }>;
}

export interface WorkerFilter {
  region?: string;
  city?: string;
  available?: boolean;
  skill?: string;
  limit?: number;
}

export async function listMarketplaceWorkers(
  filter: WorkerFilter = {}
): Promise<WorkerCardData[]> {
  const sb = await createSupabaseServerClient();
  let q = sb
    .from("worker_profiles")
    .select(
      `id, headline, skills, experience_years, hourly_rate_sek, available,
       profile:profiles!worker_profiles_profile_id_fkey
         (id, full_name, avatar_url, city, region, banned)`
    )
    .order("available", { ascending: false })
    .limit(filter.limit ?? 24);

  if (filter.available !== undefined) q = q.eq("available", filter.available);
  if (filter.region) q = q.ilike("profile.region", `%${filter.region}%`);
  if (filter.city) q = q.ilike("profile.city", `%${filter.city}%`);
  if (filter.skill) q = q.contains("skills", [filter.skill]);

  const { data, error } = await q;
  if (error || !data) return [];

  type Row = {
    id: string;
    headline: string;
    skills: string[];
    experience_years: number;
    hourly_rate_sek: number | null;
    available: boolean;
    profile: WorkerCardData["profile"] & { banned: boolean };
  };

  return (data as unknown as Row[])
    .filter((r) => r.profile && !r.profile.banned)
    .map((r) => ({
      id: r.id,
      headline: r.headline,
      skills: r.skills ?? [],
      experience_years: r.experience_years,
      hourly_rate_sek: r.hourly_rate_sek,
      available: r.available,
      profile: {
        id: r.profile.id,
        full_name: r.profile.full_name,
        avatar_url: r.profile.avatar_url,
        city: r.profile.city,
        region: r.profile.region
      }
    }));
}

export async function getWorkerById(id: string): Promise<WorkerDetail | null> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("worker_profiles")
    .select(
      `id, headline, skills, experience_years, hourly_rate_sek, available,
       travel_radius_km, available_from,
       profile:profiles!worker_profiles_profile_id_fkey
         (id, full_name, avatar_url, city, region, bio, verified, banned),
       certifications (id, title, issuer, issued_at, expires_at, verified)`
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as WorkerDetail & { profile: WorkerDetail["profile"] & { banned: boolean } };
  if (!row.profile || row.profile.banned) return null;

  return {
    id: row.id,
    headline: row.headline,
    skills: row.skills ?? [],
    experience_years: row.experience_years,
    hourly_rate_sek: row.hourly_rate_sek,
    available: row.available,
    travel_radius_km: row.travel_radius_km,
    available_from: row.available_from,
    profile: {
      id: row.profile.id,
      full_name: row.profile.full_name,
      avatar_url: row.profile.avatar_url,
      city: row.profile.city,
      region: row.profile.region,
      bio: row.profile.bio,
      verified: row.profile.verified
    },
    certifications: (row.certifications ?? []).filter((c) => c.verified)
  };
}

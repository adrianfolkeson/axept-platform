import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface AdminCounts {
  users: number;
  pending_certifications: number;
  active_equipment: number;
  reviews: number;
  banned_users: number;
}

export interface AdminUserRow {
  id: string;
  full_name: string;
  role: "admin" | "company" | "worker" | "equipment_owner";
  city: string | null;
  region: string | null;
  verified: boolean;
  banned: boolean;
  created_at: string;
}

export interface AdminEquipmentRow {
  id: string;
  owner_id: string;
  title: string;
  category: string;
  city: string | null;
  region: string | null;
  daily_rate_sek: number;
  status: "active" | "paused" | "archived";
  created_at: string;
  owner_name: string;
}

export interface AdminCertificationRow {
  id: string;
  worker_profile_id: string;
  title: string;
  issuer: string | null;
  expires_at: string | null;
  file_url: string | null;
  verified: boolean;
  created_at: string;
  worker_name: string;
}

export interface AdminReviewRow {
  id: string;
  request_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  author_id: string;
  author_name: string;
  subject_type: "worker" | "equipment";
  subject_label: string;
}

export async function getAdminCounts(): Promise<AdminCounts> {
  const sb = createSupabaseAdminClient();
  const [
    { count: users },
    { count: pendingCerts },
    { count: activeEquipment },
    { count: reviews },
    { count: bannedUsers }
  ] = await Promise.all([
    sb.from("profiles").select("*", { count: "exact", head: true }),
    sb.from("certifications").select("*", { count: "exact", head: true }).eq("verified", false),
    sb.from("equipment").select("*", { count: "exact", head: true }).eq("status", "active"),
    sb.from("reviews").select("*", { count: "exact", head: true }),
    sb.from("profiles").select("*", { count: "exact", head: true }).eq("banned", true)
  ]);

  return {
    users: users ?? 0,
    pending_certifications: pendingCerts ?? 0,
    active_equipment: activeEquipment ?? 0,
    reviews: reviews ?? 0,
    banned_users: bannedUsers ?? 0
  };
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("profiles")
    .select("id, full_name, role, city, region, verified, banned, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return data as unknown as AdminUserRow[];
}

export async function listAdminEquipment(): Promise<AdminEquipmentRow[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("equipment")
    .select(
      `id, owner_id, title, category, city, region, daily_rate_sek, status, created_at,
       owner:profiles!equipment_owner_id_fkey (full_name)`
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (error || !data) return [];
  type Row = AdminEquipmentRow & { owner: { full_name: string } | null };
  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    owner_id: r.owner_id,
    title: r.title,
    category: r.category,
    city: r.city,
    region: r.region,
    daily_rate_sek: r.daily_rate_sek,
    status: r.status,
    created_at: r.created_at,
    owner_name: r.owner?.full_name ?? "—"
  }));
}

export async function listAdminCertifications(
  onlyPending: boolean
): Promise<AdminCertificationRow[]> {
  const sb = createSupabaseAdminClient();
  let q = sb
    .from("certifications")
    .select(
      `id, worker_profile_id, title, issuer, expires_at, file_url, verified, created_at,
       worker:worker_profiles!certifications_worker_profile_id_fkey
         (profile:profiles!worker_profiles_profile_id_fkey (full_name))`
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (onlyPending) q = q.eq("verified", false);

  const { data, error } = await q;
  if (error || !data) return [];
  type Row = AdminCertificationRow & {
    worker: { profile: { full_name: string } | null } | null;
  };
  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    worker_profile_id: r.worker_profile_id,
    title: r.title,
    issuer: r.issuer,
    expires_at: r.expires_at,
    file_url: r.file_url,
    verified: r.verified,
    created_at: r.created_at,
    worker_name: r.worker?.profile?.full_name ?? "—"
  }));
}

export async function listAdminReviews(): Promise<AdminReviewRow[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("reviews")
    .select(
      `id, request_id, rating, body, created_at, author_id, worker_profile_id, equipment_id,
       author:profiles!reviews_author_id_fkey (full_name),
       worker:worker_profiles!reviews_worker_profile_id_fkey
         (profile:profiles!worker_profiles_profile_id_fkey (full_name)),
       equipment:equipment!reviews_equipment_id_fkey (title)`
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (error || !data) return [];

  type Row = {
    id: string;
    request_id: string;
    rating: number;
    body: string | null;
    created_at: string;
    author_id: string;
    worker_profile_id: string | null;
    equipment_id: string | null;
    author: { full_name: string } | null;
    worker: { profile: { full_name: string } | null } | null;
    equipment: { title: string } | null;
  };

  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    request_id: r.request_id,
    rating: r.rating,
    body: r.body,
    created_at: r.created_at,
    author_id: r.author_id,
    author_name: r.author?.full_name ?? "—",
    subject_type: r.worker_profile_id ? "worker" : "equipment",
    subject_label: r.worker_profile_id
      ? r.worker?.profile?.full_name ?? "—"
      : r.equipment?.title ?? "—"
  }));
}

export async function createAdminCertSignedUrl(filePath: string): Promise<string | null> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.storage
    .from("certifications")
    .createSignedUrl(filePath, 60 * 10);
  if (error || !data) return null;
  return data.signedUrl;
}

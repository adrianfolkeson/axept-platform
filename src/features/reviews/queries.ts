import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ReviewRow {
  id: string;
  author_id: string;
  request_id: string;
  worker_profile_id: string | null;
  equipment_id: string | null;
  rating: number;
  body: string | null;
  created_at: string;
}

export interface ReviewWithAuthor extends ReviewRow {
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface RatingAggregate {
  avg: number;
  count: number;
}

const EMPTY_AGG: RatingAggregate = { avg: 0, count: 0 };

function aggregate(rows: Array<{ rating: number }>): RatingAggregate {
  if (rows.length === 0) return EMPTY_AGG;
  const total = rows.reduce((acc, r) => acc + (r.rating ?? 0), 0);
  return { avg: total / rows.length, count: rows.length };
}

export async function getReviewByRequest(
  requestId: string,
  authorId: string
): Promise<ReviewRow | null> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("reviews")
    .select("id, author_id, request_id, worker_profile_id, equipment_id, rating, body, created_at")
    .eq("request_id", requestId)
    .eq("author_id", authorId)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as ReviewRow;
}

export async function getRatingForWorker(workerProfileId: string): Promise<RatingAggregate> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("reviews")
    .select("rating")
    .eq("worker_profile_id", workerProfileId);
  return aggregate((data ?? []) as Array<{ rating: number }>);
}

export async function getRatingForEquipment(equipmentId: string): Promise<RatingAggregate> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("reviews")
    .select("rating")
    .eq("equipment_id", equipmentId);
  return aggregate((data ?? []) as Array<{ rating: number }>);
}

export async function getRatingsForWorkers(
  ids: string[]
): Promise<Map<string, RatingAggregate>> {
  const out = new Map<string, RatingAggregate>();
  if (ids.length === 0) return out;
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("reviews")
    .select("worker_profile_id, rating")
    .in("worker_profile_id", ids);
  const byId = new Map<string, Array<{ rating: number }>>();
  for (const r of (data ?? []) as Array<{ worker_profile_id: string; rating: number }>) {
    const arr = byId.get(r.worker_profile_id) ?? [];
    arr.push({ rating: r.rating });
    byId.set(r.worker_profile_id, arr);
  }
  for (const id of ids) out.set(id, aggregate(byId.get(id) ?? []));
  return out;
}

export async function getRatingsForEquipment(
  ids: string[]
): Promise<Map<string, RatingAggregate>> {
  const out = new Map<string, RatingAggregate>();
  if (ids.length === 0) return out;
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("reviews")
    .select("equipment_id, rating")
    .in("equipment_id", ids);
  const byId = new Map<string, Array<{ rating: number }>>();
  for (const r of (data ?? []) as Array<{ equipment_id: string; rating: number }>) {
    const arr = byId.get(r.equipment_id) ?? [];
    arr.push({ rating: r.rating });
    byId.set(r.equipment_id, arr);
  }
  for (const id of ids) out.set(id, aggregate(byId.get(id) ?? []));
  return out;
}

async function listWithAuthors(
  filter: { worker_profile_id?: string; equipment_id?: string },
  limit = 20
): Promise<ReviewWithAuthor[]> {
  const sb = await createSupabaseServerClient();
  let q = sb
    .from("reviews")
    .select(
      `id, author_id, request_id, worker_profile_id, equipment_id, rating, body, created_at,
       author:profiles!reviews_author_id_fkey (id, full_name, avatar_url)`
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (filter.worker_profile_id) q = q.eq("worker_profile_id", filter.worker_profile_id);
  if (filter.equipment_id) q = q.eq("equipment_id", filter.equipment_id);
  const { data, error } = await q;
  if (error || !data) return [];
  return data as unknown as ReviewWithAuthor[];
}

export async function listReviewsForWorker(
  workerProfileId: string,
  limit = 20
): Promise<ReviewWithAuthor[]> {
  return listWithAuthors({ worker_profile_id: workerProfileId }, limit);
}

export async function listReviewsForEquipment(
  equipmentId: string,
  limit = 20
): Promise<ReviewWithAuthor[]> {
  return listWithAuthors({ equipment_id: equipmentId }, limit);
}

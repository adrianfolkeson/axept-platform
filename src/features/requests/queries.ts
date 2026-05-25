import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { RequestStatus } from "./state-machine";

export interface RequestSummary {
  id: string;
  status: RequestStatus;
  start_date: string;
  end_date: string;
  message: string | null;
  created_at: string;
  requester_id: string;
  worker_profile_id: string | null;
  equipment_id: string | null;
  requester: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  worker: {
    id: string;
    profile: { id: string; full_name: string; avatar_url: string | null };
  } | null;
  equipment: {
    id: string;
    title: string;
    owner_id: string;
  } | null;
}

const SELECT = `
  id, status, start_date, end_date, message, created_at,
  requester_id, worker_profile_id, equipment_id,
  requester:profiles!booking_requests_requester_id_fkey
    (id, full_name, avatar_url),
  worker:worker_profiles
    (id, profile:profiles!worker_profiles_profile_id_fkey (id, full_name, avatar_url)),
  equipment:equipment
    (id, title, owner_id)
`;

function normalize(raw: unknown): RequestSummary {
  return raw as RequestSummary;
}

export async function listOutgoingRequests(userId: string): Promise<RequestSummary[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("booking_requests")
    .select(SELECT)
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown[]).map(normalize);
}

export async function listIncomingRequests(userId: string): Promise<RequestSummary[]> {
  const sb = await createSupabaseServerClient();
  // RLS already gates rows to parties. We filter further to "incoming only" by
  // excluding rows the user requested themself.
  const { data, error } = await sb
    .from("booking_requests")
    .select(SELECT)
    .neq("requester_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown[]).map(normalize);
}

export async function getRequestById(id: string): Promise<RequestSummary | null> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("booking_requests")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return normalize(data);
}

export function targetUserId(req: RequestSummary): string | null {
  if (req.worker) return req.worker.profile.id;
  if (req.equipment) return req.equipment.owner_id;
  return null;
}

export function targetLabel(req: RequestSummary): string {
  if (req.worker) return req.worker.profile.full_name;
  if (req.equipment) return req.equipment.title;
  return "—";
}

export function targetHref(req: RequestSummary): string | null {
  if (req.worker_profile_id) return `/marketplace/workers/${req.worker_profile_id}`;
  if (req.equipment_id) return `/marketplace/equipment/${req.equipment_id}`;
  return null;
}

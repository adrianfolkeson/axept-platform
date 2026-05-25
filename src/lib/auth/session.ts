import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Role = "admin" | "company" | "worker" | "equipment_owner";

export interface SessionProfile {
  id: string;
  email: string | null;
  role: Role;
  full_name: string;
  avatar_url: string | null;
  verified: boolean;
}

export async function getSession(): Promise<SessionProfile | null> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user }
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data: profile } = await sb
    .from("profiles")
    .select("id, role, full_name, avatar_url, verified")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role as Role,
    full_name: profile.full_name as string,
    avatar_url: (profile.avatar_url as string | null) ?? null,
    verified: !!profile.verified
  };
}

export async function requireUser(): Promise<SessionProfile> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(role: Role | Role[]): Promise<SessionProfile> {
  const session = await requireUser();
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(session.role)) redirect("/dashboard");
  return session;
}

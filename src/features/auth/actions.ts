"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { LoginSchema, SignupSchema } from "./schemas";

export type ActionState = { error?: string; fieldErrors?: Record<string, string> };

function flattenErrors(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function signupAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = SignupSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role")
  });
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  const sb = await createSupabaseServerClient();
  const { data, error } = await sb.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${env.appUrl()}/callback`,
      data: {
        full_name: parsed.data.full_name,
        role: parsed.data.role
      }
    }
  });

  if (error) return { error: error.message };
  if (!data.session) {
    return { error: "Kontot skapades. Kontrollera din e-post för att bekräfta." };
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  const sb = await createSupabaseServerClient();
  const { error } = await sb.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Fel e-post eller lösenord." };

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const sb = await createSupabaseServerClient();
  await sb.auth.signOut();
  redirect("/login");
}

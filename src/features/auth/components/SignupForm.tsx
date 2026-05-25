"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import { signupAction, type ActionState } from "../actions";

const INITIAL: ActionState = {};

const ROLE_OPTIONS = [
  { value: "company", label: "Byggföretag" },
  { value: "worker", label: "Arbetare / Hantverkare" },
  { value: "equipment_owner", label: "Maskinägare" }
] as const;

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Namn" htmlFor="full_name" error={state.fieldErrors?.full_name}>
        <Input id="full_name" name="full_name" autoComplete="name" required />
      </FormField>

      <FormField label="E-post" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>

      <FormField
        label="Lösenord"
        htmlFor="password"
        hint="Minst 8 tecken"
        error={state.fieldErrors?.password}
      >
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </FormField>

      <FormField label="Jag är" htmlFor="role" error={state.fieldErrors?.role}>
        <select
          id="role"
          name="role"
          required
          defaultValue="company"
          className="flex h-11 w-full rounded-lg border border-border bg-bg px-3 text-base sm:text-sm"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </FormField>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Skapar konto…" : "Skapa konto"}
      </Button>

      <p className="text-center text-sm text-mute">
        Har du redan konto?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Logga in
        </Link>
      </p>
    </form>
  );
}

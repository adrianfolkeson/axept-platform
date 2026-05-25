"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import { loginAction, type ActionState } from "../actions";

const INITIAL: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="E-post" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>

      <FormField label="Lösenord" htmlFor="password" error={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Loggar in…" : "Logga in"}
      </Button>

      <p className="text-center text-sm text-mute">
        Inget konto?{" "}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          Skapa konto
        </Link>
      </p>
    </form>
  );
}

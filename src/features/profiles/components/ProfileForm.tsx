"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import { updateProfileAction, type ActionState } from "../actions";
import type { ProfileRecord } from "../queries";

const INITIAL: ActionState = {};

export function ProfileForm({ profile }: { profile: ProfileRecord }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, INITIAL);

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <FormField label="Namn" htmlFor="full_name" error={state.fieldErrors?.full_name}>
        <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
      </FormField>

      <FormField label="Telefon" htmlFor="phone" error={state.fieldErrors?.phone}>
        <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
      </FormField>

      <FormField label="Stad" htmlFor="city" error={state.fieldErrors?.city}>
        <Input id="city" name="city" defaultValue={profile.city ?? ""} />
      </FormField>

      <FormField label="Län / Region" htmlFor="region" error={state.fieldErrors?.region}>
        <Input id="region" name="region" defaultValue={profile.region ?? ""} />
      </FormField>

      <div className="sm:col-span-2">
        <FormField label="Om mig" htmlFor="bio" error={state.fieldErrors?.bio}>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio ?? ""}
            rows={4}
            placeholder="Kort beskrivning…"
          />
        </FormField>
      </div>

      <div className="sm:col-span-2 flex items-center justify-end gap-3">
        {state.ok && <span className="text-sm text-emerald-600">Sparat ✓</span>}
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
        <Button type="submit" disabled={pending}>
          {pending ? "Sparar…" : "Spara"}
        </Button>
      </div>
    </form>
  );
}

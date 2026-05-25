"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import { upsertCompanyAction, type ActionState } from "../actions";
import type { CompanyRecord } from "../queries";

const INITIAL: ActionState = {};

export function CompanyForm({ company }: { company: CompanyRecord | null }) {
  const [state, formAction, pending] = useActionState(upsertCompanyAction, INITIAL);

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <FormField label="Företagsnamn" htmlFor="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" defaultValue={company?.name ?? ""} required />
      </FormField>

      <FormField label="Org.nummer" htmlFor="org_number" error={state.fieldErrors?.org_number}>
        <Input id="org_number" name="org_number" defaultValue={company?.org_number ?? ""} />
      </FormField>

      <FormField label="Webbplats" htmlFor="website" error={state.fieldErrors?.website}>
        <Input
          id="website"
          name="website"
          type="url"
          placeholder="https://"
          defaultValue={company?.website ?? ""}
        />
      </FormField>

      <FormField label="Huvudstad" htmlFor="hq_city" error={state.fieldErrors?.hq_city}>
        <Input id="hq_city" name="hq_city" defaultValue={company?.hq_city ?? ""} />
      </FormField>

      <FormField label="Region" htmlFor="hq_region" error={state.fieldErrors?.hq_region}>
        <Input id="hq_region" name="hq_region" defaultValue={company?.hq_region ?? ""} />
      </FormField>

      <div className="sm:col-span-2">
        <FormField label="Beskrivning" htmlFor="description" error={state.fieldErrors?.description}>
          <Textarea
            id="description"
            name="description"
            defaultValue={company?.description ?? ""}
            rows={4}
          />
        </FormField>
      </div>

      <div className="sm:col-span-2 flex items-center justify-end gap-3">
        {state.ok && <span className="text-sm text-emerald-600">Sparat ✓</span>}
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
        <Button type="submit" disabled={pending}>
          {pending ? "Sparar…" : "Spara företag"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import { upsertWorkerProfileAction, type ActionState } from "../actions";
import type { WorkerProfileRecord } from "../queries";

const INITIAL: ActionState = {};

export function WorkerProfileForm({ worker }: { worker: WorkerProfileRecord | null }) {
  const [state, formAction, pending] = useActionState(upsertWorkerProfileAction, INITIAL);

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormField label="Rubrik" htmlFor="headline" error={state.fieldErrors?.headline}>
          <Input
            id="headline"
            name="headline"
            placeholder="t.ex. Snickare med 10 års erfarenhet"
            defaultValue={worker?.headline ?? ""}
            required
          />
        </FormField>
      </div>

      <div className="sm:col-span-2">
        <FormField
          label="Kompetenser"
          htmlFor="skills"
          hint="Kommaseparerat — t.ex. snickeri, plattsättning, takläggning"
          error={state.fieldErrors?.skills}
        >
          <Input
            id="skills"
            name="skills"
            defaultValue={worker?.skills?.join(", ") ?? ""}
          />
        </FormField>
      </div>

      <FormField
        label="Erfarenhet (år)"
        htmlFor="experience_years"
        error={state.fieldErrors?.experience_years}
      >
        <Input
          id="experience_years"
          name="experience_years"
          type="number"
          min={0}
          max={70}
          defaultValue={worker?.experience_years ?? 0}
        />
      </FormField>

      <FormField
        label="Timpris (SEK)"
        htmlFor="hourly_rate_sek"
        error={state.fieldErrors?.hourly_rate_sek}
      >
        <Input
          id="hourly_rate_sek"
          name="hourly_rate_sek"
          type="number"
          min={0}
          defaultValue={worker?.hourly_rate_sek ?? ""}
        />
      </FormField>

      <FormField
        label="Reseradius (km)"
        htmlFor="travel_radius_km"
        error={state.fieldErrors?.travel_radius_km}
      >
        <Input
          id="travel_radius_km"
          name="travel_radius_km"
          type="number"
          min={0}
          defaultValue={worker?.travel_radius_km ?? ""}
        />
      </FormField>

      <div className="flex items-end">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="available"
            defaultChecked={worker?.available ?? true}
            className="h-4 w-4 rounded border-border"
          />
          Tillgänglig för uppdrag
        </label>
      </div>

      <div className="sm:col-span-2 flex items-center justify-end gap-3">
        {state.ok && <span className="text-sm text-emerald-600">Sparat ✓</span>}
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
        <Button type="submit" disabled={pending}>
          {pending ? "Sparar…" : "Spara arbetarprofil"}
        </Button>
      </div>
    </form>
  );
}

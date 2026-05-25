"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import {
  EQUIPMENT_CATEGORIES,
  LISTING_STATUSES
} from "@/features/equipment/schemas";
import { categoryLabel } from "@/lib/utils/format";
import type { ActionState } from "../actions";
import type { EquipmentRow } from "../queries";

const INITIAL: ActionState = {};

const STATUS_LABEL: Record<(typeof LISTING_STATUSES)[number], string> = {
  active: "Aktiv",
  paused: "Pausad",
  archived: "Arkiverad"
};

interface Props {
  equipment?: EquipmentRow | null;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
}

export function EquipmentForm({ equipment, action, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, INITIAL);

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormField label="Titel" htmlFor="title" error={state.fieldErrors?.title}>
          <Input id="title" name="title" defaultValue={equipment?.title ?? ""} required />
        </FormField>
      </div>

      <FormField label="Kategori" htmlFor="category" error={state.fieldErrors?.category}>
        <select
          id="category"
          name="category"
          defaultValue={equipment?.category ?? "excavator"}
          className="flex h-11 w-full rounded-lg border border-border bg-bg px-3 text-base sm:text-sm"
        >
          {EQUIPMENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Status" htmlFor="status" error={state.fieldErrors?.status}>
        <select
          id="status"
          name="status"
          defaultValue={equipment?.status ?? "active"}
          className="flex h-11 w-full rounded-lg border border-border bg-bg px-3 text-base sm:text-sm"
        >
          {LISTING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Dygnspris (SEK)"
        htmlFor="daily_rate_sek"
        error={state.fieldErrors?.daily_rate_sek}
      >
        <Input
          id="daily_rate_sek"
          name="daily_rate_sek"
          type="number"
          min={0}
          defaultValue={equipment?.daily_rate_sek ?? ""}
          required
        />
      </FormField>

      <FormField
        label="Veckopris (SEK, valfritt)"
        htmlFor="weekly_rate_sek"
        error={state.fieldErrors?.weekly_rate_sek}
      >
        <Input
          id="weekly_rate_sek"
          name="weekly_rate_sek"
          type="number"
          min={0}
          defaultValue={equipment?.weekly_rate_sek ?? ""}
        />
      </FormField>

      <FormField label="Stad" htmlFor="city" error={state.fieldErrors?.city}>
        <Input id="city" name="city" defaultValue={equipment?.city ?? ""} />
      </FormField>

      <FormField label="Region" htmlFor="region" error={state.fieldErrors?.region}>
        <Input id="region" name="region" defaultValue={equipment?.region ?? ""} />
      </FormField>

      <div className="sm:col-span-2">
        <FormField label="Beskrivning" htmlFor="description" error={state.fieldErrors?.description}>
          <Textarea
            id="description"
            name="description"
            defaultValue={equipment?.description ?? ""}
            rows={4}
            placeholder="Specifikationer, skick, hyresvillkor…"
          />
        </FormField>
      </div>

      <div className="sm:col-span-2 flex items-center justify-end gap-3">
        {state.ok && <span className="text-sm text-emerald-600">Sparat ✓</span>}
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
        <Button type="submit" disabled={pending}>
          {pending ? "Sparar…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

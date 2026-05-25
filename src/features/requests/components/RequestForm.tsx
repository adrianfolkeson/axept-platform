"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import { createRequestAction, type ActionState } from "../actions";

interface Props {
  targetType: "worker" | "equipment";
  targetId: string;
}

const INITIAL: ActionState = {};

export function RequestForm({ targetType, targetId }: Props) {
  const [state, formAction, pending] = useActionState(createRequestAction, INITIAL);
  const router = useRouter();

  useEffect(() => {
    if (state.ok && state.request_id) {
      router.push(`/requests/${state.request_id}`);
    }
  }, [state.ok, state.request_id, router]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="target_type" value={targetType} />
      <input type="hidden" name="target_id" value={targetId} />

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Från" htmlFor="start_date" error={state.fieldErrors?.start_date}>
          <Input id="start_date" name="start_date" type="date" min={today} defaultValue={today} required />
        </FormField>
        <FormField label="Till" htmlFor="end_date" error={state.fieldErrors?.end_date}>
          <Input id="end_date" name="end_date" type="date" min={today} defaultValue={today} required />
        </FormField>
      </div>

      <FormField label="Meddelande (valfritt)" htmlFor="message" error={state.fieldErrors?.message}>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Beskriv uppdraget eller önskemål…"
        />
      </FormField>

      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Skickar…" : "Skicka förfrågan"}
      </Button>
    </form>
  );
}

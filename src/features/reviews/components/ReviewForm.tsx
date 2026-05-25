"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import { StarsInput } from "@/components/ui/stars";
import { createReviewAction, type ActionState } from "../actions";

const INITIAL: ActionState = {};

interface Props {
  requestId: string;
  subjectType: "worker" | "equipment";
  subjectId: string;
  counterpartName: string;
}

export function ReviewForm({ requestId, subjectType, subjectId, counterpartName }: Props) {
  const [state, formAction, pending] = useActionState(createReviewAction, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="subject_type" value={subjectType} />
      <input type="hidden" name="subject_id" value={subjectId} />

      <FormField label={`Hur var samarbetet med ${counterpartName}?`} htmlFor="rating" error={state.fieldErrors?.rating}>
        <StarsInput name="rating" />
      </FormField>

      <FormField label="Kommentar (valfritt)" htmlFor="body" error={state.fieldErrors?.body}>
        <Textarea id="body" name="body" rows={4} placeholder="Vad fungerade bra? Vad kan förbättras?" />
      </FormField>

      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
      )}
      {state.ok && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Tack för ditt omdöme.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Skickar…" : "Skicka omdöme"}
      </Button>
    </form>
  );
}

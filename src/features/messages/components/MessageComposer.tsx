"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendMessageAction, type ActionState } from "../actions";

const INITIAL: ActionState = {};

interface Props {
  conversationId: string;
}

export function MessageComposer({ conversationId }: Props) {
  const [state, formAction, pending] = useActionState(sendMessageAction, INITIAL);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state.ok && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [state.ok]);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-t border-border bg-bg px-4 py-3"
    >
      <input type="hidden" name="conversation_id" value={conversationId} />
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          name="body"
          rows={1}
          placeholder="Skriv ett meddelande…"
          required
          maxLength={5000}
          onKeyDown={onKeyDown}
          className="max-h-40 min-h-[44px] flex-1 resize-none rounded-lg border border-border bg-bg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 shrink-0 items-center rounded-lg bg-ink px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Skickar…" : "Skicka"}
        </button>
      </div>
      {state.error && <p className="mt-2 text-xs text-rose-600">{state.error}</p>}
      {state.fieldErrors?.body && (
        <p className="mt-2 text-xs text-rose-600">{state.fieldErrors.body}</p>
      )}
    </form>
  );
}

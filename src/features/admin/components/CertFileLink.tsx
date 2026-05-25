"use client";

import { useState, useTransition } from "react";
import { adminCreateCertSignedUrlAction } from "../signed-url-action";

export function CertFileLink({ path }: { path: string }) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function open() {
    setErr(null);
    startTransition(async () => {
      const url = await adminCreateCertSignedUrlAction(path);
      if (!url) {
        setErr("Kunde inte öppna fil");
        return;
      }
      window.open(url, "_blank", "noopener");
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={open}
        disabled={pending}
        className="text-accent hover:underline disabled:opacity-50"
      >
        {pending ? "Öppnar…" : "Visa fil"}
      </button>
      {err && <span className="text-xs text-rose-600">{err}</span>}
    </span>
  );
}

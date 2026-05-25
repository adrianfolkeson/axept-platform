"use client";

import { useState, useTransition } from "react";
import {
  createSignedCertUrlAction,
  deleteCertificationAction
} from "../actions";
import type { CertificationRow } from "../queries";
import { formatDate } from "@/lib/utils/format";

interface Props {
  rows: CertificationRow[];
}

export function CertificationList({ rows }: Props) {
  const [openErr, setOpenErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openFile(path: string | null) {
    if (!path) return;
    setOpenErr(null);
    startTransition(async () => {
      const url = await createSignedCertUrlAction(path);
      if (!url) {
        setOpenErr("Kunde inte öppna filen");
        return;
      }
      window.open(url, "_blank", "noopener");
    });
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-mute">Inga certifikat ännu. Lägg till ditt första nedan.</p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-bg">
        {rows.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{c.title}</p>
              <p className="text-xs text-mute">
                {c.issuer ?? "—"} · utfärdat {formatDate(c.issued_at)} · utgår{" "}
                {formatDate(c.expires_at)}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {c.verified ? (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                  Verifierad
                </span>
              ) : (
                <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-mute">
                  Inväntar granskning
                </span>
              )}
              {c.file_url && (
                <button
                  type="button"
                  onClick={() => openFile(c.file_url)}
                  disabled={pending}
                  className="text-accent hover:underline disabled:opacity-50"
                >
                  Visa fil
                </button>
              )}
              <form action={deleteCertificationAction}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="text-red-600 hover:underline">
                  Ta bort
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {openErr && <p className="text-sm text-red-600">{openErr}</p>}
    </div>
  );
}

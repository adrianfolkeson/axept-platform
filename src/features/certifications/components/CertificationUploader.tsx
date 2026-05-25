"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import { addCertificationAction, type ActionState } from "../actions";

const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;
const INITIAL: ActionState = {};

interface Props {
  workerProfileId: string | null;
}

export function CertificationUploader({ workerProfileId }: Props) {
  const [state, formAction, pending] = useActionState(addCertificationAction, INITIAL);
  const [filePath, setFilePath] = useState<string>("");
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();

  if (!workerProfileId) {
    return (
      <p className="text-sm text-mute">
        Skapa din arbetarprofil först under{" "}
        <a href="/profile" className="text-accent hover:underline">
          Min profil
        </a>
        .
      </p>
    );
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadErr(null);
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      setUploadErr("Bara PDF, JPG eller PNG");
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadErr("Max 10 MB");
      return;
    }

    const sb = createSupabaseBrowserClient();
    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${workerProfileId}/${crypto.randomUUID()}.${ext}`;
    startUpload(async () => {
      const { error } = await sb.storage
        .from("certifications")
        .upload(path, file, { upsert: false });
      if (error) {
        setUploadErr(error.message);
        return;
      }
      setFilePath(path);
    });
  }

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormField label="Titel" htmlFor="title" error={state.fieldErrors?.title}>
          <Input
            id="title"
            name="title"
            placeholder="t.ex. Heta arbeten — certifikat"
            required
          />
        </FormField>
      </div>

      <FormField label="Utfärdare" htmlFor="issuer" error={state.fieldErrors?.issuer}>
        <Input id="issuer" name="issuer" placeholder="t.ex. SBSC" />
      </FormField>

      <FormField label="Utfärdad" htmlFor="issued_at" error={state.fieldErrors?.issued_at}>
        <Input id="issued_at" name="issued_at" type="date" />
      </FormField>

      <FormField label="Utgår" htmlFor="expires_at" error={state.fieldErrors?.expires_at}>
        <Input id="expires_at" name="expires_at" type="date" />
      </FormField>

      <div className="sm:col-span-2">
        <FormField label="Bevis (PDF / JPG / PNG)" htmlFor="cert_file">
          <input
            id="cert_file"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={onFileChange}
            disabled={uploading}
            className="block w-full text-sm text-mute file:mr-3 file:rounded-md file:border-0 file:bg-panel file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-border"
          />
          <input type="hidden" name="file_url" value={filePath} />
          {uploading && <p className="mt-1 text-xs text-mute">Laddar upp…</p>}
          {filePath && (
            <p className="mt-1 text-xs text-emerald-600">Fil bifogad ✓</p>
          )}
          {uploadErr && <p className="mt-1 text-xs text-red-600">{uploadErr}</p>}
        </FormField>
      </div>

      <div className="sm:col-span-2 flex items-center justify-end gap-3">
        {state.ok && <span className="text-sm text-emerald-600">Tillagt ✓</span>}
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
        <Button type="submit" disabled={pending || uploading}>
          {pending ? "Sparar…" : "Lägg till certifikat"}
        </Button>
      </div>
    </form>
  );
}

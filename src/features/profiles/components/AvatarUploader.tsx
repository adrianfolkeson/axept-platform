"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { setAvatarAction } from "../actions";

interface Props {
  userId: string;
  avatarUrl: string | null;
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function AvatarUploader({ userId, avatarUrl }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState(avatarUrl);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      setError("Bara JPG, PNG eller WEBP");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Max 5 MB");
      return;
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const sb = createSupabaseBrowserClient();

    const { error: upErr } = await sb.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (upErr) {
      setError(upErr.message);
      return;
    }

    const { data } = sb.storage.from("avatars").getPublicUrl(path);
    const publicUrl = data.publicUrl;

    startTransition(async () => {
      const res = await setAvatarAction(publicUrl);
      if (res.error) setError(res.error);
      else setCurrentUrl(publicUrl);
    });
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border bg-panel">
        {currentUrl ? (
          <Image src={currentUrl} alt="" fill sizes="80px" className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-mute">
            Ingen bild
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-border bg-bg px-3 text-sm font-medium hover:bg-panel">
          {pending ? "Laddar upp…" : "Ladda upp ny bild"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onChange}
            disabled={pending}
            className="sr-only"
          />
        </label>
        <p className="text-xs text-mute">JPG/PNG/WEBP, max 5 MB</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}

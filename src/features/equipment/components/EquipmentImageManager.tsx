"use client";

import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  attachEquipmentImageAction,
  deleteEquipmentImageAction
} from "../actions";
import type { EquipmentImage } from "../queries";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

interface Props {
  equipmentId: string;
  images: EquipmentImage[];
}

export function EquipmentImageManager({ equipmentId, images }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [local, setLocal] = useState(images);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      setError("Bara JPG, PNG eller WEBP");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Max 8 MB");
      return;
    }

    const sb = createSupabaseBrowserClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${equipmentId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await sb.storage
      .from("equipment-images")
      .upload(path, file, { upsert: false, cacheControl: "3600" });
    if (upErr) {
      setError(upErr.message);
      return;
    }

    const { data } = sb.storage.from("equipment-images").getPublicUrl(path);
    const publicUrl = data.publicUrl;

    startTransition(async () => {
      const res = await attachEquipmentImageAction(equipmentId, publicUrl);
      if (res.error) {
        setError(res.error);
      } else {
        setLocal((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            url: publicUrl,
            sort_order: prev.length
          }
        ]);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {local.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-panel"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <form action={deleteEquipmentImageAction} className="absolute inset-x-2 bottom-2">
              <input type="hidden" name="image_id" value={img.id} />
              <input type="hidden" name="equipment_id" value={equipmentId} />
              <button
                type="submit"
                className="inline-flex h-9 w-full items-center justify-center rounded-md bg-bg/95 px-2 text-xs font-medium opacity-100 shadow-sm backdrop-blur transition md:opacity-0 md:group-hover:opacity-100"
                aria-label="Ta bort bild"
              >
                Ta bort
              </button>
            </form>
          </div>
        ))}

        <label className="flex aspect-[4/3] cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-panel/40 text-sm text-mute hover:bg-panel">
          {pending ? "Laddar upp…" : "+ Lägg till bild"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onUpload}
            disabled={pending}
            className="sr-only"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-mute">JPG/PNG/WEBP, max 8 MB per bild.</p>
    </div>
  );
}

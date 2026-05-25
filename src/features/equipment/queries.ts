import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EquipmentCardData } from "@/components/marketplace/EquipmentCard";

export interface EquipmentRow {
  id: string;
  owner_id: string;
  title: string;
  category: string;
  description: string | null;
  daily_rate_sek: number;
  weekly_rate_sek: number | null;
  city: string | null;
  region: string | null;
  status: "active" | "paused" | "archived";
  created_at: string;
}

export interface EquipmentImage {
  id: string;
  url: string;
  sort_order: number;
}

export interface EquipmentDetail extends EquipmentRow {
  images: EquipmentImage[];
  owner: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    city: string | null;
    region: string | null;
  };
}

export interface EquipmentFilter {
  region?: string;
  category?: string;
  city?: string;
  limit?: number;
}

export async function listMarketplaceEquipment(filter: EquipmentFilter = {}): Promise<EquipmentCardData[]> {
  const sb = await createSupabaseServerClient();
  let q = sb
    .from("equipment")
    .select(
      "id, title, category, city, region, daily_rate_sek, weekly_rate_sek, equipment_images(url, sort_order)"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(filter.limit ?? 24);

  if (filter.region) q = q.ilike("region", `%${filter.region}%`);
  if (filter.city) q = q.ilike("city", `%${filter.city}%`);
  if (filter.category) q = q.eq("category", filter.category);

  const { data, error } = await q;
  if (error || !data) return [];

  return (data as unknown as Array<EquipmentRow & { equipment_images: EquipmentImage[] }>).map(
    (row) => {
      const images = (row.equipment_images ?? []).sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      );
      return {
        id: row.id,
        title: row.title,
        category: row.category,
        city: row.city,
        region: row.region,
        daily_rate_sek: row.daily_rate_sek,
        weekly_rate_sek: row.weekly_rate_sek,
        primary_image_url: images[0]?.url ?? null
      };
    }
  );
}

export async function getEquipmentById(id: string): Promise<EquipmentDetail | null> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("equipment")
    .select(
      `id, owner_id, title, category, description, daily_rate_sek, weekly_rate_sek,
       city, region, status, created_at,
       equipment_images (id, url, sort_order),
       owner:profiles!equipment_owner_id_fkey (id, full_name, avatar_url, city, region)`
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as EquipmentRow & {
    equipment_images: EquipmentImage[];
    owner: EquipmentDetail["owner"];
  };
  const images = (row.equipment_images ?? []).sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  return { ...row, images, owner: row.owner };
}

export async function listOwnerEquipment(ownerId: string): Promise<EquipmentRow[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("equipment")
    .select(
      "id, owner_id, title, category, description, daily_rate_sek, weekly_rate_sek, city, region, status, created_at"
    )
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as unknown as EquipmentRow[];
}

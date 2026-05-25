import { z } from "zod";

export const EQUIPMENT_CATEGORIES = [
  "excavator",
  "loader",
  "crane",
  "scaffolding",
  "generator",
  "truck",
  "tool",
  "other"
] as const;

export const LISTING_STATUSES = ["active", "paused", "archived"] as const;

const intLike = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "number" ? v : v.trim()))
  .refine((v) => v === "" || !Number.isNaN(Number(v)), "Ogiltigt nummer")
  .transform((v) => (v === "" ? null : Number(v)))
  .nullable();

export const EquipmentSchema = z.object({
  title: z.string().min(2, "Titel krävs").max(200),
  category: z.enum(EQUIPMENT_CATEGORIES),
  description: z.string().max(4000).optional().or(z.literal("")),
  daily_rate_sek: intLike
    .refine((v) => v != null, "Dygnspris krävs")
    .refine((v) => v == null || v >= 0, "Måste vara 0 eller mer"),
  weekly_rate_sek: intLike.refine(
    (v) => v == null || v >= 0,
    "Måste vara 0 eller mer"
  ),
  city: z.string().max(120).optional().or(z.literal("")),
  region: z.string().max(120).optional().or(z.literal("")),
  status: z.enum(LISTING_STATUSES).default("active")
});
export type EquipmentInput = z.infer<typeof EquipmentSchema>;

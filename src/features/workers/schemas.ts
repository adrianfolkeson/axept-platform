import { z } from "zod";

const intLike = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "number" ? v : v.trim()))
  .refine((v) => v === "" || !Number.isNaN(Number(v)), "Ogiltigt nummer")
  .transform((v) => (v === "" ? null : Number(v)))
  .nullable();

export const WorkerProfileSchema = z.object({
  headline: z.string().min(2, "Rubrik krävs").max(200),
  skills: z
    .string()
    .max(2000)
    .optional()
    .transform((v) =>
      (v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  experience_years: intLike
    .transform((v) => v ?? 0)
    .refine((v) => v >= 0 && v <= 70, "0-70 år"),
  hourly_rate_sek: intLike.refine(
    (v) => v === null || (v >= 0 && v <= 100000),
    "0-100 000 SEK/h"
  ),
  available: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean(), z.null()])
    .transform((v) => v === "on" || v === "true" || v === true),
  travel_radius_km: intLike.refine(
    (v) => v === null || (v >= 0 && v <= 5000),
    "0-5000 km"
  )
});
export type WorkerProfileInput = z.infer<typeof WorkerProfileSchema>;

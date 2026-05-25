import { z } from "zod";

export const TargetTypeEnum = z.enum(["worker", "equipment"]);
export type TargetType = z.infer<typeof TargetTypeEnum>;

export const CreateRequestSchema = z
  .object({
    target_type: TargetTypeEnum,
    target_id: z.string().uuid(),
    start_date: z.string().min(1, "Startdatum krävs"),
    end_date: z.string().min(1, "Slutdatum krävs"),
    message: z.string().max(2000).optional().or(z.literal(""))
  })
  .refine((v) => new Date(v.end_date) >= new Date(v.start_date), {
    message: "Slutdatum måste vara samma eller efter startdatum",
    path: ["end_date"]
  });
export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;

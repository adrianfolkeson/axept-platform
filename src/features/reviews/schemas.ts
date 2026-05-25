import { z } from "zod";

export const ReviewSubjectEnum = z.enum(["worker", "equipment"]);
export type ReviewSubject = z.infer<typeof ReviewSubjectEnum>;

const ratingLike = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "number" ? v : Number(v)))
  .pipe(z.number().int().min(1, "Välj 1–5 stjärnor").max(5, "Välj 1–5 stjärnor"));

export const CreateReviewSchema = z.object({
  request_id: z.string().uuid(),
  subject_type: ReviewSubjectEnum,
  subject_id: z.string().uuid(),
  rating: ratingLike,
  body: z.string().max(2000).optional().or(z.literal(""))
});
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

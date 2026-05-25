import { z } from "zod";

const dateLike = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v : null))
  .nullable();

export const CertificationSchema = z.object({
  title: z.string().min(2, "Titel krävs").max(200),
  issuer: z.string().max(200).optional().or(z.literal("")),
  issued_at: dateLike,
  expires_at: dateLike,
  file_url: z.string().optional().or(z.literal("")).nullable()
});
export type CertificationInput = z.infer<typeof CertificationSchema>;

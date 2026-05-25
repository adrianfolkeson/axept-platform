import { z } from "zod";

export const CompanySchema = z.object({
  name: z.string().min(2, "Företagsnamn krävs").max(200),
  org_number: z.string().max(40).optional().or(z.literal("")),
  website: z
    .string()
    .max(300)
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^https?:\/\//.test(v),
      "Webbplats måste börja med http:// eller https://"
    ),
  description: z.string().max(4000).optional().or(z.literal("")),
  hq_city: z.string().max(120).optional().or(z.literal("")),
  hq_region: z.string().max(120).optional().or(z.literal(""))
});
export type CompanyInput = z.infer<typeof CompanySchema>;

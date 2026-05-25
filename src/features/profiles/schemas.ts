import { z } from "zod";

export const ProfileSchema = z.object({
  full_name: z.string().min(2).max(120),
  phone: z.string().max(40).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  region: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal(""))
});
export type ProfileInput = z.infer<typeof ProfileSchema>;

export const AvatarUrlSchema = z.object({
  avatar_url: z.string().url()
});

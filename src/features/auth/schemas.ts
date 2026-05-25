import { z } from "zod";

export const RoleEnum = z.enum(["company", "worker", "equipment_owner"]);
export type SignupRole = z.infer<typeof RoleEnum>;

export const SignupSchema = z.object({
  full_name: z.string().min(2, "Ange för- och efternamn").max(120),
  email: z.string().email("Ogiltig e-postadress"),
  password: z.string().min(8, "Minst 8 tecken"),
  role: RoleEnum
});
export type SignupInput = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Ogiltig e-postadress"),
  password: z.string().min(1, "Lösenord krävs")
});
export type LoginInput = z.infer<typeof LoginSchema>;

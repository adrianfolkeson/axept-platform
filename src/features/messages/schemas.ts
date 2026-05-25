import { z } from "zod";

export const SendMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  body: z.string().min(1, "Skriv ett meddelande").max(5000)
});
export type SendMessageInput = z.infer<typeof SendMessageSchema>;

import { Content } from "next/font/google";
import { z } from "zod";

export const createConversationSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
});

export type CreateConversationSchema = z.infer<typeof createConversationSchema>;

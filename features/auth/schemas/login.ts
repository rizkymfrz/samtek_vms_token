import { z } from "zod";

export const loginInputSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Enter your username or email.")
    .max(255, "Use at most 255 characters."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(1024, "Use at most 1024 characters."),
});

export type LoginInput = z.input<typeof loginInputSchema>;

import { z } from "zod";

export const loginInputSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Username or email is required.")
    .max(255, "Username or email must be at most 255 characters."),
  password: z
    .string()
    .min(1, "Password is required.")
    .max(1024, "Password must be at most 1024 characters."),
  remember: z.boolean().default(false),
});

export type LoginInput = z.input<typeof loginInputSchema>;

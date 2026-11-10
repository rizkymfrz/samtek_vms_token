import { z } from "zod";

export const loginInputSchema = z.object({
  identifier: z.string().trim().min(1).max(255),
  password: z.string().min(1).max(1024),
});

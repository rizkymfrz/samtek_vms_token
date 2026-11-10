import { z } from "zod";

export const meResponseSchema = z.object({
  data: z.object({
    id: z.coerce.string(),
    username: z.string(),
    email: z.string(),
    avatar: z.string().nullable(),
  }),
});

import { z } from "zod";

const schema = z.object({
  CENTRAL_API_URL: z.url().optional(),
  MAP_MATCHING_URL: z.url().optional(),
  EDGE_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  COOKIE_SECURE: z.stringbool().optional(),
});

export const env = schema.parse({
  CENTRAL_API_URL: process.env.CENTRAL_API_URL || undefined,
  MAP_MATCHING_URL: process.env.MAP_MATCHING_URL || undefined,
  EDGE_TIMEOUT_MS: process.env.EDGE_TIMEOUT_MS || undefined,
  COOKIE_SECURE: process.env.COOKIE_SECURE || undefined,
});

export const isSecureCookie =
  env.COOKIE_SECURE ?? process.env.NODE_ENV === "production";

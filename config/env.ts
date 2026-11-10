import { z } from "zod";

const schema = z
  .object({
    DATA_SOURCE: z.enum(["mock", "live"]).default("mock"),
    CENTRAL_API_URL: z.url().optional(),
    EDGE_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  })
  .refine((value) => value.DATA_SOURCE === "mock" || value.CENTRAL_API_URL, {
    path: ["CENTRAL_API_URL"],
    message: "CENTRAL_API_URL is required when DATA_SOURCE=live",
  });

export const env = schema.parse({
  DATA_SOURCE: process.env.DATA_SOURCE || undefined,
  CENTRAL_API_URL: process.env.CENTRAL_API_URL || undefined,
  EDGE_TIMEOUT_MS: process.env.EDGE_TIMEOUT_MS || undefined,
});

export const isLiveSource = env.DATA_SOURCE === "live";

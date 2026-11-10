import axios, { isAxiosError } from "axios";
import { z } from "zod";
import { env } from "@/config/env";
import { UnauthorizedError } from "@/lib/auth/session";

export class CentralError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

const errorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z
      .array(z.object({ field: z.string(), messages: z.array(z.string()) }))
      .optional(),
  }),
});

export const createCentralClient = (token?: string) => {
  if (!env.CENTRAL_API_URL) throw new Error("CENTRAL_API_URL is not set");
  return axios.create({
    baseURL: env.CENTRAL_API_URL,
    timeout: 10_000,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
};

export const toCentralError = (error: unknown) => {
  if (error instanceof CentralError || error instanceof UnauthorizedError) {
    return error;
  }
  if (!isAxiosError(error))
    return new CentralError("Unexpected error", 500, "UNEXPECTED");
  if (!error.response) {
    return new CentralError("Central API unreachable", 502, "UNREACHABLE");
  }
  const parsed = errorBodySchema.safeParse(error.response.data);
  if (!parsed.success) {
    return new CentralError(
      `Central API responded with ${error.response.status}`,
      error.response.status,
      "UNKNOWN",
    );
  }
  const { code, message, details } = parsed.data.error;
  if (code === "UNAUTHORIZED") return new UnauthorizedError();
  const detail = details?.[0];
  return new CentralError(
    detail ? `${detail.field}: ${detail.messages[0]}` : message,
    error.response.status,
    code,
  );
};

export const failureMessage = (reason: unknown) =>
  reason instanceof CentralError ? reason.message : "Unexpected error";

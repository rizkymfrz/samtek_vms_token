import axios, { isAxiosError } from "axios";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import {
  ENDPOINTS_COOKIE,
  hostnameOf,
  parseEndpointsCookie,
  scopeOf,
} from "@/config/endpoints";
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

export const resolveCentralUrl = async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const saved = parseEndpointsCookie(cookieStore.get(ENDPOINTS_COOKIE)?.value);
  const scope = scopeOf(hostnameOf(headerStore.get("host")));
  return saved?.[scope].centralUrl || env.CENTRAL_API_URL;
};

export const createCentralClient = (token?: string, baseURL?: string) => {
  const client = axios.create({
    baseURL,
    timeout: 10_000,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (baseURL) return client;
  client.interceptors.request.use(async (config) => {
    const resolved = await resolveCentralUrl();
    if (!resolved) {
      throw new CentralError(
        "The central API address is not set.",
        503,
        "NOT_CONFIGURED",
      );
    }
    config.baseURL = resolved;
    return config;
  });
  return client;
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

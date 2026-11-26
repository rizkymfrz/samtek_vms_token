import { z } from "zod";

export const ENDPOINTS_COOKIE = "samtek_endpoints";
const COOKIE_MAX_AGE_SECONDS = 365 * 24 * 3600;
const LOCAL_SUFFIXES = [".local", ".lan", ".internal", ".home", ".localdomain"];
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

export type EndpointScope = "local" | "cloud";

const optionalUrl = (protocol: RegExp, message: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.url({ protocol }).safeParse(value).success,
      message,
    )
    .transform((value) => value.replace(/\/+$/, ""));

const addressSchema = z.object({
  centralUrl: optionalUrl(
    /^https?$/,
    "Central API URL must start with http:// or https://.",
  ),
  mqttUrl: optionalUrl(
    /^wss?$/,
    "MQTT WebSocket URL must start with ws:// or wss://.",
  ),
  mqttUsername: z.string().trim(),
  mqttPassword: z.string(),
});

export const endpointsSchema = z.object({
  local: addressSchema,
  cloud: addressSchema,
});

export type EndpointAddress = z.output<typeof addressSchema>;
export type Endpoints = z.output<typeof endpointsSchema>;

export const EMPTY_ADDRESS: EndpointAddress = {
  centralUrl: "",
  mqttUrl: "",
  mqttUsername: "",
  mqttPassword: "",
};

export const EMPTY_ENDPOINTS: Endpoints = {
  local: EMPTY_ADDRESS,
  cloud: EMPTY_ADDRESS,
};

export const hostnameOf = (host: string | null | undefined) => {
  if (!host) return "";
  const bracketed = /^\[([^\]]+)\]/.exec(host);
  if (bracketed) return bracketed[1].toLowerCase();
  return host.split(":")[0].toLowerCase();
};

export const scopeOf = (hostname: string): EndpointScope => {
  if (!hostname.includes(".") || hostname.includes(":")) return "local";
  if (IPV4.test(hostname)) return "local";
  return LOCAL_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
    ? "local"
    : "cloud";
};

export const parseEndpointsCookie = (value: string | undefined) => {
  if (!value) return null;
  try {
    const parsed = endpointsSchema.safeParse(
      JSON.parse(decodeURIComponent(value)),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const endpointsCookieString = (endpoints: Endpoints) =>
  `${ENDPOINTS_COOKIE}=${encodeURIComponent(JSON.stringify(endpoints))}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;

export const readEndpointsCookie = () => {
  const prefix = `${ENDPOINTS_COOKIE}=`;
  const entry = document.cookie
    .split("; ")
    .find((item) => item.startsWith(prefix));
  return parseEndpointsCookie(entry?.slice(prefix.length));
};

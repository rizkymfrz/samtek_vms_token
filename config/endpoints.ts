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
});

export const endpointsSchema = z.object({
  local: addressSchema,
  cloud: addressSchema,
  isLocalManual: z.boolean().default(false),
});

export type EndpointAddress = z.output<typeof addressSchema>;
export type Endpoints = z.output<typeof endpointsSchema>;

export const EMPTY_ADDRESS: EndpointAddress = {
  centralUrl: "",
  mqttUrl: "",
};

export const EMPTY_ENDPOINTS: Endpoints = {
  local: EMPTY_ADDRESS,
  cloud: EMPTY_ADDRESS,
  isLocalManual: false,
};

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const PRODUCTION_CENTRAL_URL = "http://127.0.0.1:7200";
const DEV_API_PORT = 5000;
const DEV_MQTT_PORT = 8040;
const NGINX_MQTT_PATH = "/mqtt";

export type Where = { hostname: string; host: string; protocol: string };

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

const bracketed = (hostname: string) =>
  hostname.includes(":") ? `[${hostname}]` : hostname;

export const localCentralUrl = (
  hostname: string,
  installed: string | undefined,
) =>
  IS_PRODUCTION
    ? installed || PRODUCTION_CENTRAL_URL
    : `http://${bracketed(hostname)}:${DEV_API_PORT}`;

const isProxiedMqtt = (url: string) =>
  URL.canParse(url) &&
  new URL(url).pathname.replace(/\/+$/, "") === NGINX_MQTT_PATH;

export const localAddress = (
  where: Where,
  installedMqtt: string | undefined,
): EndpointAddress => {
  if (!IS_PRODUCTION) {
    const host = bracketed(where.hostname);
    return {
      centralUrl: `http://${host}:${DEV_API_PORT}`,
      mqttUrl: `ws://${host}:${DEV_MQTT_PORT}`,
    };
  }
  const scheme = where.protocol === "https:" ? "wss" : "ws";
  const mqttUrl =
    installedMqtt && isProxiedMqtt(installedMqtt)
      ? `${scheme}://${where.host}${NGINX_MQTT_PATH}`
      : (installedMqtt ?? "");
  return { centralUrl: "", mqttUrl };
};

export const withLocalAddress = (
  endpoints: Endpoints,
  derived: EndpointAddress,
): Endpoints => {
  if (endpoints.isLocalManual) return endpoints;
  const { local } = endpoints;
  if (
    local.centralUrl === derived.centralUrl &&
    local.mqttUrl === derived.mqttUrl
  ) {
    return endpoints;
  }
  return { ...endpoints, local: derived };
};

export const isManualLocal = (
  local: EndpointAddress,
  derived: EndpointAddress,
) =>
  (local.centralUrl !== "" && local.centralUrl !== derived.centralUrl) ||
  (local.mqttUrl !== "" && local.mqttUrl !== derived.mqttUrl);

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

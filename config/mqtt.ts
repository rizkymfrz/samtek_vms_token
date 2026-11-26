import { z } from "zod";
import {
  hostnameOf,
  localAddress,
  readEndpointsCookie,
  scopeOf,
} from "./endpoints";

const schema = z.object({
  url: z.url({ protocol: /^wss?$/ }),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
});

const credentials = () => ({
  username: process.env.NEXT_PUBLIC_MQTT_USERNAME || undefined,
  password: process.env.NEXT_PUBLIC_MQTT_PASSWORD || undefined,
});

const fromEnv = () => {
  const url = process.env.NEXT_PUBLIC_MQTT_WS_URL;
  if (!url) return null;
  return schema.parse({ url, ...credentials() });
};

const fromBrowser = () => {
  if (typeof document === "undefined") return null;
  const hostname = hostnameOf(window.location.hostname);
  const scope = scopeOf(hostname);
  const saved = readEndpointsCookie()?.[scope].mqttUrl;
  const derived =
    scope === "local"
      ? localAddress(
          { ...window.location, hostname },
          process.env.NEXT_PUBLIC_MQTT_WS_URL,
        ).mqttUrl
      : "";
  const url = saved || derived;
  return url ? schema.parse({ url, ...credentials() }) : null;
};

export const mqttConfig = fromBrowser() ?? fromEnv();
export const EDGE_UP_TOPIC = "samtek/v1/+/up";
export const edgeDownTopic = (edgeId: string) => `samtek/v1/${edgeId}/down`;

import { z } from "zod";
import { hostnameOf, readEndpointsCookie, scopeOf } from "./endpoints";

const schema = z.object({
  url: z.url({ protocol: /^wss?$/ }),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
});

const fromEnv = () => {
  const url = process.env.NEXT_PUBLIC_MQTT_WS_URL;
  if (!url) return null;
  return schema.parse({
    url,
    username: process.env.NEXT_PUBLIC_MQTT_USERNAME || undefined,
    password: process.env.NEXT_PUBLIC_MQTT_PASSWORD || undefined,
  });
};

const fromSettings = () => {
  if (typeof document === "undefined") return null;
  const saved = readEndpointsCookie();
  if (!saved) return null;
  const address = saved[scopeOf(hostnameOf(window.location.hostname))];
  if (!address.mqttUrl) return null;
  return schema.parse({
    url: address.mqttUrl,
    username: address.mqttUsername || undefined,
    password: address.mqttPassword || undefined,
  });
};

export const mqttConfig = fromSettings() ?? fromEnv();
export const EDGE_UP_TOPIC = "samtek/v1/+/up";
export const edgeDownTopic = (edgeId: string) => `samtek/v1/${edgeId}/down`;

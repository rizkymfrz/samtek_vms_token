import { z } from "zod";

const schema = z.object({
  url: z.url({ protocol: /^wss?$/ }),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
});

const parse = () => {
  const url = process.env.NEXT_PUBLIC_MQTT_WS_URL;
  if (!url) return null;
  return schema.parse({
    url,
    username: process.env.NEXT_PUBLIC_MQTT_USERNAME || undefined,
    password: process.env.NEXT_PUBLIC_MQTT_PASSWORD || undefined,
  });
};

export const mqttConfig = parse();
export const EDGE_UP_TOPIC = "samtek/v1/+/up";

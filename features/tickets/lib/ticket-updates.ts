import type { MqttClient } from "mqtt";
import { mqttConfig } from "@/config/mqtt";
import { connectMqtt } from "@/lib/mqtt/browser-client";
import { ticketUpdatedMessageSchema } from "../schemas/ticket";

export const TICKETS_TOPIC = "samtek/v1/tickets/+";

type Listener = () => void;

const listeners = new Set<Listener>();

let client: MqttClient | null = null;

const notify = () => {
  for (const listener of listeners) listener();
};

const receive = (_topic: string, payload: Uint8Array) => {
  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder().decode(payload));
  } catch {
    return;
  }
  const message = ticketUpdatedMessageSchema.safeParse(json);
  if (!message.success) return;
  notify();
};

const start = () => {
  client = connectMqtt();
  let hasConnected = false;
  client?.on("connect", () => {
    client?.subscribe(TICKETS_TOPIC, { qos: 1 });
    if (hasConnected) notify();
    hasConnected = true;
  });
  client?.on("message", receive);
  client?.on("error", (error) =>
    console.error("[tickets] broker error:", error.message),
  );
};

const stop = () => {
  client?.end(true);
  client = null;
};

export const hasTicketUpdates = mqttConfig !== null;

export const subscribeTicketUpdates = (listener: Listener) => {
  listeners.add(listener);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
};

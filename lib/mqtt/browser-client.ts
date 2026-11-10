import mqtt, { type MqttClient } from "mqtt";
import { mqttConfig } from "@/config/mqtt";

const RECONNECT_MS = 2000;

export const connectMqtt = (): MqttClient | null => {
  if (!mqttConfig) return null;
  return mqtt.connect(mqttConfig.url, {
    username: mqttConfig.username,
    password: mqttConfig.password,
    clientId: `samtek-vms-${Math.random().toString(16).slice(2, 10)}`,
    reconnectPeriod: RECONNECT_MS,
    clean: true,
  });
};

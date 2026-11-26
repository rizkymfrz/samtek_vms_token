import {
  type EndpointAddress,
  hostnameOf,
  localAddress,
} from "@/config/endpoints";

export const browserLocalAddress = (): EndpointAddress =>
  localAddress(
    { ...window.location, hostname: hostnameOf(window.location.hostname) },
    process.env.NEXT_PUBLIC_MQTT_WS_URL,
  );

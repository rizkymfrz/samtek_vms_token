export type DeviceState =
  "live" | "disabled" | "server-offline" | "stream-offline";

export const DEVICE_STATE_LABEL: Record<DeviceState, string> = {
  live: "Live",
  disabled: "Disabled",
  "server-offline": "Server offline",
  "stream-offline": "Stream offline",
};

export const deviceDot = (state: DeviceState) =>
  state === "live" ? "live" : "offline";

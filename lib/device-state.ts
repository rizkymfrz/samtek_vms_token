export type DeviceState =
  | "live"
  | "disabled"
  | "server-disabled"
  | "server-offline"
  | "stream-offline"
  | "device-error";

export type DeviceFault = "stream" | "device" | "partial";

export const DEVICE_STATE_LABEL: Record<DeviceState, string> = {
  live: "Live",
  disabled: "Disabled",
  "server-disabled": "Edge server disabled",
  "server-offline": "Server offline",
  "stream-offline": "Stream unavailable",
  "device-error": "Camera error",
};

export const deviceDot = (state: DeviceState) =>
  state === "live" ? "live" : "offline";

export const isServerDown = (state: DeviceState) =>
  state === "server-offline" || state === "server-disabled";

export const deviceStateOf = ({
  isEnabled = true,
  isServerActive = true,
  isServerOnline,
  fault,
}: {
  isEnabled?: boolean;
  isServerActive?: boolean;
  isServerOnline: boolean;
  fault?: DeviceFault | null;
}): DeviceState => {
  if (!isEnabled) return "disabled";
  if (!isServerActive) return "server-disabled";
  if (!isServerOnline) return "server-offline";
  if (fault === "stream") return "stream-offline";
  if (fault === "device") return "device-error";
  return "live";
};

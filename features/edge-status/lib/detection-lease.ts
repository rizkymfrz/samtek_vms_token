import { edgeDownTopic } from "@/config/mqtt";
import { sendEdgeCommand } from "./edge-status-store";

const LEASE_SECONDS = 15;
const RENEW_MS = 5000;
const MAX_FPS = 25;

const leases = new Map<
  string,
  { count: number; timer: number; isFailing: boolean }
>();

const subscribe = (edgeId: string, deviceId: string, key: string) =>
  sendEdgeCommand(edgeDownTopic(edgeId), "bbox.subscribe", {
    device_id: deviceId,
    lease_seconds: LEASE_SECONDS,
    max_fps: MAX_FPS,
  }).then(
    () => {
      const lease = leases.get(key);
      if (lease) lease.isFailing = false;
    },
    (error: Error) => {
      const lease = leases.get(key);
      if (!lease || lease.isFailing) return;
      lease.isFailing = true;
      console.warn(`[detections] ${key}: ${error.message}`);
    },
  );

export const acquireDetectionLease = (edgeId: string, deviceId: string) => {
  const key = `${edgeId}/${deviceId}`;
  const lease = leases.get(key);
  if (lease) lease.count += 1;
  else {
    leases.set(key, {
      count: 1,
      timer: window.setInterval(
        () => void subscribe(edgeId, deviceId, key),
        RENEW_MS,
      ),
      isFailing: false,
    });
    void subscribe(edgeId, deviceId, key);
  }
  return () => {
    const current = leases.get(key);
    if (!current) return;
    current.count -= 1;
    if (current.count > 0) return;
    clearInterval(current.timer);
    leases.delete(key);
    sendEdgeCommand(edgeDownTopic(edgeId), "bbox.unsubscribe", {
      device_id: deviceId,
    }).catch(() => {});
  };
};

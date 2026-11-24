import { edgeDownTopic } from "@/config/mqtt";
import { sendEdgeCommand } from "./edge-status-store";

export type ScanRequest = {
  scanId: string;
  ipRange: string;
  ports: number[];
  credentials: { credentialId: string; username: string; password: string }[];
};

export const startDeviceScan = (
  edgeId: string,
  { scanId, ipRange, ports, credentials }: ScanRequest,
) =>
  sendEdgeCommand(edgeDownTopic(edgeId), "device.scan", {
    scan_id: scanId,
    ip_range: ipRange,
    ports,
    ws_discovery: true,
    credentials: credentials.map((c) => ({
      credential_id: c.credentialId,
      username: c.username,
      password: c.password,
    })),
  });

export const stopDeviceScan = (edgeId: string, scanId: string) =>
  sendEdgeCommand(edgeDownTopic(edgeId), "device.scan_stop", {
    scan_id: scanId,
  });

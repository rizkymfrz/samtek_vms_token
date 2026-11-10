export type DeviceStatus = "online" | "offline";

export const CAMERAS: { id: string; name: string; status: DeviceStatus }[] = [
  { id: "cam-01", name: "Lobby Entrance", status: "online" },
  { id: "cam-02", name: "Parking Lot A", status: "online" },
  { id: "cam-03", name: "Parking Lot B", status: "offline" },
  { id: "cam-04", name: "Warehouse Gate", status: "online" },
  { id: "cam-05", name: "Server Room", status: "online" },
  { id: "cam-06", name: "Back Alley", status: "offline" },
];

export const SERVERS: { id: string; name: string; status: DeviceStatus }[] = [
  { id: "srv-01", name: "Recording Server 1", status: "online" },
  { id: "srv-02", name: "Recording Server 2", status: "online" },
  { id: "srv-03", name: "Analytics Server", status: "online" },
];

export const ALERTS: {
  id: string;
  title: string;
  source: string;
  time: string;
  severity: "critical" | "info";
  read: boolean;
}[] = [
  {
    id: "a1",
    title: "Camera offline",
    source: "Parking Lot B",
    time: "2m ago",
    severity: "critical",
    read: false,
  },
  {
    id: "a2",
    title: "Motion detected",
    source: "Warehouse Gate",
    time: "14m ago",
    severity: "info",
    read: false,
  },
  {
    id: "a3",
    title: "Camera offline",
    source: "Back Alley",
    time: "1h ago",
    severity: "critical",
    read: false,
  },
  {
    id: "a4",
    title: "Storage at 85%",
    source: "Recording Server 1",
    time: "3h ago",
    severity: "info",
    read: true,
  },
];

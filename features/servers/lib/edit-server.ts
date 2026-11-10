import type { Discovered, ServerRecord } from "../types";

export type Draft = {
  name: string;
  code: string;
  description: string;
  groupId: string | null;
  hostAddress: string;
  localHostAddress: string;
  webrtcUrl: string;
  webrtcUrlLocal: string;
  macAddress: string;
  isActive: boolean;
};

export type Errors = Partial<
  Record<
    | "name"
    | "code"
    | "hostAddress"
    | "localHostAddress"
    | "webrtcUrl"
    | "webrtcUrlLocal"
    | "macAddress",
    string
  >
>;

export const emptyDraft = (): Draft => ({
  name: "",
  code: "",
  description: "",
  groupId: null,
  hostAddress: "",
  localHostAddress: "",
  webrtcUrl: "",
  webrtcUrlLocal: "",
  macAddress: "",
  isActive: true,
});

export const toDraft = (server: ServerRecord): Draft => ({
  name: server.name,
  code: server.code,
  description: server.description ?? "",
  groupId: server.groupId,
  hostAddress: server.hostAddress ?? "",
  localHostAddress: server.localHostAddress ?? "",
  webrtcUrl: server.webrtcUrl ?? "",
  webrtcUrlLocal: server.webrtcUrlLocal ?? "",
  macAddress: server.macAddress ?? "",
  isActive: server.isActive,
});

const HOST = /^[A-Za-z0-9.-]+(:\d{1,5})?$/;
const HTTP_URL = /^https?:\/\/\S+$/i;
const MAC = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;

export const validate = (
  draft: Draft,
  servers: ServerRecord[],
  editingId: string | null,
): Errors => {
  const errors: Errors = {};
  const name = draft.name.trim();
  const code = draft.code.trim();
  if (!name) errors.name = "Name is required.";
  else if (name.length > 100)
    errors.name = "Name can be at most 100 characters.";
  if (!code) errors.code = "Code is required.";
  else if (code.length > 100)
    errors.code = "Code can be at most 100 characters.";
  else if (!/^[a-z0-9][a-z0-9-]*$/.test(code))
    errors.code = "Use lowercase letters, numbers and dashes.";
  else if (servers.some((s) => s.id !== editingId && s.code === code))
    errors.code = "Another server already uses this code.";
  for (const field of ["hostAddress", "localHostAddress"] as const) {
    const value = draft[field].trim();
    if (value && (value.length > 255 || !HOST.test(value)))
      errors[field] = "Use a host name or IP, optionally with :port.";
  }
  for (const field of ["webrtcUrl", "webrtcUrlLocal"] as const) {
    const value = draft[field].trim();
    if (value && (value.length > 2048 || !HTTP_URL.test(value)))
      errors[field] = "Use an http:// or https:// address.";
  }
  if (draft.macAddress.trim() && !MAC.test(draft.macAddress.trim()))
    errors.macAddress = "Use the form 00:1A:2B:3C:4D:5E.";
  return errors;
};

const orNull = (value: string) => value.trim() || null;

export const saveServer = (
  servers: ServerRecord[],
  draft: Draft,
  editingId: string | null,
): ServerRecord[] => {
  if (editingId === null) {
    const id = String(
      Math.max(0, ...servers.map((s) => Number(s.id) || 0)) + 1,
    );
    return [
      ...servers,
      {
        id,
        groupId: draft.groupId,
        name: draft.name.trim(),
        code: draft.code.trim(),
        description: orNull(draft.description),
        hostAddress: orNull(draft.hostAddress),
        localHostAddress: orNull(draft.localHostAddress),
        webrtcUrl: orNull(draft.webrtcUrl),
        webrtcUrlLocal: orNull(draft.webrtcUrlLocal),
        macAddress: orNull(draft.macAddress),
        isActive: draft.isActive,
        lastSeenAt: null,
        vendor: "Custom",
        cameraCount: 0,
      },
    ];
  }
  return servers.map((s) =>
    s.id !== editingId
      ? s
      : {
          ...s,
          groupId: draft.groupId,
          name: draft.name.trim(),
          code: draft.code.trim(),
          description: orNull(draft.description),
          hostAddress: orNull(draft.hostAddress),
          localHostAddress: orNull(draft.localHostAddress),
          webrtcUrl: orNull(draft.webrtcUrl),
          webrtcUrlLocal: orNull(draft.webrtcUrlLocal),
          macAddress: orNull(draft.macAddress),
          isActive: draft.isActive,
        },
  );
};

export const canDelete = (server: ServerRecord) => server.cameraCount === 0;

export const removeServer = (servers: ServerRecord[], id: string) =>
  servers.filter((s) => s.id !== id);

export const registerDiscovered = (
  servers: ServerRecord[],
  discovered: Discovered[],
  discoveredId: string,
  now: number,
): {
  servers: ServerRecord[];
  discovered: Discovered[];
  serverId: string | null;
} => {
  const found = discovered.find((d) => d.id === discoveredId);
  if (!found || found.registeredServerId)
    return { servers, discovered, serverId: null };
  const serverId = String(
    Math.max(0, ...servers.map((s) => Number(s.id) || 0)) + 1,
  );
  const taken = new Set(servers.map((s) => s.code));
  const code = taken.has(found.id) ? `${found.id}-${serverId}` : found.id;
  return {
    serverId,
    servers: [
      ...servers,
      {
        id: serverId,
        groupId: null,
        name: found.id,
        code,
        description: null,
        hostAddress: `${found.ip}:443`,
        localHostAddress: null,
        webrtcUrl: null,
        webrtcUrlLocal: null,
        macAddress: null,
        isActive: true,
        lastSeenAt: now,
        vendor: found.vendor,
        cameraCount: 0,
      },
    ],
    discovered: discovered.map((d) =>
      d.id === discoveredId ? { ...d, registeredServerId: serverId } : d,
    ),
  };
};

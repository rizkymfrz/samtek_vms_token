import { z } from "zod";
import { requiredText } from "@/lib/forms/required-text";
import type { Discovered, ServerRecord } from "../types";

export type Draft = {
  name: string;
  description: string;
  groupId: string | null;
  hostAddress: string;
  localHostAddress: string;
  webrtcUrl: string;
  webrtcUrlLocal: string;
  macAddress: string;
  isActive: boolean;
};

export const emptyDraft = (): Draft => ({
  name: "",
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
const HOST_MESSAGE = "Use a host name or IP, optionally with :port.";
const URL_MESSAGE = "Use an http:// or https:// address.";

const optionalHost = z.string().refine((value) => {
  const text = value.trim();
  return !text || (text.length <= 255 && HOST.test(text));
}, HOST_MESSAGE);

const optionalUrl = z.string().refine((value) => {
  const text = value.trim();
  return !text || (text.length <= 2048 && HTTP_URL.test(text));
}, URL_MESSAGE);

export const serverDraftSchema = z.object({
  name: requiredText("Name", 100),
  description: z.string(),
  groupId: z.string().nullable(),
  hostAddress: optionalHost,
  localHostAddress: optionalHost,
  webrtcUrl: optionalUrl,
  webrtcUrlLocal: optionalUrl,
  macAddress: z
    .string()
    .refine(
      (value) => !value.trim() || MAC.test(value.trim()),
      "Use the form 00:1A:2B:3C:4D:5E.",
    ),
  isActive: z.boolean(),
});

const orNull = (value: string) => value.trim() || null;

export const topicsFor = (code: string) => ({
  mqttPublishTopic: `samtek/v1/${code.trim()}/down`,
  mqttSubscribeTopic: `samtek/v1/${code.trim()}/up`,
});

export const toCreatePayload = (draft: Draft) => ({
  name: draft.name.trim(),
  description: orNull(draft.description) ?? undefined,
  groupId: draft.groupId ?? undefined,
  hostAddress: orNull(draft.hostAddress) ?? undefined,
  localHostAddress: orNull(draft.localHostAddress) ?? undefined,
  webrtcUrl: orNull(draft.webrtcUrl) ?? undefined,
  webrtcUrlLocal: orNull(draft.webrtcUrlLocal) ?? undefined,
  macAddress: orNull(draft.macAddress) ?? undefined,
  isActive: draft.isActive,
});

const changedText = (draft: string, original: string | null) =>
  draft.trim() !== (original ?? "") ? orNull(draft) : undefined;

export const toUpdatePayload = (draft: Draft, original: ServerRecord) => ({
  name: draft.name.trim() !== original.name ? draft.name.trim() : undefined,
  description: changedText(draft.description, original.description),
  groupId: draft.groupId !== original.groupId ? draft.groupId : undefined,
  hostAddress: changedText(draft.hostAddress, original.hostAddress),
  localHostAddress: changedText(
    draft.localHostAddress,
    original.localHostAddress,
  ),
  webrtcUrl: changedText(draft.webrtcUrl, original.webrtcUrl),
  webrtcUrlLocal: changedText(draft.webrtcUrlLocal, original.webrtcUrlLocal),
  macAddress: changedText(draft.macAddress, original.macAddress),
  isActive: draft.isActive !== original.isActive ? draft.isActive : undefined,
});

const nextId = (servers: ServerRecord[]) =>
  Math.max(0, ...servers.map((s) => Number(s.id) || 0)) + 1;

const codeFor = (id: number) => `srv-${String(id).padStart(3, "0")}`;

export const saveServer = (
  servers: ServerRecord[],
  draft: Draft,
  editingId: string | null,
): ServerRecord[] => {
  if (editingId === null) {
    const next = nextId(servers);
    const id = String(next);
    const code = codeFor(next);
    return [
      ...servers,
      {
        id,
        groupId: draft.groupId,
        name: draft.name.trim(),
        code,
        description: orNull(draft.description),
        hostAddress: orNull(draft.hostAddress),
        localHostAddress: orNull(draft.localHostAddress),
        webrtcUrl: orNull(draft.webrtcUrl),
        webrtcUrlLocal: orNull(draft.webrtcUrlLocal),
        macAddress: orNull(draft.macAddress),
        ...topicsFor(code),
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
  const next = nextId(servers);
  const serverId = String(next);
  const taken = new Set(servers.map((s) => s.code));
  const code = taken.has(found.id) ? codeFor(next) : found.id;
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
        ...topicsFor(code),
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

import { z } from "zod";
import { requiredText } from "@/lib/forms/required-text";
import type { SpeakerRecord } from "../types";

export type Draft = {
  serverId: string | null;
  name: string;
  host: string;
  port: string;
  username: string;
  password: string;
  timeoutSeconds: string;
  volume: string;
  isEnabled: boolean;
};

export const emptyDraft = (): Draft => ({
  serverId: null,
  name: "",
  host: "",
  port: "5060",
  username: "",
  password: "",
  timeoutSeconds: "5",
  volume: "80",
  isEnabled: true,
});

export const toDraft = (speaker: SpeakerRecord): Draft => ({
  serverId: speaker.edgeServerId,
  name: speaker.name,
  host: speaker.host,
  port: String(speaker.port),
  username: speaker.username ?? "",
  password: "",
  timeoutSeconds: String(speaker.timeoutSeconds),
  volume: String(speaker.volume),
  isEnabled: speaker.isEnabled,
});

const IPV4 =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

const whole = (label: string, min: number, max: number) =>
  z
    .string()
    .refine(
      (value) => /^\d+$/.test(value.trim()),
      `${label} must be a whole number.`,
    )
    .refine(
      (value) => Number(value) >= min && Number(value) <= max,
      `${label} must be between ${min} and ${max}.`,
    );

export const speakerDraftSchema = (editing: boolean) =>
  z.object({
    serverId: z
      .string()
      .nullable()
      .refine((value) => editing || value !== null, "Edge server is required."),
    name: requiredText("Speaker name", 100),
    host: z
      .string()
      .refine((value) => value.trim() !== "", "Address is required.")
      .refine(
        (value) => IPV4.test(value.trim()),
        "Enter an IPv4 address, e.g. 192.168.77.40.",
      ),
    port: whole("Port", 1, 65535),
    username: z
      .string()
      .refine(
        (value) => value.trim().length <= 100,
        "Username can be at most 100 characters.",
      ),
    password: z
      .string()
      .refine(
        (value) => value.length <= 255,
        "Password can be at most 255 characters.",
      ),
    timeoutSeconds: z
      .string()
      .refine(
        (value) => /^\d+(\.\d)?$/.test(value.trim()),
        "Timeout must have at most one decimal.",
      )
      .refine(
        (value) => Number(value) >= 0.1 && Number(value) <= 60,
        "Timeout must be between 0.1 and 60 seconds.",
      ),
    volume: whole("Volume", 0, 100),
    isEnabled: z.boolean(),
  });

export const toCreatePayload = (draft: Draft) => ({
  name: draft.name.trim(),
  host: draft.host.trim(),
  port: Number(draft.port),
  username: draft.username.trim() || undefined,
  password: draft.password || undefined,
  timeoutSeconds: Number(draft.timeoutSeconds),
  volume: Number(draft.volume),
  isEnabled: draft.isEnabled,
});

export const toUpdatePayload = (draft: Draft, original: SpeakerRecord) => {
  const username = draft.username.trim() || null;
  return {
    name: draft.name.trim() !== original.name ? draft.name.trim() : undefined,
    host: draft.host.trim() !== original.host ? draft.host.trim() : undefined,
    port: Number(draft.port) !== original.port ? Number(draft.port) : undefined,
    username: username !== original.username ? username : undefined,
    password: draft.password ? draft.password : undefined,
    timeoutSeconds:
      Number(draft.timeoutSeconds) !== original.timeoutSeconds
        ? Number(draft.timeoutSeconds)
        : undefined,
    volume:
      Number(draft.volume) !== original.volume
        ? Number(draft.volume)
        : undefined,
    isEnabled:
      draft.isEnabled !== original.isEnabled ? draft.isEnabled : undefined,
  };
};

export const hasChanges = (payload: Record<string, unknown>) =>
  Object.values(payload).some((value) => value !== undefined);

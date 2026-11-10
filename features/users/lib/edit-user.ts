import { z } from "zod";
import { requiredText } from "@/lib/forms/required-text";
import type { UserRecord } from "../types";

export type Draft = {
  username: string;
  email: string;
  whatsapp: string;
  password: string;
  isActive: boolean;
  platformRoleId: string | null;
};

export const emptyDraft = (): Draft => ({
  username: "",
  email: "",
  whatsapp: "",
  password: "",
  isActive: true,
  platformRoleId: null,
});

export const toDraft = (user: UserRecord): Draft => ({
  username: user.username,
  email: user.email,
  whatsapp: user.whatsapp ?? "",
  password: "",
  isActive: user.isActive,
  platformRoleId: user.platformRoleId,
});

const USERNAME = /^[A-Za-z0-9._-]+$/;
const WHATSAPP = /^\+?\d{8,15}$/;

export const userDraftSchema = (
  users: UserRecord[],
  editingId: string | null,
) =>
  z.object({
    username: requiredText("Username", 100)
      .refine(
        (value) => editingId !== null || value.trim().length >= 3,
        "Username needs at least 3 characters.",
      )
      .refine(
        (value) => USERNAME.test(value.trim()),
        'Use letters, digits, ".", "_" and "-".',
      )
      .refine(
        (value) =>
          editingId !== null ||
          !users.some(
            (user) =>
              user.username.toLowerCase() === value.trim().toLowerCase(),
          ),
        "This username is already taken.",
      ),
    email: requiredText("Email", 255)
      .refine(
        (value) => z.email().safeParse(value.trim()).success,
        "Enter a valid email address.",
      )
      .refine(
        (value) =>
          !users.some(
            (user) =>
              user.id !== editingId &&
              user.email.toLowerCase() === value.trim().toLowerCase(),
          ),
        "This email is already registered.",
      ),
    whatsapp: z
      .string()
      .refine(
        (value) => !value.trim() || WHATSAPP.test(value.trim()),
        'Use 8-15 digits, optionally starting with "+".',
      ),
    password: z
      .string()
      .refine(
        (value) => editingId !== null || value.length >= 8,
        "Password needs at least 8 characters.",
      )
      .refine(
        (value) => value.length <= 128,
        "Password can be at most 128 characters.",
      ),
    isActive: z.boolean(),
    platformRoleId: z.string().nullable(),
  });

const orNull = (value: string) => value.trim() || null;

export const toCreatePayload = (draft: Draft) => ({
  username: draft.username.trim(),
  email: draft.email.trim(),
  whatsapp: orNull(draft.whatsapp) ?? undefined,
  password: draft.password,
  isActive: draft.isActive,
});

export const toUpdatePayload = (draft: Draft, original: UserRecord) => ({
  email: draft.email.trim() !== original.email ? draft.email.trim() : undefined,
  whatsapp:
    draft.whatsapp.trim() !== (original.whatsapp ?? "")
      ? orNull(draft.whatsapp)
      : undefined,
  isActive: draft.isActive !== original.isActive ? draft.isActive : undefined,
});

export const hasChanges = (payload: Record<string, unknown>) =>
  Object.values(payload).some((value) => value !== undefined);

export const saveUserLocally = (
  users: UserRecord[],
  draft: Draft,
  editingId: string | null,
): UserRecord[] => {
  if (editingId === null) {
    const id = String(Math.max(0, ...users.map((u) => Number(u.id) || 0)) + 1);
    return [
      ...users,
      {
        id,
        username: draft.username.trim(),
        email: draft.email.trim(),
        whatsapp: orNull(draft.whatsapp),
        avatar: null,
        platformRoleId: draft.platformRoleId,
        isActive: draft.isActive,
        createdAt: new Date().toISOString(),
      },
    ];
  }
  return users.map((user) =>
    user.id === editingId
      ? {
          ...user,
          email: draft.email.trim(),
          whatsapp: orNull(draft.whatsapp),
          isActive: draft.isActive,
          platformRoleId: draft.platformRoleId,
        }
      : user,
  );
};

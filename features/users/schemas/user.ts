import { z } from "zod";

export const userSchema = z.object({
  id: z.coerce.string(),
  username: z.string(),
  email: z.string(),
  whatsapp: z.string().nullable(),
  avatar: z.string().nullable(),
  platformRoleId: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
});

export const roleSchema = z.object({
  id: z.coerce.string(),
  name: z.string(),
});

export const userIdResponseSchema = z.object({
  data: z.object({ id: z.coerce.string() }),
});

export const createUserInputSchema = z.object({
  username: z.string(),
  email: z.string(),
  whatsapp: z.string().optional(),
  password: z.string(),
  isActive: z.boolean().optional(),
});

export const updateUserInputSchema = z.strictObject({
  email: z.string().optional(),
  whatsapp: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const assignRoleInputSchema = z.strictObject({
  roleId: z.string().nullable(),
});

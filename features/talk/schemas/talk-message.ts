import { z } from "zod";

const id = z.string().regex(/^[A-Za-z0-9._-]{1,64}$/);

export const talkStateSchema = z
  .object({
    type: z.literal("talk.state"),
    id: z.string().min(1),
    data: z.object({
      device_id: id,
      session_id: id,
      state: z.enum(["active", "ended"]),
      reason: z
        .enum(["stopped", "replaced", "idle", "failed", "device_removed"])
        .optional(),
      detail: z.string().optional(),
    }),
  })
  .refine(
    ({ data }) => (data.state === "ended") === (data.reason !== undefined),
    { message: "reason is required exactly when state is ended" },
  );

export const talkAudioSchema = z.object({
  type: z.literal("talk.audio"),
  data: z.object({
    device_id: id,
    session_id: id,
    seq: z.number().int().min(0).max(2_147_483_647),
    audio: z.string().min(4).max(42_668),
  }),
});

export const talkResultSchema = z.object({
  device_id: id,
  session_id: id,
  state: z.enum(["connecting", "active"]),
});

export type TalkStateMessage = z.output<typeof talkStateSchema>;
export type TalkAudioMessage = z.output<typeof talkAudioSchema>;

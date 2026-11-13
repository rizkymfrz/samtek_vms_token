import { z } from "zod";

export const edgeRecognitionsResponseSchema = z.object({
  recognitions: z.array(
    z.object({
      event_id: z.string(),
      device_id: z.string(),
      recognizer: z.string(),
      kind: z.string().optional(),
      occurred_at: z.iso.datetime(),
      object: z
        .object({ label: z.string(), confidence: z.number() })
        .optional(),
      result: z.record(z.string(), z.unknown()).default({}),
      crop_path: z.string().optional(),
    }),
  ),
});

export const edgeFaceReferencesSchema = z.object({
  faces: z.array(
    z.object({
      face_id: z.string(),
      person_id: z.string(),
      has_photo: z.boolean().default(false),
    }),
  ),
});

export type EdgeRecognition = z.output<
  typeof edgeRecognitionsResponseSchema
>["recognitions"][number];

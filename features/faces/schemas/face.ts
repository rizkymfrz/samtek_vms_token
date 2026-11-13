import { z } from "zod";

export const edgeFacesResponseSchema = z.object({
  faces: z.array(
    z.object({
      face_id: z.string(),
      person_id: z.string(),
      name: z.string(),
      group: z.string(),
      has_photo: z.boolean().default(false),
    }),
  ),
});

export const edgeFaceCreatedSchema = z.object({
  face: z.object({ face_id: z.string(), person_id: z.string() }),
});

export const NAME_MAX = 128;
export const GROUP_MAX = 64;
export const PERSON_ID = /^[A-Za-z0-9._-]{1,64}$/;
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024;

export const enrollFieldsSchema = z.object({
  name: z.string().trim().min(1).max(NAME_MAX),
  group: z.string().trim().max(GROUP_MAX),
  personId: z.string().regex(PERSON_ID).or(z.literal("")),
});

import { z } from "zod";

const coordinates = {
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null),
};

export const mapGroupSchema = z.object({
  id: z.coerce.string(),
  name: z.string(),
  ...coordinates,
});

export const mapServerSchema = z.object({
  id: z.coerce.string(),
  name: z.string(),
  groupId: z.coerce.string().nullable().default(null),
  isActive: z.boolean(),
  webrtcUrl: z.string().nullable().default(null),
  webrtcUrlLocal: z.string().nullable().default(null),
  lastSeenAt: z.iso.datetime().nullable().default(null),
  ...coordinates,
});

export const mapDeviceSchema = z.object({
  id: z.coerce.string(),
  name: z.string(),
  edgeServerId: z.coerce.string(),
  isEnabled: z.boolean(),
  sourceSub: z.string().nullable().default(null),
  ...coordinates,
});

const id = z.string().regex(/^[0-9]+$/);

export const locationInputSchema = z
  .object({
    type: z.enum(["group", "server", "device"]),
    id,
    edgeServerId: id.optional(),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
  })
  .refine((value) => (value.latitude === null) === (value.longitude === null), {
    message: "Latitude and longitude go together",
  })
  .refine((value) => value.type !== "device" || value.edgeServerId, {
    message: "A device needs its edge server",
  });

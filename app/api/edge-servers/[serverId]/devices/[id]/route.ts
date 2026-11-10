import { isLiveSource } from "@/config/env";
import {
  deviceResponseSchema,
  updateDeviceInputSchema,
} from "@/features/cameras/schemas/device";
import {
  callCentral,
  errorResponse,
  ID_PATTERN,
} from "@/lib/api/central-proxy";

type Context = { params: Promise<{ serverId: string; id: string }> };

const resolve = async ({ params }: Context) => {
  const { serverId, id } = await params;
  if (!isLiveSource || !ID_PATTERN.test(serverId) || !ID_PATTERN.test(id)) {
    return null;
  }
  return `/v1/edge-servers/${serverId}/devices/${id}`;
};

export const PATCH = async (request: Request, context: Context) => {
  const path = await resolve(context);
  if (!path) return new Response(null, { status: 404 });
  const body = updateDeviceInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid camera data" }, { status: 400 });
  }
  try {
    const data = await callCentral("patch", path, body.data);
    return Response.json(deviceResponseSchema.parse(data).data);
  } catch (error) {
    return errorResponse(error, "api/devices update");
  }
};

export const DELETE = async (_request: Request, context: Context) => {
  const path = await resolve(context);
  if (!path) return new Response(null, { status: 404 });
  try {
    await callCentral("delete", path);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "api/devices delete");
  }
};

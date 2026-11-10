import { isLiveSource } from "@/config/env";
import {
  serverIdResponseSchema,
  updateServerInputSchema,
} from "@/features/servers/schemas/server";
import {
  callCentral,
  errorResponse,
  isValidIds,
} from "@/lib/api/central-proxy";

type Context = { params: Promise<{ serverId: string }> };

const resolve = async ({ params }: Context) => {
  const { serverId } = await params;
  if (!isLiveSource || !isValidIds(serverId)) return null;
  return `/v1/edge-servers/${serverId}`;
};

export const PATCH = async (request: Request, context: Context) => {
  const path = await resolve(context);
  if (!path) return new Response(null, { status: 404 });
  const body = updateServerInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid server data" }, { status: 400 });
  }
  try {
    const data = await callCentral("patch", path, body.data);
    return Response.json(serverIdResponseSchema.parse(data).data);
  } catch (error) {
    return errorResponse(error, "api/edge-servers update");
  }
};

export const DELETE = async (_request: Request, context: Context) => {
  const path = await resolve(context);
  if (!path) return new Response(null, { status: 404 });
  try {
    await callCentral("delete", path);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "api/edge-servers delete");
  }
};

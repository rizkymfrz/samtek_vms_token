import { updateSpeakerInputSchema } from "@/features/speakers/schemas/speaker";
import {
  callCentral,
  errorResponse,
  isValidIds,
} from "@/lib/api/central-proxy";

type Context = { params: Promise<{ serverId: string; id: string }> };

const resolve = async ({ params }: Context) => {
  const { serverId, id } = await params;
  return isValidIds(serverId, id)
    ? `/v1/edge-servers/${serverId}/speakers/${id}`
    : null;
};

export const PATCH = async (request: Request, context: Context) => {
  const path = await resolve(context);
  if (!path) return new Response(null, { status: 404 });
  const body = updateSpeakerInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid speaker data" }, { status: 400 });
  }
  try {
    await callCentral("patch", path, body.data);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "api/speakers update");
  }
};

export const DELETE = async (_request: Request, context: Context) => {
  const path = await resolve(context);
  if (!path) return new Response(null, { status: 404 });
  try {
    await callCentral("delete", path);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "api/speakers delete");
  }
};

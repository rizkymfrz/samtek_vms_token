import { isLiveSource } from "@/config/env";
import {
  createServerInputSchema,
  serverIdResponseSchema,
} from "@/features/servers/schemas/server";
import { callCentral, errorResponse } from "@/lib/api/central-proxy";

export const POST = async (request: Request) => {
  if (!isLiveSource) return new Response(null, { status: 404 });
  const body = createServerInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid server data" }, { status: 400 });
  }
  try {
    const data = await callCentral("post", "/v1/edge-servers", body.data);
    return Response.json(serverIdResponseSchema.parse(data).data, {
      status: 201,
    });
  } catch (error) {
    return errorResponse(error, "api/edge-servers create");
  }
};

import { isLiveSource } from "@/config/env";
import {
  createRoleInputSchema,
  userIdResponseSchema,
} from "@/features/users/schemas/user";
import { callCentral, errorResponse } from "@/lib/api/central-proxy";

export const POST = async (request: Request) => {
  if (!isLiveSource) return new Response(null, { status: 404 });
  const body = createRoleInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid role data" }, { status: 400 });
  }
  try {
    const data = await callCentral("post", "/v1/roles", body.data);
    return Response.json(userIdResponseSchema.parse(data).data, {
      status: 201,
    });
  } catch (error) {
    return errorResponse(error, "api/roles create");
  }
};

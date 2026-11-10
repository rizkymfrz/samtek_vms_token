import { isLiveSource } from "@/config/env";
import { updateUserInputSchema } from "@/features/users/schemas/user";
import {
  callCentral,
  errorResponse,
  isValidIds,
} from "@/lib/api/central-proxy";

type Context = { params: Promise<{ id: string }> };

const resolve = async ({ params }: Context) => {
  const { id } = await params;
  return isLiveSource && isValidIds(id) ? `/v1/users/${id}` : null;
};

export const PATCH = async (request: Request, context: Context) => {
  const path = await resolve(context);
  if (!path) return new Response(null, { status: 404 });
  const body = updateUserInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid user data" }, { status: 400 });
  }
  try {
    await callCentral("patch", path, body.data);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "api/users update");
  }
};

export const DELETE = async (_request: Request, context: Context) => {
  const path = await resolve(context);
  if (!path) return new Response(null, { status: 404 });
  try {
    await callCentral("delete", path);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "api/users delete");
  }
};

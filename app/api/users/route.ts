import { connection } from "next/server";
import { isLiveSource } from "@/config/env";
import {
  createUserInputSchema,
  userIdResponseSchema,
} from "@/features/users/schemas/user";
import { getUsers } from "@/features/users/services/get-users";
import { callCentral, errorResponse } from "@/lib/api/central-proxy";

export const GET = async () => {
  await connection();
  try {
    return Response.json(await getUsers());
  } catch (error) {
    return errorResponse(error, "api/users");
  }
};

export const POST = async (request: Request) => {
  if (!isLiveSource) return new Response(null, { status: 404 });
  const body = createUserInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid user data" }, { status: 400 });
  }
  try {
    const data = await callCentral("post", "/v1/users", body.data);
    return Response.json(userIdResponseSchema.parse(data).data, {
      status: 201,
    });
  } catch (error) {
    return errorResponse(error, "api/users create");
  }
};

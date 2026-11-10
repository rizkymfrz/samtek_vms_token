import { connection } from "next/server";
import { isLiveSource } from "@/config/env";
import { summaryOf } from "@/features/live/lib/edit-layout";
import {
  layoutResponseSchema,
  updateLayoutInputSchema,
} from "@/features/live/schemas/layout";
import { getLayout } from "@/features/live/services/get-live";
import {
  callCentral,
  errorResponse,
  isValidIds,
} from "@/lib/api/central-proxy";

type Context = { params: Promise<{ id: string }> };

const resolve = async ({ params }: Context) => {
  const { id } = await params;
  return isLiveSource && isValidIds(id) ? id : null;
};

export const GET = async (_request: Request, context: Context) => {
  await connection();
  const id = await resolve(context);
  if (!id) return new Response(null, { status: 404 });
  try {
    return Response.json(await getLayout(id));
  } catch (error) {
    return errorResponse(error, "api/layouts get");
  }
};

export const PATCH = async (request: Request, context: Context) => {
  const id = await resolve(context);
  if (!id) return new Response(null, { status: 404 });
  const body = updateLayoutInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid layout data" }, { status: 400 });
  }
  try {
    const data = await callCentral("patch", `/v1/layouts/${id}`, body.data);
    return Response.json(summaryOf(layoutResponseSchema.parse(data).data));
  } catch (error) {
    return errorResponse(error, "api/layouts update");
  }
};

export const DELETE = async (_request: Request, context: Context) => {
  const id = await resolve(context);
  if (!id) return new Response(null, { status: 404 });
  try {
    await callCentral("delete", `/v1/layouts/${id}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "api/layouts delete");
  }
};

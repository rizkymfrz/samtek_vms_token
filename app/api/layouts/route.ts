import { isLiveSource } from "@/config/env";
import { summaryOf } from "@/features/live/lib/edit-layout";
import {
  createLayoutInputSchema,
  layoutResponseSchema,
} from "@/features/live/schemas/layout";
import { callCentral, errorResponse } from "@/lib/api/central-proxy";

export const POST = async (request: Request) => {
  if (!isLiveSource) return new Response(null, { status: 404 });
  const body = createLayoutInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid layout data" }, { status: 400 });
  }
  try {
    const data = await callCentral("post", "/v1/layouts", body.data);
    return Response.json(summaryOf(layoutResponseSchema.parse(data).data), {
      status: 201,
    });
  } catch (error) {
    return errorResponse(error, "api/layouts create");
  }
};

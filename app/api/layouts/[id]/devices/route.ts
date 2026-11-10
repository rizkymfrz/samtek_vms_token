import { isLiveSource } from "@/config/env";
import {
  layoutDetailResponseSchema,
  replaceSlotsInputSchema,
} from "@/features/live/schemas/layout";
import { toLayout } from "@/features/live/services/layout-mapper";
import {
  callCentral,
  errorResponse,
  isValidIds,
} from "@/lib/api/central-proxy";

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  if (!isLiveSource || !isValidIds(id))
    return new Response(null, { status: 404 });
  const body = replaceSlotsInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid layout data" }, { status: 400 });
  }
  try {
    const data = await callCentral(
      "put",
      `/v1/layouts/${id}/devices`,
      body.data,
    );
    return Response.json(toLayout(layoutDetailResponseSchema.parse(data).data));
  } catch (error) {
    return errorResponse(error, "api/layouts devices");
  }
};

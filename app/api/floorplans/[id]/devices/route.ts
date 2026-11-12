import { isLiveSource } from "@/config/env";
import { replacePlacementsInputSchema } from "@/features/floorplan/schemas/floorplan";
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
  const body = replacePlacementsInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid placement data" }, { status: 400 });
  }
  try {
    await callCentral("put", `/v1/floorplans/${id}/devices`, body.data);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "api/floorplans devices");
  }
};

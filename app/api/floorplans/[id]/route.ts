import { isLiveSource } from "@/config/env";
import {
  callCentral,
  errorResponse,
  isValidIds,
} from "@/lib/api/central-proxy";

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  if (!isLiveSource || !isValidIds(id))
    return new Response(null, { status: 404 });
  try {
    await callCentral("delete", `/v1/floorplans/${id}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error, "api/floorplans delete");
  }
};

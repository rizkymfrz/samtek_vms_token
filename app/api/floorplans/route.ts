import {
  createFloorplanInputSchema,
  floorplanResponseSchema,
} from "@/features/floorplan/schemas/floorplan";
import { callCentral, errorResponse } from "@/lib/api/central-proxy";

export const POST = async (request: Request) => {
  const body = createFloorplanInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid floor plan data" }, { status: 400 });
  }
  try {
    const data = await callCentral("post", "/v1/floorplans", body.data);
    return Response.json(floorplanResponseSchema.parse(data).data, {
      status: 201,
    });
  } catch (error) {
    return errorResponse(error, "api/floorplans create");
  }
};

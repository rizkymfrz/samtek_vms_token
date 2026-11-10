import { isLiveSource } from "@/config/env";
import {
  createDeviceInputSchema,
  deviceResponseSchema,
} from "@/features/cameras/schemas/device";
import {
  callCentral,
  errorResponse,
  ID_PATTERN,
} from "@/lib/api/central-proxy";

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ serverId: string }> },
) => {
  const { serverId } = await params;
  if (!isLiveSource || !ID_PATTERN.test(serverId)) {
    return new Response(null, { status: 404 });
  }
  const body = createDeviceInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid camera data" }, { status: 400 });
  }
  try {
    const data = await callCentral(
      "post",
      `/v1/edge-servers/${serverId}/devices`,
      body.data,
    );
    return Response.json(deviceResponseSchema.parse(data).data, {
      status: 201,
    });
  } catch (error) {
    return errorResponse(error, "api/devices create");
  }
};

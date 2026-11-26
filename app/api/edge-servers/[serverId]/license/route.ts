import { licenseResponseSchema } from "@/features/license/schemas/license";
import {
  callCentral,
  errorResponse,
  isValidIds,
} from "@/lib/api/central-proxy";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ serverId: string }> },
) => {
  const { serverId } = await params;
  if (!isValidIds(serverId)) {
    return new Response(null, { status: 404 });
  }
  try {
    const data = await callCentral(
      "get",
      `/v1/edge-servers/${serverId}/license`,
    );
    return Response.json(licenseResponseSchema.parse(data));
  } catch (error) {
    return errorResponse(error, "api/license");
  }
};

import { speakerTestResponseSchema } from "@/features/speakers/schemas/speaker";
import {
  callCentral,
  errorResponse,
  isValidIds,
} from "@/lib/api/central-proxy";

export const maxDuration = 70;

export const POST = async (
  _request: Request,
  { params }: { params: Promise<{ serverId: string; id: string }> },
) => {
  const { serverId, id } = await params;
  if (!isValidIds(serverId, id)) return new Response(null, { status: 404 });
  try {
    const data = await callCentral(
      "post",
      `/v1/edge-servers/${serverId}/devices/${id}/speaker-test-calls`,
      undefined,
      65_000,
    );
    return Response.json(speakerTestResponseSchema.parse(data).data);
  } catch (error) {
    return errorResponse(error, "api/devices speaker test");
  }
};

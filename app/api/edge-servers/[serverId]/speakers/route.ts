import {
  createSpeakerInputSchema,
  speakerResponseSchema,
} from "@/features/speakers/schemas/speaker";
import {
  callCentral,
  errorResponse,
  isValidIds,
} from "@/lib/api/central-proxy";

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ serverId: string }> },
) => {
  const { serverId } = await params;
  if (!isValidIds(serverId)) return new Response(null, { status: 404 });
  const body = createSpeakerInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return Response.json({ error: "Invalid speaker data" }, { status: 400 });
  }
  try {
    const data = await callCentral(
      "post",
      `/v1/edge-servers/${serverId}/speakers`,
      body.data,
    );
    return Response.json(speakerResponseSchema.parse(data).data, {
      status: 201,
    });
  } catch (error) {
    return errorResponse(error, "api/speakers create");
  }
};

import { MAX_EVIDENCE_BYTES } from "@/features/tickets/schemas/ticket";
import { addTicketEvidence } from "@/features/tickets/services/ticket-source";
import { errorResponse, isValidIds } from "@/lib/api/central-proxy";

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  if (!isValidIds(id)) return new Response(null, { status: 404 });
  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "A photo is required" }, { status: 400 });
  }
  if (file.size > MAX_EVIDENCE_BYTES) {
    return Response.json(
      { error: "The photo is larger than 10 MB" },
      { status: 413 },
    );
  }
  try {
    return Response.json(await addTicketEvidence(id, file), { status: 201 });
  } catch (error) {
    return errorResponse(error, "api/tickets evidence");
  }
};

import { MAX_EVIDENCE_BYTES } from "@/features/tickets/schemas/ticket";
import {
  addLinkEvidence,
  linkErrorResponse,
} from "@/features/tickets/services/ticket-link-source";
import { noToken, readLinkToken } from "../../token";

export const POST = async (request: Request) => {
  const token = readLinkToken(request);
  if (!token) return noToken();
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
    return Response.json(await addLinkEvidence(token, file), { status: 201 });
  } catch (error) {
    return linkErrorResponse(error, "api/ticket-link evidence");
  }
};

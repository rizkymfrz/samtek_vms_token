import { createHash } from "node:crypto";
import { connection } from "next/server";
import {
  AUDIO_MAX_BYTES,
  audioFieldsSchema,
  edgeAudioCreatedSchema,
} from "@/features/speakers/schemas/audio";
import { getSpeakerAudio } from "@/features/speakers/services/get-speaker-audio";
import { postFormToEdge } from "@/lib/api/edge-client";
import { edgeErrorResponse } from "@/lib/api/edge-proxy";
import { findEdgeServer } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";

export const GET = async () => {
  await connection();
  try {
    return Response.json(await getSpeakerAudio());
  } catch (error) {
    return edgeErrorResponse(error, "api/speaker-audio");
  }
};

export const POST = async (request: Request) => {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const edgeId = form?.get("edgeId");
  const fields = audioFieldsSchema.safeParse({ name: form?.get("name") ?? "" });
  if (
    !form ||
    typeof edgeId !== "string" ||
    !(file instanceof File) ||
    file.size === 0 ||
    file.size > AUDIO_MAX_BYTES ||
    !fields.success
  ) {
    return Response.json({ error: "Invalid audio file" }, { status: 400 });
  }
  try {
    const edge = await findEdgeServer(await requireAccessToken(), edgeId);
    if (!edge) {
      return Response.json({ error: "Edge server not found" }, { status: 404 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const body = new FormData();
    body.set("file", new Blob([bytes]), file.name);
    body.set("sha256", createHash("sha256").update(bytes).digest("hex"));
    if (fields.data.name) body.set("name", fields.data.name);
    const created = await postFormToEdge(
      edge,
      "/v1/speaker-audio",
      body,
      edgeAudioCreatedSchema,
    );
    return Response.json(created, { status: 201 });
  } catch (error) {
    return edgeErrorResponse(error, "api/speaker-audio create");
  }
};

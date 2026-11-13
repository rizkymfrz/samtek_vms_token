import { connection } from "next/server";
import { isLiveSource } from "@/config/env";
import {
  edgeFaceCreatedSchema,
  enrollFieldsSchema,
  PHOTO_MAX_BYTES,
} from "@/features/faces/schemas/face";
import { getFaces } from "@/features/faces/services/get-faces";
import { postFormToEdge } from "@/lib/api/edge-client";
import { edgeErrorResponse } from "@/lib/api/edge-proxy";
import { findEdgeServer } from "@/lib/api/edge-registry";
import { requireAccessToken } from "@/lib/auth/session";

export const GET = async () => {
  await connection();
  try {
    return Response.json(await getFaces());
  } catch (error) {
    return edgeErrorResponse(error, "api/faces");
  }
};

export const POST = async (request: Request) => {
  if (!isLiveSource) return new Response(null, { status: 404 });
  const form = await request.formData().catch(() => null);
  const photo = form?.get("photo");
  const edgeId = form?.get("edgeId");
  const fields = enrollFieldsSchema.safeParse({
    name: form?.get("name") ?? "",
    group: form?.get("group") ?? "",
    personId: form?.get("personId") ?? "",
  });
  if (
    !form ||
    typeof edgeId !== "string" ||
    !(photo instanceof File) ||
    photo.type !== "image/jpeg" ||
    photo.size === 0 ||
    photo.size > PHOTO_MAX_BYTES ||
    !fields.success
  ) {
    return Response.json({ error: "Invalid face data" }, { status: 400 });
  }
  try {
    const edge = await findEdgeServer(await requireAccessToken(), edgeId);
    if (!edge) {
      return Response.json({ error: "Edge server not found" }, { status: 404 });
    }
    const body = new FormData();
    body.set("photo", photo);
    body.set("name", fields.data.name);
    if (fields.data.group) body.set("group", fields.data.group);
    if (fields.data.personId) body.set("person_id", fields.data.personId);
    const created = await postFormToEdge(
      edge,
      "/v1/faces",
      body,
      edgeFaceCreatedSchema,
    );
    return Response.json(created, { status: 201 });
  } catch (error) {
    return edgeErrorResponse(error, "api/faces create");
  }
};

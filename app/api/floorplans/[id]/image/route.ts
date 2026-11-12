import { isLiveSource } from "@/config/env";
import { createCentralClient, toCentralError } from "@/lib/api/central-client";
import { errorResponse, isValidIds } from "@/lib/api/central-proxy";
import { requireAccessToken } from "@/lib/auth/session";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  if (!isLiveSource || !isValidIds(id))
    return new Response(null, { status: 404 });
  try {
    const token = await requireAccessToken();
    const response = await createCentralClient(token).get<ArrayBuffer>(
      `/v1/floorplans/${id}/image`,
      { responseType: "arraybuffer" },
    );
    return new Response(response.data, {
      headers: {
        "Content-Type": String(response.headers["content-type"] ?? ""),
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return errorResponse(toCentralError(error), "api/floorplans image");
  }
};

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  if (!isLiveSource || !isValidIds(id))
    return new Response(null, { status: 404 });
  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "An image is required" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return Response.json(
      { error: "The image is larger than 10 MB" },
      { status: 413 },
    );
  }
  try {
    const token = await requireAccessToken();
    const form = new FormData();
    form.append("file", file, file.name);
    await createCentralClient(token).put(`/v1/floorplans/${id}/image`, form);
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(toCentralError(error), "api/floorplans image upload");
  }
};

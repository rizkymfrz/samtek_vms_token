import { createCentralClient, toCentralError } from "@/lib/api/central-client";
import { errorResponse } from "@/lib/api/central-proxy";
import { requireAccessToken } from "@/lib/auth/session";
import { LINK_HEADER, linkErrorResponse } from "./ticket-link-source";

export const proxyTicketBinary = async (
  path: string,
  scope: string,
  linkToken?: string,
) => {
  try {
    const client = createCentralClient(
      linkToken === undefined ? await requireAccessToken() : undefined,
    );
    const response = await client.get<ArrayBuffer>(path, {
      responseType: "arraybuffer",
      headers:
        linkToken === undefined ? undefined : { [LINK_HEADER]: linkToken },
    });
    return new Response(response.data, {
      headers: {
        "Content-Type": String(response.headers["content-type"] ?? ""),
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const mapped = toCentralError(error);
    return linkToken === undefined
      ? errorResponse(mapped, scope)
      : linkErrorResponse(mapped, scope);
  }
};

import { requireAccessToken, UnauthorizedError } from "@/lib/auth/session";
import {
  CentralError,
  createCentralClient,
  toCentralError,
} from "./central-client";

const ID_PATTERN = /^[0-9]+$/;

export const isValidIds = (...ids: string[]) =>
  ids.every((id) => ID_PATTERN.test(id));

export const callCentral = async (
  method: "post" | "patch" | "put" | "delete",
  path: string,
  body?: unknown,
) => {
  const token = await requireAccessToken();
  try {
    const response = await createCentralClient(token).request<unknown>({
      method,
      url: path,
      data: body,
    });
    return response.data;
  } catch (error) {
    throw toCentralError(error);
  }
};

export const errorResponse = (error: unknown, scope: string) => {
  if (error instanceof UnauthorizedError) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof CentralError && error.status < 500) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(`[${scope}]`, error);
  return Response.json({ error: "Request failed" }, { status: 502 });
};

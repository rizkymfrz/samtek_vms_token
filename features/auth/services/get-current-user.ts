import { createCentralClient, toCentralError } from "@/lib/api/central-client";
import { requireAccessToken } from "@/lib/auth/session";
import { meResponseSchema } from "../schemas/me";
import type { CurrentUser } from "../types";

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const token = await requireAccessToken();
  try {
    const { data } =
      await createCentralClient(token).get<unknown>("/v1/auth/me");
    return meResponseSchema.parse(data).data;
  } catch (error) {
    throw toCentralError(error);
  }
};

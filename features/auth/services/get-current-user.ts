import { isLiveSource } from "@/config/env";
import { createCentralClient, toCentralError } from "@/lib/api/central-client";
import { requireAccessToken } from "@/lib/auth/session";
import { meResponseSchema } from "../schemas/me";
import type { CurrentUser } from "../types";

const MOCK_USER: CurrentUser = {
  id: "1",
  username: "Rizky Maulana",
  email: "rizky@samtek.id",
  avatar: null,
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  if (!isLiveSource) return MOCK_USER;
  const token = await requireAccessToken();
  try {
    const { data } =
      await createCentralClient(token).get<unknown>("/v1/auth/me");
    return meResponseSchema.parse(data).data;
  } catch (error) {
    throw toCentralError(error);
  }
};

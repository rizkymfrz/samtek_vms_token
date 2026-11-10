import { z } from "zod";
import { createCentralClient, toCentralError } from "@/lib/api/central-client";

const tokensSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number().int().positive(),
  }),
});

export type AuthTokens = z.output<typeof tokensSchema>["data"];

export const login = async (identifier: string, password: string) => {
  try {
    const { data } = await createCentralClient().post<unknown>(
      "/v1/auth/login",
      { identifier, password },
    );
    return tokensSchema.parse(data).data;
  } catch (error) {
    throw toCentralError(error);
  }
};

export const refresh = async (refreshToken: string) => {
  try {
    const { data } = await createCentralClient().post<unknown>(
      "/v1/auth/refresh",
      { refreshToken },
    );
    return tokensSchema.parse(data).data;
  } catch (error) {
    throw toCentralError(error);
  }
};

export const logout = async (refreshToken: string) => {
  try {
    await createCentralClient().post("/v1/auth/logout", { refreshToken });
  } catch (error) {
    throw toCentralError(error);
  }
};

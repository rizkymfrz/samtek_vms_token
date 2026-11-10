import { cookies } from "next/headers";
import { isSecureCookie } from "@/config/env";
import type { AuthTokens } from "./tokens";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 3600;
const ACCESS_EXPIRY_MARGIN_SECONDS = 30;

type CookieStore = {
  set: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax";
      path: string;
      maxAge: number;
    },
  ) => unknown;
};

export class UnauthorizedError extends Error {
  constructor() {
    super("Not authenticated");
  }
}

const options = (maxAge: number) => ({
  httpOnly: true,
  secure: isSecureCookie,
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

export const setAuthCookies = (store: CookieStore, tokens: AuthTokens) => {
  store.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    options(Math.max(tokens.expiresIn - ACCESS_EXPIRY_MARGIN_SECONDS, 1)),
  );
  store.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    options(REFRESH_MAX_AGE_SECONDS),
  );
};

export const clearAuthCookies = (store: CookieStore) => {
  store.set(ACCESS_TOKEN_COOKIE, "", options(0));
  store.set(REFRESH_TOKEN_COOKIE, "", options(0));
};

export const requireAccessToken = async () => {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) throw new UnauthorizedError();
  return token;
};

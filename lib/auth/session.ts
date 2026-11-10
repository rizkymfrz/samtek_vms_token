import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "access_token";

export class UnauthorizedError extends Error {
  constructor() {
    super("Not authenticated");
  }
}

export const requireAccessToken = async () => {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) throw new UnauthorizedError();
  return token;
};

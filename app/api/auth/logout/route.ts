import { cookies } from "next/headers";
import { clearAuthCookies, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session";
import { logout } from "@/lib/auth/tokens";

export const POST = async () => {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;
  clearAuthCookies(store);
  if (refreshToken) {
    await logout(refreshToken).catch((error) =>
      console.error("[api/auth/logout]", error),
    );
  }
  return new Response(null, { status: 204 });
};

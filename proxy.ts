import { type NextRequest, NextResponse } from "next/server";
import { webFallbackPath } from "@/features/camera-web/lib/web-fallback";
import {
  ACCESS_TOKEN_COOKIE,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
  REMEMBER_COOKIE,
  setAuthCookies,
} from "@/lib/auth/session";
import { type AuthTokens, refresh } from "@/lib/auth/tokens";

const SHARE_WINDOW_MS = 10_000;
const PUBLIC_API_PATHS = new Set(["/api/auth/login", "/api/auth/logout"]);
const TICKET_LINK_PAGE = "/t";
const TICKET_LINK_API = "/api/ticket-link/";
const inflight = new Map<string, Promise<AuthTokens | null>>();

const refreshOnce = (refreshToken: string) => {
  const existing = inflight.get(refreshToken);
  if (existing) return existing;
  const pending = refresh(refreshToken).catch(() => null);
  inflight.set(refreshToken, pending);
  setTimeout(() => inflight.delete(refreshToken), SHARE_WINDOW_MS);
  return pending;
};

export const proxy = async (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_API_PATHS.has(pathname)) return NextResponse.next();
  const camera = request.cookies.has(ACCESS_TOKEN_COOKIE)
    ? webFallbackPath(pathname, request.headers.get("referer"))
    : null;
  if (camera) {
    return NextResponse.redirect(new URL(camera + search, request.url), 307);
  }
  if (pathname === TICKET_LINK_PAGE || pathname.startsWith(TICKET_LINK_API)) {
    return NextResponse.next();
  }
  if (request.cookies.has(ACCESS_TOKEN_COOKIE)) return NextResponse.next();
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const tokens = refreshToken ? await refreshOnce(refreshToken) : null;
  if (!tokens) {
    const response = pathname.startsWith("/api/")
      ? NextResponse.next()
      : NextResponse.redirect(
          new URL(
            `/login?next=${encodeURIComponent(pathname + search)}`,
            request.url,
          ),
        );
    if (refreshToken) clearAuthCookies(response.cookies);
    return response;
  }
  request.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken);
  request.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken);
  const response = NextResponse.next({ request });
  setAuthCookies(
    response.cookies,
    tokens,
    request.cookies.get(REMEMBER_COOKIE)?.value === "1",
  );
  return response;
};

export const config = {
  matcher: [
    "/((?!login|showcase|earth\\.webm|logo\\.svg|_next/static|_next/image|favicon.ico).*)",
  ],
};

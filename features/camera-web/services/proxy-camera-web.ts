import { connection } from "next/server";
import { errorResponse, isValidIds } from "@/lib/api/central-proxy";
import { getWebTarget } from "./get-web-target";
import { cameraCookies, scopeSetCookie } from "../lib/cookies";
import {
  looksLikeHtml,
  rewriteHtml,
  rewriteLocation,
  rewritePlugin,
  rewriteScript,
} from "../lib/rewrite-html";
import { upstreamRequest } from "../lib/upstream-request";
import { webPrefix } from "../lib/web-target";

const FORWARD = [
  "accept",
  "accept-language",
  "authorization",
  "content-type",
  "range",
];

const DROP = [
  "etag",
  "last-modified",
  "content-encoding",
  "content-length",
  "content-security-policy",
  "set-cookie",
  "transfer-encoding",
  "x-frame-options",
];

export const proxyCameraWeb = async (
  request: Request,
  id: string,
  path: string[],
) => {
  await connection();
  if (!isValidIds(id)) {
    return Response.json({ error: "Invalid camera" }, { status: 400 });
  }
  try {
    const target = await getWebTarget(id);
    if (!target) {
      return Response.json(
        { error: "This camera has no web page" },
        { status: 404 },
      );
    }
    const { pathname, search } = new URL(request.url);
    const headers = new Headers();
    for (const name of FORWARD) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    const cookie = cameraCookies(request.headers.get("cookie"));
    if (cookie) headers.set("cookie", cookie);
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const upstream = await upstreamRequest(
      `${target.origin}/${path.map(encodeURIComponent).join("/")}${search}`,
      {
        method: request.method,
        headers,
        body: hasBody ? Buffer.from(await request.arrayBuffer()) : undefined,
      },
    );
    const prefix = webPrefix(id);
    const depth = pathname.endsWith("/") ? path.length : path.length - 1;
    const out = new Headers(upstream.headers);
    for (const name of DROP) out.delete(name);
    for (const value of upstream.headers.getSetCookie()) {
      const scoped = scopeSetCookie(value, prefix);
      if (scoped) out.append("set-cookie", scoped);
    }
    out.set("referrer-policy", "same-origin");
    const location = out.get("location");
    if (location) {
      out.set("location", rewriteLocation(location, target.origin, prefix));
    }
    const type = upstream.headers.get("content-type");
    const isScript = type?.includes("javascript") ?? false;
    const isStream = type !== null && !type.includes("text/html") && !isScript;
    const bytes = isStream ? null : Buffer.from(await upstream.arrayBuffer());
    const isHtml =
      bytes !== null && !isScript && (type !== null || looksLikeHtml(bytes));
    if (bytes && (isScript || isHtml)) out.set("cache-control", "no-store");
    if (bytes && isScript) {
      const rewrite = path.some((part) => part.startsWith("webPlugin"))
        ? rewritePlugin
        : rewriteScript;
      return new Response(rewrite(bytes.toString("utf8")), {
        status: upstream.status,
        headers: out,
      });
    }
    if (bytes && isHtml) {
      out.set("content-type", type ?? "text/html; charset=utf-8");
      return new Response(
        rewriteHtml(bytes.toString("utf8"), prefix, {
          depth,
          isRoot: path.length === 0,
          login: target.login,
          host: new URL(target.origin).host,
        }),
        { status: upstream.status, headers: out },
      );
    }
    return new Response(bytes ?? upstream.body, {
      status: upstream.status,
      headers: out,
    });
  } catch (error) {
    return errorResponse(error, "api/cameras/web");
  }
};

import { request } from "node:http";
import { Readable } from "node:stream";
import { createBrotliDecompress, createUnzip } from "node:zlib";

const TIMEOUT_MS = 15_000;
const NO_BODY = new Set([204, 205, 304]);

export const upstreamRequest = (
  url: string,
  init: { method: string; headers: Headers; body?: Buffer },
) =>
  new Promise<Response>((resolve, reject) => {
    const req = request(
      url,
      {
        method: init.method,
        headers: Object.fromEntries(init.headers),
        insecureHTTPParser: true,
        timeout: TIMEOUT_MS,
      },
      (res) => {
        const headers = new Headers();
        for (const [name, value] of Object.entries(res.headers)) {
          if (Array.isArray(value)) {
            for (const entry of value) headers.append(name, entry);
          } else if (value !== undefined) {
            headers.set(name, value);
          }
        }
        const encoding = res.headers["content-encoding"]?.toLowerCase();
        const decoder =
          encoding === "br"
            ? createBrotliDecompress()
            : encoding === "gzip" || encoding === "deflate"
              ? createUnzip()
              : null;
        if (decoder) {
          headers.delete("content-encoding");
          headers.delete("content-length");
          res.pipe(decoder);
        }
        const body = decoder ?? res;
        const status = res.statusCode ?? 502;
        const isEmpty = NO_BODY.has(status) || init.method === "HEAD";
        if (isEmpty) res.resume();
        resolve(
          new Response(
            isEmpty ? null : (Readable.toWeb(body) as ReadableStream),
            { status, headers },
          ),
        );
      },
    );
    req.on("timeout", () => req.destroy(new Error("Camera did not respond")));
    req.on("error", reject);
    req.end(init.body);
  });

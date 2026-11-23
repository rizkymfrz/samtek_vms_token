import assert from "node:assert/strict";
import { createServer } from "node:net";
import { test } from "node:test";
import { gzipSync } from "node:zlib";
import { upstreamRequest } from "../../features/camera-web/lib/upstream-request.ts";

const serve = (respond) =>
  new Promise((resolve) => {
    const server = createServer((socket) => {
      socket.once("data", () => socket.end(respond()));
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });

test("a camera that ends header lines with a bare LF is still read", async () => {
  const server = await serve(
    () => "HTTP/1.1 200 OK\nContent-Type: text/plain\nContent-Length: 2\n\nhi",
  );
  try {
    const { port } = server.address();
    const response = await upstreamRequest(`http://127.0.0.1:${port}/`, {
      method: "GET",
      headers: new Headers(),
    });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "hi");
  } finally {
    server.close();
  }
});

test("gzip bodies are decoded even when the client never asked for them", async () => {
  const body = gzipSync("var Lang = {};");
  const server = await serve(() =>
    Buffer.concat([
      Buffer.from(
        `HTTP/1.1 200 OK\r\nContent-Type: application/x-javascript\r\nContent-Encoding: gzip\r\nContent-Length: ${body.length}\r\n\r\n`,
      ),
      body,
    ]),
  );
  try {
    const { port } = server.address();
    const response = await upstreamRequest(`http://127.0.0.1:${port}/`, {
      method: "GET",
      headers: new Headers(),
    });
    assert.equal(response.headers.get("content-encoding"), null);
    assert.equal(await response.text(), "var Lang = {};");
  } finally {
    server.close();
  }
});

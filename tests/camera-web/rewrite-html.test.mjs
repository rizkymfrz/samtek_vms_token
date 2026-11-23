import assert from "node:assert/strict";
import { test } from "node:test";
import {
  looksLikeHtml,
  rewriteHtml,
  rewriteLocation,
  rewritePlugin,
  rewriteScript,
  rewriteTop,
} from "../../features/camera-web/lib/rewrite-html.ts";
import { webTarget } from "../../features/camera-web/lib/web-target.ts";

const PREFIX = "/api/cameras/7/web";

test("root-relative attributes get the proxy prefix", () => {
  const html = rewriteHtml('<a href="/a.htm"><img src="//cdn/x.png">', PREFIX);
  assert.match(html, /href="\/api\/cameras\/7\/web\/a\.htm"/);
  assert.match(html, /src="\/\/cdn\/x\.png"/);
});

test("../ is capped at the page directory depth", () => {
  const frame = '<iframe src=" ../index.htm?x=1">';
  assert.match(
    rewriteHtml(frame, PREFIX, { depth: 0 }),
    /src=" index\.htm\?x=1"/,
  );
  assert.match(
    rewriteHtml(frame, PREFIX, { depth: 1 }),
    /src=" \.\.\/index\.htm/,
  );
});

test("the root page gets a base so it survives the trailing-slash redirect", () => {
  const html = rewriteHtml("<head></head>", PREFIX, { isRoot: true });
  assert.match(html, /<head><base href="\/api\/cameras\/7\/web\/">/);
  assert.doesNotMatch(rewriteHtml("<head></head>", PREFIX), /<base/);
});

test("the fetch patch is injected inside head", () => {
  const html = rewriteHtml("<html><head></head></html>", PREFIX);
  assert.match(html, /<head><script>/);
});

test("redirects stay under the proxy", () => {
  assert.equal(
    rewriteLocation("http://10.0.0.5/login", "http://10.0.0.5", PREFIX),
    `${PREFIX}/login`,
  );
  assert.equal(
    rewriteLocation("https://other/x", "http://10.0.0.5", PREFIX),
    "https://other/x",
  );
});

test("the camera address and login come from the rtsp url", () => {
  const target = webTarget("rtsp://admin:p%40ss@10.0.0.5:554/s1");
  assert.equal(target.origin, "http://10.0.0.5");
  assert.deepEqual(target.login, { user: "admin", password: "p@ss" });
  assert.equal(webTarget("rtsp://10.0.0.5/s1").login, null);
  assert.equal(webTarget("http://10.0.0.5/"), null);
});

test("stray root paths from a camera page go back to its proxy", async () => {
  const { webFallbackPath } =
    await import("../../features/camera-web/lib/web-fallback.ts");
  const referer = "http://vms/api/cameras/7/web/index.htm";
  assert.equal(
    webFallbackPath("/doc/a.js", referer),
    "/api/cameras/7/web/doc/a.js",
  );
  assert.equal(webFallbackPath("/_next/x.js", referer), null);
  assert.equal(webFallbackPath("/live", "http://vms/dashboard"), null);
  assert.equal(webFallbackPath("/live", null), null);
});

test("html without a content type is recognised from its body", () => {
  const bytes = (text) => new TextEncoder().encode(text);
  assert.equal(looksLikeHtml(bytes("\n<!DOCTYPE html><html>")), true);
  assert.equal(looksLikeHtml(bytes("GIF89a")), false);
});

test("the injected patch also covers absolute same-origin urls", () => {
  const html = rewriteHtml("<head></head>", PREFIX);
  assert.match(html, /a\.origin!==location\.origin/);
});

test("camera cookies pass through but vms cookies never reach the camera", async () => {
  const { cameraCookies, scopeSetCookie } =
    await import("../../features/camera-web/lib/cookies.ts");
  assert.equal(
    cameraCookies("access_token=a; refresh_token=b; SID=cam1; lang=en"),
    "SID=cam1; lang=en",
  );
  assert.equal(cameraCookies("access_token=a; sidebar_state=true"), null);
  assert.equal(
    scopeSetCookie("SID=1; Path=/; Domain=x; Secure; HttpOnly", PREFIX),
    `SID=1; HttpOnly; Path=${PREFIX}; SameSite=Lax`,
  );
  assert.equal(scopeSetCookie("access_token=evil; Path=/", PREFIX), null);
});

test("top inside camera scripts means the camera root, not the vms page", () => {
  assert.equal(
    rewriteTop("top.window.location.href=x;top.LapiFlag=!1"),
    "window.__camTop.window.location.href=x;window.__camTop.LapiFlag=!1",
  );
  assert.equal(
    rewriteTop("if(self!=top)go()"),
    "if(self!=window.__camTop)go()",
  );
  assert.equal(
    rewriteTop("a=window.top;b=window.top.x"),
    "a=window.__camTop;b=window.__camTop.x",
  );
  const untouched =
    'el.top.x;css("top",1);{top:1};var s="top.";stop.x;$.offset().top';
  assert.equal(rewriteTop(untouched), untouched);
});

test("the login form is filled only where there is a password field", async () => {
  const login = { user: "admin", password: "p</script>" };
  const form =
    '<head></head><input type="text" id="userName"><input type="password" id="password">';
  const filled = rewriteHtml(form, PREFIX, { login });
  assert.match(filled, /camera_web_login/);
  assert.match(filled, /"user":"admin"/);
  assert.doesNotMatch(filled, /p<\/script>/);
  assert.doesNotMatch(
    rewriteHtml("<head></head>", PREFIX, { login }),
    /camera_web_login/,
  );
  assert.doesNotMatch(rewriteHtml(form, PREFIX), /camera_web_login/);
});

test("the camera host and port replace the vms ones for streams and plugins", () => {
  const out = rewriteScript(
    'top.loginServerIp=window.location.host;var u="ws://"+window.location.hostname+":"+p;n=""==window.location.port?80:window.location.port',
  );
  assert.match(out, /loginServerIp=window\.__camHost;/);
  assert.match(out, /"ws:\/\/"\+window\.__camHost\+":"/);
  assert.match(out, /""==window\.__camPort\?80:window\.__camPort/);
  const same =
    'x=window.location.protocol+"//"+window.location.host+"/page/a.htm"';
  assert.equal(rewriteScript(same), same);
});

test("the injected script tells pages the camera host", () => {
  const html = rewriteHtml("<head></head>", PREFIX, { host: "10.0.0.5" });
  assert.match(html, /window\.__camHost="10\.0\.0\.5";window\.__camPort=""/);
});

test("the plugin sees the real browser window and the position inside it", () => {
  const out = rewritePlugin(
    "window.top.document.title=u;n=t.getBoundingClientRect();w=window.innerWidth-a;h=window.innerHeight",
  );
  assert.match(out, /window\.top\.document\.title=u/);
  assert.match(out, /n=window\.__camRect\(t\)/);
  assert.match(out, /window\.top\.innerWidth-a/);
  assert.match(out, /h=window\.top\.innerHeight$/);
  assert.equal(
    rewriteTop("window.top.document.title=u"),
    "window.__camTop.document.title=u",
  );
});

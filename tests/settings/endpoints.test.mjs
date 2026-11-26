import assert from "node:assert/strict";
import { test } from "node:test";
import {
  endpointsCookieString,
  endpointsSchema,
  hostnameOf,
  parseEndpointsCookie,
  scopeOf,
} from "../../config/endpoints.ts";

test("scopeOf treats IPs and local names as local, domains as cloud", () => {
  for (const host of [
    "localhost",
    "127.0.0.1",
    "192.168.1.5",
    "10.0.0.2",
    "::1",
    "vms.local",
    "nvr",
  ]) {
    assert.equal(scopeOf(host), "local", host);
  }
  for (const host of ["vms.samtek.id", "central.example.com"]) {
    assert.equal(scopeOf(host), "cloud", host);
  }
});

test("hostnameOf drops the port and keeps IPv6 literals", () => {
  assert.equal(hostnameOf("Vms.Example.com:3100"), "vms.example.com");
  assert.equal(hostnameOf("[::1]:3100"), "::1");
  assert.equal(hostnameOf(null), "");
});

test("endpointsSchema accepts empty values, trims slashes and rejects wrong schemes", () => {
  const empty = {
    centralUrl: "",
    mqttUrl: "",
    mqttUsername: "",
    mqttPassword: "",
  };
  const ok = endpointsSchema.safeParse({
    local: {
      ...empty,
      centralUrl: " http://10.0.0.5:3000/ ",
      mqttUrl: "ws://10.0.0.5:9001",
    },
    cloud: empty,
  });
  assert.equal(ok.success, true);
  assert.equal(ok.data.local.centralUrl, "http://10.0.0.5:3000");
  const bad = endpointsSchema.safeParse({
    local: { ...empty, mqttUrl: "http://10.0.0.5:9001" },
    cloud: { ...empty, centralUrl: "ftp://x.example.com" },
  });
  assert.equal(bad.success, false);
});

test("the cookie value round-trips and a broken one is ignored", () => {
  const empty = {
    centralUrl: "",
    mqttUrl: "",
    mqttUsername: "",
    mqttPassword: "p;w=d",
  };
  const endpoints = { local: empty, cloud: empty };
  const value = endpointsCookieString(endpoints).split(";")[0].split("=")[1];
  assert.deepEqual(parseEndpointsCookie(value), endpoints);
  assert.equal(parseEndpointsCookie("%E0%A4%A"), null);
  assert.equal(parseEndpointsCookie(undefined), null);
});

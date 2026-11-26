import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EMPTY_ENDPOINTS,
  endpointsCookieString,
  endpointsSchema,
  hostnameOf,
  isManualLocal,
  localAddress,
  parseEndpointsCookie,
  scopeOf,
  withLocalAddress,
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
  };
  const endpoints = { local: empty, cloud: empty, isLocalManual: false };
  const value = endpointsCookieString(endpoints).split(";")[0].split("=")[1];
  assert.deepEqual(parseEndpointsCookie(value), endpoints);
  assert.equal(parseEndpointsCookie("%E0%A4%A"), null);
  assert.equal(parseEndpointsCookie(undefined), null);
});

test("localAddress builds the dev ports from the host, with IPv6 in brackets", () => {
  const where = (hostname) => ({ hostname, host: hostname, protocol: "http:" });
  assert.deepEqual(localAddress(where("192.168.1.5"), undefined), {
    centralUrl: "http://192.168.1.5:5000",
    mqttUrl: "ws://192.168.1.5:8040",
  });
  assert.equal(
    localAddress(where("::1"), undefined).centralUrl,
    "http://[::1]:5000",
  );
});

test("withLocalAddress follows the host until the local address is edited", () => {
  const derived = {
    centralUrl: "http://10.0.0.2:5000",
    mqttUrl: "ws://10.0.0.2:8040",
  };
  const old = {
    centralUrl: "http://10.0.0.1:5000",
    mqttUrl: "ws://10.0.0.1:8040",
  };
  const auto = { ...EMPTY_ENDPOINTS, local: old };
  assert.deepEqual(withLocalAddress(auto, derived).local, derived);
  assert.equal(
    withLocalAddress(withLocalAddress(auto, derived), derived).local,
    derived,
  );
  const manual = { ...auto, isLocalManual: true };
  assert.equal(withLocalAddress(manual, derived), manual);
});

test("isManualLocal ignores empty fields and the derived value", () => {
  const derived = {
    centralUrl: "http://10.0.0.2:5000",
    mqttUrl: "ws://10.0.0.2:8040",
  };
  assert.equal(isManualLocal({ centralUrl: "", mqttUrl: "" }, derived), false);
  assert.equal(isManualLocal(derived, derived), false);
  assert.equal(
    isManualLocal({ ...derived, mqttUrl: "ws://x.lan/mqtt" }, derived),
    true,
  );
});

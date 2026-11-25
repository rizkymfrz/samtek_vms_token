import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const placeholders = {
  NEXT_PUBLIC_MQTT_WS_URL: "ws://samtek-placeholder.invalid/mqtt-ws-url",
  NEXT_PUBLIC_MQTT_USERNAME: "samtek-placeholder-mqtt-username",
  NEXT_PUBLIC_MQTT_PASSWORD: "samtek-placeholder-mqtt-password",
  NEXT_PUBLIC_SCAN_LOGINS: "samtek-placeholder-scan-logins",
};

const textExtensions = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".html",
  ".rsc",
  ".json",
  ".body",
  ".txt",
]);

const walk = (directory, visit) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(path, visit);
    } else if (
      entry.isFile() &&
      textExtensions.has(path.slice(path.lastIndexOf(".")))
    ) {
      visit(path);
    }
  }
};

const readValues = (file) => {
  const values = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match) values[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return values;
};

const escapeForJavaScriptString = (value) => {
  return JSON.stringify(value).slice(1, -1);
};

const [command, argument, valuesFile] = process.argv.slice(2);

if (command === "--print-build-env") {
  for (const [key, token] of Object.entries(placeholders))
    console.log(`${key}=${token}`);
} else if (command === "--check") {
  const left = Object.fromEntries(
    Object.keys(placeholders).map((key) => [key, 0]),
  );
  walk(argument, (path) => {
    const text = readFileSync(path, "utf8");
    for (const [key, token] of Object.entries(placeholders))
      if (text.includes(token)) left[key] += 1;
  });
  const remaining = Object.entries(left).filter(([, count]) => count > 0);
  for (const [key, count] of remaining)
    console.error(`${key}: placeholder still in ${count} file(s)`);
  process.exit(remaining.length > 0 ? 1 : 0);
} else if (command === "--require") {
  const found = Object.fromEntries(
    Object.keys(placeholders).map((key) => [key, 0]),
  );
  walk(argument, (path) => {
    const text = readFileSync(path, "utf8");
    for (const [key, token] of Object.entries(placeholders))
      if (text.includes(token)) found[key] += 1;
  });
  const missing = Object.entries(found).filter(([, count]) => count === 0);
  for (const [key] of missing)
    console.error(`${key}: the placeholder is not in the build`);
  process.exit(missing.length > 0 ? 1 : 0);
} else if (command === "--apply") {
  const values = readValues(valuesFile);
  const found = Object.fromEntries(
    Object.keys(placeholders).map((key) => [key, 0]),
  );
  walk(argument, (path) => {
    const text = readFileSync(path, "utf8");
    let changed = text;
    for (const [key, token] of Object.entries(placeholders)) {
      if (!changed.includes(token)) continue;
      found[key] += 1;
      changed = changed
        .split(token)
        .join(escapeForJavaScriptString(values[key] ?? ""));
    }
    if (changed !== text) writeFileSync(path, changed);
  });
  const missing = Object.entries(found).filter(([, count]) => count === 0);
  for (const [key, count] of Object.entries(found))
    console.log(`${key}: ${count} file(s)`);
  for (const [key] of missing)
    console.error(
      `warning: ${key} placeholder not found: the build no longer reads it`,
    );
  process.exit(0);
} else {
  console.error(
    "usage: node apply-public-env.mjs --print-build-env | --require <dir> | --check <dir> | --apply <dir> <public.env>",
  );
  process.exit(2);
}

import { readdirSync, readFileSync } from "node:fs";

const uiIds = readdirSync("components/ui")
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => file.replace(/\.tsx$/, ""));

const registry = readFileSync("app/showcase/_registry.tsx", "utf8");
const registered = [...registry.matchAll(/\{ id: "([^"]+)"/g)].map(
  (match) => match[1],
);

const missing = uiIds.filter((id) => !registered.includes(id));
const stale = registered.filter((id) => !uiIds.includes(id));

if (missing.length || stale.length) {
  if (missing.length)
    console.error(`Not in showcase registry: ${missing.join(", ")}`);
  if (stale.length)
    console.error(
      `Registered but missing in components/ui: ${stale.join(", ")}`,
    );
  process.exit(1);
}

console.log(`Showcase covers all ${uiIds.length} components in components/ui.`);

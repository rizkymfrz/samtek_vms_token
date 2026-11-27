import { spawn } from "node:child_process";
import { copyFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";

const root = process.cwd();

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)),
    );
  });

const waitFor = async (url) => {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      await fetch(url, { redirect: "manual" });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`${url} did not come up`);
};

const showcase = () => {
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
  console.log(
    `Showcase covers all ${uiIds.length} components in components/ui.`,
  );
};

const worker = () => {
  mkdirSync("public", { recursive: true });
  copyFileSync(
    "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs",
    "public/maplibre-gl-worker.mjs",
  );
};

const desktop = async () => {
  worker();
  const next = spawn("npx", ["next", "dev"], { cwd: root, stdio: "inherit" });
  try {
    await waitFor("http://localhost:3000");
    await run("npx", ["electron", "electron/main.cjs"]);
  } finally {
    next.kill();
  }
};

const icon = async () => {
  const { default: sharp } = await import("sharp");
  const size = 512;
  const logo = await sharp("app/icon.svg", { density: 300 })
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  await sharp(logo).toFile("electron/icon.png");
};

const commands = { showcase, worker, desktop, icon };
const command = commands[process.argv[2]];

if (command) await command();
else {
  console.error(
    "Usage: node scripts/dev.mjs showcase | worker | desktop | icon",
  );
  process.exit(1);
}

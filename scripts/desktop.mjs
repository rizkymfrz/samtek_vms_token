import { spawn } from "node:child_process";

const root = process.cwd();
const mode = process.argv[2];

const run = (command, args, env = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, ...env },
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

const dev = async () => {
  await run("node", ["scripts/copy-maplibre-worker.mjs"]);
  const next = spawn("npx", ["next", "dev"], { cwd: root, stdio: "inherit" });
  try {
    await waitFor("http://localhost:3000");
    await run("npx", ["electron", "electron/main.cjs"]);
  } finally {
    next.kill();
  }
};

if (mode === "dev") await dev();
else {
  console.error("Usage: node scripts/desktop.mjs dev");
  process.exit(1);
}

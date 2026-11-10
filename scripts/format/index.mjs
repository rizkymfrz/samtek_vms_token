import { execFileSync } from "node:child_process";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, relative, resolve } from "node:path";
import * as prettier from "prettier";
import { functionsToArrows } from "./arrows.mjs";
import { normalizeBlankLines } from "./blank-lines.mjs";
import { stripComments } from "./comments.mjs";
import { sortImports } from "./imports.mjs";
import { convertReactNamespace } from "./react.mjs";

const EXTENSIONS = new Set([".ts", ".tsx", ".mjs"]);
const EXCLUDED = /(^|\/)(node_modules|\.next|public)\/|\.d\.ts$/;

const runPrettier = async (text, file) =>
  prettier.format(text, {
    ...(await prettier.resolveConfig(file)),
    filepath: file,
  });

const STAGES = [
  stripComments,
  convertReactNamespace,
  functionsToArrows,
  sortImports,
  runPrettier,
  normalizeBlankLines,
  runPrettier,
];

export const formatSource = async (source, file, warn = () => {}) => {
  let text = source;
  for (const stage of STAGES) text = await stage(text, file, warn);
  return text;
};

const listFiles = (targets) => {
  const output = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard"],
    { encoding: "utf8" },
  );
  const files = output
    .split("\n")
    .filter((file) => file && EXTENSIONS.has(extname(file)))
    .filter((file) => !EXCLUDED.test(file));
  if (targets.length === 0) return files;
  const prefixes = targets.map((target) => {
    const path = relative(process.cwd(), resolve(target));
    return statSync(target).isDirectory() ? `${path}/` : path;
  });
  return files.filter((file) =>
    prefixes.some((prefix) => file === prefix || file.startsWith(prefix)),
  );
};

export const main = async () => {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const targets = args.filter((arg) => !arg.startsWith("--"));
  const changed = [];
  const failed = [];
  for (const file of listFiles(targets)) {
    const path = resolve(file);
    const source = readFileSync(path, "utf8");
    try {
      const formatted = await formatSource(source, path, (message) =>
        console.warn(`warn  ${file}: ${message}`),
      );
      if (formatted !== source) {
        changed.push(file);
        if (!check) writeFileSync(path, formatted);
      }
    } catch (error) {
      failed.push(file);
      console.error(`error ${file}: ${error.message}`);
    }
  }
  for (const file of changed)
    console.log(`${check ? "needs format" : "formatted"}  ${file}`);
  console.log(
    `${changed.length} ${check ? "need formatting" : "formatted"}, ${failed.length} failed`,
  );
  if (failed.length > 0 || (check && changed.length > 0)) process.exitCode = 1;
};

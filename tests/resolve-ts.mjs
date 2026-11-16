import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SUFFIXES = [".ts", ".tsx", "/index.ts"];

const withSuffix = (base) =>
  SUFFIXES.map((suffix) => base + suffix).find((path) => existsSync(path));

export const resolve = (specifier, context, next) => {
  if (specifier.startsWith("@/")) {
    const base = ROOT + specifier.slice(2);
    const found = withSuffix(base) ?? (existsSync(base) ? base : null);
    if (found) return next(pathToFileURL(found).href, context);
  }
  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const base = fileURLToPath(new URL(specifier, context.parentURL));
    if (!existsSync(base)) {
      const found = withSuffix(base);
      if (found) return next(pathToFileURL(found).href, context);
    }
  }
  return next(specifier, context);
};

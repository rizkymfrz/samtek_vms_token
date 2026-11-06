import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import spacing from "./eslint-rules/spacing-scale.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Spacing must follow the power-of-two scale (see eslint-rules/spacing-scale.mjs).
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}"],
    plugins: { spacing },
    rules: { "spacing/spacing-scale": "error" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

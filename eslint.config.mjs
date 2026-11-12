import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import spacing from "./eslint-rules/spacing-scale.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "app/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "hooks/**/*.{ts,tsx}",
    ],
    plugins: { spacing },
    rules: { "spacing/spacing-scale": "error" },
  },
  {
    rules: {
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: ["default", "*"],
              message: "Import the named exports you use from react.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "docs/code-style-sample.tsx",
    "public/maplibre-gl-worker.mjs",
  ]),
]);

export default eslintConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.SAMTEK_STANDALONE === "1" ? { output: "standalone" } : {}),
  experimental: {
    agentFeedback: true,
  },
  allowedDevOrigins: ["192.168.1.80"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

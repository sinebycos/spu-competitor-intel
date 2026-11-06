import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All pages are per-user (login required) and read live data, so they render on each request.
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

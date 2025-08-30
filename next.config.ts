import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Alternative approach using outputFileTracingRoot
  outputFileTracingRoot: __dirname,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   eslint: {
    ignoreDuringBuilds: true,
  },
   typescript: {
    // 🚫  TypeScript strict build error
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

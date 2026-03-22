import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/compare/delhi-vs-mumbai-air-quality",
        destination: "/compare/new-delhi-vs-mumbai-air-quality",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

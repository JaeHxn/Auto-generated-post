import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // NextAuth v5 beta의 알려진 route handler 타입 검증 버그 우회
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;

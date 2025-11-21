import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // swcMinify é padrão no Next.js 16+ e não precisa ser especificado
};

export default nextConfig;

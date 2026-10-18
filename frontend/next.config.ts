import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Optional proxy if explicit external backend URL provided
  ...(process.env.BACKEND_URL
    ? {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: `${process.env.BACKEND_URL}/api/:path*`,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;

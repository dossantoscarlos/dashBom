import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "vertis.com.local",
    "localhost",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "vertis.com.local:8080",
        "backvertis.com.local:8000",
        "localhost:3000",
        "localhost:3001",
        "127.0.0.1:3000",
        "127.0.0.1:3001",
      ],
    },
  },
};

export default nextConfig;

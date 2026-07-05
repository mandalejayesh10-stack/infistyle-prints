import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // In production, proxy /api/* to the AWS Lambda Function URL. 
    // In local development, proxy /api/* to local Hono on port 3001.
    const backendUrl = process.env.NEXT_PUBLIC_HONO_BACKEND_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

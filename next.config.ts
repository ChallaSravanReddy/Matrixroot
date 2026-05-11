import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.14:3000', '192.168.1.14', 'localhost:3000'],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "accelerometer=(self \"https://api.razorpay.com\"), gyroscope=(self \"https://api.razorpay.com\"), camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }] },
  allowedDevOrigins: ["10.123.8.195"],
};

export default nextConfig;

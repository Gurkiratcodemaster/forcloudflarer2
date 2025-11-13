import type { NextConfig } from "next";

// Move `allowedDevOrigins` to the top-level config so Next.js recognizes it
// during development. Use a relaxed type to avoid TypeScript complaints
// if your installed `@types/next` doesn't yet include this property.
const nextConfig: any = {
  // This silences the cross-origin dev warning by explicitly allowing
  // requests from your local dev device.
  allowedDevOrigins: ["http://192.168.1.7:3000"],
  experimental: {},
} as NextConfig;

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  experimental: {
    // Enable React strict mode for Framer Motion
  },
};

export default nextConfig;

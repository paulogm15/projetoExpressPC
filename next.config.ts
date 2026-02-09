import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 experimental:{
  authInterrupts:true,
 },
 eslint:{
  ignoreDuringBuilds:true,
 }
};

export default nextConfig;

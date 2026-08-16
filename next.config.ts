import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.17"],
  serverExternalPackages: [
    "@supabase/supabase-js",
    "@supabase/auth-js",
    "@supabase/postgrest-js",
    "@supabase/storage-js",
    "@supabase/realtime-js",
    "@supabase/functions-js",
    "@supabase/ssr",
    "jsonwebtoken",
    "nodemailer",
  ],
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.100.17"],
  serverExternalPackages: ["@supabase/supabase-js", "nodemailer"],
};

export default nextConfig;
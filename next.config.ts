import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the native PostgreSQL driver on the Node.js runtime.
  serverExternalPackages: ["pg"],
};

export default nextConfig;

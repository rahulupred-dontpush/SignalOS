import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Parent Desktop/ has a stray package-lock.json; pin Turbopack to this app.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

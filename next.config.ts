import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Enforce trailing slashes for consistent URLs and reduce duplicate content */
  trailingSlash: false,
  /* Redirect non-www to www for consistency */
  redirects: async () => [
    {
      source: "/:path*",
      has: [{ type: "host", value: "task-flow-delta-inky.vercel.app" }],
      destination: "https://task-flow-delta-inky.vercel.app/:path*",
      permanent: true,
    },
  ],
};

export default nextConfig;

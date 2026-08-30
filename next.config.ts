import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This project lives under /Users/datamatics, which is an unrelated git
  // repository containing a stray home-directory package-lock.json — that
  // makes Next.js's workspace-root inference ambiguous (see the Zenward
  // Platform repo's product-definition.md §14 / next.config.ts for the same
  // condition, documented there first). Pinning the root avoids the warning
  // and any risk of Next.js tracing files outside this project.
  turbopack: {
    root: path.join(__dirname),
  },
  agentRules: false,
  images: {
    // No remote image domains are configured yet — homepage imagery is
    // local placeholder treatments (see docs/design/reference-index.md).
    // Add real production-photography hosts here once approved.
  },
};

export default nextConfig;

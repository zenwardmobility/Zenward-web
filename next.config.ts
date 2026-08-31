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
    // Approved production photography is served locally from public/images
    // (see docs/design/brand-assets.md) and optimized by next/image on
    // demand — no remote image domains are needed. Add a host here only if
    // brand imagery is ever moved to a CDN.
    formats: ["image/avif", "image/webp"],
    // Allowed `quality` values. 75 = supporting imagery default; 90 = the
    // homepage hero (LCP, primary visual — see src/components/public/HomeHero.tsx).
    qualities: [75, 90],
  },
};

export default nextConfig;

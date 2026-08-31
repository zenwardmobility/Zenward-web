/**
 * Approved Zenward Mobility production imagery, centralised so pages import a
 * single object (static image + factual alt text) rather than repeating file
 * paths and alt strings. Static imports give Next/Image intrinsic dimensions
 * and a blur placeholder for free.
 *
 * Production files here are mozjpeg q82 derivatives of the approved PNG
 * masters kept in docs/design/source-assets/. Source ↔ derivative ↔ usage
 * mapping: docs/design/brand-assets.md. Alt text is factual and describes
 * only what is visibly in each frame — no fabricated claims.
 */
import type { StaticImageData } from "next/image";
import heroRampAssist from "../../public/images/zenward-hero-ramp-assist.jpg";
import vanWalkerAssist from "../../public/images/zenward-van-walker-assist.jpg";
import staffWalkingAssist from "../../public/images/zenward-staff-walking-assist.jpg";
import zenwardLogo from "../../public/images/zenward-mobility-logo.png";
import zenwardLogoTrimmed from "../../public/images/zenward-mobility-logo-trimmed.png";

export interface BrandImageAsset {
  src: StaticImageData;
  alt: string;
}

export const brandImages = {
  /** Navy Zenward Mobility van with its side ramp deployed to the ground; a staff member steadies an older passenger using a rollator, outside a stone-and-glass medical building. Van carries the Zenward Mobility mark and 470-206-8005. Homepage hero. */
  heroRampAssist: {
    src: heroRampAssist,
    alt: "A Zenward Mobility staff member helping an older passenger with a rollator toward the deployed side ramp of a Zenward Mobility van outside a medical building",
  },
  /** White Zenward Mobility van with the side door open outside an office building; a staff member assists an older passenger who is using a folding walker. Van carries the Zenward Mobility mark and 470-206-8005. */
  vanWalkerAssist: {
    src: vanWalkerAssist,
    alt: "A Zenward Mobility staff member assisting an older passenger using a walker beside a Zenward Mobility van outside an office building",
  },
  /** A Zenward Mobility staff member walking beside an older passenger who is using a walker, on a path outside a modern care residence. No vehicle in frame. */
  staffWalkingAssist: {
    src: staffWalkingAssist,
    alt: "A Zenward Mobility staff member walking beside an older passenger who is using a walker on a path outside a care residence",
  },
} satisfies Record<string, BrandImageAsset>;

/** The approved Zenward Mobility logo. `trimmed` has the surrounding whitespace cropped for tight placements (header); `full` keeps the original margins. */
export const zenwardLogoImage = {
  full: zenwardLogo,
  trimmed: zenwardLogoTrimmed,
  alt: "Zenward Mobility",
} as const;

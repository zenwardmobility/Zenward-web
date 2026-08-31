/**
 * Approved Zenward Mobility production imagery, centralised so pages import a
 * single object (static image + factual alt text) rather than repeating file
 * paths and alt strings. Static imports give Next/Image intrinsic dimensions
 * and a blur placeholder for free.
 *
 * Production files here are mozjpeg derivatives of the approved PNG masters
 * kept in docs/design/source-assets/ (supporting imagery q82; the hero
 * crops q90 4:4:4 as the LCP visual). Source ↔ derivative ↔ usage mapping:
 * docs/design/brand-assets.md. Alt text is factual and describes only what
 * is visibly in each frame — no fabricated claims.
 */
import type { StaticImageData } from "next/image";
// The homepage hero now has two dedicated compositions — a 16:9 desktop crop
// and a 9:16 portrait mobile crop of the same approved photograph. `-v3` is a
// deliberate new filename so each deploy gets an unambiguous new asset URL
// rather than relying on cache invalidation of an overwritten path.
// Masters: docs/design/source-assets/zenward-hero-{desktop,mobile}-v3.png
import heroDesktop from "../../public/images/zenward-hero-desktop-v3.jpg";
import heroMobile from "../../public/images/zenward-hero-mobile-v3.jpg";
import vanWalkerAssist from "../../public/images/zenward-van-walker-assist.jpg";
import staffWalkingAssist from "../../public/images/zenward-staff-walking-assist.jpg";
import zenwardLogo from "../../public/images/zenward-mobility-logo.png";
import zenwardLogoTrimmed from "../../public/images/zenward-mobility-logo-trimmed.png";

export interface BrandImageAsset {
  src: StaticImageData;
  alt: string;
}

const HERO_ALT =
  "A Zenward Mobility staff member standing with an older passenger seated in a wheelchair at the foot of the deployed side ramp of a navy Zenward Mobility van, outside a medical building";

export const brandImages = {
  /** Homepage hero, desktop/tablet crop (16:9, 1376×768). Navy Zenward Mobility van at a medical building entrance, side door open and ramp deployed to the ground; a staff member stands with an older passenger seated in a wheelchair. Van door carries the Zenward Mobility mark and 470-206-8005. */
  heroDesktop: {
    src: heroDesktop,
    alt: HERO_ALT,
  },
  /** Homepage hero, mobile crop (9:16 portrait, 768×1376) — the same scene, composed vertically with the passenger and staff member centred. */
  heroMobile: {
    src: heroMobile,
    alt: HERO_ALT,
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

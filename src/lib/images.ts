/**
 * Approved Zenward Mobility production imagery, centralised so pages import a
 * single object (static image + factual alt text) rather than repeating file
 * paths and alt strings. Static imports give Next/Image intrinsic dimensions
 * and a blur placeholder for free.
 *
 * Source + usage rules: docs/design/brand-assets.md. Alt text is factual and
 * describes only what is visibly in each frame — no fabricated claims.
 */
import type { StaticImageData } from "next/image";
import wheelchairRampAssist from "../../public/images/zenward-wheelchair-ramp-assist.jpg";
import staffAssistingSenior from "../../public/images/zenward-staff-assisting-senior.jpg";
import zenwardLogo from "../../public/images/zenward-mobility-logo.png";
import zenwardLogoTrimmed from "../../public/images/zenward-mobility-logo-trimmed.png";

export interface BrandImageAsset {
  src: StaticImageData;
  alt: string;
}

export const brandImages = {
  /** White Zenward Mobility wheelchair-accessible van with side ramp deployed; a staff member assists an older passenger seated in a wheelchair outside a medical building. */
  wheelchairRampAssist: {
    src: wheelchairRampAssist,
    alt: "A Zenward Mobility staff member assisting an older passenger in a wheelchair at the ramp of an accessible transport van outside a medical building",
  },
  /** Zenward Mobility van at a hospital main entrance; a staff member walks alongside an older passenger using a wheeled walker up an accessible ramp. */
  staffAssistingSenior: {
    src: staffAssistingSenior,
    alt: "A Zenward Mobility staff member walking beside an older passenger using a walker on an accessible ramp near a hospital entrance, with a Zenward Mobility van parked alongside",
  },
} satisfies Record<string, BrandImageAsset>;

/** The approved Zenward Mobility logo. `trimmed` has the surrounding whitespace cropped for tight placements (header); `full` keeps the original margins. */
export const zenwardLogoImage = {
  full: zenwardLogo,
  trimmed: zenwardLogoTrimmed,
  alt: "Zenward Mobility",
} as const;

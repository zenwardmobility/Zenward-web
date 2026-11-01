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
// Owner-supplied original photograph (WebP, 1448 × 1086), served as-is; no PNG master.
import officialVehicle from "../../public/images/zenward-official-nemt-vehicle.webp";
// Wheelchair page (ZENWARD-WEB-SERVICE-WHEELCHAIR-01), owner-supplied WebP, served as-is.
// The hero is an AI-generated illustrative scene; the other three are authentic photographs.
import wheelchairAssistanceHero from "../../public/images/zenward/wheelchair-transportation/zenward-wheelchair-assistance-hero.webp";
import wheelchairRamp from "../../public/images/zenward/wheelchair-transportation/zenward-wheelchair-accessible-ramp.webp";
import wheelchairSecurementArea from "../../public/images/zenward/wheelchair-transportation/zenward-wheelchair-securement-area.webp";
import passengerSeating from "../../public/images/zenward/wheelchair-transportation/zenward-passenger-seating.webp";
import zenwardLogo from "../../public/images/zenward-mobility-logo.png";
import zenwardLogoTrimmed from "../../public/images/zenward-mobility-logo-trimmed.png";

export interface BrandImageAsset {
  src: StaticImageData;
  alt: string;
}

const HERO_ALT =
  "A Zenward Mobility staff member standing with an older passenger seated in a wheelchair at the foot of the deployed side ramp of a navy Zenward Mobility van, outside a medical building";

export const brandImages = {
  /** Wheelchair/ramp scene, desktop crop. Homepage hero until ZW-WEB-04B2; now reserved for the wheelchair transportation page (04C). Navy Zenward Mobility van at a medical building entrance, side door open and ramp deployed to the ground; a staff member stands with an older passenger seated in a wheelchair. Van door carries the Zenward Mobility mark and 678-935-5489. */
  heroDesktop: {
    src: heroDesktop,
    alt: HERO_ALT,
  },
  /** Wheelchair/ramp scene, mobile crop (9:16 portrait, 768×1376); reserved for 04C like `heroDesktop` — the same scene, composed vertically with the passenger and staff member centred. */
  heroMobile: {
    src: heroMobile,
    alt: HERO_ALT,
  },
  /** Homepage hero (ZW-WEB-04B2) and /healthcare-providers. White Zenward Mobility van with the side door open outside an office building; a staff member assists an older passenger who is using a folding walker. Van carries the Zenward Mobility mark and 678-935-5489. */
  vanWalkerAssist: {
    src: vanWalkerAssist,
    alt: "A Zenward Mobility staff member assisting an older passenger using a walker beside a Zenward Mobility van outside an office building",
  },
  /** A Zenward Mobility staff member walking beside an older passenger who is using a walker, on a path outside a modern care residence. No vehicle in frame. */
  staffWalkingAssist: {
    src: staffWalkingAssist,
    alt: "A Zenward Mobility staff member walking beside an older passenger who is using a walker on a path outside a care residence",
  },
  /** The "What is NEMT?" Resource (ZENWARD-WEB-SEO-ARTICLE-01). Side view of the white Zenward Mobility minivan in a parking lot; the front passenger door carries the Zenward Mobility mark, 678-935-5489 and "Non-Emergency Medical Transportation". No people in frame. */
  officialVehicle: {
    src: officialVehicle,
    alt: "White Zenward Mobility non-emergency medical transportation vehicle with company branding",
  },
  /** The same photograph as `officialVehicle` (same file), with the wheelchair page's own alt text. */
  officialVehicleWheelchair: {
    src: officialVehicle,
    alt: "White Zenward Mobility wheelchair-accessible vehicle showing the company's branding.",
  },
  /** Wheelchair page hero (1448 × 1086). AI-GENERATED illustrative scene, not a photograph of real staff or passengers: the white Zenward vehicle with the rear hatch open and rear ramp deployed outside a healthcare building; an assistant in a navy polo helps an older passenger in a wheelchair onto the ramp. Branding (mark, 678-935-5489, descriptor, BraunAbility) on the front door only. */
  wheelchairAssistanceHero: {
    src: wheelchairAssistanceHero,
    alt: "Illustrative scene of a Zenward Mobility assistant helping a wheelchair passenger board a wheelchair-accessible vehicle using a rear ramp.",
  },
  /** Authentic, portrait (1086 × 1448): rear view, hatch open, BraunAbility rear-entry ramp deployed, two floor securement fittings and the rear seats visible. */
  wheelchairRamp: {
    src: wheelchairRamp,
    alt: "Rear-entry BraunAbility wheelchair ramp deployed on Zenward Mobility's vehicle.",
  },
  /** Authentic, portrait (1086 × 1448): the wheelchair area floor seen from the rear opening, with floor securement fittings and the second-row seats beyond. */
  wheelchairSecurementArea: {
    src: wheelchairSecurementArea,
    alt: "Wheelchair accommodation area with floor securement fittings inside Zenward Mobility's vehicle.",
  },
  /** Authentic, portrait (1086 × 1448): second-row passenger seating seen through the open sliding door. */
  passengerSeating: {
    src: passengerSeating,
    alt: "Passenger seating inside Zenward Mobility's wheelchair-accessible vehicle.",
  },
} satisfies Record<string, BrandImageAsset>;

/** The approved Zenward Mobility logo. `trimmed` has the surrounding whitespace cropped for tight placements (header); `full` keeps the original margins. */
export const zenwardLogoImage = {
  full: zenwardLogo,
  trimmed: zenwardLogoTrimmed,
  alt: "Zenward Mobility",
} as const;

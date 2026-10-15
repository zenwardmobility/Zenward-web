import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The locked Zenward Mobility logo (public/brand/, approved outside this
 * codebase; ZW-WEB-04C). The SVG files are served byte-for-byte as supplied:
 * never redrawn, recoloured, optimised or re-wrapped here.
 *
 *   primary  public/brand/zenward-logo-primary.svg  (light backgrounds)
 *   inverse  public/brand/zenward-logo-inverse.svg  (dark Care Navy backgrounds)
 *
 * The logo artboard (viewBox 0 0 2048 682) includes built-in clear space. Its
 * visible artwork measures x 235–1814, y 124–553 (bbox measured in Chrome).
 * To keep the site's existing visual footprint (the old trimmed raster at the
 * same visible height), `height` is the height of the VISIBLE artwork: the
 * box below is exactly the artwork's size, and the full SVG is positioned so
 * its clear space overflows invisibly. Nothing is clipped or scaled
 * unevenly.
 */
const VIEW = { w: 2048, h: 682 } as const;
const ART = { x: 235, y: 124, w: 1579, h: 429 } as const;

const SRC = {
  primary: "/brand/zenward-logo-primary.svg",
  inverse: "/brand/zenward-logo-inverse.svg",
} as const;

export interface ZenwardLogoProps {
  /** `primary` on light backgrounds; `inverse` on dark Care Navy backgrounds. */
  treatment?: keyof typeof SRC;
  /** Height in px of the visible logo artwork; width follows its aspect ratio. */
  height?: number;
  /**
   * Accessible name. Pass "" when the logo sits inside a link that already
   * carries an aria-label (e.g. the header home link), so it isn't announced
   * twice.
   */
  alt?: string;
  className?: string;
  priority?: boolean;
}

export function ZenwardLogo({
  treatment = "primary",
  height = 32,
  alt = "Zenward Mobility",
  className,
  priority,
}: ZenwardLogoProps) {
  const scale = height / ART.h;
  const boxWidth = Math.round(ART.w * scale * 10) / 10;
  const svgWidth = Math.round(VIEW.w * scale * 10) / 10;
  const svgHeight = Math.round(VIEW.h * scale * 10) / 10;

  return (
    <span className={cn("relative block shrink-0", className)} style={{ width: boxWidth, height }}>
      <Image
        src={SRC[treatment]}
        alt={alt}
        width={Math.round(svgWidth)}
        height={Math.round(svgHeight)}
        priority={priority}
        unoptimized
        className="pointer-events-none absolute max-w-none select-none"
        style={{
          width: svgWidth,
          height: svgHeight,
          left: -ART.x * scale,
          top: -ART.y * scale,
        }}
      />
    </span>
  );
}

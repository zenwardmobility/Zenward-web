import Image from "next/image";
import { cn } from "@/lib/cn";
import type { BrandImageAsset } from "@/lib/images";

export interface BrandImageProps {
  asset: BrandImageAsset;
  aspect?: "video" | "square" | "portrait" | "wide";
  /** Override the preset aspect with an explicit responsive class, e.g. "aspect-[4/3] lg:aspect-square". */
  aspectClass?: string;
  /** Only the hero / LCP image should set this. */
  priority?: boolean;
  /** Responsive `sizes` hint; defaults to a roughly half-width layout slot. */
  sizes?: string;
  className?: string;
  /** CSS object-position, e.g. "center 30%", when the default crop clips something important. */
  objectPosition?: string;
}

const aspectClasses: Record<NonNullable<BrandImageProps["aspect"]>, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-3/4",
  wide: "aspect-21/9",
};

/**
 * Real approved photography, framed to match the rhythm the homepage
 * direction calls for (rounded, soft shadow, deliberate crop). Replaces
 * PhotoPlaceholder wherever an approved image exists — see
 * docs/design/brand-assets.md.
 */
export function BrandImage({
  asset,
  aspect = "video",
  aspectClass,
  priority = false,
  sizes = "(min-width: 1024px) 40rem, 100vw",
  className,
  objectPosition,
}: BrandImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-brand-calm-mist",
        aspectClass ?? aspectClasses[aspect],
        className,
      )}
    >
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        priority={priority}
        sizes={sizes}
        placeholder="blur"
        className="object-cover"
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}

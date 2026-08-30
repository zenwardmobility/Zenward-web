import Image from "next/image";
import { cn } from "@/lib/cn";
import { zenwardLogoImage } from "@/lib/images";

export interface ZenwardLogoProps {
  /**
   * `bare` renders the approved logo asset directly (for light backgrounds).
   * `chip` sets it on a white rounded card — the rendering treatment used on
   * dark Care Navy backgrounds (footer, brand moments) so the supplied asset
   * is never re-coloured or recreated, only framed.
   */
  treatment?: "bare" | "chip";
  /** Rendered height in px; width scales to the logo's aspect ratio. */
  height?: number;
  className?: string;
  priority?: boolean;
}

const ASPECT = zenwardLogoImage.trimmed.width / zenwardLogoImage.trimmed.height;

/**
 * Renders the approved Zenward Mobility logo (docs/design/brand-assets.md).
 * The asset is used as-is — its icon, wordmark, typography, and colours are
 * never modified here. Only the frame around it changes by `treatment`.
 */
export function ZenwardLogo({ treatment = "bare", height = 32, className, priority }: ZenwardLogoProps) {
  const width = Math.round(height * ASPECT);

  const image = (
    <Image
      src={zenwardLogoImage.trimmed}
      alt={zenwardLogoImage.alt}
      height={height}
      width={width}
      priority={priority}
      className="block h-full w-auto"
      sizes={`${width}px`}
    />
  );

  if (treatment === "chip") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md bg-white px-3 py-2 shadow-sm",
          className,
        )}
        style={{ height: height + 16 }}
      >
        {image}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center", className)} style={{ height }}>
      {image}
    </span>
  );
}

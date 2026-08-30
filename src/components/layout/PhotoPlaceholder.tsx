import { Image as ImageIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";

export interface PhotoPlaceholderProps {
  /** Describes the intended real photography, e.g. "Driver assisting a passenger into a vehicle." Never rendered as a claim — only as a caption on the placeholder itself. */
  description: string;
  aspect?: "video" | "square" | "portrait" | "wide";
  className?: string;
}

const aspectClasses: Record<NonNullable<PhotoPlaceholderProps["aspect"]>, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-3/4",
  wide: "aspect-21/9",
};

/**
 * Deliberate placeholder for premium photography that doesn't exist yet.
 * This project does not fabricate or AI-generate photorealistic imagery of
 * vehicles, drivers, or patients to stand in as real brand assets — see
 * docs/design/reference-index.md. Replace with real production photography
 * once approved; until then this keeps the visual rhythm the homepage
 * direction calls for without pretending to be a real photo.
 */
export function PhotoPlaceholder({ description, aspect = "video", className }: PhotoPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`Photography placeholder: ${description}`}
      className={cn(
        "relative flex items-end overflow-hidden rounded-lg bg-linear-to-br from-brand-care-navy via-brand-interactive-teal to-brand-route-teal",
        aspectClasses[aspect],
        className,
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <ImageIcon className="size-10 text-white/40" weight="thin" aria-hidden />
      </div>
      <p className={cn(typography.metadata, "relative m-3 rounded-xs bg-black/25 px-2 py-1 text-white/80")}>
        Photography placeholder — {description}
      </p>
    </div>
  );
}

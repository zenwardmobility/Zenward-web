import { Phone } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { business } from "@/lib/business";

type Tone = "navy" | "teal" | "outline";

const toneClasses: Record<Tone, string> = {
  navy: "bg-brand-care-navy text-white hover:brightness-110",
  teal: "bg-brand-interactive-teal text-white hover:brightness-95",
  outline: "border border-border-strong bg-surface-elevated text-text-primary hover:bg-surface-hover",
};

/**
 * Highlighted, accessible "call us" CTA. One tel: link, one place — the
 * number always comes from `src/lib/business.ts`. 48px min height (touch
 * target), visible focus via the global `:focus-visible` outline.
 */
export function PhoneCtaButton({
  tone = "navy",
  className,
  label,
}: {
  tone?: Tone;
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={business.phoneHref}
      aria-label={`Call Zenward at ${business.phoneDisplay}`}
      className={cn(
        typography.button,
        "inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 transition-[filter,background-color] duration-base ease-standard",
        toneClasses[tone],
        className,
      )}
    >
      <Phone className="size-4" weight="fill" aria-hidden />
      {label ?? `Call ${business.phoneDisplay}`}
    </a>
  );
}

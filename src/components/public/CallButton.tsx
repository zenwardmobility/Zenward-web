import type { ReactNode } from "react";
import { Phone } from "@phosphor-icons/react/dist/ssr";
import { buttonClassNames, type ButtonSize, type ButtonVariant } from "@/components/ui/buttonStyles";
import { TrackedPhoneLink } from "@/components/public/TrackedPhoneLink";
import type { AnalyticsSurface } from "@/lib/analytics/events";
import { business } from "@/lib/business";

/**
 * A `tel:` call action styled with the shared button system, so phone CTAs
 * sit beside LinkButton / TrackedLinkButton with identical sizing (48-56px
 * targets). The number always comes from `src/lib/business.ts`. Clicks fire
 * `phone_cta_clicked` with `surface` only (see TrackedPhoneLink).
 */
export function CallButton({
  surface,
  variant = "outline",
  size = "lg",
  onDark = false,
  className,
  label,
}: {
  surface: AnalyticsSurface;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onDark?: boolean;
  className?: string;
  /**
   * Visible label. Defaults to responsive text: "Call 678-935-5489" on phones
   * (full-width stacked buttons), the bare number from `sm` up.
   */
  label?: ReactNode;
}) {
  return (
    <TrackedPhoneLink
      surface={surface}
      aria-label={`Call Zenward at ${business.phoneDisplay}`}
      className={buttonClassNames(variant, size, false, className, onDark)}
    >
      <Phone className="size-4" weight="fill" aria-hidden />
      {label ?? (
        <>
          <span className="sm:hidden">Call {business.phoneDisplay}</span>
          <span className="hidden sm:inline">{business.phoneDisplay}</span>
        </>
      )}
    </TrackedPhoneLink>
  );
}

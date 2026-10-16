import type { Icon } from "@phosphor-icons/react";
import { ChatCircleText, Clock, IdentificationCard, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";
import { TRUST_POINTS, type TrustKey } from "@/lib/trust";

const ICONS: Record<TrustKey, Icon> = {
  licensed: ShieldCheck,
  onTime: Clock,
  drivers: IdentificationCard,
  response: ChatCircleText,
};

/**
 * Owner-confirmed operating facts as a short, factual strip (ZW-WEB-04F).
 * Wording comes only from src/lib/trust.ts. Plain icons, no seals, badges,
 * emblems or stars.
 *
 *   band     icon + label + one-line detail, 2x2 from sm and 4 across on
 *            desktop. On phones it shows the compact labels only (2x2), so
 *            it stays short; the response label keeps its working-hours
 *            qualifier. For the homepage.
 *   compact  icon + label only; 2x2 on phones, one row on desktop. For
 *            service pages, campaign heroes (tone="dark") and similar.
 */
export function TrustStrip({
  variant = "band",
  tone = "light",
  className,
}: {
  variant?: "band" | "compact";
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";

  if (variant === "compact") {
    return (
      <ul
        aria-label="Zenward operating standards"
        className={cn("grid grid-cols-2 gap-x-md gap-y-3 lg:grid-cols-4", className)}
      >
        {TRUST_POINTS.map((point) => {
          const PointIcon = ICONS[point.key];
          return (
            <li
              key={point.key}
              className={cn(
                typography.bodySmall,
                "flex items-start gap-2 font-semibold",
                dark ? "text-white" : "text-text-primary",
              )}
            >
              <PointIcon
                className={cn("mt-0.5 size-5 shrink-0", dark ? "text-brand-route-teal" : "text-brand-interactive-teal")}
                weight="fill"
                aria-hidden
              />
              {point.compactLabel}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section aria-labelledby="trust-strip-heading" className={cn("bg-surface-elevated", className)}>
      <h2 id="trust-strip-heading" className="sr-only">
        Why you can rely on Zenward
      </h2>
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-md gap-y-md px-md py-lg sm:gap-y-lg sm:px-xl sm:py-xl lg:grid-cols-4 lg:gap-x-xl">
        {TRUST_POINTS.map((point) => {
          const PointIcon = ICONS[point.key];
          return (
            <li key={point.key} className="flex items-start gap-2.5 sm:gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-calm-mist text-brand-care-navy sm:size-10">
                <PointIcon className="size-4 sm:size-5" weight="regular" aria-hidden />
              </span>
              <span>
                <span className={cn(typography.bodySmall, "block font-semibold text-text-primary sm:hidden")}>
                  {point.compactLabel}
                </span>
                <span className={cn(typography.bodySmall, "hidden font-semibold text-text-primary sm:block")}>{point.label}</span>
                <span className={cn(typography.bodySmall, "mt-0.5 hidden text-text-secondary sm:block")}>{point.detail}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

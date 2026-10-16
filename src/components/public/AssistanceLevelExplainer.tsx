import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { ASSISTANCE_LEVELS, ASSISTANCE_REVIEW_NOTE } from "@/lib/assistance-level";

export const ASSISTANCE_EXPLAINER_HEADING = "Choose the level of assistance that fits the trip";

/**
 * Public explainer for the Pickup & assistance level (ZW-WEB-04G3), from the
 * one canonical source (src/lib/assistance-level.ts). Read-only: the
 * interactive choice lives on the request form.
 *
 * - "full": four definition cards (2 × 2 from sm). Used where assistance is
 *   central (the wheelchair service page).
 * - "compact": a short definition list. Used contextually elsewhere so pages
 *   don't repeat a large identical block.
 *
 * Renders content only; the caller provides the surrounding Section.
 */
export function AssistanceLevelExplainer({
  variant = "compact",
  requestHref = "/request-transportation",
  headingId = "assistance-levels",
}: {
  variant?: "full" | "compact";
  requestHref?: string;
  headingId?: string;
}) {
  return (
    <div aria-labelledby={headingId} role="region">
      <h2 id={headingId} className={cn(variant === "full" ? typography.sectionTitle : typography.subsectionTitle, "scroll-mt-28 text-text-primary")}>
        {ASSISTANCE_EXPLAINER_HEADING}
      </h2>
      <p className={cn(typography.body, "mt-2 max-w-[40rem] text-text-secondary")}>
        When you request transportation, you choose the pickup &amp; assistance level. It describes how much driver escort
        would help at pickup and drop-off. {ASSISTANCE_REVIEW_NOTE}
      </p>

      {variant === "full" ? (
        <dl className="mt-xl grid grid-cols-1 gap-md sm:grid-cols-2">
          {ASSISTANCE_LEVELS.map((level) => (
            <div key={level.value} className="rounded-lg border border-border-subtle bg-surface-elevated p-lg">
              <dt className={cn(typography.body, "font-semibold text-text-primary")}>{level.label}</dt>
              <dd className={cn(typography.bodySmall, "mt-1 text-text-secondary")}>{level.description}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <dl className="mt-md grid max-w-[52rem] grid-cols-1 gap-x-xl gap-y-3 sm:grid-cols-2">
          {ASSISTANCE_LEVELS.map((level) => (
            <div key={level.value}>
              <dt className={cn(typography.bodySmall, "font-semibold text-text-primary")}>{level.label}</dt>
              <dd className={cn(typography.bodySmall, "text-text-secondary")}>{level.description}</dd>
            </div>
          ))}
        </dl>
      )}

      <Link
        href={requestHref}
        className={cn(typography.bodySmall, "mt-md inline-flex min-h-11 items-center gap-1.5 font-semibold text-text-accent-on-tint underline-offset-4 hover:underline")}
      >
        Request a Quote
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

import { forwardRef } from "react";
import Link from "next/link";
import { CheckCircle, Phone } from "@phosphor-icons/react/dist/ssr";
import { TrackedPhoneLink } from "@/components/public/TrackedPhoneLink";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { business } from "@/lib/business";
import {
  SUCCESS_ACTIONS,
  SUCCESS_HEADING,
  SUCCESS_HELP_HEADING,
  SUCCESS_NEXT_HEADING,
  SUCCESS_NOT_CONFIRMED,
  SUCCESS_RECEIVED,
  SUCCESS_STEPS,
} from "@/lib/quote-form/success";

/**
 * The request-received experience (ZW-WEB-04G3). Rendered ONLY after the
 * trusted Server Action returned `delivered: true` (the form's reducer gates
 * it). Focus moves to the heading.
 *
 * "What happens next" explains the process. Every step looks the same: there
 * is no current, completed or pending state, no progress bar and no
 * animation, because Zenward-Web cannot see the request's real status. No
 * reference number or internal identifier is shown, and nothing about the
 * request is stored in the browser.
 */
export const RequestSuccess = forwardRef<HTMLHeadingElement>(function RequestSuccess(_, headingRef) {
  return (
    <div data-request-success className="mx-auto w-full max-w-[40rem] scroll-mt-24 overflow-hidden rounded-lg border border-success-border bg-surface-elevated">
      <div className="bg-success-bg px-lg py-lg text-center sm:px-xl sm:py-xl">
        <CheckCircle className="mx-auto size-10 text-success-strong" weight="fill" aria-hidden />
        <h2 ref={headingRef} tabIndex={-1} className={cn(typography.subsectionTitle, "mt-3 text-text-primary outline-none")}>
          {SUCCESS_HEADING}
        </h2>
        <p className={cn(typography.body, "mt-2 text-text-primary")}>{SUCCESS_RECEIVED}</p>
        <p className={cn(typography.body, "mt-1 font-semibold text-text-primary")}>{SUCCESS_NOT_CONFIRMED}</p>
      </div>

      <div className="px-lg py-lg sm:px-xl">
        <h3 className={cn(typography.body, "font-semibold text-text-primary")}>{SUCCESS_NEXT_HEADING}</h3>
        <ol className="mt-md flex flex-col gap-md">
          {SUCCESS_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span
                aria-hidden
                className={cn(typography.bodySmall, "flex size-7 shrink-0 items-center justify-center rounded-full border border-border-strong font-semibold text-text-primary")}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className={cn(typography.bodySmall, "block font-semibold text-text-primary")}>{step.title}</span>
                <span className={cn(typography.bodySmall, "block text-text-secondary")}>{step.text}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-lg border-t border-border-subtle pt-md">
          <p className={cn(typography.bodySmall, "text-text-secondary")}>{SUCCESS_HELP_HEADING}</p>
          <TrackedPhoneLink
            surface="request_form"
            aria-label={`Call Zenward at ${business.phoneDisplay}`}
            className={cn(typography.body, "inline-flex min-h-11 items-center gap-2 font-semibold text-brand-care-navy underline-offset-4 hover:underline")}
          >
            <Phone className="size-5 text-brand-interactive-teal" weight="fill" aria-hidden />
            Call Zenward {business.phoneDisplay}
          </TrackedPhoneLink>
        </div>

        <div className="mt-sm flex flex-wrap gap-x-lg">
          {SUCCESS_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(typography.bodySmall, "inline-flex min-h-11 items-center font-medium text-text-accent-on-tint underline-offset-4 hover:underline")}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
});

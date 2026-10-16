import { Check } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { STEPS } from "@/lib/quote-form/model";

/**
 * Progress through the quote form (ZW-WEB-04G). Phones: one compact line,
 * "Step 2 of 5 · Schedule", with a thin bar. sm and up: a horizontal list of
 * all steps. The current step has aria-current="step", completed steps show a
 * check and say "completed" to screen readers, so state never relies on
 * colour alone. Not interactive: moving between steps happens through
 * Continue / Back and the Edit links on the review step, so validation is
 * never skipped.
 */
export function QuoteStepper({ current }: { current: number }) {
  const total = STEPS.length;
  return (
    <nav aria-label="Request progress">
      <div className="sm:hidden">
        <p className={cn(typography.bodySmall, "text-text-secondary")}>
          <span className="font-semibold text-text-primary">
            Step {current + 1} of {total}
          </span>{" "}
          · {STEPS[current].label}
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-border-subtle" aria-hidden>
          <div className="h-full rounded-full bg-brand-care-navy" style={{ width: `${((current + 1) / total) * 100}%` }} />
        </div>
      </div>
      <ol className="hidden items-center gap-2 sm:flex">
        {STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  typography.metadata,
                  "flex size-7 shrink-0 items-center justify-center rounded-full border font-semibold",
                  active && "border-brand-care-navy bg-brand-care-navy text-white",
                  done && "border-brand-care-navy bg-surface-elevated text-brand-care-navy",
                  !active && !done && "border-border-strong text-text-muted",
                )}
              >
                {done ? <Check className="size-4" weight="bold" aria-hidden /> : index + 1}
              </span>
              <span
                className={cn(
                  typography.bodySmall,
                  "truncate",
                  active ? "font-semibold text-text-primary" : done ? "text-text-primary" : "text-text-muted",
                )}
              >
                {step.label}
                {done && <span className="sr-only"> (completed)</span>}
              </span>
              {index < total - 1 && <span aria-hidden className="hidden h-px flex-1 bg-border-strong md:block" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

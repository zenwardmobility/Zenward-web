import { useId } from "react";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import {
  ASSISTANCE_LEVELS,
  ASSISTANCE_LEVEL_LABEL,
  ASSISTANCE_REVIEW_NOTE,
  type AssistanceLevel,
} from "@/lib/assistance-level";

/**
 * "Pickup & assistance level" (ZW-WEB-04G3): four large radio cards in a
 * labelled fieldset. Real `<input type="radio">`s, so arrow keys, focus and
 * screen readers behave natively; each description is connected with
 * aria-describedby. The selected card shows the native filled radio and a
 * navy border plus tint, so selection is never colour-only. Stacked on
 * phones, 2 × 2 from `sm`. Every card is well over 44px tall.
 */
export function AssistanceLevelField({
  value,
  onChange,
  error,
}: {
  value: AssistanceLevel | "";
  onChange: (value: AssistanceLevel) => void;
  error?: string;
}) {
  const id = useId();
  const noteId = `${id}-note`;
  const errorId = `${id}-error`;
  return (
    <fieldset
      className="flex min-w-0 flex-col gap-2"
      aria-describedby={cn(noteId, error && errorId)}
      aria-invalid={Boolean(error) || undefined}
    >
      <legend className={cn(typography.label, "mb-1 text-text-primary")}>
        {ASSISTANCE_LEVEL_LABEL}
        <span className="text-critical-text" aria-hidden>
          {" "}
          *
        </span>
      </legend>
      <p id={noteId} className={cn(typography.metadata, "text-text-muted")}>
        How much driver escort would help at pickup and drop-off? {ASSISTANCE_REVIEW_NOTE}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ASSISTANCE_LEVELS.map((level) => {
          const descriptionId = `${id}-${level.value}`;
          return (
            <label
              key={level.value}
              className={cn(
                "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border bg-surface-elevated px-4 py-3 transition-colors duration-base",
                error ? "border-critical-strong" : "border-border-strong",
                "hover:border-brand-interactive-teal/60 has-[:checked]:border-brand-care-navy has-[:checked]:bg-brand-calm-mist",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-interactive-teal",
              )}
            >
              <input
                type="radio"
                name="assistanceLevel"
                value={level.value}
                required
                checked={value === level.value}
                onChange={() => onChange(level.value)}
                aria-describedby={descriptionId}
                className="mt-1 size-5 shrink-0 accent-brand-care-navy focus-visible:outline-none"
              />
              <span className="min-w-0">
                <span className={cn(typography.body, "block font-semibold text-text-primary")}>{level.label}</span>
                <span id={descriptionId} className={cn(typography.bodySmall, "mt-0.5 block text-text-secondary")}>
                  {level.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className={cn(typography.metadata, "text-critical-text")}>
          {error}
        </p>
      )}
    </fieldset>
  );
}

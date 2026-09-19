import { useId } from "react";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";

export interface SegmentedChoiceOption {
  value: string;
  label: string;
}

export interface SegmentedChoiceProps {
  label: string;
  name: string;
  options: SegmentedChoiceOption[];
  /** Controlled value. Omit for an uncontrolled group (use `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  helpText?: string;
  error?: string;
}

/**
 * A short native radio group presented as large, equal-width segments — a
 * labelled fieldset of real `<input type="radio">`s, so keyboard arrows,
 * form validation and screen readers all behave natively. 48px tall for a
 * comfortable touch target. Use for 2–3 mutually exclusive choices; use a
 * Select for longer lists.
 */
export function SegmentedChoice({
  label,
  name,
  options,
  value,
  defaultValue,
  onChange,
  required,
  helpText,
  error,
}: SegmentedChoiceProps) {
  const id = useId();
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const controlled = value !== undefined;

  return (
    <fieldset
      className="flex min-w-0 flex-col gap-1.5"
      aria-describedby={cn(helpId, errorId) || undefined}
      aria-invalid={Boolean(error) || undefined}
    >
      <legend className={cn(typography.label, "mb-1.5 text-text-primary")}>
        {label}
        {required && (
          <span className="text-critical-text" aria-hidden>
            {" "}
            *
          </span>
        )}
      </legend>
      <div className="grid auto-cols-fr grid-flow-col gap-2 sm:inline-grid sm:grid-flow-col sm:auto-cols-[minmax(8rem,auto)]">
        {options.map((option) => (
          <label key={option.value} className="relative block cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              required={required}
              {...(controlled
                ? { checked: value === option.value }
                : { defaultChecked: defaultValue === option.value })}
              onChange={() => onChange?.(option.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                typography.body,
                "flex h-12 items-center justify-center rounded-sm border bg-surface-elevated px-5 text-text-primary transition-colors duration-base",
                error ? "border-critical-strong" : "border-border-strong",
                "peer-checked:border-brand-care-navy peer-checked:bg-brand-care-navy peer-checked:text-white",
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-interactive-teal",
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {helpText && !error && (
        <p id={helpId} className={cn(typography.metadata, "text-text-muted")}>
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} className={cn(typography.metadata, "text-critical-text")} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

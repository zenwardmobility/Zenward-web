import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  helpText?: string;
  error?: string;
}

/** Labeled text input, sized for a public-facing form (large touch target). */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helpText, error, required, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helpId = helpText ? `${inputId}-help` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className={cn(typography.label, "text-text-primary")}>
          {label}
          {required && (
            <span className="text-critical-text" aria-hidden>
              {" "}
              *
            </span>
          )}
        </label>
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-describedby={cn(helpId, errorId) || undefined}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            typography.body,
            "h-12 rounded-sm border bg-surface-elevated px-4 text-text-primary placeholder:text-text-disabled",
            error ? "border-critical-strong" : "border-border-strong",
            className,
          )}
          {...props}
        />
        {helpText && !error && (
          <p id={helpId} className={cn(typography.metadata, "text-text-muted")}>
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className={cn(typography.metadata, "text-critical-text")}>
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

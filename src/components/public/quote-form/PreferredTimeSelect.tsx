import { useId } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { PREFERRED_TIME_GROUPS } from "@/lib/quote-form/dates";

/**
 * A preferred time, chosen from 15-minute steps in one compact native select
 * (ZW-WEB-04G). On phones the OS picker opens, so there is no long column of
 * time buttons. These are preferences, not slots: every time is listed, none
 * is marked available, and "No preference" is the default. Value is the
 * 24-hour `HH:MM` wire format.
 */
export function PreferredTimeSelect({
  label,
  help,
  value,
  onChange,
  error,
}: {
  label: string;
  help?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={cn(typography.label, "text-text-primary")}>
        {label}
      </label>
      {help && (
        <p id={helpId} className={cn(typography.metadata, "text-text-muted")}>
          {help}
        </p>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={cn(helpId, errorId) || undefined}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            typography.body,
            "h-12 w-full appearance-none rounded-sm border bg-surface-elevated pl-4 pr-10 text-text-primary",
            error ? "border-critical-strong" : "border-border-strong",
          )}
        >
          <option value="">No preference</option>
          {PREFERRED_TIME_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <CaretDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
      </div>
      {error && (
        <p id={errorId} className={cn(typography.metadata, "text-critical-text")}>
          {error}
        </p>
      )}
    </div>
  );
}

import { useId } from "react";
import { Input } from "@/components/ui/Input";
import { SegmentedChoice } from "@/components/ui/SegmentedChoice";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { WEEKDAYS, WEEKDAY_LABELS } from "@/lib/request-intake/recurring";

export const RECURRING_FIELD_NAMES = {
  days: "recurringDay",
  startDate: "recurringStartDate",
  endDate: "recurringEndDate",
  appointmentTime: "recurringAppointmentTime",
  returnExpected: "recurringReturnExpected",
} as const;

/**
 * The fields revealed when Trip frequency is "Recurring". Rendered inside the
 * request form (uncontrolled inputs; the form reads them from FormData). The
 * schedule described here is the REQUESTED schedule — it does not book trips.
 * Nothing entered here is ever placed in a URL.
 */
export function RecurringScheduleFields({
  startDate,
  onStartDateChange,
  daysError,
}: {
  startDate: string;
  onStartDateChange: (value: string) => void;
  daysError?: string;
}) {
  const daysId = useId();
  const daysErrorId = daysError ? `${daysId}-error` : undefined;

  return (
    <div
      className="flex flex-col gap-md rounded-lg border border-border-subtle bg-surface-secondary p-md sm:p-lg"
      data-testid="recurring-fields"
    >
      <div>
        <p className={cn(typography.body, "font-semibold text-text-primary")}>Recurring schedule</p>
        <p className={cn(typography.bodySmall, "mt-0.5 text-text-secondary")}>
          Tell us the schedule you&rsquo;d like. Zenward will review it and confirm what can be arranged &mdash;
          this doesn&rsquo;t book trips automatically.
        </p>
      </div>

      <fieldset className="flex min-w-0 flex-col gap-1.5" aria-describedby={daysErrorId} aria-invalid={Boolean(daysError) || undefined}>
        <legend className={cn(typography.label, "mb-1.5 text-text-primary")}>
          Days of the week
          <span className="text-critical-text" aria-hidden>
            {" "}
            *
          </span>
        </legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {WEEKDAYS.map((day) => (
            <label key={day} className="relative block cursor-pointer">
              <input type="checkbox" name={RECURRING_FIELD_NAMES.days} value={day} className="peer sr-only" />
              <span
                className={cn(
                  typography.body,
                  "flex h-12 items-center justify-center rounded-sm border bg-surface-elevated text-text-primary transition-colors duration-base",
                  daysError ? "border-critical-strong" : "border-border-strong",
                  "peer-checked:border-brand-care-navy peer-checked:bg-brand-care-navy peer-checked:text-white",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-interactive-teal",
                )}
              >
                <span aria-hidden>{WEEKDAY_LABELS[day].short}</span>
                <span className="sr-only">{WEEKDAY_LABELS[day].long}</span>
              </span>
            </label>
          ))}
        </div>
        {daysError && (
          <p id={daysErrorId} className={cn(typography.metadata, "text-critical-text")} role="alert">
            {daysError}
          </p>
        )}
      </fieldset>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input
          name={RECURRING_FIELD_NAMES.startDate}
          label="Start date"
          type="date"
          required
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
        <Input
          name={RECURRING_FIELD_NAMES.endDate}
          label="End date (optional)"
          type="date"
          min={startDate || undefined}
        />
        <Input name={RECURRING_FIELD_NAMES.appointmentTime} label="Appointment time (optional)" type="time" />
      </div>

      <SegmentedChoice
        label="Return transportation expected?"
        name={RECURRING_FIELD_NAMES.returnExpected}
        required
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />
    </div>
  );
}

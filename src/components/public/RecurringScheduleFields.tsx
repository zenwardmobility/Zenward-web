"use client";

import { useId, useState } from "react";
import { SegmentedChoice } from "@/components/ui/SegmentedChoice";
import { QuoteCalendar } from "@/components/public/quote-form/QuoteCalendar";
import { PreferredTimeSelect } from "@/components/public/quote-form/PreferredTimeSelect";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { WEEKDAYS, WEEKDAY_LABELS, type Weekday } from "@/lib/request-intake/recurring";
import { RECURRING_NOTE, RETURN_TRIP_NOTE, type FieldErrors, type QuoteField, type QuoteFormValues } from "@/lib/quote-form/model";

/**
 * The REQUESTED recurring schedule (ZW-WEB-04G, controlled). Only the
 * contract's `recurringSchedule` members are collected: days of the week,
 * start date, optional end date, optional typical appointment time and
 * whether a return trip is expected. It never books a series; Zenward
 * reviews it and confirms what can be arranged.
 */
export function RecurringScheduleFields({
  values,
  errors,
  today,
  onChange,
}: {
  values: QuoteFormValues;
  errors: FieldErrors;
  today: string;
  onChange: <K extends QuoteField>(field: K, value: QuoteFormValues[K]) => void;
}) {
  const daysId = useId();
  const daysErrorId = errors.recurringDays ? `${daysId}-error` : undefined;
  // UI-only: whether the visitor wants to give an end date. Never sent.
  const [hasEnd, setHasEnd] = useState(Boolean(values.recurringEndDate));

  function toggleDay(day: Weekday, checked: boolean) {
    const next = checked ? [...values.recurringDays, day] : values.recurringDays.filter((d) => d !== day);
    onChange("recurringDays", WEEKDAYS.filter((d) => next.includes(d)));
  }

  return (
    <div className="flex flex-col gap-lg rounded-lg border border-border-subtle bg-surface-secondary p-md sm:p-lg" data-testid="recurring-fields">
      <div>
        <p className={cn(typography.body, "font-semibold text-text-primary")}>Recurring schedule</p>
        <p className={cn(typography.bodySmall, "mt-0.5 text-text-secondary")}>{RECURRING_NOTE}</p>
      </div>

      <fieldset className="flex min-w-0 flex-col gap-1.5" aria-describedby={daysErrorId} aria-invalid={Boolean(errors.recurringDays) || undefined}>
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
              <input
                type="checkbox"
                value={day}
                checked={values.recurringDays.includes(day)}
                onChange={(event) => toggleDay(day, event.target.checked)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  typography.body,
                  "flex h-12 items-center justify-center rounded-sm border bg-surface-elevated text-text-primary transition-colors duration-base",
                  errors.recurringDays ? "border-critical-strong" : "border-border-strong",
                  "peer-checked:border-brand-care-navy peer-checked:bg-brand-care-navy peer-checked:font-semibold peer-checked:text-white",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-interactive-teal",
                )}
              >
                <span aria-hidden>{WEEKDAY_LABELS[day].short}</span>
                <span className="sr-only">{WEEKDAY_LABELS[day].long}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.recurringDays && (
          <p id={daysErrorId} className={cn(typography.metadata, "text-critical-text")}>
            {errors.recurringDays}
          </p>
        )}
      </fieldset>

      <QuoteCalendar
        label="First trip date"
        required
        help="Choose the date you would like the schedule to start."
        value={values.recurringStartDate}
        onChange={(iso) => {
          onChange("recurringStartDate", iso);
          if (values.recurringEndDate && values.recurringEndDate < iso) onChange("recurringEndDate", "");
        }}
        today={today}
        error={errors.recurringStartDate}
      />

      <SegmentedChoice
        label="Until when?"
        name="recurringEndMode"
        value={hasEnd ? "until" : "ongoing"}
        onChange={(mode) => {
          setHasEnd(mode === "until");
          if (mode === "ongoing") onChange("recurringEndDate", "");
        }}
        options={[
          { value: "ongoing", label: "Ongoing" },
          { value: "until", label: "Until a date" },
        ]}
      />
      {hasEnd && (
        <QuoteCalendar
          label="Last trip date"
          value={values.recurringEndDate}
          onChange={(iso) => onChange("recurringEndDate", iso)}
          today={today}
          min={values.recurringStartDate || today}
          error={errors.recurringEndDate}
          onClear={() => onChange("recurringEndDate", "")}
        />
      )}

      <PreferredTimeSelect
        label="Typical appointment time (optional)"
        help="The time you usually need to be there. Zenward will confirm pickup timing with you."
        value={values.recurringAppointmentTime}
        onChange={(value) => onChange("recurringAppointmentTime", value)}
        error={errors.recurringAppointmentTime}
      />

      <div className="flex flex-col gap-2">
        <SegmentedChoice
          label="Return trip on these days?"
          name="recurringReturnExpected"
          required
          value={values.recurringReturnExpected}
          onChange={(value) => onChange("recurringReturnExpected", value as "yes" | "no")}
          error={errors.recurringReturnExpected}
          options={[
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" },
          ]}
        />
        {values.recurringReturnExpected === "yes" && (
          <p className={cn(typography.bodySmall, "text-text-secondary")}>{RETURN_TRIP_NOTE}</p>
        )}
      </div>
    </div>
  );
}

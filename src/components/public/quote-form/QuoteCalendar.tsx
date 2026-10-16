"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import {
  addDays,
  addMonths,
  compareMonths,
  formatLongDate,
  formatMonth,
  isBefore,
  monthOf,
  monthWeeks,
  type MonthRef,
} from "@/lib/quote-form/dates";

const WEEKDAY_HEADERS = [
  { short: "Su", long: "Sunday" },
  { short: "Mo", long: "Monday" },
  { short: "Tu", long: "Tuesday" },
  { short: "We", long: "Wednesday" },
  { short: "Th", long: "Thursday" },
  { short: "Fr", long: "Friday" },
  { short: "Sa", long: "Saturday" },
];

/**
 * A monthly calendar for choosing a PREFERRED date (ZW-WEB-04G). It knows
 * nothing about availability: every date from `min` onward can be chosen,
 * and dates before it are disabled. No dots, colours or labels suggest
 * vehicle or driver availability.
 *
 * Accessibility: a labelled table of real buttons with roving focus. Arrow
 * keys move a day/week, Home/End go to the start/end of the week,
 * PageUp/PageDown change month. Each button's name is the full date (plus
 * "today"), the chosen date has aria-pressed and a filled style (not colour
 * alone), and the chosen date is announced in a polite live region. Cells are
 * at least 44px.
 */
export function QuoteCalendar({
  label,
  help,
  value,
  onChange,
  today,
  min,
  error,
  onClear,
  required,
}: {
  label: string;
  required?: boolean;
  help?: string;
  value: string;
  onChange: (iso: string) => void;
  /** Today in the market timezone (`YYYY-MM-DD`). */
  today: string;
  /** Earliest selectable date; defaults to today. */
  min?: string;
  error?: string;
  /** When given, shows a "Clear date" control (optional dates). */
  onClear?: () => void;
}) {
  const id = useId();
  const minDate = min && min > today ? min : today;
  const initialFocus = value && !isBefore(value, minDate) ? value : minDate;
  const [rawView, setView] = useState<MonthRef>(() => monthOf(initialFocus));
  const [rawFocused, setFocused] = useState(initialFocus);
  // If `min` moves past the remembered focus/month (e.g. a later start date), clamp during render.
  const focused = isBefore(rawFocused, minDate) ? minDate : rawFocused;
  const view = compareMonths(rawView, monthOf(minDate)) < 0 ? monthOf(minDate) : rawView;
  const moveByKeyboard = useRef(false);
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (!moveByKeyboard.current) return;
    moveByKeyboard.current = false;
    tableRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${focused}"]`)?.focus();
  }, [focused, view]);

  const canGoBack = compareMonths(view, monthOf(minDate)) > 0;

  function changeMonth(delta: number) {
    const next = addMonths(view, delta);
    if (compareMonths(next, monthOf(minDate)) < 0) return;
    setView(next);
    const firstOfNext = `${next.year}-${String(next.month + 1).padStart(2, "0")}-01`;
    setFocused(isBefore(firstOfNext, minDate) ? minDate : firstOfNext);
  }

  function moveTo(target: string) {
    const clamped = isBefore(target, minDate) ? minDate : target;
    moveByKeyboard.current = true;
    setFocused(clamped);
    setView(monthOf(clamped));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, iso: string) {
    const weekday = new Date(`${iso}T00:00:00Z`).getUTCDay();
    const keys: Record<string, () => string> = {
      ArrowLeft: () => addDays(iso, -1),
      ArrowRight: () => addDays(iso, 1),
      ArrowUp: () => addDays(iso, -7),
      ArrowDown: () => addDays(iso, 7),
      Home: () => addDays(iso, -weekday),
      End: () => addDays(iso, 6 - weekday),
      PageUp: () => shiftMonth(iso, -1),
      PageDown: () => shiftMonth(iso, 1),
    };
    const next = keys[event.key];
    if (!next) return;
    event.preventDefault();
    moveTo(next());
  }

  const headingId = `${id}-label`;
  const monthId = `${id}-month`;
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <p id={headingId} className={cn(typography.label, "text-text-primary")}>
        {label}
        {required && (
          <span className="text-critical-text" aria-hidden>
            {" "}
            *
          </span>
        )}
      </p>
      {help && (
        <p id={helpId} className={cn(typography.metadata, "text-text-muted")}>
          {help}
        </p>
      )}
      <div
        className={cn(
          "mt-1 rounded-lg border bg-surface-elevated p-2 sm:p-3",
          error ? "border-critical-strong" : "border-border-strong",
        )}
      >
        <div className="flex items-center justify-between gap-2 pb-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            disabled={!canGoBack}
            aria-label="Previous month"
            className="flex size-11 items-center justify-center rounded-sm text-text-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:bg-transparent"
          >
            <CaretLeft className="size-5" aria-hidden />
          </button>
          <p id={monthId} className={cn(typography.body, "font-semibold text-text-primary")} aria-live="polite">
            {formatMonth(view)}
          </p>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="flex size-11 items-center justify-center rounded-sm text-text-primary hover:bg-surface-hover"
          >
            <CaretRight className="size-5" aria-hidden />
          </button>
        </div>
        <table
          ref={tableRef}
          className="w-full table-fixed border-collapse"
          aria-labelledby={`${headingId} ${monthId}`}
          aria-describedby={cn(helpId, errorId) || undefined}
        >
          <thead>
            <tr>
              {WEEKDAY_HEADERS.map((day) => (
                <th key={day.long} scope="col" abbr={day.long} className={cn(typography.metadata, "pb-1 font-medium text-text-muted")}>
                  {day.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthWeeks(view).map((week, w) => (
              <tr key={w}>
                {week.map((iso, d) => {
                  if (!iso) return <td key={d} />;
                  const past = isBefore(iso, minDate);
                  const selected = iso === value;
                  const isToday = iso === today;
                  return (
                    <td key={iso} className="p-0.5">
                      <button
                        type="button"
                        data-date={iso}
                        tabIndex={iso === focused ? 0 : -1}
                        disabled={past}
                        aria-pressed={selected}
                        aria-label={`${formatLongDate(iso)}${isToday ? ", today" : ""}`}
                        onClick={() => {
                          setFocused(iso);
                          onChange(iso);
                        }}
                        onKeyDown={(event) => onKeyDown(event, iso)}
                        className={cn(
                          typography.body,
                          "relative flex h-11 w-full min-w-11 flex-col items-center justify-center rounded-sm tabular-nums transition-colors duration-base",
                          past && "cursor-not-allowed text-text-disabled line-through decoration-text-disabled/60",
                          !past && !selected && "text-text-primary hover:bg-brand-calm-mist",
                          selected && "bg-brand-care-navy font-semibold text-white ring-2 ring-brand-care-navy ring-offset-1",
                          isToday && !selected && "font-semibold",
                        )}
                      >
                        {Number(iso.slice(8))}
                        {isToday && (
                          <span
                            aria-hidden
                            className={cn("absolute bottom-1 size-1 rounded-full", selected ? "bg-white" : "bg-brand-interactive-teal")}
                          />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex min-h-6 flex-wrap items-center gap-x-3" aria-live="polite">
        {value ? (
          <p className={cn(typography.bodySmall, "font-semibold text-text-primary")}>Selected: {formatLongDate(value)}</p>
        ) : null}
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className={cn(typography.bodySmall, "inline-flex min-h-11 items-center font-medium text-brand-interactive-teal underline-offset-4 hover:underline")}
          >
            Clear date
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className={cn(typography.metadata, "text-critical-text")}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Same day of month in the adjacent month, clamped to that month's length. */
function shiftMonth(iso: string, delta: number): string {
  const ref = addMonths(monthOf(iso), delta);
  const day = Number(iso.slice(8));
  const lastDay = new Date(Date.UTC(ref.year, ref.month + 1, 0)).getUTCDate();
  return `${ref.year}-${String(ref.month + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
}

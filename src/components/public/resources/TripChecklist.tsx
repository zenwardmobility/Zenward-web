"use client";

import { useId, useState } from "react";
import { Printer } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";

/**
 * Medical Transportation Trip Checklist (ZW-WEB-04K): an interactive planning
 * aid. Ticks live in this component's memory only. Nothing is stored
 * (no localStorage, sessionStorage, cookies or URL) and nothing is sent
 * anywhere. It is not a transportation request. "Print checklist" uses the
 * browser's own print dialog; the print stylesheet hides site chrome.
 */
export function TripChecklist({ items }: { items: { label: string; hint: string }[] }) {
  const id = useId();
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const done = checked.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-md">
      <fieldset className="rounded-lg border border-border-subtle bg-surface-elevated p-md sm:p-lg">
        <legend className={cn(typography.body, "px-1 font-semibold text-text-primary")}>Trip details to prepare</legend>
        <p className={cn(typography.bodySmall, "mt-1 text-text-secondary print:hidden")} aria-live="polite">
          {done} of {items.length} ready
        </p>
        <ul className="mt-md flex flex-col divide-y divide-border-subtle">
          {items.map((item, index) => {
            const inputId = `${id}-${index}`;
            return (
              <li key={item.label} className="py-1">
                <label htmlFor={inputId} className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={checked[index]}
                    onChange={(event) => setChecked((list) => list.map((value, i) => (i === index ? event.target.checked : value)))}
                    className="mt-1 size-5 shrink-0 accent-brand-care-navy"
                  />
                  <span>
                    <span className={cn(typography.body, "block font-semibold text-text-primary")}>{item.label}</span>
                    <span className={cn(typography.bodySmall, "block text-text-secondary")}>{item.hint}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className={cn(typography.button, "inline-flex h-12 items-center gap-2 rounded-md border border-border-strong bg-surface-elevated px-5 text-text-primary hover:bg-surface-hover")}
        >
          <Printer className="size-5" aria-hidden />
          Print checklist
        </button>
        <button
          type="button"
          onClick={() => setChecked(items.map(() => false))}
          disabled={done === 0}
          className={cn(typography.button, "inline-flex h-12 items-center rounded-md px-4 text-text-secondary hover:bg-surface-hover disabled:opacity-50")}
        >
          Clear ticks
        </button>
      </div>
    </div>
  );
}

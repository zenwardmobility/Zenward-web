"use client";

import { useId, useState } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Every answer is rendered into the HTML and collapsed with `hidden`, so all
 * answers are present for crawlers and in-page find, not only the open one
 * (ZW-WEB-04A S-03). Each button controls its own panel via `aria-controls`.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-border-subtle rounded-lg border border-border-subtle bg-surface-elevated">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                id={buttonId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 px-lg py-lg text-left"
              >
                <span className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{item.question}</span>
                <CaretDown
                  className={cn("size-5 shrink-0 text-text-muted transition-transform duration-base", isOpen && "rotate-180")}
                  aria-hidden
                />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="px-lg pb-lg">
              <p className={cn(typography.body, "text-text-secondary")}>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

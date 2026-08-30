"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border-subtle rounded-lg border border-border-subtle bg-surface-elevated">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-lg py-lg text-left"
            >
              <span className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{item.question}</span>
              <CaretDown
                className={cn("size-5 shrink-0 text-text-muted transition-transform duration-base", isOpen && "rotate-180")}
                aria-hidden
              />
            </button>
            {isOpen && (
              <div className="px-lg pb-lg">
                <p className={cn(typography.body, "text-text-secondary")}>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

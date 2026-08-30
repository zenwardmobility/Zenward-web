import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SectionContainer } from "./SectionContainer";

export type SectionTone = "white" | "mist" | "navy" | "navy-gradient";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  narrow?: boolean;
  children: ReactNode;
  /** Skip the inner SectionContainer (e.g. the hero manages its own inner layout). */
  bare?: boolean;
}

const toneClasses: Record<SectionTone, string> = {
  white: "bg-surface-elevated",
  mist: "bg-brand-calm-mist",
  navy: "bg-brand-care-navy text-white",
  "navy-gradient": "bg-linear-to-br from-brand-care-navy via-brand-care-navy to-brand-interactive-teal text-white",
};

/**
 * Full-bleed section band with a deliberate tone, so the page alternates
 * white / mist / navy rather than sitting flat white (design direction:
 * premium healthcare + transportation, not a generic SaaS page).
 */
export function Section({ tone = "white", narrow, bare = false, className, children, ...props }: SectionProps) {
  return (
    <section className={cn("py-3xl sm:py-4xl", toneClasses[tone], className)} {...props}>
      {bare ? children : <SectionContainer narrow={narrow}>{children}</SectionContainer>}
    </section>
  );
}

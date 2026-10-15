import type { Icon } from "@phosphor-icons/react";
import { ClipboardText, MapPin, Phone, Repeat, ShieldCheck, UsersThree, Wheelchair } from "@phosphor-icons/react/dist/ssr";
import { typography } from "@/design/typography";
import { business } from "@/lib/business";
import { cn } from "@/lib/cn";
import { servingLine } from "@/lib/service-area";

/**
 * A restrained strip of CONFIRMED practical facts (ZW-WEB-04C). Only facts
 * already established for the public site belong here: no hours, response
 * times, certifications, licensing, insurance, ratings, counts or
 * guarantees.
 */
export function PracticalFacts({ className }: { className?: string }) {
  const facts: { icon: Icon; text: string }[] = [
    { icon: MapPin, text: servingLine() },
    { icon: ShieldCheck, text: "Non-emergency medical transportation" },
    { icon: ClipboardText, text: "Every request reviewed by a person" },
    { icon: Repeat, text: "One-time and recurring requests" },
    { icon: UsersThree, text: "Family and caregiver requests welcome" },
    { icon: Wheelchair, text: "Wheelchair-accessible transportation available" },
  ];
  return (
    <section aria-label="Practical facts" className={cn("border-y border-border-subtle bg-surface-elevated", className)}>
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-x-xl gap-y-3 px-md py-lg sm:grid-cols-2 sm:px-xl lg:grid-cols-4">
        {facts.map((fact) => (
          <li key={fact.text} className={cn(typography.bodySmall, "flex items-center gap-2.5 font-medium text-text-primary")}>
            <fact.icon className="size-5 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
            {fact.text}
          </li>
        ))}
        <li>
          <a
            href={business.phoneHref}
            aria-label={`Call Zenward at ${business.phoneDisplay}`}
            className={cn(typography.bodySmall, "inline-flex min-h-11 items-center gap-2.5 font-semibold text-brand-care-navy hover:underline underline-offset-4")}
          >
            <Phone className="size-5 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
            Call {business.phoneDisplay}
          </a>
        </li>
      </ul>
    </section>
  );
}

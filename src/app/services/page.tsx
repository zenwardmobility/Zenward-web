import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { SERVICES, SERVICE_ORDER } from "@/lib/services";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description: "Non-emergency medical transportation for appointments, dialysis, rehabilitation, hospital discharge, and scheduled care.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <Section tone="mist" narrow>
        <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Services</p>
        <h1 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>
          Transportation for the care that matters
        </h1>
        <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
          Zenward focuses on non-emergency medical transportation — not emergency response, ambulance service, or
          stretcher transport. Here&rsquo;s what we currently coordinate. Every request is reviewed, and
          Zenward confirms the next steps with the person arranging the trip.
        </p>
      </Section>

      <Section tone="white">
        <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_ORDER.map((slug, index) => {
            const service = SERVICES[slug];
            // With an odd count the last card would sit alone in its row; let it
            // span the grid as a single horizontal card instead of an orphan.
            const wide = SERVICE_ORDER.length % 2 === 1 && index === SERVICE_ORDER.length - 1;
            return (
              <Link
                key={slug}
                href={service.path}
                className={cn(
                  "group flex flex-col rounded-lg border border-border-subtle p-lg transition-colors duration-base hover:bg-surface-hover",
                  wide && "sm:col-span-2 sm:flex-row sm:items-center sm:gap-xl lg:col-span-3",
                )}
              >
                <service.icon className="size-8 shrink-0 text-brand-care-navy" weight="light" aria-hidden />
                <div className={cn("flex-1", wide && "sm:max-w-[40rem]")}>
                  <p className={cn(typography.subsectionTitle, "mt-4 text-lg text-text-primary", wide && "sm:mt-0")}>
                    {service.cardTitle}
                  </p>
                  <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{service.cardDescription}</p>
                </div>
                <span
                  className={cn(
                    typography.bodySmall,
                    "mt-auto inline-flex items-center gap-1.5 pt-4 font-medium text-brand-interactive-teal group-hover:underline",
                    wide && "sm:mt-0 sm:ml-auto sm:pt-0",
                  )}
                >
                  Learn more
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section tone="navy-gradient">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className={cn(typography.sectionTitle, "text-white")}>Ready to request a ride?</h2>
          <TrackedLinkButton
            href="/request-transportation"
            size="lg"
            onDark
            event={{ name: "request_transportation_clicked", source: "other" }}
          >
            Request Transportation
          </TrackedLinkButton>
        </div>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { Stethoscope, Heartbeat, FirstAidKit, Hospital, CalendarCheck, Wheelchair } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description: "Non-emergency medical transportation for appointments, dialysis, rehabilitation, hospital discharge, and scheduled care.",
  path: "/services",
});

const SERVICES = [
  {
    icon: Stethoscope,
    title: "Medical Appointments",
    description: "Routine checkups, specialist visits, and follow-up appointments, on schedule.",
  },
  {
    icon: Heartbeat,
    title: "Dialysis Visits",
    description: "Dependable, recurring transportation for ongoing dialysis treatment.",
  },
  {
    icon: FirstAidKit,
    title: "Rehabilitation Appointments",
    description: "Consistent transportation for physical therapy and recovery-focused visits.",
  },
  {
    icon: Hospital,
    title: "Hospital Discharge Transportation",
    description: "Coordinated transportation home after a hospital stay.",
  },
  {
    icon: CalendarCheck,
    title: "Recurring Scheduled Care",
    description: "Standing transportation arranged around a recurring treatment or care schedule.",
  },
  {
    icon: Wheelchair,
    title: "Senior Medical Transportation",
    description: "Transportation for older adults attending medical appointments and care visits.",
  },
];

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
          stretcher transport. Here&rsquo;s what we currently coordinate.
        </p>
      </Section>

      <Section tone="white">
        <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <div key={service.title} className="rounded-lg border border-border-subtle p-lg">
              <service.icon className="size-8 text-brand-care-navy" weight="light" aria-hidden />
              <p className={cn(typography.subsectionTitle, "mt-4 text-lg text-text-primary")}>{service.title}</p>
              <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{service.description}</p>
            </div>
          ))}
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

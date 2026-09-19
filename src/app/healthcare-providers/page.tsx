import type { Metadata } from "next";
import { CalendarCheck, Hospital, ChatCircleText, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { BrandImage } from "@/components/layout/BrandImage";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { brandImages } from "@/lib/images";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  title: "Healthcare Providers",
  description:
    "Zenward works with clinics, dialysis centers, rehabilitation providers, senior care organizations, and hospital discharge teams to coordinate patient transportation.",
  path: "/healthcare-providers",
});

const AUDIENCES = ["Dialysis centers", "Clinics", "Rehabilitation providers", "Senior care organizations", "Hospital discharge teams"];

const VALUE_PROPS = [
  {
    icon: CalendarCheck,
    title: "Appointment-led scheduling",
    description:
      "Rides arranged around the appointment time — routine visits, specialist appointments, dialysis and rehabilitation appointments.",
  },
  {
    icon: Hospital,
    title: "Hospital discharge coordination",
    description:
      "Share the discharge details and Zenward coordinates transportation to the patient's next destination, so transport isn't what delays a discharge.",
  },
  {
    icon: ChatCircleText,
    title: "Clear communication with care teams",
    description:
      "Your team and the passenger know the pickup plan, and hear from Zenward if anything changes.",
  },
  {
    icon: UsersThree,
    title: "A consistent coordination contact",
    description:
      "One point of contact for your team's transportation needs — for one patient or an ongoing schedule.",
  },
];

export default function HealthcareProvidersPage() {
  return (
    <>
      <Section tone="navy-gradient">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          <div>
            <p className={cn(typography.eyebrow, "text-brand-arrival-gold")}>Healthcare Providers</p>
            <h1 className={cn(typography.sectionTitle, "mt-3 text-white")}>
              Transportation coordination your team can rely on
            </h1>
            <p className={cn(typography.lede, "mt-4 max-w-[32rem] text-white/85")}>
              Zenward works with clinics, dialysis centers, rehabilitation providers, senior care organizations,
              and hospital discharge teams to coordinate non-emergency medical transportation for the patients
              you refer.
            </p>
            <div className="mt-8">
              <TrackedLinkButton
                href="/contact"
                size="lg"
                onDark
                event={{ name: "provider_cta_clicked", source: "healthcare_providers_page" }}
              >
                Talk to Zenward
              </TrackedLinkButton>
            </div>
          </div>
          <BrandImage
            asset={brandImages.vanWalkerAssist}
            aspectClass="aspect-[4/3] lg:aspect-square"
            sizes="(min-width: 1024px) 30rem, 100vw"
            className="ring-1 ring-white/10"
            objectPosition="center 45%"
          />
        </div>
      </Section>

      <Section tone="white">
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>Who we work with</h2>
        <div className="mt-2xl flex flex-wrap justify-center gap-3">
          {AUDIENCES.map((audience) => (
            <span
              key={audience}
              className={cn(
                typography.bodySmall,
                "rounded-full border border-border-strong px-5 py-2.5 font-medium text-text-primary",
              )}
            >
              {audience}
            </span>
          ))}
        </div>
      </Section>

      <Section tone="mist">
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>
          What working with Zenward looks like
        </h2>
        <div className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2">
          {VALUE_PROPS.map((prop) => (
            <div key={prop.title} className="rounded-lg bg-surface-elevated p-lg">
              <prop.icon className="size-8 text-brand-interactive-teal" weight="light" aria-hidden />
              <p className={cn(typography.subsectionTitle, "mt-4 text-lg text-text-primary")}>{prop.title}</p>
              <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{prop.description}</p>
            </div>
          ))}
        </div>
        <p className={cn(typography.bodySmall, "mx-auto mt-lg max-w-[42rem] text-center text-text-muted")}>
          Your team coordinates care; Zenward coordinates the transportation. Talk to our team about how your
          organization arranges transportation today, and how Zenward can help.
        </p>
      </Section>

      <Section tone="navy">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className={cn(typography.sectionTitle, "text-white")}>
            Let&rsquo;s talk about your patients&rsquo; transportation needs
          </h2>
          <p className={cn(typography.lede, "max-w-[36rem] text-white/80")}>
            Tell us about your organization and the transportation coordination you&rsquo;re looking for.
          </p>
          <TrackedLinkButton
            href="/contact"
            size="lg"
            onDark
            event={{ name: "provider_cta_clicked", source: "healthcare_providers_page" }}
          >
            Talk to Zenward
          </TrackedLinkButton>
        </div>
      </Section>
    </>
  );
}

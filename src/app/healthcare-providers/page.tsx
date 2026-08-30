import type { Metadata } from "next";
import { ClipboardText, UsersThree, FileText, ChatsCircle } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { PhotoPlaceholder } from "@/components/layout/PhotoPlaceholder";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  title: "Healthcare Providers",
  description:
    "Zenward partners with clinics, dialysis centers, rehabilitation providers, senior care organizations, and hospital discharge teams to coordinate patient transportation.",
  path: "/healthcare-providers",
});

const AUDIENCES = ["Dialysis centers", "Clinics", "Rehabilitation providers", "Senior care organizations", "Hospital discharge teams"];

const VALUE_PROPS = [
  {
    icon: ClipboardText,
    title: "Clear transportation requests",
    description: "Submit a transportation request with the details your team already has on hand.",
  },
  {
    icon: FileText,
    title: "Scheduled trip coordination",
    description: "Zenward reviews and coordinates each trip, so scheduling isn't left to chance.",
  },
  {
    icon: UsersThree,
    title: "Driver assignment visibility",
    description: "Know that a trip has a driver assigned once dispatch has confirmed it.",
  },
  {
    icon: ChatsCircle,
    title: "Less fragmented communication",
    description: "One place to send a transportation request instead of scattered calls and texts.",
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
              Patient transportation, coordinated clearly
            </h1>
            <p className={cn(typography.lede, "mt-4 max-w-lg text-white/85")}>
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
          <PhotoPlaceholder description="A discharge coordinator reviewing a patient's transportation plan." aspect="square" />
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
          What coordinating with Zenward looks like
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
      </Section>

      <Section tone="navy">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className={cn(typography.sectionTitle, "text-white")}>
            Let&rsquo;s talk about your patients&rsquo; transportation needs
          </h2>
          <p className={cn(typography.lede, "max-w-xl text-white/80")}>
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

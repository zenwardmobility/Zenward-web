import type { Metadata } from "next";
import { Target, Handshake, Compass } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { PhotoPlaceholder } from "@/components/layout/PhotoPlaceholder";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: "Zenward Mobility provides non-emergency medical transportation across Georgia.",
  path: "/about",
});

const VALUES = [
  {
    icon: Target,
    title: "Focused on medical transportation",
    description: "Zenward exists for one purpose: dependable, non-emergency medical transportation.",
  },
  {
    icon: Handshake,
    title: "Built around the people we serve",
    description: "Patients, families, caregivers, and the healthcare organizations that refer them.",
  },
  {
    icon: Compass,
    title: "Launching in Georgia",
    description: "Zenward is launching its transportation service in Georgia, with careful attention to how we grow.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Section tone="mist" narrow>
        <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>About Zenward</p>
        <h1 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>Care that gets you there.</h1>
        <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
          Zenward Mobility provides non-emergency medical transportation for patients, families, caregivers, and
          the healthcare providers who refer them — currently launching in Georgia.
        </p>
      </Section>

      <Section tone="white">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          <PhotoPlaceholder description="A Zenward vehicle prepared for a scheduled transportation trip." aspect="video" />
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Why Zenward exists</h2>
            <p className={cn(typography.body, "mt-4 text-text-secondary")}>
              Getting to and from medical care shouldn&rsquo;t be the hardest part of a patient&rsquo;s day. Zenward
              coordinates non-emergency medical transportation so patients, families, and healthcare
              organizations have one dependable place to arrange it — with clear communication from request to
              arrival.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="grid grid-cols-1 gap-lg sm:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-lg bg-surface-elevated p-lg">
              <value.icon className="size-8 text-brand-interactive-teal" weight="light" aria-hidden />
              <p className={cn(typography.subsectionTitle, "mt-4 text-lg text-text-primary")}>{value.title}</p>
              <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{value.description}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

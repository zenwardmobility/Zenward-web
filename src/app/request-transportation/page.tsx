import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { RequestTransportationForm } from "@/components/public/RequestTransportationForm";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  title: "Request Transportation",
  description:
    "Request non-emergency medical transportation in Georgia for appointments, treatments, discharge, or scheduled care.",
  path: "/request-transportation",
});

export default function RequestTransportationPage() {
  return (
    <>
      <Section tone="mist" narrow>
        <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Request Transportation</p>
        <h1 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>
          Tell us about the trip you need
        </h1>
        <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
          This is a transportation request, not a guaranteed ride. Zenward will review the details and contact
          you to confirm availability and next steps.
        </p>
      </Section>

      <Section tone="white" narrow>
        <RequestTransportationForm />
      </Section>
    </>
  );
}

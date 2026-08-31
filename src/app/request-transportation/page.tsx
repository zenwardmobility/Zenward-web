import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { RequestTransportationForm } from "@/components/public/RequestTransportationForm";
import { PhoneCtaButton } from "@/components/public/PhoneCtaButton";
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

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-elevated p-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={cn(typography.body, "font-semibold text-text-primary")}>Prefer to arrange by phone?</p>
            <p className={cn(typography.bodySmall, "mt-0.5 text-text-secondary")}>
              Our team can take the details over the phone. Calling isn&rsquo;t required — the form works too.
            </p>
          </div>
          <PhoneCtaButton tone="navy" className="shrink-0" />
        </div>
      </Section>

      <Section tone="white" narrow>
        <RequestTransportationForm />
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { RequestTransportationForm } from "@/components/public/RequestTransportationForm";
import { PhoneCtaButton } from "@/components/public/PhoneCtaButton";
import { AssistantInlineEntry } from "@/components/public/assistant/AssistantInlineEntry";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { QUOTE_RESPONSE_LINE } from "@/lib/trust";
import { resolveServiceParam } from "@/lib/request-intake/service-types";
import { commercialFaq } from "@/lib/operating-facts";

// What happens after a request, from the canonical operating facts (ZW-WEB-04I). Below the form so it stays primary.
const BEFORE_YOU_REQUEST = (() => {
  const f = commercialFaq();
  return [f.confirmation, f.response, f.pricing, f.payment, f.timing, f.returnTrip, f.recurring, f.hours];
})();

export const metadata: Metadata = pageMetadata({
  title: "Request a Transportation Quote",
  description:
    "Request a quote for non-emergency medical transportation to appointments, treatment, hospital discharge or recurring care. Zenward reviews every request and contacts you to confirm availability, next steps and pricing.",
  path: "/request-transportation",
});

/**
 * `?service=` may preselect ONE allow-listed service (the six service pages
 * and wheelchair transportation link here that way). Anything else — unknown
 * values, repeated params, empty, oversized, prototype keys — is ignored and
 * the page renders exactly as if there were no query. The value is resolved on
 * the server through an explicit map (`resolveServiceParam`); nothing else is
 * ever read from the URL, and no passenger/trip data ever belongs there.
 */
export default async function RequestTransportationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { service } = await searchParams;
  const initialServiceType = resolveServiceParam(service);

  return (
    <>
      <Section tone="mist" narrow>
        <p className={cn(typography.eyebrow, "text-text-accent-on-tint")}>Request a Quote</p>
        <h1 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>Request a Transportation Quote</h1>
        <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
          Tell us about the trip you need. Zenward will review the details and contact you to confirm
          availability, next steps and pricing.
        </p>
        {/* Response expectation (ZW-WEB-04F): a reply, not a confirmed ride. */}
        <p className={cn(typography.body, "mt-3 font-semibold text-text-primary")}>{QUOTE_RESPONSE_LINE}</p>
        <p className={cn(typography.bodySmall, "mt-1 text-text-muted-on-tint")}>
          Submitting this form is a request, not a confirmed booking, and availability isn&rsquo;t guaranteed
          until Zenward confirms it with you.
        </p>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-elevated p-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={cn(typography.body, "font-semibold text-text-primary")}>Prefer to arrange by phone?</p>
            <p className={cn(typography.bodySmall, "mt-0.5 text-text-secondary")}>
              Our team can take the details over the phone. Calling isn&rsquo;t required — the form works too.
            </p>
          </div>
          <PhoneCtaButton surface="request_form" tone="navy" className="shrink-0" />
        </div>
        {/* Below 1024px the floating launcher is hidden here (it could cover form controls); this opens the same assistant. */}
        <AssistantInlineEntry className="mt-4" />
      </Section>

      <Section tone="white" narrow>
        <RequestTransportationForm initialServiceType={initialServiceType} />
      </Section>

      <Section tone="mist" narrow>
        <h2 className={cn(typography.subsectionTitle, "text-text-primary")}>Before you request</h2>
        <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>
          What happens after you send a request, and how timing, pricing and payment are confirmed.
        </p>
        <div className="mt-lg">
          <FaqAccordion items={BEFORE_YOU_REQUEST} />
        </div>
      </Section>
    </>
  );
}

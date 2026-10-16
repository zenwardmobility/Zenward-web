import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { business } from "@/lib/business";
import { cn } from "@/lib/cn";
import { QUOTE_RESPONSE_LINE } from "@/lib/trust";
import { CONFIRMED } from "@/lib/operating-facts";
import { ASSISTANCE_REVIEW_NOTE } from "@/lib/assistance-level";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "Terms governing the use of the Zenward Mobility website.",
  path: "/terms",
});

const LAST_UPDATED = "October 16, 2026";

/**
 * Launch-quality conservative draft. States only what is true today about
 * the service and this website: request -> review -> confirmation, the
 * owner-confirmed 2-hour working-hours RESPONSE (never availability or
 * timing), non-emergency only, no medical care. Sets no insurance, payment,
 * cancellation, refund, liability-limitation or governing-law terms; those
 * need owner/legal decisions (docs/product/public-policy-legal-review-needed.md).
 * Counsel review is still required before this is treated as final.
 */
function Block({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{heading}</h2>
      <div className={cn(typography.body, "mt-2 flex flex-col gap-3 text-text-secondary")}>{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <Section tone="white" narrow>
      <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Legal</p>
      <h1 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>Terms of Service</h1>
      <p className={cn(typography.bodySmall, "mt-4 text-text-muted")}>
        Last updated {LAST_UPDATED}. This is a pre-launch draft pending final legal review and may change.
      </p>

      <div className="mt-2xl flex flex-col gap-xl">
        <Block heading="What Zenward provides">
          <p>
            Zenward Mobility provides non-emergency medical transportation: rides to and from appointments,
            treatments, discharge, and scheduled care. Zenward does not provide emergency response, ambulance
            service, or stretcher transportation.
          </p>
          <p>
            Zenward provides transportation, not medical care. Drivers do not provide clinical or medical
            assistance, and nothing on this website is medical advice.
          </p>
        </Block>

        <Block heading="Using this website">
          <p>
            This website is provided for general information and to submit transportation requests and
            enquiries. You agree to provide accurate information and to use the site only for these purposes.
            Content on this site may change as the service launches and develops.
          </p>
        </Block>

        <Block heading="Transportation requests are subject to review">
          <p>
            Submitting the Request Transportation form, or asking for transportation by phone, is a{" "}
            <strong>request</strong>, not a confirmed ride. It works in three stages:
          </p>
          <ol className="list-decimal pl-6">
            <li>
              <strong>Request.</strong> You send the trip details.
            </li>
            <li>
              <strong>Review.</strong> Our team reviews availability, the trip details and pricing.{" "}
              {QUOTE_RESPONSE_LINE}
            </li>
            <li>
              <strong>Confirmation.</strong> Transportation is arranged only after Zenward confirms the details
              with you.
            </li>
          </ol>
          <p>
            A reply is not a confirmation. Submitting a request does not guarantee that transportation is
            available for your date, time, location, or needs, and requested dates and times are preferences
            until confirmed. {CONFIRMED.pricing} {ASSISTANCE_REVIEW_NOTE}
          </p>
          <p>
            Questions about payment, coverage, or changing or cancelling a trip are answered by our team for
            each request; this website does not set those terms.
          </p>
        </Block>

        <Block heading="Emergencies">
          <p>
            Do not use this website or Zenward for a medical emergency. If you are experiencing an emergency,
            call 911.
          </p>
        </Block>

        <Block heading="Information on this site">
          <p>
            We work to keep this site accurate, but it is provided &ldquo;as is&rdquo; while the service is
            launching, and details are still being finalized. We may update or correct information at any time.
          </p>
        </Block>

        <Block heading="Changes to these terms">
          <p>
            We may update these terms as the service develops. The &ldquo;last updated&rdquo; date above
            reflects the current version.
          </p>
        </Block>

        <Block heading="Contact">
          <p>
            Questions about these terms can be sent through our{" "}
            <a href="/contact" className="font-medium text-brand-interactive-teal underline">
              contact page
            </a>{" "}
            or by calling{" "}
            <a href={business.phoneHref} className="font-medium text-brand-interactive-teal underline">
              {business.phoneDisplay}
            </a>
            .
          </p>
        </Block>
      </div>

      <p className={cn(typography.metadata, "mt-2xl text-text-muted")}>
        This draft has not yet completed formal legal review. It intentionally sets no terms for insurance
        coverage, payment, cancellation, refunds, limitation of liability or governing law. Those sections
        require counsel.
      </p>
    </Section>
  );
}

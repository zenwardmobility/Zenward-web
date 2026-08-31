import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { business } from "@/lib/business";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "Terms governing the use of the Zenward Mobility website.",
  path: "/terms",
});

const LAST_UPDATED = "August 31, 2026";

/**
 * Launch-quality conservative draft. States only what is true today about
 * the service and this website. Makes no insurance, refund, liability-
 * limitation, licensing, regulatory, or response-time representation — those
 * require legal counsel (see docs/product/marketing-scope.md). Counsel
 * review is still required before this is treated as final.
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
            Zenward Mobility provides non-emergency medical transportation — rides to and from appointments,
            treatments, discharge, and scheduled care. Zenward does not provide emergency response, ambulance
            service, or stretcher transportation.
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
            <strong>request</strong> — not a confirmed ride. Every request is reviewed by our team. A trip is
            only arranged once we have followed up with you to confirm availability and the details.
          </p>
          <p>
            Submitting a request does not guarantee that transportation is available for your date, time,
            location, or needs, and does not guarantee a specific response time.
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
        This draft has not yet completed formal legal review. It intentionally makes no representation about
        insurance, refunds, limitation of liability, licensing, regulatory status, or guaranteed response times
        — those sections require counsel.
      </p>
    </Section>
  );
}

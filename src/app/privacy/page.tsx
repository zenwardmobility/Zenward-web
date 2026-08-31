import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { business } from "@/lib/business";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Zenward Mobility handles information submitted through this website.",
  path: "/privacy",
});

const LAST_UPDATED = "August 31, 2026";

/**
 * Launch-quality honest draft. Describes actual data flows on this website
 * only. Makes no compliance claim (HIPAA, specific encryption standards,
 * fixed retention periods) that has not been verified — see
 * docs/product/marketing-scope.md "Claim discipline". Counsel review is
 * still required before this is treated as final.
 */
function Block({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{heading}</h2>
      <div className={cn(typography.body, "mt-2 flex flex-col gap-3 text-text-secondary")}>{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <Section tone="white" narrow>
      <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Legal</p>
      <h1 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>Privacy Policy</h1>
      <p className={cn(typography.bodySmall, "mt-4 text-text-muted")}>
        Last updated {LAST_UPDATED}. This is a pre-launch draft pending final legal review; it describes how this
        website currently handles information and may change before and after launch.
      </p>

      <div className="mt-2xl flex flex-col gap-xl">
        <Block heading="What this policy covers">
          <p>
            This policy applies to the Zenward Mobility public website. It does not cover any separate Zenward
            operations system, or communications you have with our team by phone or email after you contact us.
          </p>
        </Block>

        <Block heading="Information you submit">
          <p>
            <strong>Transportation requests.</strong> When you use the Request Transportation form, we collect
            what you enter: your name, your relationship to the passenger, your phone number, an optional email,
            the passenger&rsquo;s name, pickup and destination details, any preferred date or time, whether a
            return trip is needed, and any assistance or additional notes you choose to add. We use this only to
            review the request and follow up with you about transportation.
          </p>
          <p>
            <strong>Contact enquiries.</strong> When you use the Talk to Our Team form, we collect your name,
            email, an optional phone number, an optional organization name, the reason for contacting us, and
            your message. The contact form is for general questions — please don&rsquo;t include medical details
            there; use the Request Transportation form or call {business.phoneDisplay} instead.
          </p>
        </Block>

        <Block heading="Why we collect it">
          <p>
            To respond to you, to review and coordinate transportation you request, and to keep a record of our
            correspondence. We do not sell your information, and we do not use it for advertising.
          </p>
        </Block>

        <Block heading="Website technical information">
          <p>
            Like most websites, our hosting provider automatically records standard request information such as
            your IP address, browser type, pages visited, and timestamps. This is used to operate the site
            securely and understand aggregate traffic.
          </p>
        </Block>

        <Block heading="Cookies and analytics">
          <p>
            This site aims to use privacy-conscious, aggregate analytics and no advertising or cross-site
            tracking cookies. Where analytics are used, they measure things like which pages and calls-to-action
            are used — never the contents of a form. Passenger names, contact details, addresses, appointment
            information, and assistance notes are never sent to analytics.
          </p>
        </Block>

        <Block heading="Service providers">
          <p>
            We rely on a small number of providers to run the site: a website hosting platform, and — for
            contact enquiries — an email delivery service. Each provider only handles the information needed for
            its function, and is expected to protect it. We do not use a third party to process the detailed
            contents of transportation requests through this website.
          </p>
        </Block>

        <Block heading="How information is handled">
          <p>
            We take reasonable steps to protect the information submitted through this site and limit access to
            people who need it to respond to you. No website can promise perfect security.
          </p>
        </Block>

        <Block heading="How long we keep it">
          <p>
            We keep information submitted through this site for as long as needed to respond to you and to
            maintain reasonable business records, after which it is deleted or archived. Specific retention
            periods are being finalized.
          </p>
        </Block>

        <Block heading="Your choices">
          <p>
            You can ask us what information we hold about you from this website, ask us to correct it, or ask us
            to delete it, by contacting us. We&rsquo;ll respond as required by applicable law.
          </p>
        </Block>

        <Block heading="Changes to this policy">
          <p>
            We may update this policy as the service launches and develops. The &ldquo;last updated&rdquo; date
            above reflects the current version.
          </p>
        </Block>

        <Block heading="Contact">
          <p>
            Questions about this policy can be sent through our{" "}
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
        This draft has not yet completed formal legal review. It intentionally makes no claim of HIPAA
        certification or compliance, no specific encryption or retention commitments, and no regulatory
        guarantees.
      </p>
    </Section>
  );
}

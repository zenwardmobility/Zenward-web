import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { ContactForm } from "@/components/public/ContactForm";
import { PhoneCtaButton } from "@/components/public/PhoneCtaButton";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { CONTACT_RESPONSE_LINE } from "@/lib/trust";
import { commercialFaq } from "@/lib/operating-facts";

// Commercial questions people often contact us about, from the canonical operating facts (ZW-WEB-04I).
const CONTACT_FAQ = (() => {
  const f = commercialFaq();
  return [f.hours, f.payment, f.pricing, f.area, f.timing, f.changes];
})();

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact Zenward Mobility in Metro Atlanta: request transportation for a specific trip, or send a general question. Call 678-935-5489.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Section tone="mist" narrow>
        <p className={cn(typography.eyebrow, "text-text-accent-on-tint")}>Contact</p>
        <h1 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>Talk to our team</h1>
        <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
          Whether you have a question, need support, or want to talk about transportation coordination for your
          organization, we&rsquo;d like to hear from you.
        </p>
        <p className={cn(typography.body, "mt-3 font-semibold text-text-primary")}>{CONTACT_RESPONSE_LINE}</p>
        <p className={cn(typography.bodySmall, "mt-3 text-text-muted-on-tint")}>
          For medical emergencies, call 911. Zenward does not provide emergency transportation.
        </p>
      </Section>

      {/* Two routes in (ZW-WEB-04L): a specific trip goes through the structured request form;
          the message form below is for general questions only, never trip or passenger details. */}
      <Section tone="white" narrow>
        <h2 className="sr-only">How to reach Zenward</h2>
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-lg border border-brand-care-navy/20 bg-surface-app p-lg">
            <h3 className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>Arranging a specific trip?</h3>
            <p className={cn(typography.bodySmall, "flex-1 text-text-secondary")}>
              Use the request form. It collects the trip, passenger and assistance details our team needs to review
              the request.
            </p>
            <TrackedLinkButton
              href="/request-transportation"
              size="md"
              className="w-full sm:w-auto sm:self-start"
              event={{ name: "request_transportation_clicked", source: "contact_page" }}
            >
              Request Transportation
            </TrackedLinkButton>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-border-subtle p-lg">
            <h3 className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>A general question?</h3>
            <p className={cn(typography.bodySmall, "flex-1 text-text-secondary")}>
              Questions about Zenward, an existing request, or working with Zenward as a care team: send a message
              below or call. Please don&rsquo;t include passenger or trip details in a message.
            </p>
            <a
              href="#contact-form"
              className={cn(typography.bodySmall, "inline-flex min-h-11 items-center font-semibold text-text-accent-on-tint underline-offset-4 hover:underline")}
            >
              Go to the message form
            </a>
          </div>
        </div>
      </Section>

      <Section tone="white" narrow id="contact-form" className="scroll-mt-20 pt-0 sm:pt-0">
        <h2 className={cn(typography.subsectionTitle, "mb-lg text-text-primary")}>Send a general message</h2>
        <div className="grid grid-cols-1 gap-2xl lg:grid-cols-[1fr_18rem]">
          <ContactForm />
          <aside className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface-app p-lg lg:self-start">
            <p className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>Prefer to call?</p>
            <PhoneCtaButton surface="contact_page" tone="navy" className="w-full sm:w-auto" />
            <p className={cn(typography.bodySmall, "text-text-secondary")}>
              To arrange a specific trip, use the{" "}
              <a href="/request-transportation" className="font-medium text-text-accent-on-tint underline">
                Request Transportation
              </a>{" "}
              form instead. It captures the trip details our team needs.
            </p>
          </aside>
        </div>
      </Section>

      <Section tone="mist" narrow>
        <h2 className={cn(typography.subsectionTitle, "text-text-primary")}>Common questions</h2>
        <div className="mt-lg">
          <FaqAccordion items={CONTACT_FAQ} />
        </div>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { ContactForm } from "@/components/public/ContactForm";
import { PhoneCtaButton } from "@/components/public/PhoneCtaButton";
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
  description: "Get in touch with Zenward Mobility — patients, families, caregivers, and healthcare providers.",
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

      <Section tone="white" narrow>
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
              form instead — it captures the trip details our team needs.
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

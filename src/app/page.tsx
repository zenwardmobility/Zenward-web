import {
  HandHeart,
  ShieldCheck,
  ChatCircleText,
  ClipboardText,
  Buildings,
  Stethoscope,
  Heartbeat,
  CalendarCheck,
  Wheelchair,
  Hospital,
  FirstAidKit,
  HeartStraight,
} from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { PhotoPlaceholder } from "@/components/layout/PhotoPlaceholder";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";

const TRUST_PRINCIPLES = [
  {
    icon: ChatCircleText,
    title: "Clear communication",
    description: "You know what to expect before, during, and after every trip we coordinate.",
  },
  {
    icon: HandHeart,
    title: "Trained, dedicated drivers",
    description: "Drivers focused on one thing: getting people to care safely and on time.",
  },
  {
    icon: ClipboardText,
    title: "Careful coordination",
    description: "Every request is reviewed by a person before a trip is scheduled.",
  },
  {
    icon: ShieldCheck,
    title: "Respect and dignity",
    description: "Every passenger is treated with the patience and care they deserve.",
  },
];

const SERVICES = [
  { icon: Stethoscope, title: "Medical Appointments", description: "Routine and specialist visits, on schedule." },
  { icon: Heartbeat, title: "Dialysis Visits", description: "Dependable, recurring transportation for ongoing treatment." },
  { icon: FirstAidKit, title: "Rehabilitation Appointments", description: "Consistent transportation for recovery and therapy visits." },
  { icon: Hospital, title: "Hospital Discharge Transportation", description: "Coordinated transportation home after a hospital stay." },
  { icon: CalendarCheck, title: "Recurring Scheduled Care", description: "Standing transportation arranged around a recurring care schedule." },
  { icon: Wheelchair, title: "Senior Medical Transportation", description: "Transportation for older adults attending medical care." },
];

const PROCESS_STEPS = [
  { title: "Submit a request", description: "Share the passenger, pickup, destination, and timing — online or by phone." },
  { title: "Zenward reviews it", description: "Our team reviews the details and confirms availability with you." },
  { title: "A trip is scheduled", description: "Once confirmed, the trip is scheduled and a driver is coordinated." },
  { title: "Your driver coordinates pickup", description: "The driver arrives, assists as needed, and gets underway." },
  { title: "Safe arrival", description: "The passenger arrives at their appointment or destination, ready for care." },
];

const FAQ_ITEMS = [
  {
    question: "Is this emergency transportation?",
    answer:
      "No. Zenward provides non-emergency medical transportation only. If you are experiencing a medical emergency, call 911.",
  },
  {
    question: "How do I request transportation?",
    answer:
      "Use the Request Transportation form on this site, or contact our team directly. We'll review the details and follow up to confirm availability and next steps.",
  },
  {
    question: "Is my request a confirmed booking?",
    answer:
      "Submitting a request lets Zenward know what transportation you need. It is not a confirmed ride until our team follows up to confirm availability.",
  },
  {
    question: "What areas does Zenward serve?",
    answer:
      "Zenward is launching in Georgia. Service area details are being finalized — contact us with your location and we'll confirm whether we can help.",
  },
  {
    question: "Do you work with healthcare facilities?",
    answer:
      "Yes. Zenward coordinates with clinics, dialysis centers, rehabilitation providers, senior care organizations, and hospital discharge teams. See our Healthcare Providers page or talk to our team.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <Section tone="navy-gradient" bare>
        <SectionContainer className="grid grid-cols-1 items-center gap-2xl py-lg lg:grid-cols-2 lg:py-2xl">
          <div>
            <p className={cn(typography.eyebrow, "text-brand-arrival-gold")}>
              Non-Emergency Medical Transportation
            </p>
            <h1 className={cn(typography.display, "mt-4 text-white")}>Care that gets you there.</h1>
            <p className={cn(typography.lede, "mt-6 max-w-lg text-white/85")}>
              Dependable medical transportation for appointments, treatments, discharge journeys, and scheduled
              care across Georgia.
            </p>
            <p className={cn(typography.body, "mt-3 max-w-lg text-white/70")}>
              Clear coordination from request to arrival.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <TrackedLinkButton
                href="/request-transportation"
                size="lg"
                onDark
                event={{ name: "request_transportation_clicked", source: "hero" }}
              >
                Request Transportation
              </TrackedLinkButton>
              <TrackedLinkButton
                href="/contact"
                size="lg"
                variant="outline"
                onDark
                event={{ name: "contact_started", topic: "general" }}
              >
                Talk to Our Team
              </TrackedLinkButton>
            </div>
            <p className={cn(typography.metadata, "mt-6 text-white/60")}>
              For patients, families, caregivers, and healthcare providers.
            </p>
          </div>
          <PhotoPlaceholder
            description="A Zenward driver assisting a passenger into a vehicle outside a healthcare facility."
            aspect="square"
            className="shadow-md"
          />
        </SectionContainer>
      </Section>

      {/* 2. Immediate transportation-request CTA */}
      <Section tone="mist">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className={cn(typography.subsectionTitle, "text-text-primary")}>
              Ready to schedule a ride?
            </p>
            <p className={cn(typography.body, "mt-1 text-text-secondary")}>
              Requesting transportation takes a few minutes.
            </p>
          </div>
          <TrackedLinkButton
            href="/request-transportation"
            size="lg"
            event={{ name: "request_transportation_clicked", source: "hero" }}
          >
            Request Transportation
          </TrackedLinkButton>
        </div>
      </Section>

      {/* 3. Trust / reassurance principles */}
      <Section tone="white">
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>
          What you can count on
        </h2>
        <div className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_PRINCIPLES.map((principle) => (
            <div key={principle.title} className="rounded-lg border border-border-subtle p-lg">
              <principle.icon className="size-8 text-brand-interactive-teal" weight="light" aria-hidden />
              <p className={cn(typography.subsectionTitle, "mt-4 text-lg text-text-primary")}>{principle.title}</p>
              <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{principle.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Human transportation value */}
      <Section tone="mist">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          <PhotoPlaceholder description="A caregiver and passenger arriving at a medical appointment together." aspect="video" />
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>
              Transportation is part of getting care
            </h2>
            <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
              Missing a ride can mean missing an appointment, a treatment, or a chance to come home. Zenward
              exists to make sure the trip to and from care is one less thing to worry about.
            </p>
            <p className={cn(typography.body, "mt-4 text-text-secondary")}>
              Every trip is coordinated with the same attention we&rsquo;d want for our own families — clear timing,
              a dependable driver, and a passenger who is treated with patience and respect.
            </p>
          </div>
        </div>
      </Section>

      {/* 5. Patients & families */}
      <Section tone="white">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Patients &amp; Families</p>
            <h2 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>
              Request transportation for yourself or someone you care for
            </h2>
            <p className={cn(typography.body, "mt-4 text-text-secondary")}>
              Whether you&rsquo;re arranging your own ride to a treatment or coordinating transportation for a family
              member, Zenward makes the request straightforward and keeps you informed along the way.
            </p>
            <div className="mt-6">
              <TrackedLinkButton
                href="/request-transportation"
                event={{ name: "request_transportation_clicked", source: "hero" }}
              >
                Request Transportation
              </TrackedLinkButton>
            </div>
          </div>
          <PhotoPlaceholder
            description="A family member helping a passenger prepare for a scheduled trip."
            aspect="video"
            className="order-1 lg:order-2"
          />
        </div>
      </Section>

      {/* 6. Healthcare provider commercial section */}
      <Section tone="mist">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          <PhotoPlaceholder description="A healthcare facility discharge coordinator reviewing a transportation schedule." aspect="video" />
          <div>
            <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Healthcare Providers</p>
            <h2 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>
              Fewer fragmented calls. Clearer transportation coordination.
            </h2>
            <p className={cn(typography.body, "mt-4 text-text-secondary")}>
              Clinics, dialysis centers, rehabilitation providers, senior care organizations, and hospital
              discharge teams work with Zenward to arrange and track patient transportation without relying
              solely on phone calls and texts.
            </p>
            <div className="mt-6">
              <TrackedLinkButton
                href="/healthcare-providers"
                variant="secondary"
                event={{ name: "provider_cta_clicked", source: "hero" }}
              >
                Talk to Zenward
              </TrackedLinkButton>
            </div>
          </div>
        </div>
      </Section>

      {/* 7. Services */}
      <Section tone="white">
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>Services</h2>
        <div className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <div key={service.title} className="rounded-lg border border-border-subtle p-lg">
              <service.icon className="size-7 text-brand-care-navy" weight="light" aria-hidden />
              <p className={cn(typography.subsectionTitle, "mt-4 text-lg text-text-primary")}>{service.title}</p>
              <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{service.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 8. From request to arrival */}
      <Section tone="mist">
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>
          From request to arrival
        </h2>
        <ol className="mx-auto mt-2xl flex max-w-3xl flex-col gap-lg">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-lg">
              <span
                className={cn(
                  typography.subsectionTitle,
                  "flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-care-navy text-lg text-white",
                )}
              >
                {index + 1}
              </span>
              <div>
                <p className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{step.title}</p>
                <p className={cn(typography.bodySmall, "mt-1 text-text-secondary")}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* 9. Dependability / professional trust */}
      <Section tone="white" narrow>
        <div className="text-center">
          <Buildings className="mx-auto size-9 text-brand-care-navy" weight="light" aria-hidden />
          <h2 className={cn(typography.sectionTitle, "mt-4 text-text-primary")}>
            Built for the trust medical transportation requires
          </h2>
          <p className={cn(typography.lede, "mx-auto mt-4 max-w-2xl text-text-secondary")}>
            Zenward is built specifically for non-emergency medical transportation — not adapted from a general
            rideshare or taxi model. Every part of how we coordinate trips is designed around the needs of
            patients, families, and the healthcare organizations that refer them.
          </p>
        </div>
      </Section>

      {/* 10. Healthcare organization sales CTA */}
      <Section tone="navy">
        <div className="flex flex-col items-center gap-6 text-center">
          <HeartStraight className="size-10 text-brand-arrival-gold" weight="fill" aria-hidden />
          <h2 className={cn(typography.sectionTitle, "text-white")}>
            Let&rsquo;s simplify transportation for your patients
          </h2>
          <p className={cn(typography.lede, "max-w-2xl text-white/80")}>
            If your organization coordinates transportation for patients, we&rsquo;d like to talk with you about how
            Zenward can help.
          </p>
          <TrackedLinkButton
            href="/contact"
            variant="primary"
            size="lg"
            onDark
            event={{ name: "provider_cta_clicked", source: "healthcare_providers_page" }}
          >
            Talk to Zenward
          </TrackedLinkButton>
        </div>
      </Section>

      {/* 11. Request transportation CTA */}
      <Section tone="navy-gradient">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className={cn(typography.sectionTitle, "text-white")}>Need a ride to care?</h2>
          <p className={cn(typography.lede, "max-w-xl text-white/80")}>
            Request transportation for yourself or someone you care for — it only takes a few minutes.
          </p>
          <TrackedLinkButton
            href="/request-transportation"
            size="lg"
            onDark
            event={{ name: "request_transportation_clicked", source: "hero" }}
          >
            Request Transportation
          </TrackedLinkButton>
        </div>
      </Section>

      {/* 12. FAQ */}
      <Section tone="white" narrow>
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>
          Frequently asked questions
        </h2>
        <div className="mt-2xl">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </Section>
    </>
  );
}

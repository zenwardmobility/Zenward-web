import Link from "next/link";
import {
  HandHeart,
  ShieldCheck,
  ChatCircleText,
  ClipboardText,
  Stethoscope,
  Heartbeat,
  CalendarCheck,
  Wheelchair,
  Hospital,
  FirstAidKit,
  Phone,
  MapPinLine,
  CalendarDots,
  UsersThree,
  FileText,
  SteeringWheel,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { BrandImage } from "@/components/layout/BrandImage";
import { HomeHero } from "@/components/public/HomeHero";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { LinkButton } from "@/components/ui/LinkButton";
import { buttonClassNames } from "@/components/ui/buttonStyles";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";
import { brandImages } from "@/lib/images";
import { business } from "@/lib/business";
import { absoluteUrl, siteName, siteUrl } from "@/lib/seo";

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

const PROVIDER_CAPABILITIES = [
  { icon: ClipboardText, title: "Transportation requests", description: "Send a request with the details your team already has on hand." },
  { icon: CalendarDots, title: "Trip scheduling", description: "Zenward reviews and schedules each trip around the appointment." },
  { icon: SteeringWheel, title: "Driver assignment", description: "A trip is confirmed once a driver has been assigned to it." },
  { icon: FileText, title: "Trip records", description: "A record of the transportation Zenward has coordinated for your patients." },
];

const SERVICES = [
  { icon: Stethoscope, title: "Medical appointments", description: "Routine and specialist visits, on schedule." },
  { icon: Heartbeat, title: "Dialysis visits", description: "Dependable, recurring transportation for ongoing treatment." },
  { icon: FirstAidKit, title: "Rehabilitation appointments", description: "Consistent transportation for recovery and therapy visits." },
  { icon: Hospital, title: "Hospital discharge transportation", description: "Coordinated transportation home after a hospital stay." },
  { icon: CalendarCheck, title: "Recurring scheduled care", description: "Standing transportation arranged around a recurring care schedule." },
  { icon: Wheelchair, title: "Senior medical transportation", description: "Transportation for older adults attending medical care." },
];

const PROCESS_STEPS = [
  { title: "Request", description: "Submit the passenger, pickup, destination, and timing — online or by phone." },
  { title: "Coordination", description: "Zenward reviews the details and confirms availability with you." },
  { title: "Ride", description: "A driver is assigned, arrives, assists as needed, and gets underway." },
  { title: "Arrival", description: "The passenger reaches their appointment or destination, ready for care." },
];

const DEPENDABILITY = [
  { title: "Rider communication", description: "You get pickup information as it is confirmed, and a point of contact if plans change." },
  { title: "Appointment-led timing", description: "Trips are scheduled around when the passenger needs to arrive, not the other way around." },
  { title: "Consistency", description: "The same dependable coordination for a one-time visit or a standing weekly schedule." },
  { title: "Respectful service", description: "Patience and assistance for passengers who need a little more time or support." },
];

const FAQ_ITEMS = [
  {
    question: "Is this emergency transportation?",
    answer:
      "No. Zenward provides non-emergency medical transportation only. If you are experiencing a medical emergency, call 911.",
  },
  {
    question: "Can a family member or caregiver request transportation?",
    answer:
      "Yes. You can request transportation for yourself, for a family member, or as a caregiver. The request form asks for your relationship to the passenger so we can follow up with the right person.",
  },
  {
    question: "Does submitting a request confirm the ride?",
    answer:
      "No. A request tells Zenward what transportation you need. It is not a confirmed ride until our team follows up to confirm availability and next steps.",
  },
  {
    question: "Can you accommodate a wheelchair, walker, or other assistance?",
    answer:
      "Transportation needs — including wheelchair accessibility, a walker, oxygen, or a travel companion — can be reviewed during request coordination. Note what is needed on the request and our team will confirm what we can arrange.",
  },
  {
    question: "Can a healthcare facility request transportation for a patient?",
    answer:
      "Yes. Clinics, dialysis centers, rehabilitation providers, senior care organizations, and hospital discharge teams coordinate patient transportation with Zenward. See the Healthcare Providers page or talk to our team.",
  },
  {
    question: `Where does Zenward operate?`,
    answer: `Zenward is launching in ${business.serviceArea}. Service area details are being finalized — contact us with your location and we'll confirm whether we can help.`,
  },
];

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: siteName,
  description:
    "Non-emergency medical transportation for appointments, treatments, discharge journeys, and scheduled care.",
  url: siteUrl,
  telephone: business.phoneHref.replace("tel:", ""),
  areaServed: { "@type": "State", name: business.serviceArea },
  logo: absoluteUrl("/images/zenward-mobility-logo.png"),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* 1. Hero */}
      <HomeHero />

      {/* 2. Immediate request / reassurance banner — overlaps the hero as one system */}
      <div className="relative z-10 -mt-14 px-md sm:-mt-16 sm:px-xl lg:-mt-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg bg-surface-elevated p-lg shadow-md ring-1 ring-brand-care-navy/10 sm:p-xl">
            <div className="flex flex-col gap-lg lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className={cn(typography.subsectionTitle, "text-text-primary")}>Need transportation?</p>
                <p className={cn(typography.body, "mt-1 max-w-[34rem] text-text-secondary")}>
                  Tell us about the trip. Zenward reviews every request and follows up to confirm.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <TrackedLinkButton
                  href="/request-transportation"
                  size="lg"
                  event={{ name: "request_transportation_clicked", source: "reassurance_strip" }}
                >
                  Request Transportation
                </TrackedLinkButton>
                <a
                  href={business.phoneHref}
                  aria-label={`Call Zenward at ${business.phoneDisplay}`}
                  className={buttonClassNames("secondary", "lg", false)}
                >
                  <Phone className="size-4" weight="fill" aria-hidden />
                  Call {business.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Trust principles */}
      <Section tone="white">
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>What you can count on</h2>
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

      {/* 4. Getting to care should feel more certain */}
      <Section tone="mist">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          <BrandImage
            asset={brandImages.vanWalkerAssist}
            aspect="video"
            objectPosition="center 42%"
          />
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>
              Getting to care should feel more certain
            </h2>
            <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
              Missing a ride can mean missing an appointment, a treatment, or a chance to come home. Zenward
              coordinates the trip so it is one less thing to worry about.
            </p>
            <ul className="mt-6 flex flex-col gap-4">
              {[
                { icon: MapPinLine, text: "Clear pickup information, confirmed ahead of the trip." },
                { icon: CalendarDots, text: "Coordination led by the appointment time, not guesswork." },
                { icon: ChatCircleText, text: "Communication throughout the trip, from pickup to arrival." },
              ].map((item) => (
                <li key={item.text} className="flex gap-3">
                  <item.icon className="mt-0.5 size-5 shrink-0 text-brand-interactive-teal" weight="bold" aria-hidden />
                  <span className={cn(typography.body, "text-text-secondary")}>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 5. Patients & families */}
      <Section tone="white">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Patients &amp; Families</p>
            <h2 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>
              Transportation support, with patience and respect
            </h2>
            <p className={cn(typography.body, "mt-4 text-text-secondary")}>
              Whether you are arranging your own ride to a treatment or coordinating transportation for a parent
              or family member, Zenward keeps the request straightforward and keeps you informed along the way.
              Passengers who need extra time or assistance get it.
            </p>
            <p className={cn(typography.bodySmall, "mt-4 text-text-muted")}>
              Zenward provides non-emergency medical transportation — not emergency or ambulance care.
            </p>
            <div className="mt-6">
              <TrackedLinkButton
                href="/request-transportation"
                event={{ name: "request_transportation_clicked", source: "patients_families" }}
              >
                Request Transportation
              </TrackedLinkButton>
            </div>
          </div>
          <BrandImage
            asset={brandImages.staffWalkingAssist}
            aspect="video"
            className="order-1 lg:order-2"
            objectPosition="center 38%"
          />
        </div>
      </Section>

      {/* 6. Healthcare providers */}
      <Section tone="navy">
        <div className="grid grid-cols-1 gap-2xl lg:grid-cols-2 lg:items-center">
          <div>
            <p className={cn(typography.eyebrow, "text-brand-arrival-gold")}>For Healthcare Providers</p>
            <h2 className={cn(typography.sectionTitle, "mt-3 text-white")}>
              Transportation coordination your team can rely on
            </h2>
            <p className={cn(typography.lede, "mt-4 max-w-[32rem] text-white/80")}>
              Clinics, dialysis centers, rehabilitation providers, senior care organizations, and hospital
              discharge teams work with Zenward to arrange and track patient transportation — without relying
              solely on scattered phone calls and texts.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <TrackedLinkButton
                href="/contact"
                size="lg"
                onDark
                event={{ name: "provider_cta_clicked", source: "homepage" }}
              >
                Talk to Zenward
              </TrackedLinkButton>
              <LinkButton href="/healthcare-providers" size="lg" variant="outline" onDark>
                Explore Provider Solutions
              </LinkButton>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PROVIDER_CAPABILITIES.map((cap) => (
              <div key={cap.title} className="rounded-lg bg-white/5 p-lg ring-1 ring-white/10">
                <cap.icon className="size-7 text-brand-calm-mist" weight="light" aria-hidden />
                <p className={cn(typography.subsectionTitle, "mt-3 text-lg text-white")}>{cap.title}</p>
                <p className={cn(typography.bodySmall, "mt-2 text-white/70")}>{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
        <p className={cn(typography.metadata, "mt-xl text-white/50")}>
          Provider tools are rolling out alongside Zenward&rsquo;s launch. Talk to us about what your team needs.
        </p>
      </Section>

      {/* 7. Services */}
      <Section tone="white">
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>
          Transportation for essential care
        </h2>
        <div className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <div key={service.title} className="rounded-lg border border-border-subtle p-lg">
              <service.icon className="size-7 text-brand-care-navy" weight="light" aria-hidden />
              <p className={cn(typography.subsectionTitle, "mt-4 text-lg text-text-primary")}>{service.title}</p>
              <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{service.description}</p>
            </div>
          ))}
        </div>
        <p className={cn(typography.bodySmall, "mt-lg text-center text-text-muted")}>
          Zenward does not provide emergency response, ambulance, or stretcher transportation.
        </p>
      </Section>

      {/* 8. From request to arrival */}
      <Section tone="mist" id="how-it-works">
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>From request to arrival</h2>
        <ol className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.title} className="rounded-lg bg-surface-elevated p-lg">
              <span
                className={cn(
                  typography.button,
                  "flex size-9 items-center justify-center rounded-full bg-brand-care-navy text-white",
                )}
              >
                {index + 1}
              </span>
              <p className={cn(typography.subsectionTitle, "mt-4 text-lg text-text-primary")}>{step.title}</p>
              <p className={cn(typography.bodySmall, "mt-1 text-text-secondary")}>{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 9. Dependability / details */}
      <Section tone="white">
        <div className="mx-auto max-w-[48rem] text-center">
          <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Dependability is in the details</h2>
          <p className={cn(typography.lede, "mx-auto mt-4 max-w-[42rem] text-text-secondary")}>
            The trip to care is not a background task. Zenward treats each one with the attention it deserves.
          </p>
        </div>
        <div className="mx-auto mt-2xl grid max-w-[52rem] grid-cols-1 gap-lg sm:grid-cols-2">
          {DEPENDABILITY.map((item) => (
            <div key={item.title} className="rounded-lg border border-border-subtle p-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
                <p className={cn(typography.body, "font-semibold text-text-primary")}>{item.title}</p>
              </div>
              <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 10. Provider sales CTA */}
      <Section tone="navy-gradient">
        <div className="flex flex-col items-center gap-6 text-center">
          <UsersThree className="size-10 text-brand-arrival-gold" weight="light" aria-hidden />
          <h2 className={cn(typography.sectionTitle, "text-white")}>
            Arrange transportation for the people you serve
          </h2>
          <p className={cn(typography.lede, "max-w-[42rem] text-white/80")}>
            If your organization coordinates transportation for patients, we would like to talk with you about
            how Zenward can help — for one patient or an ongoing schedule.
          </p>
          <TrackedLinkButton
            href="/contact"
            variant="primary"
            size="lg"
            onDark
            event={{ name: "provider_cta_clicked", source: "homepage" }}
          >
            Talk to Zenward
          </TrackedLinkButton>
        </div>
      </Section>

      {/* 11. Transportation request CTA */}
      <Section tone="navy">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className={cn(typography.sectionTitle, "text-white")}>Need a ride to care?</h2>
          <p className={cn(typography.lede, "max-w-[36rem] text-white/80")}>
            Request transportation for yourself or someone you care for — it only takes a few minutes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <TrackedLinkButton
              href="/request-transportation"
              size="lg"
              onDark
              event={{ name: "request_transportation_clicked", source: "final_cta" }}
            >
              Request Transportation
            </TrackedLinkButton>
            <a
              href={business.phoneHref}
              className={cn(
                typography.body,
                "inline-flex items-center justify-center gap-2 font-medium text-white hover:text-brand-calm-mist",
              )}
            >
              <Phone className="size-4" weight="fill" aria-hidden />
              Call {business.phoneDisplay}
            </a>
          </div>
        </div>
      </Section>

      {/* 12. FAQ */}
      <Section tone="white" narrow>
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>Frequently asked questions</h2>
        <div className="mt-2xl">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
        <p className={cn(typography.bodySmall, "mt-lg text-center text-text-secondary")}>
          Still have a question?{" "}
          <Link href="/contact" className="font-medium text-brand-interactive-teal underline">
            Talk to our team
          </Link>
          .
        </p>
      </Section>
    </>
  );
}

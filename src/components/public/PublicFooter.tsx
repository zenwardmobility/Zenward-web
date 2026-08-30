import Link from "next/link";
import { Phone } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ZenwardLogo } from "@/components/brand/ZenwardLogo";
import { business } from "@/lib/business";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Explore",
    links: [
      { label: "Services", href: "/services" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Healthcare Providers", href: "/healthcare-providers" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "Get transportation",
    links: [
      { label: "Request Transportation", href: "/request-transportation" },
      { label: "Talk to Our Team", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

/** Premium Care Navy footer — the site's closing brand moment. Uses the approved logo asset on a white chip and the approved business phone number (docs/design/brand-assets.md). */
export function PublicFooter() {
  return (
    <footer className="bg-brand-care-navy text-white">
      <SectionContainer className="py-3xl">
        <div className="grid grid-cols-2 gap-xl sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <ZenwardLogo treatment="chip" height={30} />
            <p className={cn(typography.body, "mt-4 max-w-[20rem] text-white/70")}>Care that gets you there.</p>
            <a
              href={business.phoneHref}
              className={cn(typography.body, "mt-4 inline-flex items-center gap-2 font-medium text-white hover:text-brand-calm-mist")}
            >
              <Phone className="size-4" weight="fill" aria-hidden />
              {business.phoneDisplay}
            </a>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className={cn(typography.label, "text-white/50")}>{column.heading}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={cn(typography.bodySmall, "text-white/80 hover:text-white")}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-2xl flex flex-col gap-2 border-t border-white/15 pt-lg sm:flex-row sm:items-center sm:justify-between">
          <p className={cn(typography.metadata, "text-white/50")}>
            © {new Date().getFullYear()} Zenward Mobility. Non-emergency medical transportation, {business.serviceArea}.
          </p>
          <p className={cn(typography.metadata, "text-white/50")}>
            For medical emergencies, call 911. Zenward does not provide emergency transportation.
          </p>
        </div>
      </SectionContainer>
    </footer>
  );
}

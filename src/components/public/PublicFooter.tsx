import Link from "next/link";
import { Phone } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { ZenwardLogo } from "@/components/brand/ZenwardLogo";
import { business } from "@/lib/business";
import { TrackedPhoneLink } from "@/components/public/TrackedPhoneLink";
import { servingLine } from "@/lib/service-area";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Explore",
    links: [
      { label: "Services", href: "/services" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Healthcare Providers", href: "/healthcare-providers" },
      { label: "Resources", href: "/resources" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "Get transportation",
    links: [
      { label: "Request a Quote", href: "/request-transportation" },
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

/** Premium Care Navy footer — the site's closing brand moment. Uses the locked inverse logo (public/brand/zenward-logo-inverse.svg) on Care Navy and the approved business phone number (docs/design/brand-assets.md). */
export function PublicFooter() {
  // The current operating market, from src/lib/service-area.ts.
  const serving = servingLine();
  return (
    <footer className="bg-brand-care-navy text-white">
      <SectionContainer className="py-3xl">
        <div className="grid grid-cols-2 gap-xl sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <ZenwardLogo treatment="inverse" height={30} />
            <p className={cn(typography.body, "mt-4 max-w-[20rem] text-white/70")}>Care that gets you there.</p>
            <p className={cn(typography.bodySmall, "mt-1 text-white/70")}>{serving}</p>
            <TrackedPhoneLink
              surface="footer"
              aria-label={`Call Zenward at ${business.phoneDisplay}`}
              className={cn(typography.body, "mt-4 inline-flex items-center gap-2 font-medium text-white hover:text-brand-calm-mist")}
            >
              <Phone className="size-4" weight="fill" aria-hidden />
              {business.phoneDisplay}
            </TrackedPhoneLink>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className={cn(typography.label, "text-white/60")}>{column.heading}</p>
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
          <p className={cn(typography.metadata, "text-white/60")}>
            © {new Date().getFullYear()} Zenward Mobility. Non-emergency medical transportation.
          </p>
          <p className={cn(typography.metadata, "text-white/60")}>
            For medical emergencies, call 911. Zenward does not provide emergency transportation.
          </p>
        </div>
      </SectionContainer>
    </footer>
  );
}

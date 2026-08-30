import Link from "next/link";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { SectionContainer } from "@/components/layout/SectionContainer";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "For patients & families",
    links: [
      { label: "Request Transportation", href: "/request-transportation" },
      { label: "Services", href: "/services" },
    ],
  },
  {
    heading: "For healthcare providers",
    links: [
      { label: "Healthcare Providers", href: "/healthcare-providers" },
      { label: "Talk to Zenward", href: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
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

/** Premium Care Navy footer — the site's closing brand moment, not an afterthought. No fabricated contact details (production phone/address are still unconfirmed — see decision register ZD-027). */
export function PublicFooter() {
  return (
    <footer className="bg-brand-care-navy text-white">
      <SectionContainer className="py-3xl">
        <div className="grid grid-cols-2 gap-xl sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <p className={cn(typography.subsectionTitle, "text-white")}>Zenward Mobility</p>
            <p className={cn(typography.body, "mt-2 max-w-xs text-white/70")}>Care that gets you there.</p>
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
            © {new Date().getFullYear()} Zenward Mobility. Non-emergency medical transportation, Georgia.
          </p>
          <p className={cn(typography.metadata, "text-white/50")}>
            For medical emergencies, call 911. Zenward does not provide emergency transportation.
          </p>
        </div>
      </SectionContainer>
    </footer>
  );
}

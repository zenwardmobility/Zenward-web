"use client";

import { useState } from "react";
import Link from "next/link";
import { List, Phone, X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { LinkButton } from "@/components/ui/LinkButton";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { ZenwardLogo } from "@/components/brand/ZenwardLogo";
import { business } from "@/lib/business";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Healthcare Providers", href: "/healthcare-providers" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/**
 * Site header. The two conversion paths are always one tap away (ZW-WEB-04B):
 *   - mobile/tablet (< lg): logo · compact Call button ("Call" on phones,
 *     the number from sm) · menu. Calling never needs the menu; Request a
 *     Quote is in the hero and the menu.
 *   - desktop (lg+): nav · phone icon + the real number · Request a Quote.
 */
export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface-elevated/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-3 px-md sm:px-xl">
        <Link href="/" aria-label="Zenward Mobility — home" className="flex shrink-0 items-center" onClick={close}>
          <ZenwardLogo height={32} alt="" priority />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex xl:gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(typography.bodySmall, "font-medium text-text-secondary hover:text-text-primary")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={business.phoneHref}
            aria-label={`Call Zenward at ${business.phoneDisplay}`}
            className={cn(
              typography.bodySmall,
              "inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-md px-3 font-semibold text-brand-care-navy hover:bg-surface-hover",
            )}
          >
            <Phone className="size-5 text-brand-interactive-teal" weight="fill" aria-hidden />
            <span>{business.phoneDisplay}</span>
          </a>
          <TrackedLinkButton
            href="/request-transportation"
            size="md"
            event={{ name: "request_transportation_clicked", source: "header" }}
          >
            Request a Quote
          </TrackedLinkButton>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={business.phoneHref}
            aria-label={`Call Zenward at ${business.phoneDisplay}`}
            onClick={close}
            className={cn(
              typography.button,
              "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-care-navy px-4 text-white hover:brightness-110",
            )}
          >
            <Phone className="size-4" weight="fill" aria-hidden />
            <span className="sm:hidden">Call</span>
            <span className="hidden sm:inline">{business.phoneDisplay}</span>
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex size-11 items-center justify-center rounded-sm text-text-primary"
          >
            {menuOpen ? <X className="size-6" aria-hidden /> : <List className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="flex flex-col gap-1 border-t border-border-subtle bg-surface-elevated px-md py-md lg:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className={cn(typography.body, "rounded-sm px-2 py-3 font-medium text-text-primary hover:bg-surface-hover")}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <TrackedLinkButton
              href="/request-transportation"
              size="lg"
              className="w-full"
              onClick={close}
              event={{ name: "request_transportation_clicked", source: "mobile_nav" }}
            >
              Request a Quote
            </TrackedLinkButton>
            <LinkButton href="/contact" size="lg" variant="outline" className="w-full" onClick={close}>
              Talk to Our Team
            </LinkButton>
          </div>
        </nav>
      )}
    </header>
  );
}

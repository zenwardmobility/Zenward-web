"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { LinkButton } from "@/components/ui/LinkButton";
import { ZenwardLogo } from "@/components/brand/ZenwardLogo";
import { business } from "@/lib/business";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Healthcare Providers", href: "/healthcare-providers" },
  { label: "About", href: "/about" },
];

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface-elevated/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-md sm:px-xl">
        <Link href="/" aria-label="Zenward Mobility — home" className="flex items-center" onClick={close}>
          <ZenwardLogo height={32} priority />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
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
          {business.signInUrl && (
            <Link
              href={business.signInUrl}
              className={cn(typography.bodySmall, "font-medium text-text-secondary hover:text-text-primary")}
            >
              Sign In
            </Link>
          )}
          <LinkButton href="/contact" size="md" variant="outline">
            Talk to Our Team
          </LinkButton>
          <LinkButton href="/request-transportation" size="md">
            Request Transportation
          </LinkButton>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex size-11 items-center justify-center rounded-sm text-text-primary lg:hidden"
        >
          {menuOpen ? <X className="size-6" aria-hidden /> : <List className="size-6" aria-hidden />}
        </button>
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
          {business.signInUrl && (
            <Link
              href={business.signInUrl}
              onClick={close}
              className={cn(typography.body, "rounded-sm px-2 py-3 font-medium text-text-primary hover:bg-surface-hover")}
            >
              Sign In
            </Link>
          )}
          <div className="mt-2 flex flex-col gap-2">
            <LinkButton href="/contact" size="lg" variant="outline" className="w-full" onClick={close}>
              Talk to Our Team
            </LinkButton>
            <LinkButton href="/request-transportation" size="lg" className="w-full" onClick={close}>
              Request Transportation
            </LinkButton>
          </div>
          <a
            href={business.phoneHref}
            onClick={close}
            className={cn(typography.bodySmall, "mt-3 px-2 py-2 font-medium text-brand-interactive-teal")}
          >
            Call {business.phoneDisplay}
          </a>
        </nav>
      )}
    </header>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { LinkButton } from "@/components/ui/LinkButton";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Healthcare Providers", href: "/healthcare-providers" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface-elevated/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-md sm:px-xl">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className={cn(typography.subsectionTitle, "text-brand-care-navy")}>Zenward</span>
          <span className={cn(typography.bodySmall, "hidden text-text-muted sm:inline")}>Mobility</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
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

        <div className="hidden lg:block">
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
              onClick={() => setMenuOpen(false)}
              className={cn(typography.body, "rounded-sm px-2 py-3 font-medium text-text-primary hover:bg-surface-hover")}
            >
              {link.label}
            </Link>
          ))}
          <LinkButton href="/request-transportation" size="lg" className="mt-2 w-full" onClick={() => setMenuOpen(false)}>
            Request Transportation
          </LinkButton>
        </nav>
      )}
    </header>
  );
}

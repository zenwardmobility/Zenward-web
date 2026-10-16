"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { track } from "@/lib/analytics/events";
import type { AssistantContext } from "@/lib/assistant/types";
import { OPEN_ASSISTANT_EVENT } from "./open-assistant";

// The panel (and the assistant engine) load only when first opened, so pages
// don't pay for it up front.
const loadPanel = () => import("./AssistantPanel").then((m) => m.AssistantPanel);
const AssistantPanel = dynamic(loadPanel, { ssr: false, loading: () => null });

/**
 * Pages whose form starts in the first viewport. There the floating launcher
 * is hidden below lg (it could cover form controls) and is the compact symbol
 * from lg. /request-transportation also has an inline entry; /contact is
 * itself the human-contact page. (/contact added in ZW-WEB-04I after QA found
 * the same overlap there.)
 */
const FORM_PAGES = new Set(["/request-transportation", "/contact"]);

/**
 * Site-wide entry to the Zenward Transportation Assistant (ZW-WEB-04H): a
 * restrained bottom-right button with the Zenward symbol. Hidden while the
 * panel is open; focus returns here when the panel closes. Respects the
 * bottom safe area. State lives in memory only.
 */
export function AssistantLauncher({ context }: { context: AssistantContext }) {
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  // Whatever opened the panel (this button or an inline entry) gets focus back on close.
  const opener = useRef<HTMLElement | null>(null);
  // On the quote form itself the visitor is already in the funnel (the form has its own service guidance
  // and phone panel). There the launcher shows only from lg, where the centred form leaves a side
  // gutter, and collapses to the symbol, so it never sits over form controls.
  const compact = FORM_PAGES.has(usePathname());

  useEffect(() => {
    if (wasOpen.current && !open) {
      const target = opener.current;
      // Fall back to the launcher if the opener is gone or hidden at this width.
      if (target && target.isConnected && target.getClientRects().length > 0) target.focus();
      else launcherRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  function openPanel() {
    if (open) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
    track({ name: "transportation_assistant_opened" });
  }

  // Inline entries (e.g. on the quote page) open this same panel.
  useEffect(() => {
    const onOpen = () => openPanel();
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpen);
  });

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={openPanel}
          onPointerEnter={() => void loadPanel()}
          onFocus={() => void loadPanel()}
          aria-haspopup="dialog"
          aria-label="Open the Zenward Transportation Assistant"
          className={cn(
            typography.button,
            "fixed right-4 z-30 h-12 items-center gap-2 rounded-full border border-brand-care-navy/10 bg-surface-elevated text-brand-care-navy shadow-md transition-shadow duration-base hover:shadow-lg sm:right-6",
            compact ? "hidden w-12 justify-center lg:inline-flex" : "inline-flex pl-2 pr-4",
            "bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-6",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- locked brand SVG, decorative */}
          <img src="/brand/zenward-symbol-primary.svg" alt="" width={32} height={32} className="size-8" />
          {!compact && <span>Need help?</span>}
        </button>
      )}
      {open && <AssistantPanel context={context} onClose={() => setOpen(false)} />}
    </>
  );
}

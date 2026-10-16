"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { track } from "@/lib/analytics/events";
import type { AssistantContext } from "@/lib/assistant/types";
import { ZENNY } from "@/lib/assistant/zenny";
import { playArrivalChime } from "@/lib/assistant/chime";
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
 * Site-wide entry to Zenny, the Zenward Transportation Assistant (ZW-WEB-04H,
 * identity ZW-WEB-04H2): a circular Zenny avatar bottom-right, with a quiet,
 * dismissible teaser ("Hi, I'm Zenny, here to assist you.") on page load. The
 * teaser shows once per session (dismissing or opening hides it until the
 * page is reloaded), never on the form pages, and never with a badge,
 * typing indicator or "live" status. Hidden while the panel is open; focus
 * returns to the opener when it closes. Only a "phone step done" flag is
 * kept here, IN MEMORY ONLY, so a same-session reopen doesn't ask again (the
 * number itself is not kept client-side once submitted); a reload clears it.
 * Respects the bottom safe area.
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
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  // Whether the phone step was completed this session. Memory only; the number itself isn't kept.
  const [gateDone, setGateDone] = useState(false);

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
    setTeaserDismissed(true);
    setOpen(true);
    track({ name: "transportation_assistant_opened" });
  }

  // Inline entries (e.g. on the quote page) open this same panel.
  useEffect(() => {
    const onOpen = () => openPanel();
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpen);
  });

  const showTeaser = !open && !compact && !teaserDismissed;

  // Arrival chime: at most once per page lifecycle, when the teaser first appears. Never on
  // reopen or replies. Supplemental only; silently skipped when autoplay isn't allowed.
  const chimed = useRef(false);
  useEffect(() => {
    if (!showTeaser || chimed.current) return;
    chimed.current = true;
    void playArrivalChime();
  }, [showTeaser]);

  return (
    <>
      {showTeaser && (
        <div
          className={cn(
            // Beside the avatar on the same baseline (not stacked above it), so it stays in the bottom
            // corner and clear of first-viewport CTAs (04H2 QA).
            "fixed right-[5rem] z-30 flex max-w-[13.5rem] items-center gap-0.5 rounded-lg rounded-br-sm border border-brand-care-navy/10 bg-surface-elevated pl-3 shadow-md sm:right-[5.5rem]",
            "bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-6",
          )}
        >
          <button
            type="button"
            onClick={openPanel}
            aria-haspopup="dialog"
            className={cn(typography.bodySmall, "min-h-11 flex-1 py-1.5 text-left leading-5 text-text-primary")}
          >
            {ZENNY.teaser}
          </button>
          <button
            type="button"
            onClick={() => setTeaserDismissed(true)}
            aria-label="Dismiss Zenny's greeting"
            className="flex size-11 shrink-0 items-center justify-center rounded-sm text-text-secondary hover:bg-surface-hover"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      )}
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={openPanel}
          onPointerEnter={() => void loadPanel()}
          onFocus={() => void loadPanel()}
          aria-haspopup="dialog"
          aria-label={ZENNY.launcherLabel}
          className={cn(
            "fixed right-4 z-30 items-center justify-center rounded-full bg-surface-elevated p-0.5 shadow-md ring-2 ring-surface-elevated transition-shadow duration-base hover:shadow-lg sm:right-6",
            compact ? "hidden size-12 lg:inline-flex" : "inline-flex size-14",
            "bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-6",
          )}
        >
          <Image src={ZENNY.avatarSrc} alt="" width={56} height={56} sizes="56px" className="size-full rounded-full object-cover" />
        </button>
      )}
      {open && <AssistantPanel context={context} gateDone={gateDone} onGateDone={() => setGateDone(true)} onClose={() => setOpen(false)} />}
    </>
  );
}

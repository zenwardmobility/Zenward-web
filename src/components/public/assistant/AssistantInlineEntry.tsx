"use client";

import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { openTransportationAssistant } from "./open-assistant";

/**
 * Inline entry to the Transportation Assistant for the quote page on phones
 * and tablets (ZW-WEB-04H close-out). Below 1024px the floating launcher is
 * hidden on /request-transportation so it can never sit over form controls;
 * this restrained row takes its place, once, before the form. From 1024px the
 * compact floating launcher is shown instead, so the two never appear
 * together. It opens the SAME panel via openTransportationAssistant().
 */
export function AssistantInlineEntry({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-x-4 gap-y-1 lg:hidden", className)}>
      <p className={cn(typography.bodySmall, "text-text-secondary")}>Need help choosing a service?</p>
      <button
        type="button"
        onClick={openTransportationAssistant}
        aria-haspopup="dialog"
        className={cn(
          typography.bodySmall,
          "inline-flex min-h-11 items-center gap-2 font-semibold text-text-accent-on-tint underline-offset-4 hover:underline",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- locked brand SVG, decorative */}
        <img src="/brand/zenward-symbol-primary.svg" alt="" width={20} height={20} className="size-5" />
        Ask the Transportation Assistant
      </button>
    </div>
  );
}

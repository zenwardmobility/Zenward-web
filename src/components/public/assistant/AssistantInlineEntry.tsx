"use client";

import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import Image from "next/image";
import { ZENNY } from "@/lib/assistant/zenny";
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
        <Image src={ZENNY.avatarSrc} alt="" width={24} height={24} sizes="24px" className="size-6 rounded-full object-cover" />
        Ask Zenny
      </button>
    </div>
  );
}

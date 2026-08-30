"use client";

import { LinkButton, type LinkButtonProps } from "@/components/ui/LinkButton";
import { track, type AnalyticsEvent } from "@/lib/analytics/events";

export interface TrackedLinkButtonProps extends LinkButtonProps {
  event: AnalyticsEvent;
}

/** A LinkButton that fires an analytics event on click — the small client boundary that lets server-rendered marketing pages still track CTA clicks. */
export function TrackedLinkButton({ event, onClick, ...props }: TrackedLinkButtonProps) {
  return (
    <LinkButton
      {...props}
      onClick={(e) => {
        track(event);
        onClick?.(e);
      }}
    />
  );
}

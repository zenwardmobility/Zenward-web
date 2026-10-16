"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { track, type AnalyticsSurface } from "@/lib/analytics/events";
import { business } from "@/lib/business";

/**
 * The one `tel:` link primitive (ZW-WEB-04D). Fires `phone_cta_clicked` with
 * the closed `surface` value only (no page, service or form context), then
 * lets the browser follow the tel: link. It never calls preventDefault, and
 * `track()` never throws, so a tracking problem can't stop the call. The
 * number always comes from src/lib/business.ts.
 */
export function TrackedPhoneLink({
  surface,
  children,
  onClick,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { surface: AnalyticsSurface; children: ReactNode }) {
  return (
    <a
      {...props}
      href={business.phoneHref}
      onClick={(event) => {
        track({ name: "phone_cta_clicked", surface });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}

/**
 * The ONE place the public service-area statement lives (ZW-WEB-04B).
 *
 * NOT YET CONFIRMED. ZW-WEB-04A (findings L-01 / L-02) found no confirmed
 * service area documented in this repository, and docs/product/marketing-
 * scope.md still describes the brand as geography-neutral. Until the owner
 * confirms the market, `SERVICE_AREA` stays `null` and every consumer renders
 * its honest, geography-free fallback. Do not put a guessed market, city or
 * county here, and do not scatter area strings through components.
 *
 * When the owner confirms it, set `SERVICE_AREA` below. With no other code
 * change, the area then appears in:
 *   - the homepage hero         (HomeHero: "Serving …" line under the audience line)
 *   - the quick request band    (homepage: "Serving …" before the review note)
 *   - the homepage FAQ          ("Where does Zenward operate?" answer)
 *   - the site footer           (PublicFooter: line under the tagline)
 *   - homepage metadata         (title + description, via `homeMetadataCopy`)
 *   - homepage JSON-LD          (`areaServed` on the Organization)
 * Also update docs/product/marketing-scope.md "Geography" in the same change.
 */
import { business } from "@/lib/business";

export interface ServiceArea {
  /**
   * The market as it reads after "Serving" and "in", e.g. "Metro Atlanta".
   * Owner-confirmed wording only.
   */
  name: string;
  /** Optional owner-confirmed counties/cities, listed in the FAQ answer. */
  places?: readonly string[];
}

const SERVICE_AREA: ServiceArea | null = null;

/** The confirmed service area, or `null` while it is unconfirmed. */
export function getServiceArea(): ServiceArea | null {
  return SERVICE_AREA;
}

/** "Serving <area>." or `null` (render nothing) while unconfirmed. */
export function servingLine(): string | null {
  const area = getServiceArea();
  return area ? `Serving ${area.name}.` : null;
}

/** Answer for the homepage FAQ "Where does Zenward operate?". */
export function serviceAreaFaqAnswer(): string {
  const area = getServiceArea();
  if (!area) {
    return `Availability depends on where the trip starts and ends. Call ${business.phoneDisplay} or send a request, and our team will confirm whether Zenward can provide your trip.`;
  }
  const places = area.places?.length ? ` including ${area.places.join(", ")}` : "";
  return `Zenward provides non-emergency medical transportation in ${area.name}${places}. Call ${business.phoneDisplay} or send a request, and our team will confirm availability for your trip.`;
}

/** Homepage <title> stem and meta description. */
export function homeMetadataCopy(): { title: string; description: string } {
  const area = getServiceArea();
  return {
    title: area ? `Non-Emergency Medical Transportation in ${area.name}` : "Non-Emergency Medical Transportation",
    description: area
      ? `Non-emergency medical transportation in ${area.name} for appointments, dialysis, rehabilitation, hospital discharge and recurring care, including wheelchair transportation. Request a ride or call ${business.phoneDisplay}.`
      : `Non-emergency medical transportation for appointments, dialysis, rehabilitation, hospital discharge and recurring care, including wheelchair transportation. Request a ride or call ${business.phoneDisplay}.`,
  };
}

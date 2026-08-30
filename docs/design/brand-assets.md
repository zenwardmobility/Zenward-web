# Zenward Web — Brand Assets

**Status:** Approved production assets in use.
**Last updated:** 2026-08-30

Canonical, approved Zenward Mobility brand assets for the public marketing site, and the rules for using them. Supplied in the WEB-P1-E1 asset drop.

## Logo

**Canonical asset:** `public/images/zenward-mobility-logo.png` (2172 × 724, RGB, near-white background).
**Derived:** `public/images/zenward-mobility-logo-trimmed.png` — the same asset with the surrounding whitespace cropped, for tight placements. Derived by `sharp().trim()`; the original is unmodified.

Rendered through `src/components/brand/ZenwardLogo.tsx` and `src/lib/images.ts` (`zenwardLogoImage`).

Rules:

- Use the supplied asset **as-is**. Do not redraw, recolour, re-typeset, re-icon, or reinterpret it, and do not rebuild it in HTML/CSS or from Phosphor glyphs.
- On light backgrounds (header), render it directly (`treatment="bare"`).
- On dark Care Navy backgrounds (footer, brand moments), render it on a white rounded chip (`treatment="chip"`) — a frame around the asset, never a recolour of it.
- Alt text is always `Zenward Mobility`.

## Photography

| File | Description (factual) | Approved uses |
|---|---|---|
| `zenward-wheelchair-ramp-assist.jpg` (1672 × 941) | White Zenward Mobility wheelchair-accessible van, side ramp deployed; a staff member assists an older passenger seated in a wheelchair outside a medical building. Vehicle carries the Zenward Mobility logo and the phone number 470-206-8005. | Homepage hero (LCP, `priority`), homepage "Patients & Families", `/about` |
| `zenward-staff-assisting-senior.jpg` (1449 × 1085) | Black Zenward Mobility van at a hospital main entrance; a staff member walks beside an older passenger using a wheeled walker up an accessible ramp. Vehicle carries the Zenward Mobility logo and the phone number 470-206-8005. | Homepage "Getting to care should feel more certain", `/healthcare-providers` hero |

Both were supplied as ~2.3 MB PNGs and converted once to quality-82 mozjpeg (`sharp`) for delivery; `next/image` handles responsive sizing and AVIF/WebP on demand. The PNG sources were not retained — regenerate from the asset drop if a lossless master is needed.

Image rules:

- Preserve the on-vehicle Zenward Mobility branding and the phone number **470-206-8005** that appear in the photographs. Never overlay CSS on top of them, crop them out deliberately, or alter them.
- Render only through `src/components/layout/BrandImage.tsx` (rounded, soft shadow, deliberate crop, blur placeholder).
- Alt text is factual and describes only what is visibly in frame — see `src/lib/images.ts`. No fabricated claims (no DOT number, license number, fleet ID, on-vehicle website, or healthcare-partner branding is invented anywhere).

## Phone number

**Approved business line:** `470-206-8005` — as printed on the approved vehicle imagery.

- Single source of truth: `src/lib/business.ts` (`business.phoneDisplay`, `business.phoneHref`).
- Telephone links use `tel:+14702068005`.
- Do not hardcode the number in components; import from `business`.
- Used on: header (mobile menu), footer, homepage reassurance strip, homepage final CTA, `/contact`, `/request-transportation`, and the `MedicalBusiness` JSON-LD on the homepage.

## Sign In / operations platform link

The header "Sign In" link points at the Zenward operations platform. Its production URL is unconfirmed (Zenward Platform decision register ZD-027 / ZD-079). Set `NEXT_PUBLIC_APP_URL` to enable the link; until then the header omits it rather than guessing a domain. See `src/lib/business.ts` (`business.signInUrl`).

## What is never fabricated

No fake reviews, ratings, stars, partner logos, client/trip counts, years of operation, accreditations, compliance badges, DOT/license numbers, service-area counties, or facility relationships appear anywhere on this site. See `docs/product/marketing-scope.md` "Claim discipline".

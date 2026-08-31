# Zenward Web — Brand Assets

**Status:** Approved production assets in use.
**Last updated:** 2026-08-31

Canonical, approved Zenward Mobility brand assets for the public marketing site, and the rules for using them. Logo supplied in the WEB-P1-E1 asset drop; photography replaced in the WEB-P1 photography-replacement drop (2026-08-31).

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

Registered in `src/lib/images.ts` (`brandImages`). Each production `.jpg` in `public/images/` is a mozjpeg q82, native-resolution (no upscaling) derivative of the PNG master kept out of the served tree in `docs/design/source-assets/`. `next/image` generates responsive AVIF/WebP on demand.

| Master (`docs/design/source-assets/`) | Production derivative (`public/images/`) | `brandImages` key | Description (factual) | Approved uses |
|---|---|---|---|---|
| `zenward-hero-desktop-v3.png` (1376 × 768, 16:9) | `zenward-hero-desktop-v3.jpg` (q90, 4:4:4, ~241 KB) | `heroDesktop` | Navy Zenward Mobility van at a medical building entrance, side door open and ramp deployed to the ground; a staff member stands with an older passenger seated in a wheelchair. Van door carries the Zenward Mobility mark and 470-206-8005. | Homepage hero, `lg` and up (LCP, `priority`, `quality={90}`, full-bleed) |
| `zenward-hero-mobile-v3.png` (768 × 1376, 9:16 portrait) | `zenward-hero-mobile-v3.jpg` (q90, 4:4:4, ~188 KB) | `heroMobile` | The same scene composed vertically, passenger and staff centred. | Homepage hero, below `lg` (LCP, `priority`, `quality={90}`, full-bleed) |
| `zenward-van-walker-assist.png` (1264 × 848, from "Staff assist 2.png") | `zenward-van-walker-assist.jpg` | `vanWalkerAssist` | White Zenward Mobility van with the side door open outside an office building; a staff member assists an older passenger who is using a folding walker. Van carries the Zenward Mobility mark and 470-206-8005. | Homepage "Getting to care should feel more certain"; `/healthcare-providers` hero |
| `zenward-staff-walking-assist.png` (1264 × 848, from "Staff Assist.png") | `zenward-staff-walking-assist.jpg` | `staffWalkingAssist` | A Zenward Mobility staff member walking beside an older passenger who is using a walker, on a path outside a modern care residence. No vehicle in frame. | Homepage "Patients & Families"; `/about` |

`vanWalkerAssist` and `staffWalkingAssist` each appear twice, but never on the same page/scroll — the homepage shows three distinct photographs, and the reuses land on separate standalone pages (`/healthcare-providers`, `/about`).

**Hero asset history:** the homepage hero is now two dedicated crops of the same approved photograph — a 16:9 `heroDesktop` and a 9:16 portrait `heroMobile` — rendered per breakpoint in `HomeHero.tsx` (`v3`). Only one loads at a given breakpoint: each `<Image sizes>` collapses to a 1px placeholder at the other breakpoint so the preload scanner does not fetch both full-size (the "off" image still fetches one small ~20–36 KB candidate — an accepted trade for clean art direction). The `-v3` filenames are deliberate cache-safe new URLs. Both sources are 1376 px on the long edge — good for the majority of displays but below the ~2200–3000 px a very large / high-DPI *desktop* hero ideally wants; they are **not** upscaled (per policy), so on 4K/5K the desktop crop shows mild softness under close inspection. The portrait mobile crop comfortably covers phone widths at 3x.

**Regenerating a derivative:** supporting images — `sharp("docs/design/source-assets/<name>.png").jpeg({ quality: 82, mozjpeg: true }).toFile("public/images/<name>.jpg")`. The **hero crops** use `quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4"` (full chroma keeps the on-van text and ramp edges crisp) — the LCP / primary visual, so quality is prioritised over a small bandwidth saving. Never upscale; never re-compress a JPEG.

Image rules:

- Preserve the on-vehicle Zenward Mobility branding and the phone number **470-206-8005** that appear in the photographs. Never crop them out deliberately or alter them, and keep them clear of gradient overlays where they carry meaning.
- Framed content images render through `src/components/layout/BrandImage.tsx` (rounded, soft shadow, deliberate `object-position`, blur placeholder). The homepage hero is the one exception: a full-bleed `next/image` in `src/components/public/HomeHero.tsx` with the Care Navy → transparent gradient scrim (horizontal on desktop, vertical on mobile) — no hard seam between the text area and the photograph.
- Crops are tuned per placement (and per breakpoint for the hero) via `object-position` so the passenger, staff member, ramp, and van branding stay visible. Do not let `object-cover` remove the meaning of the frame.
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

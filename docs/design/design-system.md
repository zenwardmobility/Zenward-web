# Zenward Web — Design System

**Status:** Foundation, replicated from the Zenward Platform's approved brand system.
**Last updated:** 2026-08-30

This project's colors, typography, spacing, and iconography are a deliberate local copy of Zenward's approved brand system — not a shared package or cross-repo import. See [public-marketing-separation.md](../../../ZenWard/docs/product/public-marketing-separation.md) in the platform repository for why, and the drift-risk note below for how to keep the two in sync.

## Colors

Defined as Tailwind v4 `@theme` tokens in `src/app/globals.css`.

| Token | Hex | Use |
|---|---|---|
| `brand-care-navy` | `#123447` | Primary brand color, dark sections, primary headings on light backgrounds |
| `brand-route-teal` | `#21A89A` | Decorative brand accent, gradients |
| `brand-interactive-teal` | `#178577` | Primary interactive color — buttons, links |
| `brand-calm-mist` | `#DDF4F0` | Alternating section background |
| `brand-arrival-gold` | `#F4B860` | Restrained accent only — never a default CTA color, never overused |
| Neutrals (`text-*`, `surface-*`, `border-*`) | — | See `globals.css` for the full scale |

Semantic colors (`success-*`, `critical-*`) exist only for form validation states — this is a marketing site, not an operations console, so it needs far fewer semantic states than the platform app.

## Typography

- **Manrope** — hero headline, section titles, subsection titles. Brand and major-moment typography only.
- **Inter** — body copy, navigation, buttons, forms, captions, legal text.

Tokens live in `src/design/typography.ts` (`display`, `sectionTitle`, `subsectionTitle`, `body`, `lede`, `bodySmall`, `label`, `metadata`, `button`, `eyebrow`). Pages import from here rather than improvising font sizes.

## Spacing, radius, shadow

Semantic spacing aliases (`spacing-xs` through `spacing-5xl`) layered on Tailwind's 4px scale; radius tokens (`radius-xs` 6px through `radius-lg` 16px — slightly more generous than the platform app's, appropriate for a premium marketing site rather than a dense operations console); two shadow levels only. All in `globals.css`.

**Gotcha — `max-w-*` / `w-*` named sizes:** because `--spacing-{sm,md,lg,xl,2xl,3xl,…}` are defined as named tokens, Tailwind v4 resolves `max-w-lg` (etc.) against the *spacing* scale, not the container scale — `max-w-lg` would be `1.5rem`, not `32rem`. Use explicit arbitrary values for content widths (`max-w-[32rem]`, `max-w-[48rem]`) or the container-scale keys that don't collide (`max-w-6xl`, `max-w-7xl`). `gap-*`, `p-*`, `py-*`, `m-*` with the named keys are correct and intended.

## Iconography

**Phosphor Icons** (`@phosphor-icons/react`), imported directly where used — there is no centralized navigation icon map like the platform app's `OperationsSidebar` needs, because this site has no persistent app-shell navigation to map. One icon system only; do not introduce a second.

## Section rhythm

The homepage direction is explicitly **not** flat white. `src/components/layout/Section.tsx` provides four tones — `white`, `mist`, `navy`, `navy-gradient` — and pages alternate between them deliberately (see the homepage's section-by-section tone choices) rather than defaulting to white everywhere.

## Brand assets (logo + photography)

The approved **Zenward Mobility logo** (`public/images/zenward-mobility-logo.png`) is now the **canonical production brand asset**. It is used as-is — never redrawn, recoloured, re-typeset, or rebuilt in markup — via `src/components/brand/ZenwardLogo.tsx` in the header and footer. Full asset inventory and usage rules: [brand-assets.md](./brand-assets.md).

Approved production photography now exists and is rendered through `src/components/layout/BrandImage.tsx` (`next/image`, rounded, soft shadow, blur placeholder). All homepage `PhotoPlaceholder` usages present at initialization have been replaced. `src/components/layout/PhotoPlaceholder.tsx` remains for future sections that need premium photography before an approved image exists. This project still does not generate or use AI photorealistic imagery as a stand-in for real brand assets (see [reference-index.md](./reference-index.md)).

## Drift risk

This file and `src/app/globals.css` are a manually-synced copy of the platform repository's design system. A brand change made in one repo does not automatically appear in the other — update both. If drift becomes a recurring problem, extracting a shared, versioned design-token package is the natural next step (not needed yet, at two repos and pre-launch).

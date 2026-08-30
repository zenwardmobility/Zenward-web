# Zenward Web

The public marketing and acquisition website for **Zenward Mobility** — non-emergency medical transportation, launching in Georgia. Care that gets you there.

This is a standalone Next.js (App Router) + TypeScript + Tailwind CSS project. It is **not** the Zenward Platform (the operations console and driver app live in a separate repository, `ZenWard`). See [docs/product/marketing-scope.md](docs/product/marketing-scope.md) for the full relationship between the two.

## What this site is

The public commercial website for patients, family members, caregivers, and healthcare providers — built to generate transportation requests, healthcare-provider conversations, and establish Zenward's public brand ahead of the operations platform's completion.

## What this site is not

Not the dispatcher application, not the driver application, not an admin console, not a SaaS dashboard. It has no direct standing access to any operational data (passengers, trips, drivers, vehicles, assignments) — see [docs/architecture/request-intake-boundary.md](docs/architecture/request-intake-boundary.md).

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — defaults work for local dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/` — routes: `/`, `/request-transportation`, `/healthcare-providers`, `/services`, `/about`, `/contact`, `/privacy`, `/terms`, plus `sitemap.ts`/`robots.ts`
- `src/components/layout/` — `PublicLayout`, `Section`/`SectionContainer`, `PhotoPlaceholder`
- `src/components/public/` — `PublicHeader`, `PublicFooter`, forms, and the tracked CTA button
- `src/components/ui/` — shared primitives (`Button`, `LinkButton`, `Input`, `Textarea`, `Select`)
- `src/design/typography.ts` — typography tokens (color/spacing/radius tokens live in `src/app/globals.css`)
- `src/lib/request-intake/`, `src/lib/contact-intake/` — the controlled server-side boundaries forms submit through (see the architecture doc above)
- `src/lib/analytics/events.ts` — the privacy-conscious analytics event layer
- `docs/design/design-system.md` — brand tokens (colors, type, spacing, radius, icons)
- `docs/design/reference-index.md` — where approved visual references live
- `docs/product/marketing-scope.md` — audiences, conversion goals, relationship to the Zenward Platform

## Conventions

- Colors, spacing, radii, shadows, and fonts are defined once in `src/app/globals.css` (Tailwind v4 `@theme`) — replicated from, not imported from, the Zenward Platform's design system. See `docs/design/design-system.md`.
- No runtime code is ever imported from the Zenward Platform repository, and vice versa. The two projects are independently deployable.
- This site has no direct connection to the Zenward Platform's database. Forms submit through a Server Action to a swappable adapter (`src/lib/request-intake/`, `src/lib/contact-intake/`) — currently a safe stub that persists nothing.
- Analytics track actions, never passenger data — see `src/lib/analytics/events.ts`.
- Do not fabricate certifications, licenses, partner logos, testimonials, ratings, statistics, fleet size, customer counts, or service-area details. Use honest, non-committal language where final business information isn't confirmed yet.

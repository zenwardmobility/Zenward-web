# Zenward Web — Design Reference Index

**Status:** Canonical homepage reference and approved production imagery on file.
**Last updated:** 2026-08-30

## Purpose

`docs/design/references/` is where **approved canonical** Zenward public-site visual references belong once they exist — full-page comps, section-level design direction, or approved photography direction that this codebase should match.

## Rules

- **Only approved canonical references go here.** Do not add rejected iterations, early drafts, or exploratory concepts (e.g., rejected Stitch iterations) — this index and its folder are a source of truth for "what we build to," not a working scratch space.
- Each reference added to `docs/design/references/` must be listed below with: filename, what it covers, the date it was approved, and who approved it.
- If a reference is superseded, move the old one out (or mark it superseded below) rather than leaving two conflicting "canonical" files.

## Index

| File | Covers | Approved | Approved by |
|---|---|---|---|
| `references/01-public-homepage.png` | **CANONICAL PUBLIC HOMEPAGE VISUAL REFERENCE** — full desktop homepage composition: header, hero, reassurance strip, trust principles, "getting to care" section, patients & families, healthcare-providers band, services, "from request to arrival" stepper, dependability details, provider sales CTA, request CTA, FAQ, footer. The implemented homepage (`src/app/page.tsx`) follows this composition, refined per `marketing-scope.md` §21 (spacing, type scale, image cropping, CTA hierarchy, responsive composition). | 2026-08-30 | Project owner (WEB-P1-E1 asset drop) |

## Approved production imagery in use

Documented in full in [brand-assets.md](./brand-assets.md). Summary:

| Asset | Used on |
|---|---|
| `public/images/zenward-mobility-logo.png` (+ `-trimmed`) | Header, footer, brand JSON-LD |
| `public/images/zenward-wheelchair-ramp-assist.jpg` | Homepage hero, homepage "Patients & Families", `/about` |
| `public/images/zenward-staff-assisting-senior.jpg` | Homepage "Getting to care", `/healthcare-providers` hero |

## Placeholder policy

`src/components/layout/PhotoPlaceholder.tsx` remains for any future section that needs premium photography before an approved image exists. All homepage placeholders present at initialization have been replaced with approved imagery via `src/components/layout/BrandImage.tsx`. This project still does not generate or use AI photorealistic imagery as a stand-in for real brand assets.

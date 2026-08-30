/**
 * Typography tokens for the Zenward marketing site. See
 * docs/design/design-system.md. Manrope for brand/hero/major headings,
 * Inter for everything else — pages import from here rather than
 * improvising font sizes or families.
 */
export const typography = {
  /** Manrope. Hero headline only. */
  display: "font-display text-4xl font-bold leading-[44px] tracking-tight sm:text-5xl sm:leading-[56px] lg:text-6xl lg:leading-[64px]",
  /** Manrope. Major section headings across the site. */
  sectionTitle: "font-display text-3xl font-semibold leading-10 sm:text-4xl sm:leading-[44px]",
  /** Manrope. Sub-headings within a section. */
  subsectionTitle: "font-display text-xl font-semibold leading-7 sm:text-2xl sm:leading-8",
  /** Inter. Default body copy. */
  body: "font-sans text-base font-normal leading-7",
  /** Inter. Larger lede/intro copy under a heading. */
  lede: "font-sans text-lg font-normal leading-8",
  /** Inter. Secondary/dense copy. */
  bodySmall: "font-sans text-sm font-normal leading-6",
  /** Inter. Form labels. */
  label: "font-sans text-[13px] font-medium leading-[18px]",
  /** Inter. Captions, fine print, legal/footer text. */
  metadata: "font-sans text-xs font-normal leading-5",
  /** Inter. Button labels. */
  button: "font-sans text-sm font-semibold leading-5",
  /** Inter. A short all-caps label above a headline ("eyebrow" copy). */
  eyebrow: "font-sans text-xs font-semibold uppercase tracking-[0.14em] leading-4",
} as const;

export type TypographyToken = keyof typeof typography;

import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";

export type ButtonVariant = "primary" | "secondary" | "outline" | "text";
export type ButtonSize = "md" | "lg";

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-interactive-teal text-white hover:brightness-95 active:brightness-90",
  secondary: "bg-brand-care-navy text-white hover:brightness-110 active:brightness-95",
  outline: "border border-border-strong bg-transparent text-text-primary hover:bg-surface-hover",
  text: "bg-transparent text-brand-interactive-teal hover:bg-surface-hover",
};

/** A variant meant for use on a dark (Care Navy / gradient) background. */
export const buttonOnDarkVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-arrival-gold text-brand-care-navy hover:brightness-95 active:brightness-90",
  secondary: "bg-white text-brand-care-navy hover:brightness-95",
  outline: "border border-white/50 bg-transparent text-white hover:bg-white/10",
  text: "bg-transparent text-white underline underline-offset-4 hover:text-brand-calm-mist",
};

export const buttonSizeClasses: Record<ButtonSize, string> = {
  md: "h-12 px-6 rounded-md gap-2",
  lg: "h-14 px-8 rounded-md gap-2.5",
};

export function buttonClassNames(
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean | undefined,
  className?: string,
  onDark = false,
) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap transition-colors duration-base ease-standard",
    disabled && "cursor-not-allowed opacity-50",
    typography.button,
    (onDark ? buttonOnDarkVariantClasses : buttonVariantClasses)[variant],
    buttonSizeClasses[size],
    className,
  );
}

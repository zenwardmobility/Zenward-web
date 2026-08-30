import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { buttonClassNames, type ButtonVariant, type ButtonSize } from "./buttonStyles";

export type { ButtonVariant, ButtonSize };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  onDark?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

/** For a link that should look like a button, use LinkButton instead of nesting a Link here. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      onDark = false,
      disabled,
      leadingIcon,
      trailingIcon,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={buttonClassNames(variant, size, isDisabled, className, onDark)}
        {...props}
      >
        {loading ? <CircleNotch className="size-4 animate-spin" aria-hidden /> : leadingIcon}
        {children}
        {!loading && trailingIcon}
      </button>
    );
  },
);
Button.displayName = "Button";

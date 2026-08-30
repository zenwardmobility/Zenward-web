import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SectionContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  narrow?: boolean;
}

/** Max-width, responsive-gutter content wrapper. Use inside a Section for the full-bleed-background pattern. */
export function SectionContainer({ narrow = false, className, children, ...props }: SectionContainerProps) {
  return (
    <div className={cn("mx-auto px-md sm:px-xl", narrow ? "max-w-[48rem]" : "max-w-6xl", className)} {...props}>
      {children}
    </div>
  );
}

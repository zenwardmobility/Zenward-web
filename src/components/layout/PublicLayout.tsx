import type { ReactNode } from "react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { AssistantLauncher } from "@/components/public/assistant/AssistantLauncher";
import { buildAssistantContext } from "@/components/public/assistant/context";

/** The one shell for this entire site — every route renders through it. */
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      {/* Site-wide Transportation Assistant (ZW-WEB-04H); the panel loads on first open. */}
      <AssistantLauncher context={buildAssistantContext()} />
    </div>
  );
}

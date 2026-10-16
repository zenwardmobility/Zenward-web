import Link from "next/link";
import { ArrowRight, Phone } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import type { AssistantAction, AssistantReply, QuickReplyId } from "@/lib/assistant/types";
import Image from "next/image";
import { ZENNY } from "@/lib/assistant/zenny";

/** One assistant reply: short paragraphs, an optional step list, then its actions. */
export function AssistantMessage({
  reply,
  showQuickReplies,
  onQuickReply,
  onNavigate,
}: {
  reply: AssistantReply;
  showQuickReplies: boolean;
  onQuickReply: (id: QuickReplyId, label: string) => void;
  onNavigate: (action: AssistantAction) => void;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Image src={ZENNY.avatarSrc} alt="" width={28} height={28} sizes="28px" className="mt-1 size-7 shrink-0 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <p className="sr-only">Zenny:</p>
        <div className={cn("flex flex-col gap-2 rounded-lg rounded-tl-sm bg-surface-secondary px-3.5 py-3", reply.kind === "emergency" && "border border-critical-border bg-critical-bg")}>
          {reply.paragraphs.map((text) => (
            <p key={text} className={cn(typography.bodySmall, "text-text-primary")}>
              {text}
            </p>
          ))}
          {reply.steps && (
            <ol className="flex list-decimal flex-col gap-1 pl-5">
              {reply.steps.map((step) => (
                <li key={step} className={cn(typography.bodySmall, "text-text-primary")}>
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
        <AssistantQuickActions actions={reply.actions} showQuickReplies={showQuickReplies} onQuickReply={onQuickReply} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

/** Links (quote, service page, contact), phone links and follow-up buttons, all at least 44px tall. */
export function AssistantQuickActions({
  actions,
  showQuickReplies,
  onQuickReply,
  onNavigate,
}: {
  actions: AssistantAction[];
  showQuickReplies: boolean;
  onQuickReply: (id: QuickReplyId, label: string) => void;
  onNavigate: (action: AssistantAction) => void;
}) {
  const visible = actions.filter((a) => a.kind !== "reply" || showQuickReplies);
  if (visible.length === 0) return null;
  const base = cn(typography.bodySmall, "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 font-semibold transition-colors duration-base");
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {visible.map((action) => {
        const style = action.kind !== "reply" && action.primary
          ? "bg-brand-care-navy text-white hover:brightness-110"
          : "border border-border-strong bg-surface-elevated text-text-primary hover:bg-surface-hover";
        return (
          <li key={`${action.kind}-${action.label}`}>
            {action.kind === "reply" ? (
              <button type="button" className={cn(base, style)} onClick={() => onQuickReply(action.id, action.label)}>
                {action.label}
              </button>
            ) : action.kind === "tel" ? (
              <a href={action.href} className={cn(base, style)} onClick={() => onNavigate(action)}>
                <Phone className="size-4" weight="fill" aria-hidden />
                {action.label}
              </a>
            ) : (
              <Link href={action.href} className={cn(base, style)} onClick={() => onNavigate(action)}>
                {action.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

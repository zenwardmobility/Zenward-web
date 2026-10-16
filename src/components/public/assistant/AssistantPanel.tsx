"use client";

import { useEffect, useRef, useState } from "react";
import { PaperPlaneRight, X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { track } from "@/lib/analytics/events";
import { ASSISTANT_NAME } from "@/lib/assistant/knowledge";
import { PANEL_NOTE, respond, welcome } from "@/lib/assistant/responses";
import type { AssistantAction, AssistantContext, AssistantReply, QuickReplyId } from "@/lib/assistant/types";
import { AssistantMessage } from "./AssistantMessage";

type Entry = { id: number; from: "assistant"; reply: AssistantReply } | { id: number; from: "visitor"; text: string };

/**
 * The Zenward Transportation Assistant panel (ZW-WEB-04H). A non-modal
 * dialog: a bottom sheet (max 80% of the viewport) on phones, a 380px
 * floating panel on larger screens, so the page behind stays visible and
 * usable. Escape or the close button closes it.
 *
 * PRIVACY: the conversation lives in this component's memory only. Nothing
 * is written to storage or cookies, put in a URL, sent to a server, emailed,
 * logged or sent to analytics. Replies come from the deterministic engine in
 * src/lib/assistant (no network, no model, no Nemryn).
 */
export function AssistantPanel({ context: ctx, onClose }: { context: AssistantContext; onClose: () => void }) {
  const [entries, setEntries] = useState<Entry[]>(() => [{ id: 0, from: "assistant", reply: welcome() }]);
  const [draft, setDraft] = useState("");
  const nextId = useRef(1);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the panel heading (not the input, so phones don't pop the keyboard).
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    if (entries.length > 1) endRef.current?.scrollIntoView({ block: "nearest" });
  }, [entries]);

  // Escape closes the panel wherever focus is (e.g. after the Send button disables itself).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function push(visitorText: string, reply: AssistantReply) {
    const a = nextId.current++;
    const b = nextId.current++;
    setEntries((list) => [...list, { id: a, from: "visitor", text: visitorText }, { id: b, from: "assistant", reply }]);
  }

  function onQuickReply(id: QuickReplyId, label: string) {
    push(label, respond({ kind: "quick", id }, ctx));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    push(text, respond({ kind: "text", text }, ctx));
    // Keep focus in the conversation: the Send button disables itself once the draft is empty.
    inputRef.current?.focus();
  }

  function onNavigate(action: AssistantAction) {
    if (action.kind === "link") {
      if (action.quote) track({ name: "transportation_assistant_quote_clicked" });
      onClose();
    }
  }

  const lastAssistant = [...entries].reverse().find((e) => e.from === "assistant")?.id;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="assistant-title"
      className={cn(
        "fixed z-50 flex flex-col overflow-hidden bg-surface-elevated shadow-md ring-1 ring-brand-care-navy/15",
        "inset-x-0 bottom-0 max-h-[80dvh] rounded-t-lg pb-[env(safe-area-inset-bottom)]",
        "sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-h-[min(40rem,calc(100dvh-7rem))] sm:w-[380px] sm:rounded-lg sm:pb-0",
      )}
    >
      <div className="flex items-center gap-3 border-b border-border-subtle bg-brand-care-navy px-4 py-3 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element -- locked brand SVG, decorative */}
        <img src="/brand/zenward-symbol-inverse.svg" alt="" width={32} height={32} className="size-8 shrink-0" />
        <h2 id="assistant-title" ref={headingRef} tabIndex={-1} className={cn(typography.body, "flex-1 font-semibold outline-none")}>
          {ASSISTANT_NAME}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the Transportation Assistant"
          className="flex size-11 items-center justify-center rounded-sm hover:bg-white/10"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <p className={cn(typography.metadata, "border-b border-border-subtle bg-surface-app px-4 py-2 text-text-secondary")}>{PANEL_NOTE}</p>

      <div role="log" aria-live="polite" aria-label="Conversation" className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4">
        {entries.map((entry) =>
          entry.from === "assistant" ? (
            <AssistantMessage
              key={entry.id}
              reply={entry.reply}
              showQuickReplies={entry.id === lastAssistant}
              onQuickReply={onQuickReply}
              onNavigate={onNavigate}
            />
          ) : (
            <div key={entry.id} className="flex justify-end">
              <p className={cn(typography.bodySmall, "max-w-[85%] break-words rounded-lg rounded-tr-sm bg-brand-care-navy px-3.5 py-2.5 text-white")}>
                <span className="sr-only">You: </span>
                {entry.text}
              </p>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-border-subtle bg-surface-elevated p-3">
        <label htmlFor="assistant-input" className="sr-only">
          Ask a transportation question
        </label>
        <input
          id="assistant-input"
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="How can I help with your trip?"
          maxLength={300}
          autoComplete="off"
          enterKeyHint="send"
          className={cn(typography.body, "h-11 min-w-0 flex-1 rounded-full border border-border-strong bg-surface-elevated px-4 text-text-primary placeholder:text-text-muted sm:text-sm sm:leading-6")}
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!draft.trim()}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-care-navy text-white disabled:opacity-40"
        >
          <PaperPlaneRight className="size-5" weight="fill" aria-hidden />
        </button>
      </form>
    </div>
  );
}

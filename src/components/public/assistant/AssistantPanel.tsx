"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PaperPlaneRight, X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { track } from "@/lib/analytics/events";
import { PHONE } from "@/lib/assistant/knowledge";
import { START_ACTIONS, respond } from "@/lib/assistant/responses";
import { ZENNY, timeGreeting, validatePhone } from "@/lib/assistant/zenny";
import type { AssistantAction, AssistantContext, AssistantReply, QuickReplyId } from "@/lib/assistant/types";
import { submitAssistantCallback } from "@/app/assistant/actions";
import { AssistantMessage } from "./AssistantMessage";

type Entry = { id: number; from: "assistant"; reply: AssistantReply } | { id: number; from: "visitor"; text: string };

const say = (paragraphs: string[], actions: AssistantReply["actions"] = []): AssistantReply => ({ kind: "greeting", paragraphs, actions });

/**
 * Opening messages (ZW-WEB-04H2, owner revision). First open in a session:
 * the time-of-day greeting, then the request for a follow-up phone number.
 * No quick actions until the phone step is done. Same-session reopen:
 * "Welcome back".
 */
function openingEntries(gateDone: boolean): Entry[] {
  if (gateDone) return [{ id: 0, from: "assistant", reply: say([ZENNY.welcomeBack], START_ACTIONS) }];
  // One bubble: greeting + the optional follow-up offer. No quick actions until Continue.
  return [{ id: 0, from: "assistant", reply: say([timeGreeting(), ZENNY.phonePrompt]) }];
}

/**
 * "Ask Zenny the Assistant": the Zenward Transportation Assistant panel
 * (ZW-WEB-04H; Zenny identity + phone gate ZW-WEB-04H2). Zenny is a website
 * assistant, not staff or a live agent. One opening bubble OFFERS an optional
 * follow-up number; Continue works with the field empty (skip, nothing sent)
 * or filled (one server-side handoff), and either way the visitor gets the
 * normal assistant. Emergency guidance (Call 911) and the operator line
 * (Call Zenward) are always visible in the opening. A non-modal dialog: a bottom sheet
 * (max 80% of the viewport) on phones, a 380px floating panel on larger
 * screens. Escape or the close button closes it.
 *
 * DATA: the ONLY thing that can leave the browser is an optional follow-up
 * phone number, sent once, on Continue, through the submitAssistantCallback Server Action
 * (trusted contact-intake email path). It is then cleared from component
 * state; only a "done" flag is kept (launcher memory). The conversation
 * itself stays in memory only: never sent to a server, emailed, stored,
 * logged or tracked. Replies come from the deterministic engine (no network,
 * no model, no Nemryn).
 */
export function AssistantPanel({
  context: ctx,
  gateDone,
  onGateDone,
  onClose,
}: {
  context: AssistantContext;
  gateDone: boolean;
  onGateDone: () => void;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<Entry[]>(() => openingEntries(gateDone));
  const [draft, setDraft] = useState("");
  const nextId = useRef(entries.length);
  // Gate: the number is held only until it is submitted, then cleared.
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const openedAt = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the panel heading (not the input, so phones don't pop the keyboard).
  useEffect(() => {
    openedAt.current = Date.now();
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

  /** Moves into the normal assistant (quick actions + chat input). Marks the session done: no re-prompt. */
  function finishGate(paragraphs: string[], actions: AssistantReply["actions"]) {
    setPhone("");
    setPhoneError(undefined);
    onGateDone();
    const id = nextId.current++;
    setEntries((list) => [...list, { id, from: "assistant", reply: say(paragraphs, actions) }]);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  /** Continue: empty field = skip (nothing sent); a valid number = one server-side handoff. */
  async function onGateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    if (!phone.trim()) {
      finishGate([ZENNY.ready], START_ACTIONS);
      return;
    }
    const tel = validatePhone(phone);
    if (!tel.ok) {
      setPhoneError(tel.error);
      return;
    }
    setSending(true);
    let delivered = false;
    try {
      // Phone only. One attempt; no automatic retry.
      ({ delivered } = await submitAssistantCallback({ phone: tel.value }, { startedAt: openedAt.current || undefined }));
    } catch {
      delivered = false;
    }
    setSending(false);
    // Never shown as success unless delivered; Zenny continues either way.
    if (delivered) finishGate([ZENNY.ready], START_ACTIONS);
    else finishGate([ZENNY.notDelivered, ZENNY.ready], [{ kind: "tel", label: ZENNY.operatorLink, href: PHONE.href }, ...START_ACTIONS]);
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
        <Image src={ZENNY.avatarSrc} alt="" width={40} height={40} sizes="40px" className="size-10 shrink-0 rounded-full object-cover ring-2 ring-white/30" />
        <div className="flex-1">
          <h2 id="assistant-title" ref={headingRef} tabIndex={-1} className={cn(typography.body, "font-semibold outline-none")}>
            {ZENNY.heading}
          </h2>
          <p className={cn(typography.metadata, "text-white/80")}>{ZENNY.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the Transportation Assistant"
          className="flex size-11 items-center justify-center rounded-sm hover:bg-white/10"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

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

      {!gateDone ? (
        <form onSubmit={onGateSubmit} noValidate aria-label="Follow-up phone number" className="flex flex-col gap-2.5 border-t border-border-subtle bg-surface-elevated p-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="zenny-phone" className={cn(typography.label, "text-text-primary")}>
              {ZENNY.phoneLabel}
            </label>
            <div className="flex gap-2">
              <input
                id="zenny-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder={ZENNY.phonePlaceholder}
                autoComplete="tel"
                inputMode="tel"
                maxLength={20}
                aria-invalid={Boolean(phoneError) || undefined}
                aria-describedby={cn("zenny-consent", phoneError && "zenny-phone-error")}
                className={cn(typography.body, "h-11 min-w-0 flex-1 rounded-sm border bg-surface-elevated px-3 text-text-primary placeholder:text-text-muted sm:text-sm", phoneError ? "border-critical-strong" : "border-border-strong")}
              />
              <button
                type="submit"
                disabled={sending}
                aria-busy={sending || undefined}
                className={cn(typography.button, "h-11 shrink-0 rounded-full bg-brand-care-navy px-5 text-white hover:brightness-110 disabled:opacity-60")}
              >
                Continue
              </button>
            </div>
            {phoneError && (
              <p id="zenny-phone-error" role="alert" className={cn(typography.metadata, "text-critical-text")}>
                {phoneError}
              </p>
            )}
            <p id="zenny-consent" className={cn(typography.metadata, "text-text-secondary")}>
              {ZENNY.consent}
            </p>
          </div>
          <div className={cn(typography.metadata, "flex flex-col gap-1 pt-1 text-text-secondary")}>
            <p>
              {ZENNY.emergencyPrefix}{" "}
              <a href="tel:911" className="font-bold text-critical-text underline-offset-4 hover:underline">
                {ZENNY.emergencyLink}
              </a>
            </p>
            <p>
              {ZENNY.operatorPrefix}{" "}
              <a href={PHONE.href} className="font-semibold text-text-accent-on-tint underline-offset-4 hover:underline">
                {ZENNY.operatorLink}
              </a>
            </p>
          </div>
        </form>
      ) : (
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
      )}
    </div>
  );
}

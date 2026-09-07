"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, Info, Phone } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormHoneypot } from "@/components/public/FormHoneypot";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { track } from "@/lib/analytics/events";
import { business } from "@/lib/business";
import { submitContactMessage } from "@/app/contact/actions";
import type { ContactMessageInput, ContactTopic } from "@/lib/contact-intake/types";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | undefined>();
  const [referenceId, setReferenceId] = useState<string | undefined>();
  const [delivered, setDelivered] = useState(false);
  const hasStarted = useRef(false);
  const startedAt = useRef<number>(0);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function markStarted(topic: ContactTopic = "general") {
    if (!hasStarted.current) {
      hasStarted.current = true;
      track({ name: "contact_started", topic });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(undefined);

    const formData = new FormData(event.currentTarget);
    const input: ContactMessageInput = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? "") || undefined,
      organization: String(formData.get("organization") ?? "") || undefined,
      topic: formData.get("topic") as ContactTopic,
      message: String(formData.get("message") ?? ""),
    };

    const result = await submitContactMessage(input, {
      hp: String(formData.get("company_website") ?? ""),
      startedAt: startedAt.current || undefined,
    });

    if (result.ok) {
      setStatus("success");
      setReferenceId(result.referenceId);
      setDelivered(result.delivered);
    } else {
      setStatus("error");
      setError(result.error ?? "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={cn(
          "rounded-lg border p-xl text-center",
          delivered ? "border-success-border bg-success-bg" : "border-border-strong bg-surface-elevated",
        )}
      >
        {delivered ? (
          <CheckCircle className="mx-auto size-10 text-success-strong" weight="fill" aria-hidden />
        ) : (
          <Info className="mx-auto size-10 text-brand-care-navy" weight="fill" aria-hidden />
        )}
        {delivered ? (
          <>
            <p className={cn(typography.subsectionTitle, "mt-4 text-text-primary")}>Message received</p>
            <p className={cn(typography.body, "mx-auto mt-2 max-w-[28rem] text-text-secondary")}>
              Thanks for reaching out. Our team will get back to you.
            </p>
          </>
        ) : (
          <>
            <p className={cn(typography.subsectionTitle, "mt-4 text-text-primary")}>
              This message wasn&rsquo;t sent
            </p>
            <p className={cn(typography.body, "mx-auto mt-2 max-w-[30rem] text-text-secondary")}>
              We couldn&rsquo;t deliver your message online, so no one at Zenward has received it. Please call our
              team to reach us.
            </p>
            <a
              href={business.phoneHref}
              className={cn(
                typography.button,
                "mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand-care-navy px-6 text-white",
              )}
            >
              <Phone className="size-4" weight="fill" aria-hidden />
              Call {business.phoneDisplay}
            </a>
          </>
        )}
        {delivered && referenceId && (
          <p className={cn(typography.metadata, "mt-4 text-text-muted")}>Reference: {referenceId}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onFocus={() => markStarted()} className="relative flex flex-col gap-lg">
      <FormHoneypot />
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input name="name" label="Your name" required autoComplete="name" maxLength={120} />
        <Input name="email" label="Email" type="email" required autoComplete="email" maxLength={254} />
      </div>
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input name="phone" label="Phone (optional)" type="tel" autoComplete="tel" maxLength={40} />
        <Input name="organization" label="Organization (optional)" helpText="If you're reaching out on behalf of a healthcare provider." maxLength={160} />
      </div>
      <Select
        name="topic"
        label="What can we help with?"
        required
        placeholder="Select one"
        options={[
          { value: "general", label: "General question" },
          { value: "provider", label: "I'm a healthcare provider" },
          { value: "support", label: "Support for an existing request" },
        ]}
      />
      <Textarea name="message" label="Message" required rows={5} maxLength={2000} />

      {error && (
        <p className={cn(typography.bodySmall, "text-critical-text")} role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" loading={status === "submitting"} className="w-full sm:w-auto">
        Send Message
      </Button>
      <p className={cn(typography.metadata, "text-text-muted")}>
        For transportation, use{" "}
        <a href="/request-transportation" className="font-medium text-brand-interactive-teal underline">
          Request Transportation
        </a>{" "}
        instead — please don&rsquo;t include medical details here.
      </p>
    </form>
  );
}

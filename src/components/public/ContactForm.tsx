"use client";

import { useRef, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { track } from "@/lib/analytics/events";
import { submitContactMessage } from "@/app/contact/actions";
import type { ContactMessageInput, ContactTopic } from "@/lib/contact-intake/types";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | undefined>();
  const hasStarted = useRef(false);

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

    const result = await submitContactMessage(input);
    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setError(result.error ?? "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-success-border bg-success-bg p-xl text-center">
        <CheckCircle className="mx-auto size-10 text-success-strong" weight="fill" aria-hidden />
        <p className={cn(typography.subsectionTitle, "mt-4 text-text-primary")}>Message received</p>
        <p className={cn(typography.body, "mx-auto mt-2 max-w-md text-text-secondary")}>
          Thanks for reaching out — our team will get back to you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onFocus={() => markStarted()} className="flex flex-col gap-lg">
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input name="name" label="Your name" required autoComplete="name" />
        <Input name="email" label="Email" type="email" required autoComplete="email" />
      </div>
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input name="phone" label="Phone (optional)" type="tel" autoComplete="tel" />
        <Input name="organization" label="Organization (optional)" helpText="If you're reaching out on behalf of a healthcare provider." />
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
      <Textarea name="message" label="Message" required rows={5} />

      {error && (
        <p className={cn(typography.bodySmall, "text-critical-text")} role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" loading={status === "submitting"} className="w-full sm:w-auto">
        Send Message
      </Button>
    </form>
  );
}

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
import { submitTransportationRequest } from "@/app/request-transportation/actions";
import type { TransportationRequestInput } from "@/lib/request-intake/types";

type Status = "idle" | "submitting" | "success" | "error";

export function RequestTransportationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | undefined>();
  const [referenceId, setReferenceId] = useState<string | undefined>();
  const hasStarted = useRef(false);

  function markStarted() {
    if (!hasStarted.current) {
      hasStarted.current = true;
      track({ name: "request_form_started" });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(undefined);

    const formData = new FormData(event.currentTarget);
    const input: TransportationRequestInput = {
      requesterName: String(formData.get("requesterName") ?? ""),
      requesterRelationship: formData.get("requesterRelationship") as TransportationRequestInput["requesterRelationship"],
      requesterPhone: String(formData.get("requesterPhone") ?? ""),
      requesterEmail: String(formData.get("requesterEmail") ?? "") || undefined,
      passengerName: String(formData.get("passengerName") ?? ""),
      pickupDescription: String(formData.get("pickupDescription") ?? ""),
      destinationDescription: String(formData.get("destinationDescription") ?? ""),
      preferredDate: String(formData.get("preferredDate") ?? "") || undefined,
      preferredTime: String(formData.get("preferredTime") ?? "") || undefined,
      returnTripNeeded: formData.get("returnTripNeeded") as TransportationRequestInput["returnTripNeeded"],
      assistanceNotes: String(formData.get("assistanceNotes") ?? "") || undefined,
      additionalNotes: String(formData.get("additionalNotes") ?? "") || undefined,
    };

    const result = await submitTransportationRequest(input);

    if (result.ok) {
      setStatus("success");
      setReferenceId(result.referenceId);
      track({ name: "request_form_submitted", hasReturnTrip: input.returnTripNeeded === "yes" });
    } else {
      setStatus("error");
      setError(result.error ?? "Something went wrong. Please try again or call us.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-success-border bg-success-bg p-xl text-center">
        <CheckCircle className="mx-auto size-10 text-success-strong" weight="fill" aria-hidden />
        <p className={cn(typography.subsectionTitle, "mt-4 text-text-primary")}>Request received</p>
        <p className={cn(typography.body, "mx-auto mt-2 max-w-[28rem] text-text-secondary")}>
          Zenward will review the transportation details and contact you to confirm availability and next steps.
        </p>
        {referenceId && (
          <p className={cn(typography.metadata, "mt-4 text-text-muted")}>Reference: {referenceId}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onFocus={markStarted} className="flex flex-col gap-lg">
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input name="requesterName" label="Your name" required autoComplete="name" />
        <Select
          name="requesterRelationship"
          label="Your relationship to the passenger"
          required
          placeholder="Select one"
          options={[
            { value: "self", label: "I am the passenger" },
            { value: "family", label: "Family member" },
            { value: "caregiver", label: "Caregiver" },
            { value: "facility_coordinator", label: "Healthcare facility coordinator" },
            { value: "other", label: "Other" },
          ]}
        />
        <Input name="requesterPhone" label="Phone number" type="tel" required autoComplete="tel" />
        <Input name="requesterEmail" label="Email (optional)" type="email" autoComplete="email" />
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input name="passengerName" label="Passenger's name" required helpText="If different from you." />
        <Select
          name="returnTripNeeded"
          label="Return trip needed?"
          required
          placeholder="Select one"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "not_sure", label: "Not sure yet" },
          ]}
        />
      </div>

      <Input name="pickupDescription" label="Pickup location" required helpText="Address, or the name of a facility." />
      <Input name="destinationDescription" label="Destination" required helpText="Address, or the name of a facility." />

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input name="preferredDate" label="Preferred date" type="date" />
        <Input name="preferredTime" label="Preferred time" type="time" />
      </div>

      <Textarea
        name="assistanceNotes"
        label="Assistance needed (optional)"
        helpText="Wheelchair, walker, oxygen, companion, or other assistance."
      />
      <Textarea name="additionalNotes" label="Anything else we should know? (optional)" />

      {error && (
        <p className={cn(typography.bodySmall, "text-critical-text")} role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" loading={status === "submitting"} className="w-full sm:w-auto">
        Submit Request
      </Button>
      <p className={cn(typography.metadata, "text-text-muted")}>
        This submits a transportation request, not a confirmed booking — Zenward will contact you to confirm
        availability and next steps.
      </p>
    </form>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, Phone } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SegmentedChoice } from "@/components/ui/SegmentedChoice";
import { RecurringScheduleFields, RECURRING_FIELD_NAMES } from "@/components/public/RecurringScheduleFields";
import { FormHoneypot } from "@/components/public/FormHoneypot";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { track } from "@/lib/analytics/events";
import { business } from "@/lib/business";
import { submitTransportationRequest } from "@/app/request-transportation/actions";
import type { TransportationRequestInput } from "@/lib/request-intake/types";
import {
  SERVICE_TYPE_OPTIONS,
  defaultFrequencyFor,
  type ServiceType,
  type TripFrequency,
} from "@/lib/request-intake/service-types";
import type { Weekday } from "@/lib/request-intake/recurring";

type Status = "idle" | "submitting" | "success" | "error";

/** A random UUID for this form session, used only for downstream idempotency.
 *  `crypto.randomUUID` is available in every secure browser context (the site
 *  is HTTPS); if it is somehow missing we return "" and the Server Action
 *  mints one instead (a retry then just won't self-deduplicate). */
function makeSubmissionId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignore — handled below
  }
  return "";
}

/**
 * `initialServiceType` comes from a validated, allow-listed `?service=` value
 * resolved on the server (see `resolveServiceParam`); it is never derived from
 * anything a visitor typed into the form. Arriving for `recurring_care` also
 * defaults Trip frequency to Recurring.
 */
export function RequestTransportationForm({ initialServiceType }: { initialServiceType?: ServiceType }) {
  const [frequency, setFrequency] = useState<TripFrequency>(() => defaultFrequencyFor(initialServiceType));
  const [recurringStart, setRecurringStart] = useState("");
  const [daysError, setDaysError] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | undefined>();
  const [referenceId, setReferenceId] = useState<string | undefined>();
  const [delivered, setDelivered] = useState(false);
  const hasStarted = useRef(false);
  const startedAt = useRef<number>(0);
  // One id per logical submission, deliberately NOT regenerated on a failed
  // attempt so a retry de-duplicates downstream. Replaced only on a fresh mount.
  const submissionId = useRef<string>("");
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    submissionId.current = makeSubmissionId();
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function markStarted() {
    if (!hasStarted.current) {
      hasStarted.current = true;
      track({ name: "request_form_started" });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setDaysError(undefined);

    const formData = new FormData(event.currentTarget);
    const isRecurring = frequency === "recurring";
    const days = isRecurring ? (formData.getAll(RECURRING_FIELD_NAMES.days) as Weekday[]) : [];
    if (isRecurring && days.length === 0) {
      // The server validates too; this just keeps the visitor on the form with
      // a specific message instead of a round-trip.
      setDaysError("Choose at least one day of the week.");
      return;
    }
    setStatus("submitting");

    // When recurring, the "Return transportation expected?" answer replaces the
    // one-time "Return trip needed?" select (hidden), and the recurring start
    // date / appointment time replace preferred date / time.
    const returnExpected = isRecurring ? formData.get(RECURRING_FIELD_NAMES.returnExpected) === "yes" : undefined;

    const input: TransportationRequestInput = {
      serviceType: formData.get("serviceType") as ServiceType,
      requesterName: String(formData.get("requesterName") ?? ""),
      requesterRelationship: formData.get("requesterRelationship") as TransportationRequestInput["requesterRelationship"],
      requesterPhone: String(formData.get("requesterPhone") ?? ""),
      requesterEmail: String(formData.get("requesterEmail") ?? "") || undefined,
      passengerName: String(formData.get("passengerName") ?? ""),
      pickupDescription: String(formData.get("pickupDescription") ?? ""),
      destinationDescription: String(formData.get("destinationDescription") ?? ""),
      preferredDate: isRecurring ? undefined : String(formData.get("preferredDate") ?? "") || undefined,
      preferredTime: isRecurring ? undefined : String(formData.get("preferredTime") ?? "") || undefined,
      returnTripNeeded: isRecurring
        ? returnExpected
          ? "yes"
          : "no"
        : (formData.get("returnTripNeeded") as TransportationRequestInput["returnTripNeeded"]),
      assistanceNotes: String(formData.get("assistanceNotes") ?? "") || undefined,
      additionalNotes: String(formData.get("additionalNotes") ?? "") || undefined,
    };
    if (isRecurring) {
      input.recurringSchedule = {
        daysOfWeek: days,
        startDate: String(formData.get(RECURRING_FIELD_NAMES.startDate) ?? ""),
        endDate: String(formData.get(RECURRING_FIELD_NAMES.endDate) ?? "") || undefined,
        appointmentTime: String(formData.get(RECURRING_FIELD_NAMES.appointmentTime) ?? "") || undefined,
        returnTripExpected: returnExpected,
      };
    }

    let result: Awaited<ReturnType<typeof submitTransportationRequest>>;
    try {
      result = await submitTransportationRequest(input, {
        hp: String(formData.get("company_website") ?? ""),
        startedAt: startedAt.current || undefined,
        submissionId: submissionId.current || undefined,
      });
    } catch {
      // The call itself failed (e.g. the connection dropped). Keep everything the
      // visitor entered and the SAME submissionId, so a retry is de-duplicated
      // downstream instead of leaving the form stuck in "submitting".
      setStatus("error");
      setError("We couldn't submit your request just now. Please try again shortly, or call us.");
      return;
    }

    if (result.ok) {
      setStatus("success");
      setReferenceId(result.referenceId);
      setDelivered(result.delivered);
      // Only a genuinely delivered request counts as a conversion.
      if (result.delivered) {
        track({ name: "request_form_submitted", hasReturnTrip: input.returnTripNeeded === "yes" });
      }
    } else {
      setStatus("error");
      setError(result.error ?? "Something went wrong. Please try again or call us.");
    }
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="rounded-lg border border-success-border bg-success-bg p-xl text-center"
      >
        <CheckCircle className="mx-auto size-10 text-success-strong" weight="fill" aria-hidden />
        <p className={cn(typography.subsectionTitle, "mt-4 text-text-primary")}>Request received</p>
        {delivered ? (
          <p className={cn(typography.body, "mx-auto mt-2 max-w-[28rem] text-text-secondary")}>
            Zenward will review the transportation details and contact you to confirm availability and next steps.
          </p>
        ) : (
          <>
            <p className={cn(typography.body, "mx-auto mt-2 max-w-[30rem] text-text-secondary")}>
              We have your details. So we can confirm this trip with you directly, please also call our team —
              it&rsquo;s the fastest way to lock in availability.
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
        {referenceId && (
          <p className={cn(typography.metadata, "mt-4 text-text-muted")}>Reference: {referenceId}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onFocus={markStarted} className="relative flex flex-col gap-lg">
      <FormHoneypot />

      <div className="flex flex-col gap-md">
        <Select
          name="serviceType"
          label="Service needed"
          required
          placeholder="Select one"
          // Only pass defaultValue when there is one: Select spreads its props after its own
          // default, so an explicit `undefined` would skip the placeholder and silently
          // preselect the first real option.
          {...(initialServiceType ? { defaultValue: initialServiceType } : {})}
          options={SERVICE_TYPE_OPTIONS}
        />
        <SegmentedChoice
          label="Trip frequency"
          name="tripFrequency"
          value={frequency}
          onChange={(value) => {
            setFrequency(value as TripFrequency);
            setDaysError(undefined);
          }}
          options={[
            { value: "one_time", label: "One-time" },
            { value: "recurring", label: "Recurring" },
          ]}
        />
        {frequency === "recurring" && (
          <RecurringScheduleFields startDate={recurringStart} onStartDateChange={setRecurringStart} daysError={daysError} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input name="requesterName" label="Your name" required autoComplete="name" maxLength={120} />
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
        <Input name="requesterPhone" label="Phone number" type="tel" required autoComplete="tel" maxLength={40} />
        <Input name="requesterEmail" label="Email (optional)" type="email" autoComplete="email" maxLength={254} />
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Input name="passengerName" label="Passenger's name" required helpText="If different from you." maxLength={120} />
        {frequency === "one_time" && (
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
        )}
      </div>

      <Input name="pickupDescription" label="Pickup location" required helpText="Address, or the name of a facility." maxLength={400} />
      <Input name="destinationDescription" label="Destination" required helpText="Address, or the name of a facility." maxLength={400} />

      {frequency === "one_time" && (
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          <Input name="preferredDate" label="Preferred date" type="date" />
          <Input name="preferredTime" label="Preferred time" type="time" />
        </div>
      )}

      <Textarea
        name="assistanceNotes"
        label="Assistance needed (optional)"
        helpText="Tell us about any mobility or assistance needs for this trip. Zenward will review the request and confirm what we can accommodate."
        maxLength={2000}
      />
      <Textarea name="additionalNotes" label="Anything else we should know? (optional)" maxLength={2000} />

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

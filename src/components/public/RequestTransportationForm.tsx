"use client";

import { useEffect, useReducer, useRef } from "react";
import { CheckCircle, Phone } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SegmentedChoice } from "@/components/ui/SegmentedChoice";
import { RecurringScheduleFields } from "@/components/public/RecurringScheduleFields";
import { FormHoneypot } from "@/components/public/FormHoneypot";
import { TrackedPhoneLink } from "@/components/public/TrackedPhoneLink";
import { TrustStrip } from "@/components/public/TrustStrip";
import { QuoteCalendar } from "@/components/public/quote-form/QuoteCalendar";
import { PreferredTimeSelect } from "@/components/public/quote-form/PreferredTimeSelect";
import { QuoteStepper } from "@/components/public/quote-form/QuoteStepper";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { track } from "@/lib/analytics/events";
import { business } from "@/lib/business";
import { QUOTE_RESPONSE_LINE } from "@/lib/trust";
import { submitTransportationRequest } from "@/app/request-transportation/actions";
import { SERVICE_TYPE_OPTIONS, type ServiceType } from "@/lib/request-intake/service-types";
import { todayInMarket } from "@/lib/quote-form/dates";
import {
  DATE_HELP,
  LAST_STEP,
  NOT_A_BOOKING,
  RELATIONSHIP_OPTIONS,
  RETURN_TRIP_NOTE,
  RETURN_TRIP_OPTIONS,
  SCHEDULE_REASSURANCE,
  SERVICE_GUIDANCE,
  STEPS,
  SUBMIT_LABEL,
  TIME_HELP,
  buildRequestInput,
  initialState,
  isDeliveredConversion,
  once,
  quoteFormReducer,
  reviewSections,
  type QuoteField,
  type QuoteFormValues,
} from "@/lib/quote-form/model";

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
 * The transportation quote request, as a five-step form (ZW-WEB-04G):
 * Trip -> Schedule -> Passenger -> Contact -> Review.
 *
 * - State lives in memory only (useReducer). Nothing is written to cookies,
 *   localStorage or sessionStorage, and nothing typed goes into a URL; a
 *   refresh starts over (deliberate, see the 04G report).
 * - `initialServiceType` comes from the server-resolved, allow-listed
 *   `?service=` value, never from anything typed.
 * - Dates and times are PREFERENCES. Zenward confirms availability later.
 * - The payload is built by `buildRequestInput` and is identical to the
 *   pre-04G form's. The Server Action, idempotency (one submissionId per
 *   mount, kept across retries) and fail-closed delivery are unchanged.
 */
export function RequestTransportationForm({ initialServiceType }: { initialServiceType?: ServiceType }) {
  const [state, dispatch] = useReducer(quoteFormReducer, initialServiceType, initialState);
  const { values, errors, step, status } = state;
  const stepId = STEPS[step].id;

  const startedAt = useRef<number>(0);
  // One id per logical submission, deliberately NOT regenerated on a failed
  // attempt so a retry de-duplicates downstream. Replaced only on a fresh mount.
  const submissionId = useRef<string>("");
  // transportation_quote_started: first genuine interaction, once per mount, no form values.
  const markStarted = useRef(once(() => track({ name: "transportation_quote_started" })));
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  const validationAttempt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
    submissionId.current = makeSubmissionId();
  }, []);

  // Move focus to the new step's heading (announces "Step n of 5") — not on first render.
  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      headingRef.current?.focus();
    }
  }, [step]);

  // After a failed Continue, focus the first invalid control.
  useEffect(() => {
    if (validationAttempt.current === 0 || Object.keys(errors).length === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"] input, [aria-invalid="true"]')?.focus();
  }, [errors]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function set<K extends QuoteField>(field: K, value: QuoteFormValues[K]) {
    dispatch({ type: "set", field, value });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < LAST_STEP) {
      // Enter in a field, or the Continue button: validate this step and move on.
      validationAttempt.current += 1;
      dispatch({ type: "next", today: todayInMarket() });
      return;
    }
    if (status === "submitting") return;

    const hp = String(new FormData(event.currentTarget).get("company_website") ?? "");
    dispatch({ type: "submitStart" });
    let result: Awaited<ReturnType<typeof submitTransportationRequest>>;
    try {
      result = await submitTransportationRequest(buildRequestInput(values), {
        hp,
        startedAt: startedAt.current || undefined,
        submissionId: submissionId.current || undefined,
      });
    } catch {
      // The call itself failed (e.g. the connection dropped). Keep everything the
      // visitor entered and the SAME submissionId, so a retry is de-duplicated.
      dispatch({ type: "submitFailed", message: "We couldn't submit your request just now. Please try again shortly, or call us." });
      return;
    }
    dispatch({ type: "submitResult", result });
    // Only a genuinely delivered request counts as a conversion. No parameters.
    if (isDeliveredConversion(result)) track({ name: "transportation_quote_submitted" });
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
        {state.delivered ? (
          <>
            <p className={cn(typography.body, "mx-auto mt-2 max-w-[30rem] text-text-secondary")}>
              Zenward will review the request and follow up with you to confirm availability and next steps. Your trip
              isn&rsquo;t confirmed until we confirm it with you.
            </p>
            <p className={cn(typography.bodySmall, "mx-auto mt-3 max-w-[30rem] font-semibold text-text-primary")}>
              {QUOTE_RESPONSE_LINE}
            </p>
          </>
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
        {state.referenceId && (
          <p className={cn(typography.metadata, "mt-4 text-text-muted")}>Reference: {state.referenceId}</p>
        )}
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onFocus={() => markStarted.current()}
      noValidate
      className="relative flex flex-col gap-xl"
      aria-labelledby="quote-step-heading"
    >
      <FormHoneypot />
      <QuoteStepper current={step} />

      <div className="flex flex-col gap-lg">
        <h2
          id="quote-step-heading"
          ref={headingRef}
          tabIndex={-1}
          className={cn(typography.subsectionTitle, "text-text-primary outline-none")}
        >
          <span className="sr-only">
            Step {step + 1} of {STEPS.length}:{" "}
          </span>
          {STEPS[step].title}
        </h2>

        {hasErrors && (
          <p role="alert" className={cn(typography.bodySmall, "rounded-sm border border-critical-border bg-critical-bg px-4 py-3 text-critical-text")}>
            Please check the {Object.keys(errors).length === 1 ? "highlighted field" : "highlighted fields"} below.
          </p>
        )}

        {stepId === "trip" && (
          <>
            <div className="flex flex-col gap-2">
              <Select
                name="serviceType"
                label="Service needed"
                required
                placeholder="Select one"
                value={values.serviceType}
                onChange={(event) => set("serviceType", event.target.value as QuoteFormValues["serviceType"])}
                options={SERVICE_TYPE_OPTIONS}
                error={errors.serviceType}
              />
              {values.serviceType && (
                <p className={cn(typography.bodySmall, "rounded-sm bg-brand-calm-mist px-4 py-3 text-text-primary")}>
                  {SERVICE_GUIDANCE[values.serviceType]}
                </p>
              )}
            </div>
            <Input
              name="pickupDescription"
              label="Pickup location"
              required
              helpText="Address, or the name of a facility."
              maxLength={400}
              autoComplete="off"
              value={values.pickupDescription}
              onChange={(event) => set("pickupDescription", event.target.value)}
              error={errors.pickupDescription}
            />
            <Input
              name="destinationDescription"
              label="Destination"
              required
              helpText="Address, or the name of a facility."
              maxLength={400}
              autoComplete="off"
              value={values.destinationDescription}
              onChange={(event) => set("destinationDescription", event.target.value)}
              error={errors.destinationDescription}
            />
          </>
        )}

        {stepId === "schedule" && (
          <ScheduleStep values={values} errors={errors} set={set} />
        )}

        {stepId === "passenger" && (
          <>
            <Input
              name="passengerName"
              label="Passenger's name"
              required
              helpText="The person who will be travelling."
              maxLength={120}
              value={values.passengerName}
              onChange={(event) => set("passengerName", event.target.value)}
              error={errors.passengerName}
            />
            <Textarea
              name="assistanceNotes"
              label="Mobility or assistance needs (optional)"
              helpText="For example, a wheelchair, a walker, or help getting to the door. Only what helps us arrange the trip; please don't include medical details. Zenward will review the request and confirm what we can accommodate."
              maxLength={2000}
              value={values.assistanceNotes}
              onChange={(event) => set("assistanceNotes", event.target.value)}
            />
            <Textarea
              name="additionalNotes"
              label="Anything else about the trip? (optional)"
              helpText="Such as an appointment time, a building entrance, or airport and flight details."
              maxLength={2000}
              value={values.additionalNotes}
              onChange={(event) => set("additionalNotes", event.target.value)}
            />
          </>
        )}

        {stepId === "contact" && (
          <>
            <p className={cn(typography.bodySmall, "text-text-secondary")}>
              The person requesting transportation. Zenward will follow up with you.
            </p>
            <Select
              name="requesterRelationship"
              label="Your relationship to the passenger"
              required
              placeholder="Select one"
              value={values.requesterRelationship}
              onChange={(event) => set("requesterRelationship", event.target.value as QuoteFormValues["requesterRelationship"])}
              options={RELATIONSHIP_OPTIONS}
              error={errors.requesterRelationship}
            />
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
              <Input
                name="requesterName"
                label="Your name"
                required
                autoComplete="name"
                maxLength={120}
                value={values.requesterName}
                onChange={(event) => set("requesterName", event.target.value)}
                error={errors.requesterName}
              />
              <Input
                name="requesterPhone"
                label="Phone number"
                type="tel"
                required
                autoComplete="tel"
                maxLength={40}
                value={values.requesterPhone}
                onChange={(event) => set("requesterPhone", event.target.value)}
                error={errors.requesterPhone}
              />
            </div>
            <Input
              name="requesterEmail"
              label="Email (optional)"
              type="email"
              autoComplete="email"
              maxLength={254}
              value={values.requesterEmail}
              onChange={(event) => set("requesterEmail", event.target.value)}
              error={errors.requesterEmail}
            />
          </>
        )}

        {stepId === "review" && (
          <ReviewStep values={values} onEdit={(target) => dispatch({ type: "goto", step: target })} />
        )}
      </div>

      {stepId === "review" && (
        <div className="flex flex-col gap-md">
          <TrustStrip variant="compact" />
          <p className={cn(typography.body, "font-semibold text-text-primary")}>{QUOTE_RESPONSE_LINE}</p>
          <p className={cn(typography.bodySmall, "text-text-secondary")}>{NOT_A_BOOKING}</p>
          {state.submitError && (
            <div role="alert" className="flex flex-col gap-2 rounded-sm border border-critical-border bg-critical-bg px-4 py-3">
              <p className={cn(typography.bodySmall, "text-critical-text")}>{state.submitError}</p>
              <TrackedPhoneLink
                surface="request_form"
                aria-label={`Call Zenward at ${business.phoneDisplay}`}
                className={cn(typography.bodySmall, "inline-flex min-h-11 items-center gap-2 font-semibold text-brand-care-navy underline-offset-4 hover:underline")}
              >
                <Phone className="size-4" weight="fill" aria-hidden />
                Call {business.phoneDisplay}
              </TrackedPhoneLink>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-lg sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? (
          <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => dispatch({ type: "back" })} disabled={status === "submitting"}>
            Back
          </Button>
        ) : (
          <span className="hidden sm:block" />
        )}
        <Button type="submit" size="lg" className="w-full sm:w-auto" loading={status === "submitting"}>
          {step === LAST_STEP ? SUBMIT_LABEL : "Continue"}
        </Button>
      </div>
    </form>
  );
}

function ScheduleStep({
  values,
  errors,
  set,
}: {
  values: QuoteFormValues;
  errors: ReturnType<typeof quoteFormReducer>["errors"];
  set: <K extends QuoteField>(field: K, value: QuoteFormValues[K]) => void;
}) {
  const today = todayInMarket();
  return (
    <>
      <p className={cn(typography.bodySmall, "rounded-sm bg-brand-calm-mist px-4 py-3 text-text-primary")}>{SCHEDULE_REASSURANCE}</p>
      <SegmentedChoice
        label="How often?"
        name="tripFrequency"
        value={values.frequency}
        onChange={(value) => set("frequency", value as QuoteFormValues["frequency"])}
        options={[
          { value: "one_time", label: "One-time" },
          { value: "recurring", label: "Recurring" },
        ]}
      />
      {values.frequency === "one_time" ? (
        <>
          <QuoteCalendar
            label="Preferred trip date"
            required
            help={DATE_HELP}
            value={values.preferredDate}
            onChange={(iso) => set("preferredDate", iso)}
            today={today}
            error={errors.preferredDate}
          />
          <PreferredTimeSelect
            label="Preferred pickup time"
            help={TIME_HELP}
            value={values.preferredTime}
            onChange={(value) => set("preferredTime", value)}
            error={errors.preferredTime}
          />
          <div className="flex flex-col gap-2">
            <SegmentedChoice
              label="Do you need a return trip?"
              name="returnTripNeeded"
              required
              value={values.returnTripNeeded}
              onChange={(value) => set("returnTripNeeded", value as QuoteFormValues["returnTripNeeded"])}
              error={errors.returnTripNeeded}
              options={RETURN_TRIP_OPTIONS}
            />
            {values.returnTripNeeded === "yes" && (
              <p className={cn(typography.bodySmall, "text-text-secondary")}>{RETURN_TRIP_NOTE}</p>
            )}
          </div>
        </>
      ) : (
        <RecurringScheduleFields values={values} errors={errors} today={today} onChange={set} />
      )}
    </>
  );
}

function ReviewStep({ values, onEdit }: { values: QuoteFormValues; onEdit: (step: number) => void }) {
  return (
    <div className="flex flex-col gap-md">
      {reviewSections(values).map((section) => (
        <section key={section.title} aria-labelledby={`review-${section.step}`} className="rounded-lg border border-border-subtle bg-surface-elevated p-md sm:p-lg">
          <div className="flex items-center justify-between gap-3">
            <h3 id={`review-${section.step}`} className={cn(typography.body, "font-semibold text-text-primary")}>
              {section.title}
            </h3>
            <button
              type="button"
              onClick={() => onEdit(section.step)}
              aria-label={`Edit ${section.title.toLowerCase()} details`}
              className={cn(typography.bodySmall, "inline-flex min-h-11 items-center px-2 font-semibold text-text-accent-on-tint underline-offset-4 hover:underline")}
            >
              Edit
            </button>
          </div>
          <dl className="mt-2 grid grid-cols-1 gap-x-lg gap-y-2 sm:grid-cols-[11rem_1fr]">
            {section.rows.map((row) => (
              <div key={row.label} className="contents">
                <dt className={cn(typography.bodySmall, "text-text-secondary")}>{row.label}</dt>
                <dd className={cn(typography.bodySmall, "mb-1 break-words font-medium text-text-primary sm:mb-0")}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

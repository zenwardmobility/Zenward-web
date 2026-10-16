/**
 * The multi-step quote form's model (ZW-WEB-04G): steps, per-step validation,
 * state transitions, review summary and the ONE function that turns form
 * state into the request payload.
 *
 * CONTRACT RULE: `buildRequestInput` produces exactly the
 * `TransportationRequestInput` the pre-04G form sent, field for field. The
 * Server Action, adapter, Nemryn mapping and wire body are unchanged. UI-only
 * state (step, errors, trip frequency, the raw recurring inputs) never
 * reaches the payload. There is no return-pickup-time field because the
 * trusted contract has none (see the 04G report: RETURN TIME CONTRACT GAP).
 *
 * WORDING RULE: dates and times are PREFERENCES. Nothing here says
 * "available", "slot", "reserve" or "book".
 *
 * Pure (no React, no I/O) so it is unit-tested with `node --test`.
 */
import {
  SERVICE_TYPE_LABELS,
  isPublicServiceType,
  type PublicServiceType,
  type TripFrequency,
} from "../request-intake/service-types.ts";
import { WEEKDAYS, WEEKDAY_LABELS, type Weekday } from "../request-intake/recurring.ts";
import type {
  RequesterRelationship,
  ReturnTripPreference,
  TransportationRequestInput,
  TransportationRequestResult,
} from "../request-intake/types.ts";
import { formatLongDate, formatTime12h, isBefore, isIsoDate } from "./dates.ts";

// ---------------------------------------------------------------- copy

export const SCHEDULE_REASSURANCE =
  "Choose your preferred date and pickup time. Zenward will review availability and confirm the trip with you.";
export const DATE_HELP = "Choose the date you would like transportation.";
export const TIME_HELP =
  "Choose the time you would like to be picked up. Zenward will confirm the final timing with you.";
export const RETURN_TRIP_NOTE = "Zenward will confirm return-trip timing with you.";
export const RECURRING_NOTE =
  "Tell us the schedule you'd like. A recurring request isn't an automatically booked series: Zenward reviews the schedule and confirms what can be arranged.";
export const NOT_A_BOOKING =
  "This is a transportation request, not a confirmed booking. Zenward will review availability and contact you to confirm the trip.";
export const SUBMIT_LABEL = "Submit Quote Request";

// ---------------------------------------------------------------- steps

export const STEPS = [
  { id: "trip", label: "Trip", title: "Where are you going?" },
  { id: "schedule", label: "Schedule", title: "When would you like to travel?" },
  { id: "passenger", label: "Passenger", title: "Who is travelling?" },
  { id: "contact", label: "Contact", title: "How can we reach you?" },
  { id: "review", label: "Review", title: "Review your request" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];
export const LAST_STEP = STEPS.length - 1;

// ---------------------------------------------------------------- values

export interface QuoteFormValues {
  serviceType: PublicServiceType | "";
  pickupDescription: string;
  destinationDescription: string;
  frequency: TripFrequency;
  preferredDate: string;
  preferredTime: string;
  returnTripNeeded: ReturnTripPreference | "";
  recurringDays: Weekday[];
  recurringStartDate: string;
  recurringEndDate: string;
  recurringAppointmentTime: string;
  recurringReturnExpected: "yes" | "no" | "";
  passengerName: string;
  assistanceNotes: string;
  additionalNotes: string;
  requesterRelationship: RequesterRelationship | "";
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
}

export type QuoteField = keyof QuoteFormValues;

/** Initial values. A preselected service comes only from the server-resolved, allow-listed `?service=`. */
export function initialValues(initialServiceType?: string): QuoteFormValues {
  const serviceType = isPublicServiceType(initialServiceType) ? initialServiceType : "";
  return {
    serviceType,
    pickupDescription: "",
    destinationDescription: "",
    frequency: serviceType === "recurring_care" ? "recurring" : "one_time",
    preferredDate: "",
    preferredTime: "",
    returnTripNeeded: "",
    recurringDays: [],
    recurringStartDate: "",
    recurringEndDate: "",
    recurringAppointmentTime: "",
    recurringReturnExpected: "",
    passengerName: "",
    assistanceNotes: "",
    additionalNotes: "",
    requesterRelationship: "",
    requesterName: "",
    requesterPhone: "",
    requesterEmail: "",
  };
}

// ---------------------------------------------------------------- options

/** Wire values are unchanged (Server Action allow-list); only labels are presentation. */
export const RELATIONSHIP_OPTIONS: { value: RequesterRelationship; label: string }[] = [
  { value: "self", label: "I am the passenger" },
  { value: "family", label: "Family member" },
  { value: "caregiver", label: "Caregiver" },
  { value: "facility_coordinator", label: "Healthcare provider or facility staff" },
  { value: "other", label: "Other" },
];

export const RETURN_TRIP_OPTIONS: { value: ReturnTripPreference; label: string }[] = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
  { value: "not_sure", label: "Not sure" },
];

/** Short, claim-free help shown under the service choice. */
export const SERVICE_GUIDANCE: Record<PublicServiceType, string> = {
  medical_appointment: "Include the clinic or office name in the destination. If you know the appointment time, add it in the notes.",
  dialysis: "If this trip repeats on a treatment schedule, choose Recurring in the next step.",
  rehabilitation: "For a series of therapy visits, choose Recurring in the next step.",
  hospital_discharge: "Discharge times often change. Give your best estimate and Zenward will confirm timing with you.",
  recurring_care: "You'll describe the repeating schedule in the next step. Zenward reviews it and confirms what can be arranged.",
  senior_medical: "Family members and caregivers can request transportation on the passenger's behalf.",
  wheelchair_transportation: "You can tell us about mobility or assistance needs in the passenger step.",
  airport_transportation: "Include the airport and relevant trip details in the destination or notes.",
  other: "Describe the trip in the notes and Zenward will follow up.",
};

// ---------------------------------------------------------------- validation

export type FieldErrors = Partial<Record<QuoteField, string>>;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const blank = (s: string) => s.trim() === "";

/**
 * Required-field and format checks for one step, run when the visitor presses
 * Continue (never before they have interacted). The Server Action still
 * re-validates everything; this only keeps the visitor on the right step with
 * a specific message.
 */
export function validateStep(step: StepId, v: QuoteFormValues, today: string): FieldErrors {
  const e: FieldErrors = {};
  if (step === "trip") {
    if (!v.serviceType) e.serviceType = "Choose the service you need.";
    if (blank(v.pickupDescription)) e.pickupDescription = "Enter the pickup location.";
    if (blank(v.destinationDescription)) e.destinationDescription = "Enter the destination.";
  }
  if (step === "schedule") {
    if (v.frequency === "one_time") {
      // Required for one-time trips (owner decision, 04G close-out): a request
      // needs a date to be quotable. Pickup time stays optional ("No preference").
      if (!v.preferredDate) e.preferredDate = "Choose your preferred trip date.";
      else if (!isIsoDate(v.preferredDate) || isBefore(v.preferredDate, today)) e.preferredDate = "Choose today or a future date.";
      if (v.preferredTime && !TIME_RE.test(v.preferredTime)) e.preferredTime = "Choose a pickup time from the list.";
      if (!v.returnTripNeeded) e.returnTripNeeded = "Tell us whether you need a return trip.";
    } else {
      if (v.recurringDays.length === 0) e.recurringDays = "Choose at least one day of the week.";
      if (!isIsoDate(v.recurringStartDate)) e.recurringStartDate = "Choose the date the schedule should start.";
      else if (isBefore(v.recurringStartDate, today)) e.recurringStartDate = "Choose today or a future date.";
      if (v.recurringEndDate && (!isIsoDate(v.recurringEndDate) || v.recurringEndDate < v.recurringStartDate)) {
        e.recurringEndDate = "The end date must be on or after the start date.";
      }
      if (v.recurringAppointmentTime && !TIME_RE.test(v.recurringAppointmentTime)) {
        e.recurringAppointmentTime = "Choose an appointment time from the list.";
      }
      if (!v.recurringReturnExpected) e.recurringReturnExpected = "Tell us whether a return trip is expected.";
    }
  }
  if (step === "passenger") {
    if (blank(v.passengerName)) e.passengerName = "Enter the passenger's name.";
  }
  if (step === "contact") {
    if (!v.requesterRelationship) e.requesterRelationship = "Tell us your relationship to the passenger.";
    if (blank(v.requesterName)) e.requesterName = "Enter your name.";
    if (blank(v.requesterPhone)) e.requesterPhone = "Enter a phone number we can reach you on.";
    if (!blank(v.requesterEmail) && !EMAIL_RE.test(v.requesterEmail.trim())) e.requesterEmail = "Enter a valid email address, or leave it blank.";
  }
  return e;
}

// ---------------------------------------------------------------- payload

/**
 * Form state -> `TransportationRequestInput`, identical to the pre-04G form:
 * one-time requests carry `preferredDate` / `preferredTime` and the visitor's
 * return-trip answer; recurring requests omit those, carry
 * `recurringSchedule`, and derive `returnTripNeeded` from
 * `returnTripExpected`. Optional blanks become `undefined`. Built field by
 * field, so no UI state can leak into it.
 */
export function buildRequestInput(v: QuoteFormValues): TransportationRequestInput {
  const isRecurring = v.frequency === "recurring";
  const returnExpected = isRecurring ? v.recurringReturnExpected === "yes" : undefined;
  const input: TransportationRequestInput = {
    serviceType: v.serviceType as PublicServiceType,
    requesterName: v.requesterName,
    requesterRelationship: v.requesterRelationship as RequesterRelationship,
    requesterPhone: v.requesterPhone,
    requesterEmail: v.requesterEmail || undefined,
    passengerName: v.passengerName,
    pickupDescription: v.pickupDescription,
    destinationDescription: v.destinationDescription,
    preferredDate: isRecurring ? undefined : v.preferredDate || undefined,
    preferredTime: isRecurring ? undefined : v.preferredTime || undefined,
    returnTripNeeded: isRecurring ? (returnExpected ? "yes" : "no") : (v.returnTripNeeded as ReturnTripPreference),
    assistanceNotes: v.assistanceNotes || undefined,
    additionalNotes: v.additionalNotes || undefined,
  };
  if (isRecurring) {
    input.recurringSchedule = {
      daysOfWeek: WEEKDAYS.filter((day) => v.recurringDays.includes(day)),
      startDate: v.recurringStartDate,
      endDate: v.recurringEndDate || undefined,
      appointmentTime: v.recurringAppointmentTime || undefined,
      returnTripExpected: returnExpected,
    };
  }
  return input;
}

// ---------------------------------------------------------------- state

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

export interface QuoteFormState {
  step: number;
  /** Furthest step reached; Edit from review may jump back to any step up to here. */
  maxStep: number;
  values: QuoteFormValues;
  errors: FieldErrors;
  status: SubmitStatus;
  submitError?: string;
  delivered: boolean;
  referenceId?: string;
}

export type QuoteFormAction =
  | { type: "set"; field: QuoteField; value: QuoteFormValues[QuoteField] }
  | { type: "next"; today: string }
  | { type: "back" }
  | { type: "goto"; step: number }
  | { type: "submitStart" }
  | { type: "submitResult"; result: TransportationRequestResult }
  | { type: "submitFailed"; message: string };

export function initialState(initialServiceType?: string): QuoteFormState {
  return { step: 0, maxStep: 0, values: initialValues(initialServiceType), errors: {}, status: "idle", delivered: false };
}

const scheduleTouched = (v: QuoteFormValues) =>
  Boolean(v.preferredDate || v.preferredTime || v.returnTripNeeded || v.recurringDays.length || v.recurringStartDate);

export function quoteFormReducer(state: QuoteFormState, action: QuoteFormAction): QuoteFormState {
  switch (action.type) {
    case "set": {
      const values = { ...state.values, [action.field]: action.value } as QuoteFormValues;
      // Choosing Recurring Care before touching the schedule defaults the schedule to Recurring.
      if (action.field === "serviceType" && action.value === "recurring_care" && !scheduleTouched(state.values)) {
        values.frequency = "recurring";
      }
      // "I am the passenger": reuse the passenger's name if the requester name is still empty.
      if (action.field === "requesterRelationship" && action.value === "self" && blank(values.requesterName)) {
        values.requesterName = values.passengerName;
      }
      const errors = { ...state.errors };
      delete errors[action.field];
      if (action.field === "frequency") {
        for (const key of Object.keys(errors) as QuoteField[]) {
          if (key.startsWith("recurring") || key === "preferredDate" || key === "preferredTime" || key === "returnTripNeeded") {
            delete errors[key];
          }
        }
      }
      if (action.field === "requesterRelationship") delete errors.requesterName;
      return { ...state, values, errors };
    }
    case "next": {
      if (state.step >= LAST_STEP) return state;
      const errors = validateStep(STEPS[state.step].id, state.values, action.today);
      if (Object.keys(errors).length > 0) return { ...state, errors };
      const step = state.step + 1;
      return { ...state, step, maxStep: Math.max(state.maxStep, step), errors: {} };
    }
    case "back":
      return state.step === 0 ? state : { ...state, step: state.step - 1, errors: {}, submitError: undefined };
    case "goto":
      if (action.step < 0 || action.step > state.maxStep || state.status === "submitting") return state;
      return { ...state, step: action.step, errors: {}, submitError: undefined };
    case "submitStart":
      return { ...state, status: "submitting", submitError: undefined };
    case "submitResult":
      if (action.result.ok) {
        return { ...state, status: "success", delivered: action.result.delivered === true, referenceId: action.result.referenceId };
      }
      return { ...state, status: "error", submitError: action.result.error ?? "Something went wrong. Please try again or call us." };
    case "submitFailed":
      return { ...state, status: "error", submitError: action.message };
  }
}

/** The quote-submitted conversion counts ONLY a genuinely delivered request. */
export function isDeliveredConversion(result: TransportationRequestResult): boolean {
  return result.ok === true && result.delivered === true;
}

/** Returns a function that runs `fn` once, however often it is called (quote-started event). */
export function once(fn: () => void): () => void {
  let done = false;
  return () => {
    if (!done) {
      done = true;
      fn();
    }
  };
}

// ---------------------------------------------------------------- review

export interface ReviewSection {
  step: number;
  title: string;
  rows: { label: string; value: string }[];
}

const RETURN_LABELS: Record<ReturnTripPreference, string> = {
  yes: "Yes. Zenward will confirm return-trip timing with you.",
  no: "No",
  not_sure: "Not sure yet",
};

/** What the visitor entered, in plain language, grouped by the step that collects it. No internal ids. */
export function reviewSections(v: QuoteFormValues): ReviewSection[] {
  const or = (value: string, fallback: string) => (value.trim() ? value.trim() : fallback);
  const service = v.serviceType ? SERVICE_TYPE_LABELS[v.serviceType] : "";
  const schedule: { label: string; value: string }[] =
    v.frequency === "one_time"
      ? [
          { label: "Trip", value: "One-time" },
          { label: "Preferred date", value: v.preferredDate ? formatLongDate(v.preferredDate) : "No date chosen yet" },
          { label: "Preferred pickup time", value: v.preferredTime ? formatTime12h(v.preferredTime) : "No preference" },
          { label: "Return trip", value: v.returnTripNeeded ? RETURN_LABELS[v.returnTripNeeded] : "" },
        ]
      : [
          { label: "Trip", value: "Recurring" },
          { label: "Days", value: WEEKDAYS.filter((d) => v.recurringDays.includes(d)).map((d) => WEEKDAY_LABELS[d].long).join(", ") },
          { label: "Starting", value: v.recurringStartDate ? formatLongDate(v.recurringStartDate) : "" },
          { label: "Until", value: v.recurringEndDate ? formatLongDate(v.recurringEndDate) : "Ongoing" },
          {
            label: "Typical appointment time",
            value: v.recurringAppointmentTime ? formatTime12h(v.recurringAppointmentTime) : "No preference",
          },
          { label: "Return trip", value: v.recurringReturnExpected === "yes" ? RETURN_LABELS.yes : "No" },
        ];
  const relationship = RELATIONSHIP_OPTIONS.find((o) => o.value === v.requesterRelationship)?.label ?? "";
  return [
    {
      step: 0,
      title: "Trip",
      rows: [
        { label: "Service", value: service },
        { label: "Pickup", value: v.pickupDescription.trim() },
        { label: "Destination", value: v.destinationDescription.trim() },
      ],
    },
    { step: 1, title: "Schedule", rows: schedule },
    {
      step: 2,
      title: "Passenger",
      rows: [
        { label: "Passenger", value: v.passengerName.trim() },
        { label: "Mobility or assistance needs", value: or(v.assistanceNotes, "None added") },
        { label: "Notes", value: or(v.additionalNotes, "None added") },
      ],
    },
    {
      step: 3,
      title: "Requester",
      rows: [
        { label: "Name", value: v.requesterName.trim() },
        { label: "Relationship", value: relationship },
        { label: "Phone", value: v.requesterPhone.trim() },
        { label: "Email", value: or(v.requesterEmail, "Not provided") },
      ],
    },
  ];
}

/**
 * The Transportation Assistant's deterministic replies (ZW-WEB-04H).
 *
 * `respond(input, ctx)` is pure: it never echoes what the visitor typed,
 * never stores it and never sends it anywhere. Order of precedence:
 *   1. emergency (stops everything; 911)
 *   2. request status / changes (the assistant can't see requests; call)
 *   3. services mentioned (guidance + quote handoff with ?service= only)
 *   4. other topics (pricing, coverage, process, trust, hours, ...)
 *   5. sensitive details only (privacy note -> quote form)
 *   6. unknown (don't guess; call or message)
 * Every reply is short (1–3 paragraphs) and passes `validateReply`.
 */
import { SERVICE_CATALOG, type ServiceSlug } from "../service-catalog.ts";
import { NOT_A_BOOKING, PATHS, PHONE, PROCESS_STEPS, SERVICE_ORDER, SERVICE_TIPS, TRUST, serviceFact } from "./knowledge.ts";
import { detectServices, detectTopics, isRecurring, normalize, type Topic } from "./intents.ts";
import { hasSensitiveDetails, isEmergency } from "./safety.ts";
import type { AssistantAction, AssistantContext, AssistantInput, AssistantReply, QuickReplyId } from "./types.ts";

// ---------------------------------------------------------------- copy

export const WELCOME =
  "Hi, I'm Zenward's Transportation Assistant. I can help you choose a transportation service, understand how requests work, or get in touch with our team.";
export const PANEL_NOTE = `I share general information and can't see or change bookings. To talk to our team, call ${PHONE.display}.`;
export const EMERGENCY_TEXT =
  "Zenward provides non-emergency transportation. If this is a medical emergency, call 911 or your local emergency service.";
export const UNKNOWN_TEXT = `I don't want to give you the wrong information. You can call Zenward at ${PHONE.display} or send our team a message.`;
export const STATUS_TEXT = `The Transportation Assistant can't view request status yet. Please call Zenward at ${PHONE.display} for help with an existing request.`;
export const PRICING_TEXT = "Pricing is confirmed after Zenward reviews the transportation request and trip details.";
export const HOURS_TEXT = `Our exact working hours aren't published here yet. You can call ${PHONE.display}, and transportation requests received during working hours are answered within 2 hours.`;
export const SENSITIVE_TEXT =
  "For your privacy, and to make sure the transportation team receives those details correctly, please use the secure Request a Quote form rather than this chat.";

// ---------------------------------------------------------------- actions

const call = (primary = false): AssistantAction => ({ kind: "tel", label: `Call ${PHONE.display}`, href: PHONE.href, primary });
const call911: AssistantAction = { kind: "tel", label: "Call 911", href: "tel:911", primary: true };
const contact: AssistantAction = { kind: "link", label: "Send a message", href: PATHS.contact };
const providers: AssistantAction = { kind: "link", label: "Healthcare providers", href: PATHS.providers };
const quote = (label = "Request a Quote"): AssistantAction => ({ kind: "link", label, href: PATHS.quote, primary: true, quote: true });
const reply = (id: QuickReplyId, label: string): AssistantAction => ({ kind: "reply", label, id });

function quoteFor(slug: ServiceSlug, label?: string): AssistantAction {
  const entry = SERVICE_CATALOG[slug];
  return { kind: "link", label: label ?? `Request ${entry.label}`, href: entry.requestHref, primary: true, quote: true };
}
const learn = (slug: ServiceSlug): AssistantAction => ({
  kind: "link",
  label: `Learn about ${SERVICE_CATALOG[slug].label}`,
  href: SERVICE_CATALOG[slug].path,
});

export const START_ACTIONS: AssistantAction[] = [
  reply("request", "Request transportation"),
  reply("find_service", "Which service do I need?"),
  reply("wheelchair", "Wheelchair transportation"),
  reply("recurring", "Recurring transportation"),
  reply("airport", "Airport transportation"),
  reply("talk", "Talk to Zenward"),
];

// Two short sets so the visitor never faces all eight services at once.
const FIND_FIRST: [ServiceSlug, string][] = [
  ["medical-appointments", "Doctor or clinic visit"],
  ["dialysis-transportation", "Dialysis"],
  ["rehabilitation-transportation", "Therapy or rehab"],
  ["hospital-discharge-transportation", "Leaving the hospital"],
];
const FIND_MORE: [ServiceSlug, string][] = [
  ["recurring-care-transportation", "Trips that repeat"],
  ["senior-medical-transportation", "An older adult's medical trip"],
  ["wheelchair-transportation", "Wheelchair accessibility"],
  ["airport-transportation", "Airport trip"],
];

// ---------------------------------------------------------------- replies

export function welcome(): AssistantReply {
  return { kind: "welcome", paragraphs: [WELCOME], actions: START_ACTIONS };
}

function emergency(): AssistantReply {
  return {
    kind: "emergency",
    paragraphs: [EMERGENCY_TEXT, "Zenward doesn't provide ambulance or stretcher transportation."],
    actions: [call911, reply("not_emergency", "This isn't an emergency")],
  };
}

function serviceReply(slugs: ServiceSlug[], ctx: AssistantContext, recurring: boolean): AssistantReply {
  const ordered = SERVICE_ORDER.filter((s) => slugs.includes(s));
  // Wheelchair accessibility is a transportation need that shapes the vehicle, so it leads when combined.
  const primary = ordered.includes("wheelchair-transportation") ? "wheelchair-transportation" : ordered[0];
  const others = ordered.filter((s) => s !== primary).slice(0, 1);
  const p = serviceFact(primary, ctx);

  if (others.length > 0) {
    const o = serviceFact(others[0], ctx);
    const lead =
      primary === "wheelchair-transportation"
        ? `Zenward provides both ${o.label} and ${p.label} in ${ctx.marketName}. If wheelchair accessibility is the key transportation need, I can open the request form with ${p.label} selected, and you can note the ${o.label.replace(/ Transportation$/, "").toLowerCase()} details in the trip notes.`
        : `Zenward provides both ${p.label} and ${o.label} in ${ctx.marketName}. Choose whichever fits the trip best; you can add the other details in the trip notes.`;
    return {
      kind: "service",
      services: [primary, others[0]],
      paragraphs: [lead, NOT_A_BOOKING],
      actions: [quoteFor(primary), quoteFor(others[0]), reply("find_service", "Choose another service")],
    };
  }

  const paragraphs = [`Zenward provides ${p.label} in ${ctx.marketName}. ${p.summary}`];
  const tip =
    recurring && (primary === "dialysis-transportation" || primary === "rehabilitation-transportation" || primary === "medical-appointments")
      ? "Zenward can review recurring transportation needs. On the request form, choose Recurring and tell us the days; Zenward confirms what can be arranged."
      : SERVICE_TIPS[primary];
  paragraphs.push(tip);
  paragraphs.push(`I can take you to the quote request with ${p.label} selected.`);
  return {
    kind: "service",
    services: [primary],
    paragraphs,
    actions: [quoteFor(primary), learn(primary), reply("find_service", "Choose another service")],
  };
}

function findService(more = false): AssistantReply {
  const set = more ? FIND_MORE : FIND_FIRST;
  return {
    kind: "find_service",
    paragraphs: [more ? "A few more options:" : "What is the trip for? Choose the closest fit."],
    actions: [
      ...set.map(([slug, label]) => reply(`service:${slug}`, label)),
      more ? quote("Something else: Request a Quote") : reply("find_more", "More options"),
    ],
  };
}

function process(): AssistantReply {
  return {
    kind: "process",
    paragraphs: ["Here's how a request works:"],
    steps: PROCESS_STEPS,
    actions: [quote(), reply("find_service", "Which service do I need?"), call()],
  };
}

function trustReply(topics: Topic[]): AssistantReply {
  const lines: string[] = [];
  if (topics.includes("trust_licensed")) lines.push(`Yes. ${TRUST.licensed}`);
  if (topics.includes("trust_on_time")) lines.push(TRUST.onTime);
  if (topics.includes("trust_drivers")) lines.push(TRUST.drivers);
  if (topics.includes("trust_care")) lines.push(TRUST.care);
  if (lines.length === 0) {
    lines.push(`${TRUST.labels.join(" · ")}.`);
    lines.push(TRUST.care);
  }
  return { kind: "trust", paragraphs: lines.slice(0, 3), actions: [quote(), reply("process", "How requests work")] };
}

function topicReply(topics: Topic[], ctx: AssistantContext): AssistantReply | undefined {
  const first = (...list: Topic[]) => list.find((t) => topics.includes(t));
  if (topics.includes("provider")) {
    return {
      kind: "provider",
      paragraphs: [
        "Zenward works with clinics, dialysis centers, rehabilitation providers, senior care organizations and hospital discharge teams to coordinate non-emergency transportation for patients.",
        "Talk to our team about how your organization arranges transportation, or request a quote for a specific trip.",
      ],
      actions: [providers, contact, quote()],
    };
  }
  if (topics.includes("coverage")) {
    return {
      kind: "coverage",
      paragraphs: [`I can't confirm payment or coverage options here. Please call Zenward at ${PHONE.display} and our team can talk it through.`],
      actions: [call(true), contact],
    };
  }
  if (topics.includes("pricing")) {
    return { kind: "pricing", paragraphs: [PRICING_TEXT, NOT_A_BOOKING], actions: [quote(), call()] };
  }
  if (topics.includes("credential")) {
    return {
      kind: "trust",
      paragraphs: [
        "I can't confirm specific certifications or programs here.",
        `What I can share: ${TRUST.licensed} Drivers are professionally trained and vetted, and driver screening includes background checks.`,
        `For anything more specific, please call ${PHONE.display}.`,
      ],
      actions: [call(true), contact],
    };
  }
  if (topics.includes("process")) return process();
  if (first("trust_licensed", "trust_on_time", "trust_drivers", "trust_care", "trust_general")) return trustReply(topics);
  if (topics.includes("response_time")) {
    return { kind: "response_time", paragraphs: [TRUST.response, NOT_A_BOOKING], actions: [quote(), call()] };
  }
  if (topics.includes("hours")) return { kind: "hours", paragraphs: [HOURS_TEXT], actions: [call(true), quote()] };
  if (topics.includes("availability")) {
    return {
      kind: "availability",
      paragraphs: [
        "I can't check vehicle availability. Send a quote request and Zenward will review it and confirm availability with you.",
        `For a trip that's soon, calling ${PHONE.display} is the quickest way to reach our team.`,
      ],
      actions: [quote(), call()],
    };
  }
  if (topics.includes("area")) {
    return {
      kind: "area",
      paragraphs: [`Zenward serves ${ctx.marketName}. Our team confirms availability for a specific trip when it reviews the request.`],
      actions: [quote(), call()],
    };
  }
  if (topics.includes("medical")) {
    return {
      kind: "medical",
      paragraphs: [
        "I can't give medical advice. Please ask a doctor or another healthcare professional.",
        "If this is a medical emergency, call 911.",
      ],
      actions: [call911, reply("start", "Back to transportation help")],
    };
  }
  if (topics.includes("contact")) {
    return {
      kind: "contact",
      paragraphs: [`You can call Zenward at ${PHONE.display} or send our team a message. ${TRUST.response}`],
      actions: [call(true), contact, providers],
    };
  }
  if (topics.includes("thanks")) return { kind: "thanks", paragraphs: ["You're welcome. Anything else I can help with?"], actions: START_ACTIONS.slice(0, 3) };
  if (topics.includes("greeting")) return { ...welcome(), kind: "greeting" };
  if (topics.includes("general")) {
    return { ...findService(), paragraphs: ["Zenward can help with that. What is the trip for? Choose the closest fit."] };
  }
  return undefined;
}

function unknown(): AssistantReply {
  return { kind: "unknown", paragraphs: [UNKNOWN_TEXT], actions: [call(true), contact, reply("start", "Back to the start")] };
}

function withPrivacyNote(r: AssistantReply): AssistantReply {
  const quoteAction = r.actions.find((a) => a.kind === "link" && a.quote);
  const cta: AssistantAction = quoteAction ? { ...quoteAction, label: "Continue to Request a Quote" } : quote("Continue to Request a Quote");
  return {
    ...r,
    paragraphs: [SENSITIVE_TEXT, ...r.paragraphs].slice(0, 3),
    actions: [cta, ...r.actions.filter((a) => a !== quoteAction)],
  };
}

// ---------------------------------------------------------------- entry

function quick(id: QuickReplyId, ctx: AssistantContext): AssistantReply {
  if (id.startsWith("service:")) return serviceReply([id.slice("service:".length) as ServiceSlug], ctx, false);
  switch (id) {
    case "start":
      return welcome();
    case "request":
      return {
        kind: "find_service",
        paragraphs: ["I can open the quote request with the right service already selected. What is the trip for?"],
        actions: [...findService().actions.slice(0, 4), reply("find_more", "More options"), quote("Skip: Request a Quote")],
      };
    case "find_service":
      return findService();
    case "find_more":
      return findService(true);
    case "wheelchair":
      return serviceReply(["wheelchair-transportation"], ctx, false);
    case "recurring":
      return serviceReply(["recurring-care-transportation"], ctx, true);
    case "airport":
      return serviceReply(["airport-transportation"], ctx, false);
    case "talk":
      return topicReply(["contact"], ctx)!;
    case "process":
      return process();
    case "trust":
      return trustReply(["trust_general"]);
    case "not_emergency":
      return {
        kind: "find_service",
        paragraphs: ["Thanks for confirming. What is the trip for?"],
        actions: findService().actions,
      };
    default:
      return welcome();
  }
}

/** The assistant's reply to a typed message or a button. Pure and synchronous. */
export function respond(input: AssistantInput, ctx: AssistantContext): AssistantReply {
  if (input.kind === "quick") return quick(input.id, ctx);

  const raw = input.text.slice(0, 500);
  const t = normalize(raw);
  if (t.trim() === "") return welcome();
  if (isEmergency(t)) return emergency();

  const topics = detectTopics(t);
  if (topics.includes("status")) return { kind: "status", paragraphs: [STATUS_TEXT], actions: [call(true), contact] };
  if (topics.includes("manage")) {
    return {
      kind: "manage",
      paragraphs: [`I can't change or cancel a trip here. Please call Zenward at ${PHONE.display} for help with an existing request.`],
      actions: [call(true), contact],
    };
  }

  const sensitive = hasSensitiveDetails(t, raw);
  const services = detectServices(t);
  let result: AssistantReply | undefined;
  if (topics.includes("provider")) {
    // A care coordinator mentioning a clinic or dialysis is still a provider enquiry first.
    result = topicReply(["provider"], ctx);
  } else if (services.length > 0) {
    result = serviceReply(services, ctx, isRecurring(t));
  } else if (isRecurring(t) && !topics.some((x) => x !== "availability" && x !== "general")) {
    result = serviceReply(["recurring-care-transportation"], ctx, true);
  } else {
    result = topicReply(topics, ctx);
  }

  if (!result) {
    if (sensitive) {
      return { kind: "sensitive", paragraphs: [SENSITIVE_TEXT], actions: [quote("Continue to Request a Quote"), call()] };
    }
    return unknown();
  }
  return sensitive ? withPrivacyNote(result) : result;
}

export const __test = { FIND_FIRST, FIND_MORE };

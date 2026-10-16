/**
 * Bounded intent detection for typed questions (ZW-WEB-04H). Deterministic
 * keyword matching on normalised text: no model, no network. It recognises
 * the common transportation questions and services. Anything else falls
 * through to the "I don't want to give you the wrong information" reply.
 * It never infers a medical condition and never diagnoses.
 */
import type { ServiceSlug } from "../service-catalog.ts";
import type { AssistanceLevel } from "../assistance-level.ts";

/** Lowercase, straight quotes, hyphens/punctuation to spaces, single spaces. */
export function normalize(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9'@./:\s]/g, " ")
    .replace(/[.:/]+(\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

const has = (t: string, re: RegExp) => re.test(t);

/** Strong service signals. Order matters only for the tie-break in `detectServices`. */
const SERVICE_PATTERNS: [ServiceSlug, RegExp][] = [
  ["wheelchair-transportation", /\bwheel ?chairs?\b|\bpower chair\b|\bmobility scooter\b/],
  ["dialysis-transportation", /\bdialysis\b/],
  ["rehabilitation-transportation", /\b(physical|occupational|speech) therapy\b|\bphysio(therapy)?\b|\brehab(ilitation)?\b|\btherapy\b/],
  ["hospital-discharge-transportation", /\bdischarg\w*|\bleav\w* (the )?hospital\b|\breleased from (the )?hospital\b|\bhome from (the )?hospital\b/],
  ["airport-transportation", /\bairports?\b|\bflights?\b|\bterminal\b|\bhartsfield\b|\bairline\b|\bplane\b/],
  ["senior-medical-transportation", /\bseniors?\b|\belderly\b|\bolder (adult|person|people|parent)s?\b|\bgrand(ma|mother|pa|father)\b/],
  ["medical-appointments", /\bdoctors?\b|\bdr\b|\bphysician\b|\bspecialist\b|\bclinic\b|\boutpatient\b|\bdiagnostic\b|\bcheck ?up\b|\bscans?\b|\bmri\b|\bx ?rays?\b|\b(blood|lab) (work|test)s?\b|\bdentist\b/],
];

/** "appointment" alone is weak: it only means Medical Appointment when nothing more specific matched. */
const WEAK_MEDICAL = /\bappointments?\b|\bmedical (trip|ride|visit)s?\b/;

export const RECURRING = /\brecurring\b|\brepeat\w*|\bregular(ly)?\b|\bongoing\b|\bweekly\b|\bdaily\b|\bevery (day|week|other|mon|tue|wed|thu|fri|sat|sun)\w*|\b(once|twice|\w+ times) (a|per) week\b|\beach week\b|\bstanding (ride|appointment)s?\b/;

export function detectServices(t: string): ServiceSlug[] {
  const found = SERVICE_PATTERNS.filter(([, re]) => has(t, re)).map(([slug]) => slug);
  if (found.length === 0 && has(t, WEAK_MEDICAL)) found.push("medical-appointments");
  // A more specific service makes a generic "doctor/clinic" mention redundant.
  if (found.length > 1 && found.includes("medical-appointments")) {
    const specific = found.filter((s) => s !== "medical-appointments");
    if (specific.some((s) => s === "dialysis-transportation" || s === "rehabilitation-transportation")) return specific;
  }
  return found;
}

export type Topic =
  | "status"
  | "manage"
  | "policy"
  | "payment"
  | "pricing"
  | "coverage"
  | "process"
  | "credential"
  | "trust_licensed"
  | "trust_on_time"
  | "trust_drivers"
  | "trust_care"
  | "trust_general"
  | "response_time"
  | "hours"
  | "availability"
  | "area"
  | "provider"
  | "contact"
  | "medical"
  | "prepare"
  | "learn_nemt"
  | "greeting"
  | "thanks"
  | "general";

/** Topic patterns in priority order. */
const TOPIC_PATTERNS: [Topic, RegExp][] = [
  ["status", /\bstatus\b|\bwhere('s| is) my (ride|request|driver|booking|trip)\b|\bwas my (request|ride|booking)\b|\b(did|have) you (get|got|receive[d]?)\b|\bmy (request|ride|booking) (been )?(accepted|confirmed|approved)\b|\btrack (my )?(ride|driver)\b|\beta\b/],
  // Policy questions (cancellation/no-show/wait-time/refund) come before "manage" (which also matches "cancel").
  ["policy", /\bcancell?ation (policy|fee|charge)s?\b|\bno[- ]?show\b|\bwait(ing)? (time )?(fee|charge)s?\b|\blate (cancel\w* )?fees?\b|\brefunds?\b/],
  ["manage", /\bcancel\w*|\breschedul\w*|\bchange my (ride|booking|trip|request|pickup)\b|\bmodify my\b/],
  ["coverage", /\bmedicaid\b|\bmedicare\b|\binsurance\b|\binsurer\b|\bcovered by\b|\bvoucher\b/],
  ["payment", /\bpay(ing|ment)?\b|\bcards?\b|\bcredit\b|\bdebit\b|\bcash\b|\bcheck\b|\bcheque\b|\binvoic\w*|\bbilling\b|\bdeposits?\b|\bzelle\b|\bvenmo\b|\bpaypal\b|\bprivate pay\b/],
  ["pricing", /\bprices?\b|\bpricing\b|\bcosts?\b|\bhow much\b|\bfares?\b|\brates?\b|\bfees?\b|\bcharge\b|\bexpensive\b|\bafford\w*|\bcheap\w*/],
  // Singular or plural (04L: "care coordinators", "discharge planners" previously fell through).
  ["provider", /\bcare coordinators?\b|\bcoordinators?\b|\bcase managers?\b|\bsocial workers?\b|\bdischarge planners?\b|\bcare teams?\b|\bfacility\b|\bnursing (home|facility)\b|\bassisted living\b|\b(our|my) patients\b|\brefer(ral|ring)?\b|\bhealthcare provider\b|\bprovider\b|\bon behalf of (a|our) (clinic|hospital)\b/],
  // Specific certifications/programs that are NOT owner-confirmed: answered honestly, never affirmed.
  ["credential", /\bcpr\b|\bfirst aid\b|\bada\b|\bcertif\w*|\bdrug (test|screen)\w*|\bdrug tested\b|\blicen[cs]e number\b|\binsurance (policy|limit|certificate)s?\b/],
  ["trust_licensed", /\blicen[cs]ed?\b|\binsured\b/],
  ["trust_on_time", /\bon time\b|\bpunctual\w*|\blate\b|\breliab\w*/],
  ["trust_drivers", /\bdrivers?\b|\bbackground checks?\b|\bvetted\b|\btrained\b|\bsafe(ty)?\b/],
  ["trust_care", /\bdignity\b|\bcompassion\w*|\bpatient with\b|\bkind\b|\brespect\w*/],
  ["trust_general", /\bwhy (zenward|you|choose)\b|\btrust\b|\blegit\w*/],
  ["response_time", /\bhow (fast|quick(ly)?|soon|long)\b.*\b(reply|respond|answer|hear|get back|call)\b|\b(reply|respond|response|get back|hear back|call me back)\b/],
  ["hours", /\bhours\b|\bopen(ing)?\b|\bclos(e|ed|ing)\b|\bweekends?\b|\bholidays?\b|\b24 ?\/? ?7\b|\b24 hours\b|\bovernight\b/],
  ["process", /\bhow (do|can) i (book|request|get|schedule|order|arrange)\b|\bbook(ing)?\b|\bschedule a (ride|trip)\b|\brequest a (ride|quote|trip)\b|\bget a quote\b|\bhow (does|do) (it|this|you) work\b|\bhow it works\b|\bsign up\b/],
  ["availability", /\bavailab\w*|\bdo you have (a )?(car|van|vehicle|driver)\b|\btoday\b|\btonight\b|\btomorrow\b|\bright now\b|\basap\b|\bsame ?day\b|\burgent\w*|\bin advance\b|\bahead of time\b|\bhow (early|far ahead|far in advance)\b|\bnotice\b|\bbook ahead\b|\bnext day\b/],
  ["area", /\bwhere do you\b|\bdo you (serve|cover|go to|operate|work in|come to)\b|\bservice area\b|\bwhich (areas|cities|counties)\b|\batlanta\b|\bgeorgia\b|\bcounty\b|\bstatewide\b|\bmy (area|city|town|zip)\b|\bzip ?code\b/],
  // Planning questions answered with a Resource (ZW-WEB-04K).
  ["prepare", /\bprepar\w*|\bchecklists?\b|\bwhat (should|do) (i|we) (bring|pack|need to bring|have ready)\b|\bwhat to (bring|pack)\b|\bget ready for\b/],
  ["learn_nemt", /\bwhat (is|are|does) (nemt|non emergency (medical )?transport\w*)\b|\bwhat does nemt mean\b|\bnemt mean\b/],
  ["medical", /\bshould i (take|go|see)\b|\bis it safe to\b|\bsymptoms?\b|\bmedications?\b|\bdos(e|age)\b|\bdiagnos\w*/],
  ["contact", /\btalk to\b|\bspeak (to|with)\b|\bcall (you|zenward)\b|\bphone number\b|\bcontact\b|\bhuman\b|\breal person\b|\bsomeone\b|\brepresentative\b|\bemail you\b|\bmessage (you|your team)\b/],
  ["greeting", /^ (hi|hello|hey|good (morning|afternoon|evening))\b/],
  ["thanks", /\bthank(s| you)\b/],
  ["general", /\btransport(ation)?\b|\b(a )?rides?\b|\btrips?\b|\bpick ?up\b|\bdrive (me|my|him|her)\b|\btake (me|my|him|her)\b/],
];

export function detectTopics(t: string): Topic[] {
  return TOPIC_PATTERNS.filter(([, re]) => has(t, re)).map(([topic]) => topic);
}

// ---------------------------------------------------------------- assistance level (ZW-WEB-04G3)

/** Mentions of a specific Pickup & assistance level (normalised text: hyphens are spaces). */
const ASSISTANCE_LEVEL_PATTERNS: [AssistanceLevel, RegExp][] = [
  ["curb_to_curb", /\bcurb ?to ?curb\b|\bkerb ?to ?kerb\b|\bcurbside\b/],
  ["door_to_door", /\bdoor ?to ?door\b/],
  ["door_through_door", /\bdoor ?(through|thru) ?(the )?door\b/],
];
/** "Can the driver come to the door?" and similar. */
const COME_TO_DOOR = /\b(come|comes|coming|walk\w*|meet\w*|help\w*|get|getting|bring|escort\w*)\b[^.?!]{0,30}\b(to|at) (the |my |our |his |her |their )?(front )?door\b/;
/** "What assistance level do I need?", "I don't know which assistance option to choose." */
const ASSISTANCE_CHOICE =
  /\b(assistance|escort) (level|option|type|choice)s?\b|\blevel of (assistance|help|escort)\b|\b(which|what) (kind of |type of |level of )?(assistance|help)\b[^.?!]*\b(need|choose|pick|select)\b/;

export interface AssistanceQuestion {
  /** Specific levels named, in canonical order. */
  levels: AssistanceLevel[];
  comeToDoor: boolean;
  /** A general "which level / not sure" question. */
  choice: boolean;
}

/** Detects a question about the Pickup & assistance level, or undefined. Never infers ability or a medical need. */
export function detectAssistance(t: string): AssistanceQuestion | undefined {
  const levels = ASSISTANCE_LEVEL_PATTERNS.filter(([, re]) => re.test(t)).map(([level]) => level);
  const comeToDoor = COME_TO_DOOR.test(t);
  const choice = ASSISTANCE_CHOICE.test(t);
  return levels.length || comeToDoor || choice ? { levels, comeToDoor, choice } : undefined;
}

export function isRecurring(t: string): boolean {
  return has(t, RECURRING);
}

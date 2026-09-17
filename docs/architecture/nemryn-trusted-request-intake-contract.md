# Nemryn — Trusted Transportation-Request Intake Contract

**Audience:** the Nemryn engineering team who will build the endpoint.
**Producer:** Zenward-Web (`https://www.zenwardmobility.com/request-transportation`), via
`PlatformRequestIntakeAdapter` in `src/lib/request-intake/adapter.ts`.
**Status:** Zenward-Web side implemented and verified against a local mock (ZW-WEB-02C-1). The Nemryn endpoint does **not** exist yet. This document is the spec it must satisfy so that turning it on is config-only on the Zenward-Web side (`REQUEST_INTAKE_MODE=platform` + `PLATFORM_INTAKE_URL` + `PLATFORM_INTAKE_TOKEN`).
**Do not implement this endpoint in the Zenward-Web repository.**

---

## 1. Purpose

Accept one public, unauthenticated-origin non-emergency medical transportation
request that a visitor submitted on the Zenward Mobility marketing site,
validated server-side by Zenward-Web, and create exactly one operational
transportation request for the **Zenward Mobility** organisation inside Nemryn.

Zenward-Web is a low-trust public surface. It has **no** database access, holds
**no** tenant identifier, and must receive back **only** a public acknowledgement
(accepted + a display-safe reference). Everything else — which organisation owns
the request, how it is stored, who is notified — is Nemryn's responsibility and
must be derived from Nemryn's own trusted server-side state.

---

## 2. Transport

| Property | Value |
|---|---|
| Method | `POST` |
| Scheme | `https://` **only** (Zenward-Web refuses to send over plaintext) |
| Path | Nemryn's choice; supplied to Zenward-Web as `PLATFORM_INTAKE_URL` |
| Content type | `application/json; charset=utf-8` |
| Accept | `application/json` |
| Request body encoding | UTF-8 JSON, one envelope object (see §5) |
| Max body size | Envelope is small (< 16 KB in practice). Reject > 64 KB with `413`. |
| Client timeout | Zenward-Web aborts the call at **10 seconds**. Respond well within that. |
| Idle keep-alive / retries by client | None automatic. See §7 (idempotency) for how visitor-initiated retries behave. |

---

## 3. Authentication

```
Authorization: Bearer <PLATFORM_INTAKE_TOKEN>
```

- The token is a single shared secret issued by Nemryn to Zenward-Web for this
  one integration. It authenticates **the Zenward-Web server**, not a user.
- It is stored only in Zenward-Web's server-side environment
  (`PLATFORM_INTAKE_TOKEN`). It is never `NEXT_PUBLIC_`, never sent to the
  browser, never logged, never embedded in client code.
- Nemryn requirements:
  - Verify the bearer token on every request before any other processing.
  - Support **rotation** — ideally accept two valid tokens during an overlap
    window so the secret can be rotated with zero downtime.
  - Treat a missing/blank/malformed `Authorization` header as `401`.
  - Treat a well-formed but unrecognised/expired token as `401`.
  - Bind the token to the Zenward Mobility tenant server-side (see §4). The
    token is what selects the tenant — **not** anything in the request body.
  - Rate-limit per token (see §8, `429`).
- Do **not** invent or hard-code a real token anywhere. It is provisioned
  operationally when the endpoint goes live.

---

## 4. Tenant isolation — CRITICAL, NON-NEGOTIABLE

- The endpoint **must** resolve the destination organisation (the Zenward
  Mobility tenant) **server-side**, from the authenticated credential /
  configuration bound to that token.
- The endpoint **must not** read, trust, or even accept an `organization_id`,
  `tenant_id`, `operatorId`, or any equivalent from the request body, headers,
  or query string. Zenward-Web never sends one. If a future payload somehow
  contains such a field, the endpoint must ignore it (and may log a warning).
- Persistence **must** enforce tenant isolation at the database layer with
  Row-Level Security (RLS) — the created request row is owned by the
  token-resolved organisation and is not reachable from any other tenant's
  context.
- A single compromised or misdirected token must never be able to write into a
  different tenant's data.

---

## 5. Request body — the versioned envelope

Zenward-Web sends exactly this shape. Fields are ordered here for clarity only.

```json
{
  "schemaVersion": "1.0",
  "submissionId": "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  "submittedAt": "2026-09-07T17:30:31.715Z",
  "source": "zenward_web",
  "request": {
    "requesterName": "Dana Ellsworth",
    "requesterRelationship": "family",
    "requesterPhone": "404-555-0142",
    "requesterEmail": "dana.ellsworth@example.com",
    "passengerName": "Marion Ellsworth",
    "pickupDescription": "418 Peachtree Manor, Apt 6B",
    "destinationDescription": "Northside Dialysis Center",
    "preferredDate": "2026-09-20",
    "preferredTime": "09:15",
    "returnTripNeeded": "yes",
    "assistanceNotes": "Uses a walker; needs help to the vehicle.",
    "additionalNotes": "Please call the daughter first."
  }
}
```

### 5.1 Envelope fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `schemaVersion` | string enum | yes | Currently `"1.0"`. Nemryn must reject an unknown **major** version with `400`. New optional `request` fields will **not** bump this; a breaking envelope change will. |
| `submissionId` | string, UUID | yes | Also sent as the `Idempotency-Key` header (identical value). Idempotency key for this logical submission. Contains no PII. |
| `submittedAt` | string, ISO-8601 UTC (`Z`) | yes | Generated by the Zenward-Web server when it forwarded the request. Informational; do not use it for idempotency or dedupe windows. |
| `source` | string enum | yes | Always `"zenward_web"` from this integration. Reject other values with `400` unless/until other sources are agreed. |
| `request` | object | yes | The validated transportation-request fields. See §5.2. |

### 5.2 `request` fields (from the public form)

All strings are already server-side normalised by Zenward-Web: control
characters stripped, trimmed, collapsed blank lines, length-capped.

| Field | Type | Required | Cap | Notes |
|---|---|---|---|---|
| `requesterName` | string | yes | 120 | Person submitting the form. |
| `requesterRelationship` | string enum | yes | — | One of: `self`, `family`, `caregiver`, `facility_coordinator`, `other`. |
| `requesterPhone` | string | yes | 40 | Free-form; **not** format-validated or normalised by Zenward-Web. Nemryn should normalise/validate as needed but should not hard-reject a plausible number. |
| `requesterEmail` | string | no | 254 | Loose shape check only on the Zenward side. Absent if the visitor left it blank. |
| `passengerName` | string | yes | 120 | May equal `requesterName`. |
| `pickupDescription` | string | yes | 400 | Free text — an address or a facility name. |
| `destinationDescription` | string | yes | 400 | Free text — an address or a facility name. |
| `preferredDate` | string | no | 40 | Typically `YYYY-MM-DD` from a date picker, but treat as free text; **not** range-validated by Zenward-Web. Absent if blank. |
| `preferredTime` | string | no | 40 | Typically `HH:MM`; treat as free text. Absent if blank. |
| `returnTripNeeded` | string enum | yes | — | One of: `yes`, `no`, `not_sure`. |
| `assistanceNotes` | string | no | 2000 | Free text describing mobility/assistance needs. **A request for accommodation, not a guaranteed capability.** Absent if blank. |
| `additionalNotes` | string | no | 2000 | Free text. Absent if blank. |

- Optional fields are **omitted** (not sent as `null` / `""`) when empty.
- Zenward-Web may **add** new optional `request` fields in future without a
  `schemaVersion` bump. Nemryn must ignore unknown `request` fields, not reject
  them.
- This is **not** Nemryn's canonical TransportationRequest schema. Nemryn maps
  these fields into its own model server-side.

---

## 6. Validation expectations (Nemryn side)

Zenward-Web has already: whitelisted fields, stripped unknown props, normalised
and length-capped strings, checked the enum fields, run a honeypot + fill-time
+ payload-size check. Nemryn should still defensively validate:

- envelope well-formed, `schemaVersion` supported, `source` accepted,
  `submissionId` is a UUID, `submittedAt` parseable;
- required `request` fields present and non-empty;
- enum fields within their allowed sets;
- its own business rules (service area, capacity signalling, etc.).

Any validation failure → `400` (see §8). Do not echo the offending value back
in a way that would be surfaced publicly; Zenward-Web will not show it to the
visitor anyway.

---

## 7. Idempotency contract

**Goal:** a visitor who submits once, hits a network failure, and submits again
must create **one** operational request, not two.

- Zenward-Web generates one `submissionId` (UUID) per logical form submission
  in the browser and keeps it **stable across retries** of that submission. It
  is re-validated and, if missing/malformed, regenerated on the Zenward-Web
  server. It is sent both as the `Idempotency-Key` request header and as
  `envelope.submissionId` (identical values).
- Nemryn **must**:
  1. Treat `Idempotency-Key` as the idempotency key (fall back to
     `envelope.submissionId` if the header is ever absent — they are equal).
  2. On the **first** request for a key: process it, create the request,
     persist the mapping `key → referenceId` (and the created request id)
     durably, and return the success response (§8, `200`/`201`).
  3. On any **subsequent** request with the **same key**: do **not** create a
     second request. Return the **same** `referenceId` that was returned the
     first time, with `"accepted": true`, HTTP `200`.
     - Returning `409` is also acceptable **only if** the body still includes
       the original `referenceId` — Zenward-Web treats that as a success and
       shows the same reference. A `409` without a `referenceId` is treated as
       a failure ("please try again or call").
  4. Keep the key→reference mapping for at least **7 days** (30 preferred).
     After it expires, a repeat may create a new request — acceptable.
  5. If two requests with the same key arrive concurrently, serialise them so
     only one request is created (e.g. unique constraint on the key).
- The idempotency key contains **no personal information** and must not be
  derived from any (name, phone, email, address). It is a random UUID.
- `submittedAt` must **not** be used for dedupe.

### Retry behaviour, end to end

| Situation | What Zenward-Web does | What Nemryn should do |
|---|---|---|
| First submit succeeds | shows "Request received", reference from endpoint | create request, store key→ref |
| Network fails before response; visitor resubmits (same browser session) | resends **same** `submissionId` | recognise key, return same reference, create nothing new |
| Endpoint accepted but response was lost; visitor resubmits | resends **same** `submissionId` | return same reference (idempotent replay) |
| Visitor reloads the page and starts over | **new** `submissionId` (new logical submission) | treat as a new request |
| Malformed/missing client id | Zenward-Web server mints a fresh UUID | normal processing (retry dedupe not possible for that one case) |

---

## 8. Response contract

### 8.1 Success

`HTTP 200` (idempotent replay) or `HTTP 201` (first acceptance):

```json
{ "accepted": true, "referenceId": "ZW-7F3K9Q" }
```

- `accepted` must be the boolean `true`. Zenward-Web treats a 2xx **without**
  `accepted === true` **and** a non-empty string `referenceId` as a failure
  (fails closed — it will not tell the visitor the request was received).
- `referenceId`:
  - a short, human-quotable string the visitor can read over the phone;
  - **must** be safe to display publicly and to log;
  - **must not** be, contain, or be trivially derived from: a database primary
    key, an organisation/tenant id, a sequential/auto-increment internal id,
    or anything that leaks tenant count or volume;
  - recommended: a random or opaquely-encoded token, optionally prefixed
    `ZW-` (e.g. `ZW-7F3K9Q`). Length ~6–16 chars.
  - The **same** logical submission (same idempotency key) must always yield
    the **same** `referenceId`.
- Extra fields in the response body are ignored by Zenward-Web. Do **not**
  return internal ids, tenant info, request echoes, or state.

### 8.2 Errors — status codes and Zenward-Web handling

Zenward-Web maps every response to `delivered: true` **only** on a positive
acceptance. Everything else is `delivered: false` (fails closed) and shows one
of two customer-safe messages — it never surfaces the status code, a provider
name, API terminology, tokens, or tenant info.

| Status | Meaning | Zenward-Web result | Visitor sees |
|---|---|---|---|
| `200` + `accepted:true` + `referenceId` | idempotent replay accepted | `delivered:true` | "Request received…" + reference |
| `201` + `accepted:true` + `referenceId` | newly accepted | `delivered:true` | "Request received…" + reference |
| `200`/`201` without `accepted:true`+`referenceId` | ambiguous | `delivered:false` | "We couldn't submit your request just now. Please try again shortly, or call us." |
| `400` | invalid request / unsupported `schemaVersion` / bad `source` | `delivered:false` | same "try again / call" message |
| `401` | authentication failed (bad/missing token) | `delivered:false` | same "try again / call" message (Zenward-Web logs `outcome=rejected status=401` for operators) |
| `403` | authenticated but not authorised | `delivered:false` | same "try again / call" message |
| `409` **with** `referenceId` | idempotent duplicate | `delivered:true` | "Request received…" + the echoed reference |
| `409` **without** `referenceId` | duplicate, no reference | `delivered:false` | "try again / call" message |
| `413` | body too large | `delivered:false` | "try again / call" message |
| `422` | semantic validation failure | `delivered:false` | "try again / call" message |
| `429` | rate limited | `delivered:false` | "Online requests are temporarily unavailable right now. Please call us to arrange transportation." |
| `5xx` | server failure | `delivered:false` | same "temporarily unavailable" message |
| no response within 10 s | client timeout | `delivered:false` | same "temporarily unavailable" message |
| connection refused / DNS / TLS failure | unreachable | `delivered:false` | same "temporarily unavailable" message |

- For `429`, a `Retry-After` header is welcome but Zenward-Web does **not**
  currently auto-retry (a future ZW-WEB phase may add a single bounded retry).
- Error response bodies may include a machine-readable `error` string for
  operator logs; Zenward-Web does not display it.

---

## 9. Logging restrictions (both sides)

- **Zenward-Web** logs, server-side only: `submissionId`, an `outcome`
  category (`accepted` / `duplicate` / `rejected` / `rate_limited` /
  `server_error` / `malformed_success` / `timeout` / `unreachable` /
  `not_configured` / `insecure_url`), the HTTP `status` where relevant, an
  `errorClass`, and a `timeout` flag. **Never** the envelope, the `request`
  fields, or the token.
- **Nemryn** must not log the bearer token. Treat `request` free-text fields
  (`pickupDescription`, `destinationDescription`, `assistanceNotes`,
  `additionalNotes`) and the names/phone/email as sensitive personal data —
  log at most a redacted/hashed form, and only where operationally necessary.
- Neither side may claim HIPAA compliance or represent this channel as a
  compliant health-information pipeline.

---

## 10. Versioning

- `schemaVersion` is the envelope version. `"1.0"` today.
- Additive, backward-compatible changes to the `request` object (new **optional**
  fields) will ship **without** a version bump. Nemryn must ignore unknown
  `request` fields.
- A breaking envelope change (removing/renaming a field, changing a type,
  changing idempotency semantics) bumps `schemaVersion`. Nemryn should accept a
  known set of versions during any migration window and reject unknown major
  versions with `400`.

---

## 11. Checklist for the Nemryn implementer

- [ ] `POST`, HTTPS only, `application/json`.
- [ ] Verify `Authorization: Bearer` first; support 2 valid tokens for rotation.
- [ ] Resolve the Zenward Mobility tenant **from the token**, server-side.
- [ ] Never read an org/tenant id from the request; ignore it if present.
- [ ] Enforce tenant isolation with database RLS on the created row.
- [ ] Parse + validate the envelope (`schemaVersion` `1.0`, `source`
      `zenward_web`, `submissionId` a UUID).
- [ ] Validate required `request` fields + enums; ignore unknown `request` fields.
- [ ] Idempotency: `Idempotency-Key` → one request; same key returns same
      `referenceId`; persist mapping ≥ 7 days; serialise concurrent duplicates.
- [ ] Success: `201` (new) / `200` (replay), `{ "accepted": true, "referenceId": "ZW-…" }`.
- [ ] `referenceId` is opaque, display-safe, non-sequential, leaks no tenant/db id.
- [ ] Errors: `400 / 401 / 403 / 409 / 413 / 422 / 429 / 5xx` per §8.
- [ ] Respond within ~5 s (hard client abort at 10 s).
- [ ] Do not log the token; treat request PII as sensitive.
- [ ] Provide Zenward-Web ops with: the URL, the token(s), and a staging
      instance for an end-to-end test before `REQUEST_INTAKE_MODE=platform`
      is set in production.

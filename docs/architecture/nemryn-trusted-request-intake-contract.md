# Nemryn — Public Website Request Intake Contract

**Producer:** Zenward-Web (`https://www.zenwardmobility.com/request-transportation`), via
`PlatformRequestIntakeAdapter` in `src/lib/request-intake/adapter.ts` and the pure mapping in
`src/lib/request-intake/nemryn-mapping.ts`.
**Consumer:** Nemryn production, `POST https://app.nemryn.com/api/public-intake/website`.
**Nemryn release:** `c275ec52ea1da6f300811a87849de86fd5225ef2` (contract frozen).
**Status:** Implemented on the Zenward-Web side. Nemryn owns the endpoint; **do not change or re-implement it from this repository.** This document describes what Zenward-Web sends and how it interprets the reply. Where it disagrees with Nemryn's own route code, Nemryn's code wins.

### History

This file used to specify a *speculative* contract written before the endpoint existed: a Bearer token, a versioned
envelope (`schemaVersion` 1.0 / 1.1), an `Idempotency-Key` header, a Nemryn-issued `referenceId` and `409`
replay semantics. **None of that is the production contract and none of it is implemented.** The adapter sends a flat
body with no token, and Nemryn returns `{"ok":true}` with no reference.

---

## 1. Transport

| Property | Value |
|---|---|
| Method / scheme | `POST`, `https://` only (Zenward-Web refuses any other scheme) |
| URL | `PLATFORM_INTAKE_URL` = `https://app.nemryn.com/api/public-intake/website` |
| Headers | `content-type: application/json`, `accept: application/json`, `origin: https://www.zenwardmobility.com` (see below). **No `Authorization` header. No `Idempotency-Key` header.** |
| Client timeout | 10 s (`AbortSignal.timeout`). One attempt per call; the adapter never retries internally. |
| Call path | Browser → Zenward Server Action → adapter → Nemryn. The Nemryn call is **server-to-server**: the browser never calls Nemryn, so browser CORS is not the security boundary for it. Nemryn's CORS/rate-limit configuration is not weakened for this integration. |

**Origin header.** The Nemryn integration for this website is origin-locked (`allowed_origins`), and Nemryn's RPC fails
**closed** when a locked integration receives a call with no `Origin`. A server-side `fetch` sends none of its own, so the
adapter sets `Origin` to this site's public origin (default `https://www.zenwardmobility.com`, optional server-only override
`PLATFORM_INTAKE_ORIGIN`). Nemryn treats the origin as a secondary, non-authoritative signal — the `integrationExternalId`
identifies the integration. It is a header only (never in the JSON body) and does not loosen any Nemryn CORS setting. Without
it, every request is rejected with the generic `400`, which is indistinguishable from other rejections by design.

## 2. Identification — no secret

`integrationExternalId` (env `PLATFORM_INTAKE_INTEGRATION_ID`) is an **opaque per-integration identifier**, not a
credential. Nemryn looks it up in its own `request_intake_integrations` table to find the owning organization and to
check the integration is active. It carries no standing access.

Zenward-Web must **not** hold, and this repository must never contain: a Supabase service-role or anon key for this
integration, database credentials, an admin/bearer token, or a Vercel token. `PLATFORM_INTAKE_TOKEN` no longer exists.

## 3. Request body — flat, closed field set

```json
{
  "integrationExternalId": "<opaque id>",
  "idempotencyKey": "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  "requesterName": "Dana Ellsworth",
  "requesterRelationship": "family",
  "requesterPhone": "404-555-0142",
  "requesterEmail": "dana.ellsworth@example.com",
  "passengerName": "Marion Ellsworth",
  "pickupDescription": "418 Peachtree Manor, Apt 6B",
  "destinationDescription": "Northside Dialysis Center",
  "preferredDate": "2026-09-25",
  "preferredTime": "09:15",
  "returnTripNeeded": "yes",
  "assistanceNotes": "Uses a walker.",
  "additionalNotes": "Please call the daughter first.",
  "serviceType": "dialysis"
}
```

A recurring request replaces `preferredDate` / `preferredTime` with a structured object:

```json
{
  "...": "same flat fields as above",
  "serviceType": "dialysis",
  "returnTripNeeded": "yes",
  "recurringSchedule": {
    "daysOfWeek": ["monday", "wednesday", "friday"],
    "startDate": "2026-10-05",
    "endDate": "2026-12-18",
    "appointmentTime": "09:15",
    "returnTripExpected": true
  }
}
```

| Field | Required | Notes |
|---|---|---|
| `integrationExternalId` | yes | From server env. Never from the browser. |
| `idempotencyKey` | yes | Zenward-Web's existing per-submission `submissionId` (UUID), unchanged. See §5. |
| `requesterName`, `requesterRelationship`, `requesterPhone` | yes | `requesterRelationship` ∈ `self`, `family`, `caregiver`, `facility_coordinator`, `other`. |
| `requesterEmail` | no | Omitted when blank. |
| `passengerName` | yes (from the form) | **Structured.** Nemryn stores it as `requested_passenger_name` — a free-text snapshot. It does **not** create or link a Passenger. Never folded into notes. |
| `pickupDescription`, `destinationDescription` | yes | Free text. |
| `preferredDate`, `preferredTime` | no | One-time requests only; omitted when blank and always absent on recurring requests. |
| `returnTripNeeded` | yes | `yes` / `no` / `not_sure`. On recurring requests the form derives `yes`/`no` from `recurringSchedule.returnTripExpected`. |
| `assistanceNotes`, `additionalNotes` | no | The requester's own text, unchanged. `additionalNotes` is **never** used to carry passenger, service or schedule data. |
| `serviceType` | yes (from the form) | **Structured**, sent directly. Closed enum, identical value-for-value on both sides: `medical_appointment`, `dialysis`, `rehabilitation`, `hospital_discharge`, `recurring_care`, `senior_medical`, `wheelchair_transportation`, `other`. |
| `recurringSchedule` | no | **Structured object**, sent directly, only for a recurring request; the key is absent (never `null`) for a one-time request. Members: `daysOfWeek` (1–7 distinct lowercase weekday names, Mon→Sun), `startDate` (`YYYY-MM-DD`), optional `endDate` (`YYYY-MM-DD`, ≥ `startDate`), optional `appointmentTime` (`HH:MM`, 24 h), optional `returnTripExpected` (strict boolean). |

- Optional fields are omitted, not sent as `null` / `""`.
- Nemryn rejects any top-level key outside this set. There is deliberately **no** `organizationId`, `tenantId`,
  `passengerId`, `driverId`, `vehicleId`, `tripId`, `state` or `source`; Zenward-Web builds the body field by field so
  none can reach the wire, its Server Action rejects a submission that carries a tenancy identifier, and the adapter
  refuses to transmit a body containing one.
- **A supported `serviceType` is not a service offering.** Nemryn accepting a value does not mean Zenward Mobility
  offers it publicly; what the site presents is governed by `docs/product/marketing-scope.md`. Zenward-Web keeps
  the full enum in its internal/wire model (`SERVICE_TYPES`) but offers, and its Server Action accepts from visitors,
  only `PUBLIC_SERVICE_TYPES`. In the S4B-R3 release that excludes `wheelchair_transportation` — Nemryn would accept
  it, the public form does not send it; the ZW-WEB-03B2 release adds it back deliberately.
- **A request expresses intent only.** `recurringSchedule` creates no recurring arrangement, and a website submission
  creates no Passenger, Trip, Driver assignment or Vehicle assignment. It stops at a pending Request that an operator
  reviews, reconciles to a Passenger and (optionally) turns into a Trip manually.

## 4. Response

| Status | Body | Zenward-Web result |
|---|---|---|
| `200` | exactly `{"ok": true}` | `delivered: true`. First acceptance and idempotent replay are indistinguishable by design. |
| `400` (generic), other `4xx` | `{"ok": false, …}` — Nemryn collapses every rejection (validation, unknown/disabled integration, origin mismatch) into one generic code | `delivered: false`, "couldn't submit — check the form and try again, or call" |
| `429` | — | `delivered: false`, "receiving a lot of requests — try again in a little while, or call" |
| `5xx`, timeout, DNS/TLS/connection failure | — | `delivered: false`, "temporarily unavailable — please call" |
| `2xx` with any body other than `{"ok":true}`, or a non-JSON body | — | `delivered: false` (acceptance is never inferred), "couldn't submit just now — try again shortly, or call" |

- Nemryn returns **no** database Request id or reference. Zenward-Web therefore shows the plain "Request received"
  confirmation and **no** reference number: it does not invent or display an identifier that support could not look up.
- Customer copy never contains an HTTP status, a provider name, Postgres/Supabase/`ZW…`/`PGRST…` codes, the existence
  of an integration, rate-limit thresholds, or a stack trace. Raw provider errors are never surfaced.
- Zenward-Web logs (server-side) only `submissionId`, an outcome category, HTTP status, an error class and a timeout
  flag — never request content or the integration id.

## 5. Idempotency

One logical form submission gets **one** stable `submissionId`:

1. The browser generates a UUID when the form mounts and keeps it across failed attempts (it is replaced only on a fresh
   page load, i.e. a genuinely new submission).
2. The Server Action re-validates it and mints one server-side only if it is missing or malformed.
3. The adapter sends that exact value as `idempotencyKey` and never generates an id of its own, so a retry of the same
   submission re-sends the same key and a new submission sends a new one.

Nemryn's database enforces uniqueness per integration + key: a replay preserves the **first** accepted submission and
returns `{"ok": true}` again.

## 6. Modes and configuration

| Variable | Value | Notes |
|---|---|---|
| `REQUEST_INTAKE_MODE` | `stub` (default) or `platform` | `stub` validates and acknowledges but delivers nothing; the success screen tells the visitor to also call. |
| `PLATFORM_INTAKE_URL` | `https://app.nemryn.com/api/public-intake/website` | https only. |
| `PLATFORM_INTAKE_INTEGRATION_ID` | opaque id issued by Nemryn | Not printed in logs, docs or reports. |

`platform` without both variables fails closed with a "please call us" message; it never fakes success.

## 7. Kill switch

Setting `request_intake_integrations.is_active = false` in Nemryn immediately disables new website submissions for
this integration: Nemryn answers the generic failure and Zenward-Web shows the calm "couldn't submit" copy. It
requires no Zenward-Web deploy. It must not be left disabled after a successful release.

## 8. Logging and privacy

Request free text and names/phone/email are sensitive; neither side logs them. Neither side claims HIPAA
compliance or presents this channel as a compliant health-information pipeline.

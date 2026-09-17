# Zenward Web — Request Intake Boundary

**Status:** Foundation architecture. Stub implementation in production. The trusted `platform` path is fully specified and implemented on this side; the Nemryn endpoint it calls does not exist yet.
**Last updated:** 2026-09-07 (ZW-WEB-02C-1: versioned envelope + idempotency + response contract)

## Why this exists

This site collects transportation requests and contact messages from unauthenticated public visitors. It must never connect directly to the Zenward Platform's database, expose a service-role credential, or let the browser choose which organization owns a submission — the same security posture the platform repository's own domain model requires of any public-intake path (`ZenWard/docs/product/domain-model.md` §13/§L, decision register ZD-044/ZD-050).

## The boundary

```
Browser (form)
  → Server Action (src/app/request-transportation/actions.ts, src/app/contact/actions.ts)
      — runs server-side only; validates required fields
  → Configured adapter (src/lib/request-intake/adapter.ts, src/lib/contact-intake/adapter.ts)
      — the swappable delivery mechanism
  → [ destination — currently a safe stub, see below ]
```

The **Server Action is the boundary**, not the adapter and not the page. The browser never talks to a database, a third-party service, or the Zenward Platform directly — it always goes through the Server Action, which runs exclusively on the server.

## Current state: the stub adapter

`REQUEST_INTAKE_MODE=stub` (the default — see `.env.example`) selects a stub adapter that:

- Validates the submission (the Server Action whitelists fields, normalises and length-caps every string, checks enum values, runs a honeypot + fill-time check) and returns `{ ok: true, delivered: false }` with a locally-generated reference id.
- Persists nothing anywhere. Sends nothing to any external service. Logs no request content (only a mode warning in production). Never touches a credential.

Because it reports `delivered: false`, the success screen tells the visitor to **also call** to confirm, rather than implying a request is queued — and the `request_form_submitted` analytics conversion does **not** fire. This keeps the site honest while the trusted intake does not exist. The `platform` mode (below) is implemented and fails closed — selecting it without `PLATFORM_INTAKE_URL` / `PLATFORM_INTAKE_TOKEN` returns an honest "please call us" error, never a fake success.

## The replacement point

When the trusted Nemryn transportation-request intake endpoint exists — a controlled server-side path that resolves the Zenward Mobility tenant from its **own** credentials and never trusts a client-supplied organization/tenant id — turning it on is a matter of:

1. Point `PLATFORM_INTAKE_URL` / `PLATFORM_INTAKE_TOKEN` at it (server-only, never `NEXT_PUBLIC_`, never sent to the browser).
2. Set `REQUEST_INTAKE_MODE=platform`.

**No page, form component, or Server Action needs to change** — the adapter interface is the seam. A positive acceptance returns `delivered: true`, which flips the success copy and re-enables the `request_form_submitted` conversion automatically. Every non-acceptance (any error status, malformed success body, timeout, or unreachable endpoint) returns `delivered: false` and a customer-safe "please call us" message.

### What `PlatformRequestIntakeAdapter` sends (ZW-WEB-02C-1)

`POST` (HTTPS only), `Authorization: Bearer <PLATFORM_INTAKE_TOKEN>`, `Idempotency-Key: <submissionId>`, 10s timeout, body:

```json
{
  "schemaVersion": "1.0",
  "submissionId": "<uuid>",
  "submittedAt": "<ISO-8601 UTC, server-generated>",
  "source": "zenward_web",
  "request": { "...": "the 12 validated transportation-request fields, unchanged" }
}
```

- `submissionId` is a UUID generated in the browser (one per logical submission, held stable across retries) and **re-validated / regenerated server-side** in the Server Action. It is both the `Idempotency-Key` header and `envelope.submissionId`. It contains no personal information.
- `submittedAt` and `source` are always generated server-side.
- The envelope carries **no** `organization_id` / `tenant_id` / operator id — see the rule below.

Expected response and the exact status-code handling, plus the full endpoint spec the Nemryn team must build to, live in **`docs/architecture/nemryn-trusted-request-intake-contract.md`**.

`delivered: true` is returned **only** on `200`/`201` with `{ "accepted": true, "referenceId": "ZW-…" }`, or an idempotent `409` that echoes the original `referenceId`.

The contact form follows the same pattern (`ContactIntakeAdapter`), but is allowed ordinary email delivery (`CONTACT_INTAKE_MODE=email`, Resend) because it collects no detailed passenger transportation information. `ContactMessageResult` also carries `delivered: boolean` (ZW-WEB-02B): the stub and every failure path return `false`, `EmailContactIntakeAdapter` returns `true` only after a Resend 2xx, and the success screen tells the visitor plainly when a message was **not** sent (and to call) rather than implying it was received.

## What must never happen, at any point

- This site must never hold or use a Supabase (or equivalent) service-role credential for the platform's database.
- This site must never grant itself, or be granted, anonymous SELECT access to any platform table.
- No form on this site ever collects or transmits an `organization_id` / `tenant_id` / operator id, and neither does the server-to-server envelope — that determination belongs entirely to the trusted endpoint, which resolves it from its own server-side credentials and enforces tenant isolation with database RLS.
- The browser must never receive, in any API response, more than a plain acknowledgement (success/failure + a human-readable reference id) — never a reflected copy of platform-internal identifiers, structure, or state, and never an HTTP status, provider name, or token.
- Logs (server-side only) may contain the `submissionId`, a response status category, an error class, and a timeout flag — never request content, never the envelope, never the token.

## Security boundary summary

This site is a **low-trust public surface** with no standing access to Passengers, Trips, Drivers, Vehicles, Assignments, Memberships, TripNotes, TripEvents, or AuditEvents — now, and after any future adapter swap. If a future integration ever seems to require broader access than "submit one validated request, get back a reference id," that is a sign the integration is being designed wrong, not a sign this rule needs an exception.

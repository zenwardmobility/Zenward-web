# Zenward Web — Request Intake Boundary

**Status:** Foundation architecture. Stub implementation only — no production delivery destination is connected.
**Last updated:** 2026-08-30

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

When the Zenward Platform's trusted `TransportationRequest` intake path exists (platform repo `docs/product/domain-model.md` §13, §L — a controlled server-side path that assigns `organization_id` itself, never trusting the client), replacing the stub is a matter of:

1. `PlatformRequestIntakeAdapter` already exists (`src/lib/request-intake/adapter.ts`): a `Bearer`-token, 10s-timeout, server-to-server `POST` of the validated payload. It currently has no URL/token to call.
2. Set `PLATFORM_INTAKE_URL` and `PLATFORM_INTAKE_TOKEN` in **this site's server-only environment** (never `NEXT_PUBLIC_`, never sent to the browser).
3. Set `REQUEST_INTAKE_MODE=platform`.

**No page, form component, or Server Action needs to change** — the adapter interface is the seam specifically so the delivery destination can change without touching UI code. A successful platform response returns `delivered: true`, which flips the success copy and re-enables the `request_form_submitted` conversion automatically.

The contact form follows the same pattern (`ContactIntakeAdapter`), but is allowed ordinary email delivery (`CONTACT_INTAKE_MODE=email`, Resend) because it collects no detailed passenger transportation information.

## What must never happen, at any point

- This site must never hold or use a Supabase (or equivalent) service-role credential for the platform's database.
- This site must never grant itself, or be granted, anonymous SELECT access to any platform table.
- No form on this site ever collects or transmits an `organization_id` — that determination belongs entirely to the trusted server-side path on whichever end ultimately receives the submission, exactly as the platform's own architecture requires of its intake boundary.
- The browser must never receive, in any API response, more than a plain acknowledgement (success/failure + a human-readable reference id) — never a reflected copy of platform-internal identifiers, structure, or state.

## Security boundary summary

This site is a **low-trust public surface** with no standing access to Passengers, Trips, Drivers, Vehicles, Assignments, Memberships, TripNotes, TripEvents, or AuditEvents — now, and after any future adapter swap. If a future integration ever seems to require broader access than "submit one validated request, get back a reference id," that is a sign the integration is being designed wrong, not a sign this rule needs an exception.

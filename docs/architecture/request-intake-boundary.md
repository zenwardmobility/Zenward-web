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

- Accepts the submission and returns a success result with a locally-generated reference id.
- Persists nothing anywhere.
- Sends nothing to any external service.
- Never touches a credential of any kind.

This exists so the form has something real to submit to during this initialization phase, without connecting to any unfinished or unapproved backend.

## The replacement point

When the Zenward Platform's trusted `TransportationRequest` intake path exists (platform repo `docs/product/domain-model.md` §13, §L — a controlled server-side path that assigns `organization_id` itself, never trusting the client), replacing the stub is a matter of:

1. Implementing a new class satisfying `RequestIntakeAdapter` (or `ContactIntakeAdapter`) that calls the platform's intake endpoint — most likely a signed, server-to-server HTTP call from this site's Server Action to a platform API route.
2. Storing whatever credential that call requires in **this site's server-only environment** (never a `NEXT_PUBLIC_`-prefixed variable, never sent to the browser).
3. Switching `REQUEST_INTAKE_MODE` (or adding an equivalent selector) to use the new adapter.

**No page, form component, or Server Action needs to change** — the adapter interface is the seam specifically so the delivery destination can change without touching UI code.

## What must never happen, at any point

- This site must never hold or use a Supabase (or equivalent) service-role credential for the platform's database.
- This site must never grant itself, or be granted, anonymous SELECT access to any platform table.
- No form on this site ever collects or transmits an `organization_id` — that determination belongs entirely to the trusted server-side path on whichever end ultimately receives the submission, exactly as the platform's own architecture requires of its intake boundary.
- The browser must never receive, in any API response, more than a plain acknowledgement (success/failure + a human-readable reference id) — never a reflected copy of platform-internal identifiers, structure, or state.

## Security boundary summary

This site is a **low-trust public surface** with no standing access to Passengers, Trips, Drivers, Vehicles, Assignments, Memberships, TripNotes, TripEvents, or AuditEvents — now, and after any future adapter swap. If a future integration ever seems to require broader access than "submit one validated request, get back a reference id," that is a sign the integration is being designed wrong, not a sign this rule needs an exception.

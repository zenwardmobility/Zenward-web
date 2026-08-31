/**
 * Off-screen honeypot field. Real users never see or fill it; bots that
 * auto-complete every input do, and the Server Action rejects any submission
 * where it is non-empty (see src/lib/forms/guard.ts).
 *
 * Positioned off-screen rather than `display:none` — some bots skip hidden
 * inputs. `tabIndex={-1}` and `aria-hidden` keep it out of the keyboard and
 * screen-reader paths for real users.
 */
export function FormHoneypot() {
  return (
    <div aria-hidden className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0">
      <label htmlFor="company_website">Company website (leave blank)</label>
      <input
        id="company_website"
        name="company_website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

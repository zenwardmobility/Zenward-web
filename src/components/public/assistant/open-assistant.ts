/**
 * One way to open the ONE Transportation Assistant from anywhere on a page
 * (ZW-WEB-04H). Entry points (e.g. the inline entry on the quote page)
 * dispatch this event; AssistantLauncher, mounted once in PublicLayout,
 * listens and opens its panel. No second assistant, no shared state store, no
 * data in the event.
 */
export const OPEN_ASSISTANT_EVENT = "zenward:open-transportation-assistant";

export function openTransportationAssistant(): void {
  window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));
}

// Lightweight analytics shim for resource template events. No third-party
// SDK is installed in this repo, so events are queued on window and logged
// in development. Swap the transport later without touching call sites.
export type TemplateEventName =
  | "template_view"
  | "template_lead_submit"
  | "template_download"
  | "template_cta_click";

export interface TemplateEventPayload {
  templateSlug: string;
  source: string;
  cta?: string;
}

declare global {
  interface Window {
    zeduTemplateEvents?: (TemplateEventPayload & {
      event: TemplateEventName;
      timestamp: string;
    })[];
  }
}

export function trackTemplateEvent(
  event: TemplateEventName,
  payload: TemplateEventPayload
) {
  const entry = {
    event,
    ...payload,
    timestamp: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    window.zeduTemplateEvents = window.zeduTemplateEvents ?? [];
    window.zeduTemplateEvents.push(entry);
  }
  if (process.env.NODE_ENV !== "production") {
    console.info(`[templates] ${event}`, entry);
  }
}

export function readUtmSource(search: string | null | undefined) {
  if (!search) return "direct";
  try {
    const params = new URLSearchParams(search);
    return (
      params.get("utm_source") ??
      params.get("source") ??
      document.referrer ??
      "direct"
    );
  } catch {
    return "direct";
  }
}

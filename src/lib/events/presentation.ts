import type { EventRecord } from "~/types/events";
export const formatEventTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value)) + " WAT"
    : "Schedule to be confirmed";
export function eventLabel(event: EventRecord, now: number) {
  if (event.status === "cancelled") return "Cancelled";
  if (event.status === "draft") return "Draft";
  if (event.endsAt && now >= Date.parse(event.endsAt)) return "Ended";
  if (event.startsAt && now >= Date.parse(event.startsAt)) return "In progress";
  return "Upcoming";
}
export function localEventTime(value: string | null) {
  if (!value) return "";
  const date = new Date(Date.parse(value) + 3600000);
  return date.toISOString().slice(0, 16);
}
export function safeMeetingUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

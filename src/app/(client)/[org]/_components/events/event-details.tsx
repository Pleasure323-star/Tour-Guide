"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { setEventRsvp, resolveEventJoin } from "~/lib/events/api";
import {
  eventLabel,
  formatEventTime,
  safeMeetingUrl,
} from "~/lib/events/presentation";
import { useEvents } from "./events-provider";
import { EventManagement } from "./event-management";
export function EventDetails({
  onClose,
  onEdit,
}: {
  onClose: () => void;
  onEdit: () => void;
}) {
  const { state, organisationId, execute, selectedId, loadDetail } =
    useEvents();
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [continuation, setContinuation] = useState<string | null>(null);
  const busy = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  const event = state.detail?.id === selectedId ? state.detail : null;
  useEffect(() => {
    heading.current?.focus();
    setContinuation(null);
    setError("");
  }, [event?.id]);
  const canJoin =
    !!event &&
    event.status === "published" &&
    event.capabilities.canJoin &&
    !!event.joinOpensAt &&
    !!event.joinClosesAt &&
    state.now >= Date.parse(event.joinOpensAt) &&
    state.now < Date.parse(event.joinClosesAt);
  useEffect(() => {
    if (!canJoin) setContinuation(null);
  }, [canJoin]);
  async function rsvp() {
    if (!event || busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      await execute(() => setEventRsvp(organisationId, event.id, !event.going));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to RSVP");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  async function join() {
    if (!event || busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    setContinuation(null);
    // Reserve a tab during the click so browsers can open the validated link.
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    try {
      const result = await execute(() =>
        resolveEventJoin(organisationId, event.id)
      );
      const url = safeMeetingUrl(result.url);
      if (!url)
        throw new Error("The meeting link is unavailable. Contact the host.");
      if (tab && !tab.closed) tab.location.replace(url);
      else setContinuation(url);
    } catch (err) {
      tab?.close();
      setError(err instanceof Error ? err.message : "Unable to join");
      if (selectedId) void loadDetail(selectedId);
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <section
      className="min-w-0 rounded-xl border bg-white p-4 sm:p-6"
      aria-label="Event details"
    >
      <Button variant="link" className="mb-4 p-0" onClick={onClose}>
        Back to events
      </Button>
      {state.detailLoading && <p role="status">Loading event…</p>}
      {state.detailError && (
        <div role="alert">
          <p>{state.detailError}</p>
          <Button
            variant="outline"
            onClick={() => selectedId && loadDetail(selectedId)}
          >
            Retry event
          </Button>
        </div>
      )}
      {event && (
        <>
          <p className="text-sm text-gray-600">
            {event.category || "Session"} · {eventLabel(event, state.now)}
          </p>
          <h2
            ref={heading}
            tabIndex={-1}
            className="mt-2 break-words text-2xl font-bold outline-none"
          >
            {event.title || "Untitled draft"}
          </h2>
          <p className="mt-3 text-sm">
            {formatEventTime(event.startsAt)} — {formatEventTime(event.endsAt)}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Hosted by {event.host?.name || "Host to be confirmed"} ·{" "}
            {event.audience.label}
          </p>
          <p className="my-5 whitespace-pre-wrap break-words text-sm leading-6">
            {event.description || "Description to be confirmed"}
          </p>
          {event.status === "published" && (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={pending || !event.capabilities.canRsvp}
                  variant={event.going ? "outline" : "default"}
                  onClick={rsvp}
                >
                  {pending
                    ? "Please wait…"
                    : event.going
                      ? "Cancel RSVP"
                      : "RSVP"}
                </Button>
                {event.going && (
                  <span className="self-center text-sm font-semibold text-green-700">
                    Going
                  </span>
                )}
                <Button disabled={pending || !canJoin} onClick={join}>
                  Join session
                </Button>
              </div>
              <p className="mt-3 text-xs text-gray-600">
                Join opens {formatEventTime(event.joinOpensAt)} and closes at
                the end. You can join without an RSVP.
              </p>
              <p className="mt-2 text-xs text-gray-600">
                Reminder while this page is open:{" "}
                {formatEventTime(event.reminderAt)}. RSVP before this time to
                receive it.
              </p>
              {!event.joinOpensAt && (
                <p className="mt-2 text-sm">
                  Meeting details are missing. Contact the host.
                </p>
              )}
            </>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {continuation && (
            <a
              className="mt-3 inline-block underline"
              href={continuation}
              target="_blank"
              rel="noopener noreferrer"
            >
              Continue to authorised meeting
            </a>
          )}
          <EventManagement event={event} onEdit={onEdit} />
        </>
      )}
    </section>
  );
}

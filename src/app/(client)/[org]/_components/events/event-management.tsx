"use client";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { cancelEvent, publishEvent, setFeaturedEvent } from "~/lib/events/api";
import { useEvents } from "./events-provider";
import type { EventRecord } from "~/types/events";
export function EventManagement({
  event,
  onEdit,
}: {
  event: EventRecord;
  onEdit: () => void;
}) {
  const { organisationId, state, execute } = useEvents();
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [confirm, setConfirm] = useState(false);
  const busy = useRef(false);
  async function run(action: () => Promise<unknown>) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      await execute(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update event");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <div className="mt-6 space-y-3 border-t pt-4">
      <div className="flex flex-wrap gap-2">
        {event.capabilities.canManage && state.capabilities?.canManage && (
          <>
            <Button variant="outline" disabled={pending} onClick={onEdit}>
              Edit event
            </Button>
            {event.status === "draft" && (
              <Button
                disabled={pending}
                onClick={() =>
                  run(() =>
                    publishEvent(organisationId, event.id, event.revision)
                  )
                }
              >
                Publish event
              </Button>
            )}
            {event.status === "published" && (
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => setConfirm(true)}
              >
                Cancel event
              </Button>
            )}
          </>
        )}
        {event.capabilities.canFeature &&
          state.capabilities?.canFeature &&
          event.status === "published" && (
            <Button
              variant="outline"
              disabled={pending}
              onClick={() =>
                run(() =>
                  setFeaturedEvent(
                    organisationId,
                    event.featured ? null : event.id,
                    state.featuredRevision
                  )
                )
              }
            >
              {event.featured ? "Remove featured" : "Feature event"}
            </Button>
          )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
            <AlertDialogDescription>
              Members with an RSVP will receive an in-app cancellation notice.
              Joining and reminders will stop.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep event</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                run(() => cancelEvent(organisationId, event.id, event.revision))
              }
            >
              Confirm cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

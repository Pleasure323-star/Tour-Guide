"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  EventApiError,
  listEventMembers,
  saveEvent,
  getEvent,
} from "~/lib/events/api";
import { localEventTime, safeMeetingUrl } from "~/lib/events/presentation";
import { useEvents } from "./events-provider";
import type { EventRecord, EventMember } from "~/types/events";
const schema = z.object({
  title: z.string().max(160),
  description: z.string().max(5000),
  category: z.string().max(80),
  host_id: z.string(),
  starts_local: z.string(),
  ends_local: z.string(),
  url: z
    .string()
    .max(2048)
    .refine(
      (v) => !v || !!safeMeetingUrl(v),
      "Use an HTTPS link without embedded credentials"
    ),
});
type Values = z.infer<typeof schema>;
const values = (event?: EventRecord): Values => ({
  title: event?.title || "",
  description: event?.description || "",
  category: event?.category || "",
  host_id: event?.host?.id || "",
  starts_local: localEventTime(event?.startsAt || null),
  ends_local: localEventTime(event?.endsAt || null),
  url: event?.destination?.url || "",
});
export function EventForm({
  event,
  onClose,
  onSaved,
}: {
  event?: EventRecord;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { organisationId, execute, state } = useEvents();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: values(event),
  });
  const [members, setMembers] = useState<EventMember[]>([]),
    [search, setSearch] = useState(""),
    [error, setError] = useState(""),
    [conflict, setConflict] = useState(false),
    [revision, setRevision] = useState(event?.revision),
    [membersError, setMembersError] = useState("");
  const operation = useRef(crypto.randomUUID());
  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      listEventMembers(organisationId, search)
        .then((items) => {
          if (current) {
            setMembers(items);
            setMembersError("");
          }
        })
        .catch(() => {
          if (current)
            setMembersError("Unable to load hosts. Try searching again.");
        });
    }, 250);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [organisationId, search]);
  const submit = form.handleSubmit(async (input) => {
    setError("");
    setConflict(false);
    if (event?.status === "published") {
      if (
        !input.title.trim() ||
        !input.description.trim() ||
        !input.host_id ||
        !input.starts_local ||
        !input.ends_local ||
        !input.url
      ) {
        setError(
          "Published events need a title, description, host, schedule and meeting link."
        );
        return;
      }
      if (input.ends_local <= input.starts_local) {
        form.setError("ends_local", { message: "End must be after start" });
        return;
      }
    }
    try {
      const result = await execute(() =>
        saveEvent(
          organisationId,
          {
            ...input,
            organiser_time_zone: "Africa/Lagos",
            destination: { kind: "external", url: input.url },
            operation_id: operation.current,
            expected_revision: revision,
          },
          event?.id
        )
      );
      onSaved(result.event.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save event");
      if (err instanceof EventApiError) {
        setConflict(err.status === 409);
        for (const [key, message] of Object.entries(err.fields)) {
          if (key in input)
            form.setError(key as keyof Values, { message: String(message) });
        }
      }
    }
  });
  async function reload() {
    if (!event) return;
    try {
      const result = await getEvent(organisationId, event.id);
      form.reset(values(result.event));
      setRevision(result.event.revision);
      setConflict(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reload");
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !form.formState.isSubmitting) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{event ? "Edit event" : "Host an event"}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Audience: {event?.audience.label || "Current organisation"}. Schedule
          in Africa/Lagos (WAT).
        </p>
        <Form {...form}>
          <form onSubmit={submit} className="space-y-4">
            {(
              [
                ["title", "Title"],
                ["description", "Description"],
                ["category", "Category"],
              ] as const
            ).map(([name, label]) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      {name === "description" ? (
                        <Textarea {...field} />
                      ) : (
                        <Input {...field} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <label className="block text-sm">
              Find a host
              <Input
                aria-label="Search organisation hosts"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            {membersError && (
              <p role="alert" className="text-sm text-red-700">
                {membersError}
              </p>
            )}
            <FormField
              control={form.control}
              name="host_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-md border p-2">
                      <option value="">Select an organisation member</option>
                      {event?.host.id &&
                        !members.some((m) => m.id === event.host.id) && (
                          <option value={event.host.id}>
                            {event.host.name}
                          </option>
                        )}
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["starts_local", "Starts (WAT)"],
                  ["ends_local", "Ends (WAT)"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTTPS meeting link</FormLabel>
                  <FormControl>
                    <Input type="url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-gray-600">
              Drafts can be incomplete. Members only see published sessions.
              RSVP and Join do not prove attendance.
            </p>
            {error && (
              <div role="alert" className="text-sm text-red-700">
                {error}
                {conflict && (
                  <Button type="button" variant="outline" onClick={reload}>
                    Reload latest and review
                  </Button>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={form.formState.isSubmitting}
                onClick={onClose}
              >
                Back
              </Button>
              <Button
                disabled={
                  form.formState.isSubmitting || !state.capabilities?.canManage
                }
              >
                {form.formState.isSubmitting
                  ? "Saving…"
                  : event?.status === "published"
                    ? "Save changes"
                    : "Save draft"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

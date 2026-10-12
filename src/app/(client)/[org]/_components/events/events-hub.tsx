"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { EventRecord } from "~/types/events";
import { cn } from "~/lib/utils";
import { useEvents } from "./events-provider";
import { FeaturedEventCard } from "./featured-event-card";
import { EventAgenda, EventDateStrip } from "./event-agenda";
import { EventDetails } from "./event-details";
import { EventForm } from "./event-form";
import { getEventNotices } from "~/lib/events/api";
export function EventsHub() {
  const {
    state,
    query,
    setQuery,
    setSelectedId,
    selectedId,
    refresh,
    organisationId,
  } = useEvents();
  const router = useRouter(),
    pathname = usePathname(),
    params = useSearchParams();
  const id = params.get("event");
  const [editingEvent, setEditingEvent] = useState<EventRecord | undefined>();
  const [form, setForm] = useState<"new" | "edit" | null>(null);
  const [notices, setNotices] = useState<ReturnType<typeof getEventNotices>>(
    []
  );
  useEffect(() => {
    try {
      setNotices(getEventNotices(organisationId));
    } catch {
      setNotices([]);
    }
  }, [organisationId, state.list, state.now]);
  const focus = useRef<HTMLElement | null>(null);
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (!selectedId && restoreFocus.current) {
      restoreFocus.current = false;
      focus.current?.focus();
    }
  }, [selectedId]);
  useEffect(() => {
    setSelectedId(id);
  }, [id, setSelectedId]);
  function select(eventId: string | null) {
    if (eventId) focus.current = document.activeElement as HTMLElement;
    const next = new URLSearchParams(params.toString());
    if (eventId) next.set("event", eventId);
    else next.delete("event");
    router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
    if (!eventId) restoreFocus.current = true;
  }
  const allowed = state.capabilities?.enabled && state.capabilities.canView;
  if (!allowed)
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Events Hub</h1>
        {state.loading ? (
          <p role="status">Checking event access…</p>
        ) : (
          <>
            <p className="mt-3" role={state.error ? "alert" : undefined}>
              {state.error ||
                "Events Hub is unavailable for this organisation."}
            </p>
            <Button className="mt-4" variant="outline" onClick={refresh}>
              Retry
            </Button>
          </>
        )}
      </main>
    );
  return (
    <main className="min-h-[calc(100dvh-60px)] bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {notices.length > 0 && (
          <section
            aria-label="Event updates"
            className="mb-4 rounded-lg border bg-white p-3"
          >
            <h2 className="font-semibold">Event updates</h2>
            {notices.slice(0, 10).map((notice) => (
              <Button
                key={notice.id}
                variant="link"
                className="block h-auto whitespace-normal text-left"
                onClick={() => select(notice.eventId)}
              >
                {notice.message}
              </Button>
            ))}
          </section>
        )}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600">Learning</p>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-blue-600">
              <CalendarDays className="size-6" />
              Events Hub
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Learn together. Find your next session.
            </p>
          </div>
          {state.capabilities?.canManage && (
            <Button onClick={() => setForm("new")}>Host an event</Button>
          )}
        </header>
        <div
          className={cn("grid min-w-0 gap-5", selectedId && "lg:grid-cols-2")}
        >
          <div
            className={cn("min-w-0 space-y-5", selectedId && "hidden lg:block")}
          >
            {state.list?.featuredEvent && (
              <FeaturedEventCard
                event={state.list.featuredEvent}
                onSelect={select}
              />
            )}
            <div
              role="tablist"
              aria-label="Event lists"
              className="flex flex-wrap gap-1"
            >
              {(
                [
                  ["upcoming", "Upcoming"],
                  ["my-rsvps", "My RSVPs"],
                  ["past", "Past"],
                  ...(state.capabilities?.canManage
                    ? [["drafts", "Drafts"]]
                    : []),
                ] as const
              ).map(([tab, label]) => (
                <Button
                  key={tab}
                  role="tab"
                  aria-selected={query.tab === tab}
                  className={
                    query.tab === tab
                      ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                      : "hover:bg-blue-50"
                  }
                  variant={query.tab === tab ? "default" : "ghost"}
                  onClick={() =>
                    setQuery({
                      ...query,
                      tab: tab as typeof query.tab,
                      page: 1,
                    })
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-3 size-4 text-gray-500"
                />
                <Input
                  aria-label="Search events"
                  className="pl-9"
                  value={query.q}
                  onChange={(e) =>
                    setQuery({ ...query, q: e.target.value, page: 1 })
                  }
                  placeholder="Search sessions or hosts"
                />
              </div>
              <Input
                aria-label="Filter by date"
                type="date"
                className="w-auto max-w-full"
                value={query.date}
                onChange={(e) =>
                  setQuery({ ...query, date: e.target.value, page: 1 })
                }
              />
            </div>
            <EventDateStrip
              date={query.date}
              now={state.now}
              onDate={(date) => setQuery({ ...query, date, page: 1 })}
            />
            {query.date && (
              <Button
                variant="ghost"
                onClick={() => setQuery({ ...query, date: "", page: 1 })}
              >
                Show all dates
              </Button>
            )}
            {state.loading && <p role="status">Loading events…</p>}
            {state.error && (
              <div role="alert">
                <p>{state.error}</p>
                <Button variant="outline" onClick={refresh}>
                  Retry
                </Button>
              </div>
            )}
            {!state.loading && !state.error && !state.list?.items.length && (
              <div className="rounded-xl border bg-white p-8 text-center">
                <h2 className="font-semibold">No events found</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Try another date or search, or check back for new sessions.
                </p>
              </div>
            )}
            {state.list && (
              <>
                <EventAgenda
                  items={state.list.items}
                  now={state.now}
                  onSelect={select}
                />
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    disabled={query.page <= 1 || state.loading}
                    onClick={() => setQuery({ ...query, page: query.page - 1 })}
                  >
                    Previous page
                  </Button>
                  <span className="text-xs text-gray-600">
                    Page {query.page} of{" "}
                    {Math.max(1, state.list.pagination.total_pages_count)}
                  </span>
                  <Button
                    variant="outline"
                    disabled={
                      query.page >= state.list.pagination.total_pages_count ||
                      state.loading
                    }
                    onClick={() => setQuery({ ...query, page: query.page + 1 })}
                  >
                    Next page
                  </Button>
                </div>
              </>
            )}
          </div>
          {selectedId && (
            <EventDetails
              key={selectedId}
              onClose={() => select(null)}
              onEdit={() => {
                setEditingEvent(state.detail || undefined);
                setForm("edit");
              }}
            />
          )}
        </div>
        {form && state.capabilities?.canManage && (
          <EventForm
            event={form === "edit" ? editingEvent : undefined}
            onClose={() => setForm(null)}
            onSaved={(eventId) => {
              setForm(null);
              select(eventId);
            }}
          />
        )}
      </div>
    </main>
  );
}

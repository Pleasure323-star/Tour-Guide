"use client";
import { useState } from "react";
import {
  CalendarDays,
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { formatEventTime, eventLabel } from "~/lib/events/presentation";
import type { EventRecord } from "~/types/events";
export function EventAgenda({
  items,
  now,
  onSelect,
}: {
  items: EventRecord[];
  now: number;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="divide-y rounded-xl border bg-white">
      {items.map((event) => (
        <article
          key={event.id}
          className="flex min-w-0 items-start gap-3 p-4 sm:p-5"
        >
          <CalendarDays
            className="mt-1 size-5 shrink-0 text-blue-500"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span>{event.category || "Session"}</span>
              <span>{eventLabel(event, now)}</span>
              {event.going && (
                <span className="flex items-center gap-1 font-semibold text-green-700">
                  <Check className="size-3" />
                  Going
                </span>
              )}
            </div>
            <Button
              variant="link"
              className="h-auto max-w-full whitespace-normal break-words p-0 text-left text-base font-semibold text-blue-600"
              onClick={() => onSelect(event.id)}
            >
              {event.title || "Untitled draft"}
            </Button>
            <p className="mt-1 text-sm text-gray-600">
              {formatEventTime(event.startsAt)}
            </p>
            <p className="text-sm text-gray-600">
              Hosted by {event.host?.name || "Host to be confirmed"}
            </p>
          </div>
          <ArrowRight
            className="mt-2 size-4 shrink-0 text-gray-400"
            aria-hidden="true"
          />
        </article>
      ))}
    </div>
  );
}

export function EventDateStrip({
  date,
  now,
  onDate,
}: {
  date: string;
  now: number;
  onDate: (date: string) => void;
}) {
  const [week, setWeek] = useState("");
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
  }).format(new Date(now));
  const start = week || date || today;
  const days = Array.from(
    { length: 7 },
    (_, index) =>
      new Date(Date.parse(`${start}T12:00:00+01:00`) + index * 86400000)
  );
  const move = (offset: number) =>
    setWeek(
      new Date(days[0].getTime() + offset * 86400000).toISOString().slice(0, 10)
    );
  return (
    <section aria-label="Seven-day event navigation">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {new Intl.DateTimeFormat("en-GB", {
            timeZone: "Africa/Lagos",
            month: "long",
            year: "numeric",
          }).format(days[0])}{" "}
          · WAT
        </span>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Previous seven days"
            onClick={() => move(-7)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Next seven days"
            onClick={() => move(7)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 rounded-xl border bg-white p-2">
        {days.map((day) => {
          const value = day.toISOString().slice(0, 10);
          return (
            <Button
              key={value}
              variant={date === value ? "default" : "ghost"}
              aria-label={`Filter ${value}`}
              aria-pressed={date === value}
              className="h-14 flex-col gap-1 px-0"
              onClick={() => {
                setWeek(start);
                onDate(date === value ? "" : value);
              }}
            >
              <span className="text-xs">
                {new Intl.DateTimeFormat("en-GB", {
                  timeZone: "Africa/Lagos",
                  weekday: "narrow",
                }).format(day)}
              </span>
              <span>{day.getUTCDate()}</span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}

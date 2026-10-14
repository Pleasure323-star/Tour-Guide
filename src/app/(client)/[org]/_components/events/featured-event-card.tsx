import { Star } from "lucide-react";
import { Button } from "~/components/ui/button";
import { formatEventTime } from "~/lib/events/presentation";
import type { EventRecord } from "~/types/events";
export function FeaturedEventCard({
  event,
  onSelect,
}: {
  event: EventRecord;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="rounded-xl bg-blue-500 p-5 text-white sm:p-7">
      <p className="mb-3 flex items-center gap-2 text-sm">
        <Star className="size-4" /> Featured session
      </p>
      <h2 className="break-words text-2xl font-bold">{event.title}</h2>
      <p className="mt-2 text-sm">
        {formatEventTime(event.startsAt)} · {event.host.name}
      </p>
      <p className="my-3 line-clamp-2 whitespace-pre-wrap text-sm">
        {event.description}
      </p>
      <Button variant="secondary" onClick={() => onSelect(event.id)}>
        View event
      </Button>
    </section>
  );
}

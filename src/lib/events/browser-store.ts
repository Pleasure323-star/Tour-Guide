import type {
  EventRecord,
  EventListQuery,
  EventWriteInput,
} from "~/types/events";
import { safeMeetingUrl } from "./presentation";
export class EventApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: Record<string, string> = {}
  ) {
    super(message);
  }
}
type StoredEvent = EventRecord & { reminderEligible?: boolean };
type Notice = { id: string; eventId: string; message: string };
type Store = {
  events: StoredEvent[];
  featured: string | null;
  revision: number;
  notices: Notice[];
};
export function viewer() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return {
      id: String(u.id || u.user_id || "visitor"),
      name: String(u.username || u.name || "You"),
    };
  } catch {
    return { id: "visitor", name: "You" };
  }
}
const key = (org: string) => `zedu-events-browser-v1:${org}:${viewer().id}`;
const now = () => new Date().toISOString();
function persist(org: string, data: Store) {
  try {
    localStorage.setItem(key(org), JSON.stringify(data));
  } catch {
    throw new EventApiError(
      0,
      "Your browser could not save events. Check its storage settings."
    );
  }
}
function blank(org: string, title: string): StoredEvent {
  return {
    id: crypto.randomUUID(),
    organisationId: org,
    title,
    description: "A session to learn and connect with your team.",
    category: "Learning",
    host: { ...viewer(), role_label: "Host" },
    audience: { organisation_id: org, label: "Your organisation" },
    status: "draft",
    startsAt: null,
    endsAt: null,
    organiserTimeZone: "Africa/Lagos",
    revision: 1,
    scheduleVersion: 1,
    featured: false,
    going: false,
    capabilities: {
      canManage: true,
      canFeature: true,
      canRsvp: false,
      canJoin: false,
    },
    joinOpensAt: null,
    joinClosesAt: null,
    reminderAt: null,
  };
}
function load(org: string): Store {
  const raw = localStorage.getItem(key(org));
  if (raw) {
    try {
      const data = JSON.parse(raw);
      if (
        Array.isArray(data.events) &&
        Array.isArray(data.notices) &&
        typeof data.revision === "number"
      )
        return data;
    } catch {
      /* Report invalid stored data rather than replacing someone's events. */
    }
    throw new EventApiError(
      0,
      "Saved event data cannot be read. Clear this site's event storage to start again."
    );
  }
  const first = blank(org, "Community learning session"),
    second = blank(org, "Team check-in");
  [first, second].forEach((e, i) => {
    e.status = "published";
    e.startsAt = new Date(Date.now() + (i ? 86400000 : 900000)).toISOString();
    e.endsAt = new Date(Date.parse(e.startsAt) + 3600000).toISOString();
  });
  const data = {
    events: [first, second, blank(org, "Workshop ideas")],
    featured: first.id,
    revision: 0,
    notices: [],
  };
  persist(org, data);
  return data;
}
function record(e: StoredEvent, data: Store): EventRecord {
  const start = e.startsAt ? Date.parse(e.startsAt) : 0,
    end = e.endsAt ? Date.parse(e.endsAt) : 0;
  return {
    ...e,
    featured: data.featured === e.id,
    joinOpensAt: start ? new Date(start - 900000).toISOString() : null,
    joinClosesAt: e.endsAt,
    reminderAt:
      e.going && e.reminderEligible && start
        ? new Date(start - 1800000).toISOString()
        : null,
    capabilities: {
      canManage: true,
      canFeature: true,
      canRsvp: e.status === "published" && Date.now() < end,
      canJoin:
        e.status === "published" &&
        Date.now() >= start - 900000 &&
        Date.now() < end &&
        !!safeMeetingUrl(e.destination?.url || ""),
    },
  };
}
function find(data: Store, id: string) {
  const e = data.events.find((e) => e.id === id);
  if (!e) throw new EventApiError(404, "Event not found");
  return e;
}
function result(org: string, data: Store, e: StoredEvent) {
  persist(org, data);
  return {
    event: record(e, data),
    serverNow: now(),
    featuredRevision: data.revision,
  };
}
function check(e: StoredEvent, revision?: number) {
  if (e.revision !== revision)
    throw new EventApiError(409, "This event changed. Reload and try again.");
}
function complete(e: StoredEvent) {
  if (
    !e.title.trim() ||
    !e.description.trim() ||
    !e.startsAt ||
    !e.endsAt ||
    !safeMeetingUrl(e.destination?.url || "")
  )
    throw new EventApiError(
      422,
      "Add a title, description, schedule and HTTPS meeting link before publishing."
    );
  if (
    Date.parse(e.endsAt) <= Date.parse(e.startsAt) ||
    Date.parse(e.startsAt) <= Date.now()
  )
    throw new EventApiError(422, "Choose a future start and an end after it.");
}
export function capabilities(org: string) {
  load(org);
  return {
    enabled: true,
    canView: true,
    canManage: true,
    canFeature: true,
    serverNow: now(),
  };
}
export function notices(org: string) {
  return load(org).notices;
}
export function listing(org: string, query: EventListQuery) {
  const data = load(org);
  data.events.forEach((e) => {
    const start = e.startsAt ? Date.parse(e.startsAt) : 0,
      id = `reminder:${e.id}:${e.scheduleVersion}`;
    if (
      e.status === "published" &&
      e.going &&
      e.reminderEligible &&
      start &&
      Date.now() >= start - 1800000 &&
      Date.now() < start &&
      !data.notices.some((n) => n.id === id)
    )
      data.notices.unshift({
        id,
        eventId: e.id,
        message: `${e.title} starts soon.`,
      });
  });
  persist(org, data);
  let items = data.events.filter((e) =>
    query.tab === "drafts"
      ? e.status === "draft"
      : query.tab === "past"
        ? e.status === "cancelled" ||
          (e.status === "published" &&
            !!e.endsAt &&
            Date.parse(e.endsAt) <= Date.now())
        : query.tab === "my-rsvps"
          ? e.going && e.status === "published"
          : e.status === "published" &&
            !!e.endsAt &&
            Date.parse(e.endsAt) > Date.now()
  );
  if (query.q)
    items = items.filter((e) =>
      [e.title, e.description, e.host.name]
        .join(" ")
        .toLowerCase()
        .includes(query.q.trim().toLowerCase())
    );
  if (query.date)
    items = items.filter(
      (e) =>
        e.startsAt &&
        new Date(Date.parse(e.startsAt) + 3600000)
          .toISOString()
          .slice(0, 10) === query.date
    );
  items.sort(
    (a, b) =>
      (a.startsAt || "").localeCompare(b.startsAt || "") ||
      a.id.localeCompare(b.id)
  );
  const featured = data.events.find(
    (e) =>
      e.id === data.featured &&
      e.status === "published" &&
      !!e.endsAt &&
      Date.parse(e.endsAt) > Date.now()
  );
  return {
    items: items
      .slice((query.page - 1) * 20, query.page * 20)
      .map((e) => record(e, data)),
    featuredEvent: featured ? record(featured, data) : null,
    pagination: {
      current_page: query.page,
      limit: 20,
      total_items: items.length,
      total_pages_count: Math.max(1, Math.ceil(items.length / 20)),
    },
    serverNow: now(),
    featuredRevision: data.revision,
  };
}
export function detail(org: string, id: string) {
  const data = load(org);
  return {
    event: record(find(data, id), data),
    serverNow: now(),
    featuredRevision: data.revision,
  };
}
export function save(org: string, input: EventWriteInput, id?: string) {
  const data = load(org);
  const retry =
    !id && input.operation_id
      ? data.events.find((e) => e.id === input.operation_id)
      : null;
  if (retry) return result(org, data, retry);
  const e = id ? find(data, id) : blank(org, input.title);
  if (id) check(e, input.expected_revision);
  if (e.status === "cancelled")
    throw new EventApiError(422, "Cancelled events cannot be edited.");
  const time = (value: string) => {
    if (!value) return null;
    const date = new Date(value + "+01:00");
    if (!Number.isFinite(date.getTime()))
      throw new EventApiError(422, "Check the schedule.");
    return date.toISOString();
  };
  const startsAt = time(input.starts_local),
    endsAt = time(input.ends_local);
  if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt))
    throw new EventApiError(422, "End must be after start", {
      ends_local: "End must be after start",
    });
  if (input.destination.url && !safeMeetingUrl(input.destination.url))
    throw new EventApiError(422, "Use an HTTPS meeting link", {
      url: "Use an HTTPS meeting link",
    });
  const scheduleChanged = e.startsAt !== startsAt;
  const next = {
    ...e,
    title: input.title,
    description: input.description,
    category: input.category,
    startsAt,
    endsAt,
    destination: input.destination,
  };
  if (next.status === "published") complete(next);
  if (id) {
    next.revision++;
    if (scheduleChanged) {
      next.scheduleVersion++;
      next.reminderEligible =
        next.going && !!startsAt && Date.now() < Date.parse(startsAt) - 1800000;
    }
    if (next.going)
      data.notices.unshift({
        id: crypto.randomUUID(),
        eventId: next.id,
        message: `${next.title} was updated.`,
      });
    data.events[data.events.findIndex((x) => x.id === id)] = next;
  } else {
    next.id = input.operation_id || next.id;
    data.events.push(next);
  }
  return result(org, data, next);
}
export function publish(org: string, id: string, revision: number) {
  const data = load(org),
    e = find(data, id);
  check(e, revision);
  complete(e);
  e.status = "published";
  e.revision++;
  return result(org, data, e);
}
export function cancel(org: string, id: string, revision: number) {
  const data = load(org),
    e = find(data, id);
  check(e, revision);
  if (e.status !== "published")
    throw new EventApiError(422, "Only published events can be cancelled");
  e.status = "cancelled";
  e.revision++;
  if (data.featured === id) {
    data.featured = null;
    data.revision++;
  }
  if (e.going)
    data.notices.unshift({
      id: crypto.randomUUID(),
      eventId: id,
      message: `${e.title} was cancelled.`,
    });
  return result(org, data, e);
}
export function rsvp(org: string, id: string, going: boolean) {
  const data = load(org),
    e = find(data, id);
  if (!record(e, data).capabilities.canRsvp)
    throw new EventApiError(422, "RSVP is closed");
  e.going = going;
  e.reminderEligible =
    going && !!e.startsAt && Date.now() < Date.parse(e.startsAt) - 1800000;
  return result(org, data, e);
}
export function feature(org: string, id: string | null, revision: number) {
  const data = load(org);
  if (data.revision !== revision)
    throw new EventApiError(409, "Featured selection changed");
  if (id) {
    const e = find(data, id);
    if (
      e.status !== "published" ||
      !e.endsAt ||
      Date.parse(e.endsAt) <= Date.now()
    )
      throw new EventApiError(422, "Feature an upcoming published event");
  }
  data.featured = id;
  data.revision++;
  persist(org, data);
  return { event_id: id, revision: data.revision, server_now: now() };
}
export function join(org: string, id: string) {
  const data = load(org),
    e = find(data, id);
  if (!record(e, data).capabilities.canJoin)
    throw new EventApiError(
      422,
      "Join is unavailable. Check the schedule and meeting link."
    );
  return {
    url: safeMeetingUrl(e.destination?.url || "")!,
    kind: "external" as const,
    server_now: now(),
  };
}

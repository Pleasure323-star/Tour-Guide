import {
  GetRequest,
  PostRequest,
  PatchRequest,
  PutRequest,
} from "~/utils/new-request";
import { handleUnauthorizedIfNeeded } from "~/utils/auth-session";
import type {
  EventDto,
  EventRecord,
  EventCapabilities,
  EventListQuery,
  EventListResult,
  EventWriteInput,
  EventResult,
  EventJoinResult,
  EventMember,
} from "~/types/events";

export class EventApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: Record<string, string> = {}
  ) {
    super(message);
  }
}
async function response<T>(request: Promise<any>): Promise<T> {
  const raw = await request;
  const res = raw?.response || raw;
  if (!res?.status || res.status < 200 || res.status >= 300) {
    handleUnauthorizedIfNeeded(raw);
    throw new EventApiError(
      res?.status || 0,
      res?.data?.message || "Unable to load events. Please try again.",
      res?.data?.errors || {}
    );
  }
  return res.data.data as T;
}
const base = (orgId: string) =>
  `/organisations/${encodeURIComponent(orgId)}/events`;
const path = (orgId: string, id: string) =>
  `${base(orgId)}/${encodeURIComponent(id)}`;
export const mapEvent = (dto: EventDto): EventRecord => ({
  id: dto.id,
  organisationId: dto.organisation_id,
  title: dto.title,
  description: dto.description,
  category: dto.category,
  host: dto.host,
  audience: dto.audience,
  status: dto.status,
  startsAt: dto.starts_at,
  endsAt: dto.ends_at,
  organiserTimeZone: dto.organiser_time_zone,
  revision: dto.revision,
  scheduleVersion: dto.schedule_version,
  featured: dto.featured,
  going: dto.going,
  capabilities: {
    canManage: dto.capabilities.can_manage,
    canFeature: dto.capabilities.can_feature,
    canRsvp: dto.capabilities.can_rsvp,
    canJoin: dto.capabilities.can_join,
  },
  joinOpensAt: dto.join_opens_at,
  joinClosesAt: dto.join_closes_at,
  reminderAt: dto.reminder_at,
  destination: dto.destination,
});
export async function getEventCapabilities(
  orgId: string
): Promise<EventCapabilities> {
  const dto = await response<{
    enabled: boolean;
    can_view: boolean;
    can_manage: boolean;
    can_feature: boolean;
    server_now: string;
  }>(GetRequest(`${base(orgId)}/capabilities`));
  return {
    enabled: dto.enabled === true,
    canView: dto.can_view === true,
    canManage: dto.can_manage === true,
    canFeature: dto.can_feature === true,
    serverNow: dto.server_now,
  };
}
export async function listEvents(
  orgId: string,
  query: EventListQuery
): Promise<EventListResult> {
  const params = new URLSearchParams({
    tab: query.tab,
    page: String(query.page),
    limit: "20",
    time_zone: "Africa/Lagos",
  });
  if (query.q) params.set("q", query.q);
  if (query.date) params.set("date", query.date);
  const dto = await response<{
    items: EventDto[];
    featured_event: EventDto | null;
    pagination: EventListResult["pagination"];
    server_now: string;
    featured_revision: number;
  }>(GetRequest(`${base(orgId)}?${params}`));
  return {
    items: dto.items.map(mapEvent),
    featuredEvent: dto.featured_event ? mapEvent(dto.featured_event) : null,
    pagination: dto.pagination,
    serverNow: dto.server_now,
    featuredRevision: dto.featured_revision,
  };
}
async function eventResponse(request: Promise<any>): Promise<EventResult> {
  const dto = await response<{
    event: EventDto;
    server_now: string;
    featured_revision: number;
  }>(request);
  return {
    event: mapEvent(dto.event),
    serverNow: dto.server_now,
    featuredRevision: dto.featured_revision,
  };
}
export const getEvent = (orgId: string, id: string) =>
  eventResponse(GetRequest(path(orgId, id)));
export const saveEvent = (orgId: string, input: EventWriteInput, id?: string) =>
  eventResponse(
    id ? PatchRequest(path(orgId, id), input) : PostRequest(base(orgId), input)
  );
export const publishEvent = (orgId: string, id: string, revision: number) =>
  eventResponse(
    PostRequest(`${path(orgId, id)}/publish`, { expected_revision: revision })
  );
export const cancelEvent = (orgId: string, id: string, revision: number) =>
  eventResponse(
    PostRequest(`${path(orgId, id)}/cancel`, { expected_revision: revision })
  );
export const setEventRsvp = (orgId: string, id: string, going: boolean) =>
  eventResponse(PutRequest(`${path(orgId, id)}/rsvp`, { going }));
export const resolveEventJoin = (orgId: string, id: string) =>
  response<EventJoinResult>(PostRequest(`${path(orgId, id)}/join`));
export const setFeaturedEvent = (
  orgId: string,
  id: string | null,
  revision: number
) =>
  response<{ featured_revision: number }>(
    PutRequest(`${base(orgId)}/featured`, {
      event_id: id,
      expected_revision: revision,
    })
  );
export async function listEventMembers(
  orgId: string,
  search: string
): Promise<EventMember[]> {
  const raw = await GetRequest(
    `/organisations/${encodeURIComponent(orgId)}/users?page=1&limit=100&search=${encodeURIComponent(search)}`
  );
  const members = await response<any[]>(Promise.resolve(raw));
  return members
    .filter(
      (m) =>
        !m.deactivated &&
        !m.is_deactivated &&
        !m.is_restricted &&
        m.status !== "deactivated" &&
        m.status !== "inactive"
    )
    .map((m) => ({
      id: m.user_id || m.user?.id || m.id,
      name:
        m.name ||
        m.user?.name ||
        [m.first_name, m.last_name].filter(Boolean).join(" ") ||
        m.email,
    }));
}

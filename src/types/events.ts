export type EventTab = "upcoming" | "my-rsvps" | "past" | "drafts";
export interface EventCapabilities {
  enabled: boolean;
  canView: boolean;
  canManage: boolean;
  canFeature: boolean;
  serverNow: string;
}
export interface EventDto {
  id: string;
  organisation_id: string;
  title: string;
  description: string;
  category: string;
  host: { id: string; name: string; role_label: string };
  audience: { organisation_id: string; label: string };
  status: "draft" | "published" | "cancelled";
  starts_at: string | null;
  ends_at: string | null;
  organiser_time_zone: string;
  revision: number;
  schedule_version: number;
  featured: boolean;
  going: boolean;
  capabilities: {
    can_manage: boolean;
    can_feature: boolean;
    can_rsvp: boolean;
    can_join: boolean;
  };
  join_opens_at: string | null;
  join_closes_at: string | null;
  reminder_at: string | null;
  destination?: { kind: "external"; url: string };
}
export interface EventRecord {
  id: string;
  organisationId: string;
  title: string;
  description: string;
  category: string;
  host: EventDto["host"];
  audience: EventDto["audience"];
  status: EventDto["status"];
  startsAt: string | null;
  endsAt: string | null;
  organiserTimeZone: string;
  revision: number;
  scheduleVersion: number;
  featured: boolean;
  going: boolean;
  capabilities: {
    canManage: boolean;
    canFeature: boolean;
    canRsvp: boolean;
    canJoin: boolean;
  };
  joinOpensAt: string | null;
  joinClosesAt: string | null;
  reminderAt: string | null;
  destination?: EventDto["destination"];
}
export interface EventListQuery {
  tab: EventTab;
  q: string;
  date: string;
  page: number;
}
export interface EventListResult {
  items: EventRecord[];
  featuredEvent: EventRecord | null;
  pagination: {
    current_page: number;
    limit: number;
    total_items: number;
    total_pages_count: number;
  };
  serverNow: string;
  featuredRevision: number;
}
export interface EventWriteInput {
  title: string;
  description: string;
  category: string;
  host_id: string;
  organiser_time_zone: "Africa/Lagos";
  starts_local: string;
  ends_local: string;
  destination: { kind: "external"; url: string };
  operation_id?: string;
  expected_revision?: number;
}
export interface EventResult {
  event: EventRecord;
  serverNow: string;
  featuredRevision: number;
}
export interface EventJoinResult {
  url: string;
  kind: "external";
  server_now: string;
}
export interface EventMember {
  id: string;
  name: string;
}

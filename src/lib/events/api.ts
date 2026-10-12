import * as browser from "./browser-store";
import type { EventListQuery, EventWriteInput } from "~/types/events";
export { EventApiError } from "./browser-store";
export const getEventCapabilities = async (org: string) =>
  browser.capabilities(org);
export const listEvents = async (org: string, query: EventListQuery) =>
  browser.listing(org, query);
export const getEvent = async (org: string, id: string) =>
  browser.detail(org, id);
export const saveEvent = async (
  org: string,
  input: EventWriteInput,
  id?: string
) => browser.save(org, input, id);
export const publishEvent = async (org: string, id: string, revision: number) =>
  browser.publish(org, id, revision);
export const cancelEvent = async (org: string, id: string, revision: number) =>
  browser.cancel(org, id, revision);
export const setEventRsvp = async (org: string, id: string, going: boolean) =>
  browser.rsvp(org, id, going);
export const setFeaturedEvent = async (
  org: string,
  id: string | null,
  revision: number
) => browser.feature(org, id, revision);
export const resolveEventJoin = async (org: string, id: string) =>
  browser.join(org, id);
export const listEventMembers = async (_org: string, search: string) =>
  [browser.viewer()].filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );
export const getEventNotices = browser.notices;

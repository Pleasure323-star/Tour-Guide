"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import * as api from "~/lib/events/api";
import type {
  EventCapabilities,
  EventListQuery,
  EventListResult,
  EventRecord,
} from "~/types/events";
interface State {
  capabilities: EventCapabilities | null;
  list: EventListResult | null;
  detail: EventRecord | null;
  loading: boolean;
  detailLoading: boolean;
  error: string;
  detailError: string;
  now: number;
  featuredRevision: number;
}
const initial: State = {
  capabilities: null,
  list: null,
  detail: null,
  loading: true,
  detailLoading: false,
  error: "",
  detailError: "",
  now: Date.now(),
  featuredRevision: 0,
};
function useController(organisationId: string) {
  const [state, patch] = useReducer(
    (s: State, p: Partial<State>) => ({ ...s, ...p }),
    initial
  );
  const [query, setQuery] = useState<EventListQuery>({
    tab: "upcoming",
    q: "",
    date: "",
    page: 1,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      const capabilities = await api.getEventCapabilities(organisationId);
      const list = await api.listEvents(organisationId, query);
      patch({
        capabilities,
        list,
        loading: false,
        error: "",
        featuredRevision: list.featuredRevision,
        now: Date.now(),
      });
      if (selectedId) {
        const detail = await api.getEvent(organisationId, selectedId);
        patch({ detail: detail.event, detailError: "", detailLoading: false });
      }
    } catch (e) {
      patch({
        loading: false,
        detailLoading: false,
        error: e instanceof Error ? e.message : "Unable to load events",
      });
    }
  }, [organisationId, query, selectedId]);
  const loadDetail = useCallback(
    async (id: string) => {
      try {
        const result = await api.getEvent(organisationId, id);
        patch({ detail: result.event, detailLoading: false, detailError: "" });
      } catch (e) {
        patch({
          detail: null,
          detailLoading: false,
          detailError: e instanceof Error ? e.message : "Unable to open event",
        });
      }
    },
    [organisationId]
  );
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 1000);
    const focus = () => void refresh();
    window.addEventListener("focus", focus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [refresh]);
  const execute = useCallback(
    async <T,>(work: () => Promise<T>): Promise<T> => {
      const result = await work();
      await refresh();
      return result;
    },
    [refresh]
  );
  return {
    state,
    query,
    setQuery,
    selectedId,
    setSelectedId,
    refresh,
    loadDetail,
    execute,
    organisationId,
  };
}
const EventsContext = createContext<ReturnType<typeof useController> | null>(
  null
);
function ScopedProvider({
  organisationId,
  children,
}: {
  organisationId: string;
  children: React.ReactNode;
}) {
  const value = useController(organisationId);
  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}
export function EventsProvider({
  organisationId,
  sessionKey = "",
  children,
}: {
  organisationId: string;
  sessionKey?: string;
  children: React.ReactNode;
}) {
  return (
    <ScopedProvider
      key={`${organisationId}:${sessionKey}`}
      organisationId={organisationId}
    >
      {children}
    </ScopedProvider>
  );
}
export function useEvents() {
  const value = useContext(EventsContext);
  if (!value) throw new Error("EventsProvider is required");
  return value;
}

"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import * as api from "~/lib/events/api";
import type {
  EventCapabilities,
  EventListQuery,
  EventListResult,
  EventRecord,
  EventResult,
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
type Action = { type: "reset" } | { type: "patch"; payload: Partial<State> };
const reducer = (state: State, action: Action): State =>
  action.type === "reset" ? { ...initial } : { ...state, ...action.payload };
function useController(organisationId: string, sessionKey: string) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [query, setQuery] = useState<EventListQuery>({
    tab: "upcoming",
    q: "",
    date: "",
    page: 1,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scope = useRef(0),
    listRequest = useRef(0),
    detailRequest = useRef(0),
    clock = useRef({ server: Date.now(), local: Date.now() });
  const patch = useCallback(
    (payload: Partial<State>) => dispatch({ type: "patch", payload }),
    []
  );
  const setClock = useCallback(
    (serverNow: string) => {
      clock.current = { server: Date.parse(serverNow), local: Date.now() };
      patch({ now: Date.parse(serverNow) });
    },
    [patch]
  );
  const fail = useCallback(
    (error: unknown, detail = false) => {
      const e =
        error instanceof Error ? error : new Error("Unable to load events");
      if (
        error instanceof api.EventApiError &&
        [401, 403].includes(error.status)
      ) {
        listRequest.current++;
        detailRequest.current++;
        patch({
          capabilities: null,
          list: null,
          detail: null,
          loading: false,
          detailLoading: false,
          error: e.message,
        });
      } else
        patch(
          detail
            ? { detail: null, detailLoading: false, detailError: e.message }
            : { loading: false, error: e.message }
        );
    },
    [patch]
  );
  const refresh = useCallback(async () => {
    const generation = scope.current,
      request = ++listRequest.current;
    const current = () =>
      scope.current === generation && listRequest.current === request;
    if (!organisationId) return;
    let verifiedCapabilities = false;
    try {
      const capabilities = await api.getEventCapabilities(organisationId);
      if (!current()) return;
      setClock(capabilities.serverNow);
      verifiedCapabilities = true;
      patch({ capabilities, error: "" });
      if (!capabilities.enabled || !capabilities.canView) {
        detailRequest.current++;
        patch({ list: null, detail: null, loading: false });
        return;
      }
      const list = await api.listEvents(organisationId, query);
      if (!current()) return;
      setClock(list.serverNow);
      patch({
        list,
        featuredRevision: list.featuredRevision,
        loading: false,
        error: "",
      });
    } catch (error) {
      if (current()) {
        if (!verifiedCapabilities) {
          detailRequest.current++;
          patch({
            capabilities: null,
            list: null,
            detail: null,
            detailLoading: false,
          });
        }
        fail(error);
      }
    }
  }, [organisationId, query, patch, fail, setClock]);
  const loadDetail = useCallback(
    async (id: string) => {
      const generation = scope.current,
        request = ++detailRequest.current;
      patch({ detailLoading: true, detailError: "" });
      try {
        const result = await api.getEvent(organisationId, id);
        if (scope.current !== generation || detailRequest.current !== request)
          return;
        setClock(result.serverNow);
        patch({
          detail: result.event,
          featuredRevision: result.featuredRevision,
          detailLoading: false,
        });
      } catch (error) {
        if (scope.current === generation && detailRequest.current === request)
          fail(error, true);
      }
    },
    [organisationId, patch, fail, setClock]
  );
  const invalidateRequests = useCallback(() => {
    scope.current++;
    listRequest.current++;
    detailRequest.current++;
  }, []);
  useEffect(() => {
    invalidateRequests();
    dispatch({ type: "reset" });
    setQuery({ tab: "upcoming", q: "", date: "", page: 1 });
    setSelectedId(null);
    return invalidateRequests;
  }, [organisationId, sessionKey, invalidateRequests]);
  useEffect(() => {
    patch({ loading: true });
    void refresh();
  }, [refresh, patch]);
  const allowed = state.capabilities?.enabled && state.capabilities.canView;
  useEffect(() => {
    if (selectedId && allowed) {
      patch({ detail: null });
      void loadDetail(selectedId);
    } else {
      detailRequest.current++;
      patch({ detail: null, detailLoading: false, detailError: "" });
    }
  }, [selectedId, allowed, loadDetail, patch]);
  useEffect(() => {
    const update = () => {
      if (document.visibilityState !== "visible") return;
      void refresh();
      if (selectedId && allowed) void loadDetail(selectedId);
    };
    const timer = window.setInterval(update, 30000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    const tick = window.setInterval(
      () =>
        patch({ now: clock.current.server + Date.now() - clock.current.local }),
      1000
    );
    return () => {
      clearInterval(timer);
      clearInterval(tick);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [refresh, loadDetail, selectedId, allowed, patch]);
  const boundaryEvent = state.detail;
  useEffect(() => {
    if (!boundaryEvent || !selectedId || !allowed) return;
    const serverNow = clock.current.server + Date.now() - clock.current.local;
    const boundary = [
      boundaryEvent.joinOpensAt,
      boundaryEvent.startsAt,
      boundaryEvent.endsAt,
    ]
      .filter((value): value is string => !!value)
      .map(Date.parse)
      .filter((value) => value > serverNow)
      .sort((a, b) => a - b)[0];
    if (!boundary) return;
    const timer = setTimeout(
      () => {
        void loadDetail(selectedId);
        void refresh();
      },
      Math.min(boundary - serverNow + 20, 2147483647)
    );
    return () => clearTimeout(timer);
  }, [boundaryEvent, selectedId, allowed, loadDetail, refresh]);
  const execute = useCallback(
    async <T,>(work: () => Promise<T>): Promise<T> => {
      const generation = scope.current;
      try {
        const result = await work();
        if (generation !== scope.current)
          throw new api.EventApiError(
            0,
            "Organisation changed. Please try again."
          );
        listRequest.current++;
        detailRequest.current++;
        if (result && typeof result === "object" && "event" in result) {
          const data = result as unknown as EventResult;
          setClock(data.serverNow);
          patch({
            detail: data.event,
            featuredRevision: data.featuredRevision,
          });
        }
        void refresh();
        if (
          !(result && typeof result === "object" && "event" in result) &&
          selectedId
        )
          void loadDetail(selectedId);
        return result;
      } catch (error) {
        if (
          generation === scope.current &&
          error instanceof api.EventApiError &&
          [401, 403].includes(error.status)
        )
          fail(error);
        throw error;
      }
    },
    [refresh, patch, setClock, fail, selectedId, loadDetail]
  );
  return {
    state,
    organisationId,
    query,
    setQuery,
    selectedId,
    setSelectedId,
    refresh,
    loadDetail,
    execute,
  };
}
const EventsContext = createContext<ReturnType<typeof useController> | null>(
  null
);
function ScopedProvider({
  organisationId,
  sessionKey,
  children,
}: {
  organisationId: string;
  sessionKey: string;
  children: React.ReactNode;
}) {
  const value = useController(organisationId, sessionKey);
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
      sessionKey={sessionKey}
    >
      {children}
    </ScopedProvider>
  );
}
export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("EventsProvider is required");
  return ctx;
}

"use client";
import { useContext } from "react";
import { DataContext } from "~/store/GlobalState";
import { withAuthGate } from "~/components/rbac/withAuthGate";
import { EventsProvider } from "../_components/events/events-provider";
import { EventsHub } from "../_components/events/events-hub";
function EventsPage() {
  const { state } = useContext(DataContext);
  if (!state.orgId || !state.token) return null;
  return (
    <div className="pt-[60px] lg:ml-[90px]">
      <EventsProvider organisationId={state.orgId} sessionKey={state.token}>
        <EventsHub />
      </EventsProvider>
    </div>
  );
}
export default withAuthGate(EventsPage, { requiredPermission: "view:events" });

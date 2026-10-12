"use client";
import { useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { DataContext } from "~/store/GlobalState";
import { getEventCapabilities } from "~/lib/events/api";
import { cn } from "~/lib/utils";
export function EventsNavLink() {
  const { state } = useContext(DataContext),
    pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const scope = `${state.orgId}:${state.token}`,
    [resolved, setResolved] = useState("");
  useEffect(() => {
    let current = true;
    setVisible(false);
    async function load() {
      if (!state.orgId || !state.token) return;
      try {
        const caps = await getEventCapabilities(state.orgId);
        if (current) {
          setResolved(scope);
          setVisible(caps.enabled && caps.canView);
        }
      } catch {
        if (current) setVisible(false);
      }
    }
    void load();
    const onFocus = () => {
      if (document.visibilityState === "visible") void load();
    };
    const timer = setInterval(onFocus, 30000);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      current = false;
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [state.orgId, state.token, scope]);
  if (!visible || resolved !== scope || !state.orgSlug) return null;
  return (
    <Link
      href={`/${encodeURIComponent(state.orgSlug)}/settings/events`}
      aria-label="Learning / Events Hub"
      aria-current={pathname.endsWith("/settings/events") ? "page" : undefined}
      className="flex flex-col items-center justify-center p-1 text-white"
    >
      <span
        className={cn(
          "rounded-lg p-2",
          pathname.endsWith("/settings/events") && "bg-blue-200"
        )}
      >
        <CalendarDays className="size-6" />
      </span>
      <span className="text-xs">Learning</span>
    </Link>
  );
}

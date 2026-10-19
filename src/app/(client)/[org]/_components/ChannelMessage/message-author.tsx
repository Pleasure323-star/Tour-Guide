"use client";

import { useContext } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { DataContext } from "~/store/GlobalState";
import { findOrgMemberForUser, getUserStatus } from "~/utils/user-status";

type MessageAuthorProps = {
  item: {
    user_id?: string | number;
    username?: string;
    email?: string;
    [key: string]: unknown;
  };
  onClick?: () => void;
  className?: string;
  nameClassName?: string;
};

const formatStatusExpiry = (statusSource?: Record<string, unknown> | null) => {
  const timeout = String(statusSource?.status_timeout ?? "").trim();
  const normalizedTimeout = timeout.toLowerCase().replace(/[’']/g, "'");
  const simpleClearLabels: Record<string, string> = {
    "30 minutes": "Clears in 30 min",
    "1 hour": "Clears in 1 hour",
    today: "Clears today",
    "this week": "Clears this week",
    "dont-clear": "Doesn’t clear",
    "don't clear": "Doesn’t clear",
  };

  if (simpleClearLabels[normalizedTimeout]) {
    return simpleClearLabels[normalizedTimeout];
  }

  const durationMatch = normalizedTimeout.match(
    /^(\d+)\s*(minute|minutes|hour|hours|day|days|week|weeks)$/
  );
  if (durationMatch) {
    const [, amount, unit] = durationMatch;
    const singularUnit = unit.endsWith("s") ? unit.slice(0, -1) : unit;
    return `Clears in ${amount} ${Number(amount) === 1 ? singularUnit : `${singularUnit}s`}`;
  }

  const rawExpiry =
    statusSource?.status_expiry ?? statusSource?.expiry ?? timeout;

  if (rawExpiry != null && rawExpiry !== "") {
    const numericExpiry = Number(rawExpiry);

    if (Number.isFinite(numericExpiry) && numericExpiry <= 0) return "";

    if (Number.isFinite(numericExpiry) && numericExpiry < 946_684_800) {
      const minutes = Math.max(1, Math.ceil(numericExpiry / 60));

      if (minutes % 60 === 0) {
        const hours = minutes / 60;
        return `Clears in ${hours} ${hours === 1 ? "hour" : "hours"}`;
      }

      return `Clears in ${minutes} min`;
    }

    const date = Number.isFinite(numericExpiry)
      ? new Date(
          numericExpiry < 1_000_000_000_000
            ? numericExpiry * 1000
            : numericExpiry
        )
      : new Date(String(rawExpiry));

    if (!Number.isNaN(date.getTime())) {
      const now = new Date();
      const time = new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(date);

      const day = new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
      }).format(date);

      return `Clears ${day} at ${time}`;
    }
  }

  return "";
};

const MessageAuthor = ({
  item,
  onClick,
  className,
  nameClassName,
}: MessageAuthorProps) => {
  const { state } = useContext(DataContext);
  const { orgMembers, mentionOrgMembers, user } = state;

  const member =
    findOrgMemberForUser(orgMembers, item) ??
    findOrgMemberForUser(mentionOrgMembers, item);
  const authorId = item?.user_id;
  const currentUserId = user?.user_id ?? user?.id;
  const isCurrentUser =
    authorId != null && String(authorId) === String(currentUserId);
  const currentUserStatus = isCurrentUser ? getUserStatus(user) : null;
  const statusSource =
    isCurrentUser && currentUserStatus
      ? user
      : (member ?? (isCurrentUser ? user : null));
  const status = getUserStatus(statusSource);
  const statusIcon = status?.emoji || (status?.text ? "💬" : "");
  const statusLabel = status?.text || "Custom status";
  const clearLabel = formatStatusExpiry(
    statusSource as Record<string, unknown> | null
  );

  return (
    <div className={cn("flex min-w-0 items-center gap-1", className)}>
      <span
        className={cn(
          "shrink-0 text-[15px] font-bold text-[#1D2939]",
          onClick && "cursor-pointer",
          nameClassName
        )}
        onClick={onClick}
      >
        {item?.username || item?.email}
      </span>

      {statusIcon && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                role="img"
                aria-label={`Custom status: ${statusLabel}`}
                className="shrink-0 cursor-default text-base leading-none"
              >
                {statusIcon}
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-64 rounded-lg px-3 py-2 text-center"
            >
              <span className="flex flex-col items-center gap-0.5">
                <span className="break-words font-semibold leading-snug">
                  <span aria-hidden="true" className="mr-1.5">
                    {statusIcon}
                  </span>
                  {statusLabel}
                </span>
                {clearLabel && (
                  <span className="text-xs text-muted-foreground">
                    {clearLabel}
                  </span>
                )}
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default MessageAuthor;

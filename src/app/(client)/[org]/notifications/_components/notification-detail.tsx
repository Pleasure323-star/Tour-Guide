"use client";

import Link from "next/link";
import { useContext } from "react";
import moment from "moment";
import { ArrowRight, Hash, Lock, MessageSquare } from "lucide-react";
import FallbackImage from "~/components/layout/fallback-image";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { DataContext } from "~/store/GlobalState";

type NotificationRecord = {
  title: string;
  message: string;
  avatar_url?: string;
  status?: string;
  sent_at?: string;
  created_at?: string;
  payload?: Record<string, unknown>;
};

import {
  resolveNotificationRoute,
  storeMessageHighlightId,
} from "~/lib/onesignal/notification-route";

const getString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const getTypeLabel = (type: string | null) => {
  switch (type) {
    case "dm":
      return "Direct message";
    case "channel":
      return "Channel message";
    case "mention":
      return "Mention";
    default:
      return "Message";
  }
};

export default function NotificationDetail({
  notification,
}: {
  notification: NotificationRecord;
}) {
  const { state } = useContext(DataContext);
  const payload = notification.payload || {};

  const senderName =
    getString(payload.sender_name) || notification.title || "Unknown";
  const avatarUrl =
    getString(payload.avatar_url) ||
    getString(payload.default_avatar_url) ||
    "";
  const channelName = getString(payload.channel_name);
  const type = getString(payload.notification_type);
  const sentAt = notification.sent_at || notification.created_at;
  const route = resolveNotificationRoute(payload, null, state.orgSlug || "");
  const typeLabel = getTypeLabel(type);
  const isDm = type === "dm";

  return (
    <div className="flex h-[calc(100dvh-70px)] w-full flex-col bg-white">
      <div className="shrink-0 border-b border-[#E6EAEF] px-5 py-4">
        <h1 className="text-[22px] font-bold text-[#1D2939]">Notification</h1>
        {sentAt && (
          <p className="mt-0.5 text-[13px] text-[#667085]">
            {moment(sentAt).format("dddd, MMM D · h:mm A")}
          </p>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-b border-[#E6EAEF] bg-white">
          <div className="flex items-center gap-2 border-b border-[#E6EAEF] bg-[#F9FAFB] px-5 py-3">
            {isDm ? (
              <Lock className="size-3.5 text-[#667085]" />
            ) : (
              <Hash className="size-3.5 text-[#667085]" />
            )}
            <span className="text-[13px] font-semibold text-[#344054]">
              {typeLabel}
            </span>
            {channelName && (
              <>
                <span className="text-[#D0D5DD]">·</span>
                <span className="truncate text-[13px] text-[#667085]">
                  {channelName}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-1 items-start gap-3 overflow-y-auto px-5 py-5">
            <FallbackImage
              src={avatarUrl}
              alt={senderName}
              userType="user"
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-[7px] border object-cover object-top"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-[#1D2939]">
                  {senderName}
                </span>
                {sentAt && (
                  <span className="text-xs text-[#98A2B3]">
                    {moment(sentAt).format("h:mm A")}
                  </span>
                )}
              </div>

              <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-7 text-[#344054]">
                {notification.message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 bg-[#F9FAFB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-white text-[#667085] shadow-sm">
              <MessageSquare className="size-4" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#1D2939]">
                {channelName || senderName}
              </p>
              <p className="mt-0.5 text-[13px] text-[#667085]">
                {isDm
                  ? "Reply in your direct message conversation."
                  : "View this message in its channel."}
              </p>
            </div>
          </div>

          {route ? (
            <Button
              asChild
              className="h-10 shrink-0 bg-[#7141F8] px-4 text-white hover:bg-[#5F35D6]"
            >
              <Link
                href={route}
                onClick={() => storeMessageHighlightId(payload)}
              >
                Open conversation
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          ) : (
            <span
              className={cn(
                "text-[13px] capitalize text-[#667085]",
                notification.status === "pending" && "text-[#B54708]"
              )}
            >
              {notification.status || "No action available"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

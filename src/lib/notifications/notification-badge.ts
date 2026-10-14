type NotificationLike = Record<string, unknown> | null | undefined;

const seenNotificationKeys = new Set<string>();

export const isHomeRoute = (pathname: string | null | undefined): boolean => {
  if (!pathname) return false;
  return /\/home(\/|$)/.test(pathname);
};

export const isNotificationsRoute = (
  pathname: string | null | undefined
): boolean => {
  if (!pathname) return false;
  return /\/notifications(\/|$)/.test(pathname);
};

const getString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

export const getNotificationBadgeKey = (payload: NotificationLike): string => {
  if (!payload) return "";

  const nested =
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
      ? (payload.data as Record<string, unknown>)
      : {};

  const notificationType =
    getString(payload.notification_type) || getString(payload.event);
  const channelId =
    getString(payload.channel_id) ||
    getString(payload.channels_id) ||
    getString(nested.channel_id) ||
    getString(nested.channels_id);
  const messageId =
    getString(payload.message_id) ||
    getString(payload.messages_id) ||
    getString(payload.thread_id) ||
    getString(nested.message_id) ||
    getString(nested.messages_id) ||
    getString(nested.thread_id);
  const senderId =
    getString(payload.sender_id) ||
    getString(payload.participant_id) ||
    getString(nested.sender_id) ||
    getString(nested.participant_id);

  return [notificationType, channelId, messageId, senderId]
    .filter(Boolean)
    .join(":");
};

export const shouldIncrementNotificationBadge = (
  payload: NotificationLike
): boolean => {
  if (!payload) return false;

  const notificationType =
    getString(payload.notification_type) || getString(payload.event);
  const section = getString(payload.section);

  if (notificationType === "new_message") return true;
  if (notificationType === "dm") return true;
  if (notificationType === "mention") return true;
  if (notificationType === "direct_call_initiated") return true;
  if (notificationType === "direct_call_initialized") return true;

  if (
    section === "thread_message" &&
    (notificationType === "new_message" || notificationType === "mention")
  ) {
    return true;
  }

  return false;
};

export const registerNotificationBadge = (
  payload: NotificationLike
): boolean => {
  if (!shouldIncrementNotificationBadge(payload)) return false;

  const key =
    getNotificationBadgeKey(payload) ||
    `notification:${Date.now()}:${Math.random().toString(36).slice(2)}`;

  if (seenNotificationKeys.has(key)) return false;

  seenNotificationKeys.add(key);
  return true;
};

export const clearNotificationBadgeRegistry = () => {
  seenNotificationKeys.clear();
};

import React from "react";
import { parseMessageLink } from "~/utils/message-link";

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<"]+/gi;
const URL_SPLIT_REGEX = /((?:https?:\/\/|www\.)[^\s<"]+)/gi;

const trimTrailingPunctuation = (url: string) =>
  url.replace(/['">,.;!?)}\]]+$/, "");

const normalizeHref = (url: string) => {
  const cleaned = trimTrailingPunctuation(url);
  return cleaned.startsWith("www.") ? `https://${cleaned}` : cleaned;
};

const getLinkTarget = (href: string) => {
  if (typeof window === "undefined") {
    return { href, openInNewTab: true, isMessageLink: false };
  }

  try {
    const parsed = new URL(href);
    const messageLink = parseMessageLink(parsed.toString());

    if (parsed.origin === window.location.origin && messageLink) {
      return {
        href: `${parsed.pathname}${parsed.search}${parsed.hash}`,
        openInNewTab: false,
        isMessageLink: true,
      };
    }

    if (parsed.origin === window.location.origin) {
      return {
        href: `${parsed.pathname}${parsed.search}${parsed.hash}`,
        openInNewTab: false,
        isMessageLink: false,
      };
    }
  } catch {
    // fall through
  }

  return { href, openInNewTab: true, isMessageLink: false };
};

type LinkifyOptions = {
  onMessageLinkClick?: (href: string) => void;
};

export function linkifyText(
  text: string,
  options?: LinkifyOptions
): React.ReactNode {
  if (!URL_PATTERN.test(text)) return text;

  URL_PATTERN.lastIndex = 0;

  const parts = text.split(URL_SPLIT_REGEX);

  return parts.map((part, index) => {
    if (!part || !/^(?:https?:\/\/|www\.)/i.test(part)) {
      return part;
    }

    const href = normalizeHref(part);
    const { href: linkHref, openInNewTab, isMessageLink } = getLinkTarget(href);

    if (isMessageLink && options?.onMessageLinkClick) {
      return (
        <a
          key={`link-${index}-${part.slice(0, 24)}`}
          href={linkHref}
          onClick={(event) => {
            event.preventDefault();
            options.onMessageLinkClick?.(linkHref);
          }}
          className="smart-link-pill"
          title={linkHref}
        >
          {part}
        </a>
      );
    }

    return (
      <a
        key={`link-${index}-${part.slice(0, 24)}`}
        href={linkHref}
        {...(openInNewTab
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="smart-link-pill"
        title={linkHref}
      >
        {part}
      </a>
    );
  });
}

"use client";

import { Lock } from "lucide-react";
import React, { useContext, useEffect, useRef } from "react";
import { DataContext } from "~/store/GlobalState";

const RestrictedChannel = () => {
  const { state } = useContext(DataContext);
  const channelName = state?.channelDetails?.name;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateHeight = () => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty(
        "--chat-composer-height",
        `${height + 8}px`
      );
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--chat-composer-height");
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative z-20 w-full bg-white pb-3 dark:bg-[#1A1D21]"
    >
      <div className="mx-3 md:mx-5 flex min-h-[44px] items-center justify-center gap-3 rounded-md border border-[#E6EAEF] bg-[#F9FAFB] px-4 py-1 text-xs dark:border-white/10 dark:bg-[#222529]">
        <div className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-[#5757CD] dark:bg-[#5757CD]/20">
          <Lock className="h-4 w-4" />
        </div>
        <span>
          <strong className="font-semibold text-black dark:text-zinc-100">
            Only admins can post in this channel.
          </strong>{" "}
          <span className="text-[#667085] dark:text-zinc-400">
            You can only read messages
          </span>
        </span>
      </div>
    </div>
  );
};

export default RestrictedChannel;

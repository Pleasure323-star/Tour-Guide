"use client";

import { useContext, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  LinkIcon,
  Loader,
  Plus,
  Video,
} from "lucide-react";
import { showError, showInfo } from "~/components/toast/sonner";
import { PostRequest } from "~/utils/new-request";
import { DataContext } from "~/store/GlobalState";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  navigateBuzzTab,
  openBuzzInNewTab,
  prepareBuzzTab,
} from "~/lib/buzz/open-buzz-tab";

export default function MeetingPage() {
  const [roomId, setRoomId] = useState("");
  const [startLoading, setStartLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [isLaterModalOpen, setIsLaterModalOpen] = useState(false);
  const [laterMeetingLink, setLaterMeetingLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { state } = useContext(DataContext);
  const { orgSlug } = state;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !orgSlug) return;

    setJoinLoading(true);

    let extractedId = roomId.trim();
    if (extractedId.includes("/")) {
      const parts = extractedId.split("/");
      extractedId = parts[parts.length - 1] || extractedId;
    }

    openBuzzInNewTab(orgSlug, extractedId);
    setJoinLoading(false);
  };

  const handleCreateMeeting = async (type: "instant" | "later") => {
    if (!orgSlug) return;

    setStartLoading(true);

    const tab = type === "instant" ? prepareBuzzTab() : null;
    if (type === "instant" && !tab) {
      setStartLoading(false);
      return;
    }

    try {
      const createRes = await PostRequest("/buzz/org/create", {});

      if (createRes.status !== 200 && createRes.status !== 201) {
        tab?.close();
        setStartLoading(false);
        return;
      }

      const buzzId = createRes.data.data.buzz_code;

      if (type === "instant") {
        navigateBuzzTab(tab, orgSlug, buzzId, { directJoin: true });
        setStartLoading(false);
      } else {
        const baseUrl =
          process.env.NEXT_PUBLIC_CLIENT_URL || window.location.origin;
        setLaterMeetingLink(`${baseUrl}/${orgSlug}/buzz/${buzzId}`);
        setIsLaterModalOpen(true);
        setStartLoading(false);
      }
    } catch (error) {
      tab?.close();
      showError("Failed to create meeting. Please try again.");
      setStartLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(laterMeetingLink);
      setCopied(true);
      showInfo("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showError("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-white via-white to-primary-50/40 px-4 py-10 dark:from-zinc-950 dark:via-zinc-950 dark:to-[#211a3b] sm:px-6 md:pt-16 lg:pt-20">
      <div className="mx-auto flex max-w-[1040px] flex-col items-center text-center">
        <h1 className="max-w-[900px] text-3xl font-semibold leading-tight tracking-[-0.02em] text-[#1f174d] dark:text-zinc-100 sm:text-4xl lg:text-5xl">
          Seamless video calls and meetings
          <span className="block text-primary-500">
            for every learning community.
          </span>
        </h1>
        <p className="mt-4 max-w-[660px] text-base text-[#777493] dark:text-zinc-400 sm:text-lg lg:text-xl">
          Connect classrooms, cohorts, and teams in one shared space
        </p>

        <div className="mt-9 flex w-full max-w-[860px] flex-col items-stretch justify-center gap-3 sm:mt-10 md:flex-row md:items-center md:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                disabled={startLoading}
                className="h-14 w-full shrink-0 gap-3 rounded-xl bg-primary-500 px-6 text-base text-white shadow-sm hover:bg-primary-400 focus-visible:ring-primary-300 disabled:bg-primary-300 md:w-[240px]"
              >
                {startLoading ? (
                  <Loader className="size-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Video className="size-5" aria-hidden="true" />
                )}
                New meeting
                <ChevronDown className="ml-auto size-5" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-60 p-1 shadow-xl border-none"
            >
              <div className="flex flex-col">
                <button
                  onClick={() => handleCreateMeeting("later")}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-white/10 transition text-sm text-[#3c4043] dark:text-zinc-200"
                >
                  <LinkIcon size={18} />
                  Create a meeting for later
                </button>
                <button
                  onClick={() => handleCreateMeeting("instant")}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-white/10 transition text-sm text-[#3c4043] dark:text-zinc-200"
                >
                  <Plus size={18} />
                  Start an instant meeting
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <form
            onSubmit={handleJoin}
            className="flex w-full flex-col items-stretch gap-3 sm:flex-row md:gap-4"
          >
            <label className="relative block min-w-0 flex-1 md:w-[320px]">
              <span className="sr-only">Meeting code or link</span>
              <LinkIcon
                className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#85819e]"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Enter a code or link"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="h-14 w-full rounded-xl border border-[#dedaf2] bg-white pl-12 pr-4 text-base text-[#302b50] outline-none transition placeholder:text-[#8e8aa5] focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </label>

            <Button
              type="submit"
              disabled={!roomId || joinLoading}
              variant="outline"
              className="h-14 w-full shrink-0 gap-2 rounded-xl border-[#dedaf2] bg-white px-7 text-base font-semibold text-primary-500 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-500 focus-visible:ring-primary-300 disabled:text-zinc-400 dark:border-white/15 dark:bg-zinc-900 dark:hover:bg-white/10 sm:w-28"
            >
              {joinLoading && (
                <Loader className="size-5 animate-spin" aria-hidden="true" />
              )}
              {joinLoading ? "Joining..." : "Join"}
            </Button>
          </form>
        </div>

        <div className="mt-8 flex w-full justify-center sm:mt-10 md:mt-12">
          <div className="relative aspect-[3/2] w-full max-w-[960px]">
            <Image
              src="/image/buzz-meeting-illustration.webp"
              alt="Student joining an online classroom video call"
              fill
              sizes="(max-width: 768px) 100vw, 960px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      <Dialog open={isLaterModalOpen} onOpenChange={setIsLaterModalOpen}>
        <DialogContent className="sm:max-w-md p-6 border-none">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-base font-normal text-[#202124] dark:text-zinc-100">
              Here's the link to your meeting
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[#5f6368]">
              Copy this link and send it to people you want to meet with. Be
              sure to save it so you can use it later, too.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#f1f3f4] dark:bg-[#2C2D30] rounded-md p-3 gap-2 group">
              <span className="text-sm text-[#3c4043] dark:text-zinc-200 break-all w-full sm:max-w-80">
                {laterMeetingLink}
              </span>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-zinc-200 rounded-full transition-colors self-end sm:self-auto shrink-0"
                title="Copy meeting link"
              >
                {copied ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} className="text-[#5f6368]" />
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

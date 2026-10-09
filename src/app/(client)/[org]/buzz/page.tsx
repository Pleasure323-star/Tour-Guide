"use client";

import { useContext, useState } from "react";
import { Check, Copy, Keyboard, LinkIcon, Loader, Plus } from "lucide-react";
import { showError, showInfo } from "~/components/toast/sonner";
import { PostRequest } from "~/utils/new-request";
import { DataContext } from "~/store/GlobalState";
import Image from "next/image";
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
  const [joinError, setJoinError] = useState("");
  const [startLoading, setStartLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [isLaterModalOpen, setIsLaterModalOpen] = useState(false);
  const [laterMeetingLink, setLaterMeetingLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { state } = useContext(DataContext);
  const { orgSlug } = state;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgSlug) return;

    let extractedId = roomId.trim();
    if (extractedId.includes("/")) {
      try {
        const url = new URL(extractedId, window.location.origin);
        extractedId =
          url.protocol === "http:" || url.protocol === "https:"
            ? url.pathname.match(/^\/[^/]+\/buzz\/([^/]+)\/?$/)?.[1] || ""
            : "";
      } catch {
        extractedId = "";
      }
    }

    if (!/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(extractedId)) {
      setJoinError("Enter a valid Buzz code or link.");
      return;
    }

    setJoinError("");
    setJoinLoading(true);
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
    <div className="min-h-screen px-4 py-12 md:p-6 md:pt-20">
      <div className="mx-auto max-w-[800px] flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl font-normal text-[#202124] dark:text-zinc-100 leading-snug">
          Seamless video calls and meetings for every learning community.
        </h1>
        <p className="text-base md:text-lg text-zinc-500 mt-4 md:mt-2 max-w-[600px]">
          Connect classrooms, cohorts, and teams in one shared space
        </p>

        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mt-10 md:mt-12">
          <Popover>
            <PopoverTrigger asChild>
              <button
                disabled={startLoading}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-md font-medium transition whitespace-nowrap"
              >
                {startLoading ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 14 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.7002 7.03353V5.23353C12.7002 4.11342 12.7002 3.55337 12.4822 3.12555C12.2905 2.74922 11.9845 2.44326 11.6082 2.25152C11.1804 2.03353 10.6203 2.03353 9.5002 2.03353H3.9002C2.78009 2.03353 2.22004 2.03353 1.79221 2.25152C1.41589 2.44326 1.10993 2.74922 0.918182 3.12555C0.700195 3.55337 0.700195 4.11342 0.700195 5.23353V10.8335C0.700195 11.9536 0.700195 12.5137 0.918182 12.9415C1.10993 13.3178 1.41589 13.6238 1.79221 13.8155C2.22004 14.0335 2.78009 14.0335 3.9002 14.0335H7.03353M12.7002 6.03353H0.700195M9.36686 0.700195V3.36686M4.03353 0.700195V3.36686M10.7002 13.3669V9.36686M8.7002 11.3669H12.7002"
                      stroke="white"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                New meeting
              </button>
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
            className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-center"
          >
            <div className="relative w-full md:w-auto">
              <Keyboard
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Enter a code or link"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setJoinError("");
                }}
                aria-invalid={Boolean(joinError)}
                aria-describedby={joinError ? "buzz-join-error" : undefined}
                className="w-full md:w-64 pl-10 pr-4 py-3.5 border border-zinc-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
              />
              {joinError && (
                <p
                  id="buzz-join-error"
                  role="alert"
                  className="absolute left-0 top-full mt-1 text-left text-sm text-red-600"
                >
                  {joinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!roomId || joinLoading}
              className="flex itms-center justify-center gap-1 w-full md:w-auto text-blue-600 font-semibold disabled:text-zinc-400 hover:text-blue-700 transition px-2 py-2"
            >
              {joinLoading && <Loader size={20} className="animate-spin" />}
              {joinLoading ? "Joining..." : "Join"}
            </button>
          </form>
        </div>

        <div className="w-full mt-12 md:mt-20 flex justify-center px-4">
          <div className="relative w-full max-w-[800px] aspect-[16/10]">
            <Image
              src="/image/meeting-image.png"
              alt="Meetings Illustration"
              fill
              className="object-contain opacity-95"
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

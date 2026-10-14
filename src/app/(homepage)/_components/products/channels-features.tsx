import Image from "next/image";
import type { ReactNode } from "react";
import { Check, Megaphone } from "lucide-react";
import { cn } from "~/lib/utils";

const AVATAR_ADEYEMI = "/images/homepage/products/channels/avatar-adeyemi.jpg";
const AVATAR_CHIAMAKA =
  "/images/homepage/products/channels/avatar-chiamaka.jpg";

// Shared surface for the white cards that float above the tinted panels.
const raisedCard = "bg-white shadow-[0_20px_40px_rgba(31,37,48,0.10)]";

const ChannelGroup = ({ label }: { label: string }) => (
  <p className="px-2.5 pb-1 pt-3 text-[11px] font-bold tracking-[0.08em] text-[#5A6170] first:pt-1">
    {label}
  </p>
);

const ChannelRow = ({ name, active }: { name: string; active?: boolean }) => (
  <p
    className={cn(
      "rounded-[10px] px-3 py-2.5",
      active && "bg-primary-500 font-bold text-white"
    )}
  >
    # {name}
  </p>
);

const OrganiseVisual = () => (
  <div
    className={cn(
      "flex w-full max-w-[380px] flex-col gap-1.5 rounded-[18px] border border-slate-200 bg-white p-5 text-[15px]",
      raisedCard
    )}
  >
    <ChannelGroup label="COURSES" />
    <ChannelRow name="cs-101" active />
    <ChannelRow name="maths-201" />
    <ChannelGroup label="COHORTS" />
    <ChannelRow name="cohort-7" />
    <ChannelGroup label="DEPARTMENTS" />
    <ChannelRow name="faculty-of-science" />
  </div>
);

const ThreadMessage = ({
  avatar,
  name,
  meta,
  text,
  small,
}: {
  avatar: string;
  name: string;
  meta: string;
  text: string;
  small?: boolean;
}) => (
  <div className={cn("flex", small ? "gap-2.5" : "gap-3")}>
    <Image
      src={avatar}
      alt={name}
      width={small ? 34 : 40}
      height={small ? 34 : 40}
      className={cn(
        "shrink-0 object-cover",
        small ? "h-[34px] w-[34px] rounded-[10px]" : "h-10 w-10 rounded-xl"
      )}
    />
    <div className="flex flex-col gap-1">
      <p className="text-sm">
        <strong className="font-bold">{name}</strong>{" "}
        <span className="text-xs text-[#5A6170]">{meta}</span>
      </p>
      <p className="text-sm leading-normal text-[#344054]">{text}</p>
    </div>
  </div>
);

const ThreadsVisual = () => (
  <div
    className={cn(
      "flex w-full max-w-[420px] flex-col gap-4 rounded-[18px] border border-slate-200 bg-white p-[22px]",
      raisedCard
    )}
  >
    <ThreadMessage
      avatar={AVATAR_CHIAMAKA}
      name="Chiamaka"
      meta="Student · 9:15"
      text="Can we use while loops for question 3, or only for loops?"
    />
    <div className="ml-[52px] border-l-2 border-slate-200 pl-3.5">
      <ThreadMessage
        avatar={AVATAR_ADEYEMI}
        name="Mr. Adeyemi"
        meta="Instructor · 9:18"
        text="Both are allowed. Explain your choice in a comment."
        small
      />
    </div>
    <p className="ml-[66px] flex items-center gap-1 text-[13px] font-bold text-[#0E7A52]">
      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
      Resolved in thread · 3 replies
    </p>
  </div>
);

const AnnouncementVisual = () => (
  <div
    className={cn(
      "flex w-full max-w-[420px] flex-col gap-3 rounded-[18px] border border-[#F2E2C6] bg-white p-[22px]",
      raisedCard
    )}
  >
    <p className="flex items-center gap-2 text-xs font-bold tracking-[0.06em] text-[#9A5800]">
      <Megaphone className="h-4 w-4 shrink-0" aria-hidden="true" />
      PINNED ANNOUNCEMENT · #announcements
    </p>
    <p className="text-lg font-bold">Mid-semester exams start Monday</p>
    <p className="text-sm leading-[1.55] text-[#5A6170]">
      Timetables are in the Files tab. Bring your student ID to every paper.
    </p>
    <div className="flex items-center justify-between gap-3 border-t border-[#F2ECE0] pt-3 text-[13px] text-[#5A6170]">
      <span>Dr. Bello · Head of Department</span>
      <span className="shrink-0 font-bold text-[#0E7A52]">Seen by 412</span>
    </div>
  </div>
);

const sizeRows = [
  { name: "study-group", members: "6 members", indent: "" },
  { name: "cs-101", members: "128 members", indent: "ml-6" },
  {
    name: "faculty-of-science",
    members: "2,400 members",
    indent: cn("ml-12", raisedCard),
  },
];

const SizeVisual = () => (
  <div className="flex w-full max-w-[420px] flex-col gap-3">
    {sizeRows.map((row) => (
      <div
        key={row.name}
        className={cn(
          "flex items-center justify-between gap-3 rounded-[14px] border border-slate-200 bg-white px-[18px] py-4 text-[15px]",
          row.indent
        )}
      >
        <strong className="min-w-0 truncate font-bold"># {row.name}</strong>
        <span className="shrink-0 text-sm text-[#5A6170]">{row.members}</span>
      </div>
    ))}
  </div>
);

const features: {
  label: string;
  title: string;
  desc: string;
  panel: string;
  visual: ReactNode;
}[] = [
  {
    label: "01 · Organise",
    title: "Keep every conversation in the right place",
    desc: "Create channels by subject, class, project or department. Students jump straight to the right room instead of digging through one endless group chat.",
    panel: "bg-[#EAEAFE]",
    visual: <OrganiseVisual />,
  },
  {
    label: "02 · Threads",
    title: "Follow discussions without the noise",
    desc: "Reply directly to a specific message. Questions and answers stay together, and the main channel stays easy to read.",
    panel: "bg-[#E6F4EE]",
    visual: <ThreadsVisual />,
  },
  {
    label: "03 · Announcements",
    title: "Share updates students can't miss",
    desc: "Professors, teachers and mentors post announcements straight into the right channel, so important news never gets buried.",
    panel: "bg-[#FFF1DD]",
    visual: <AnnouncementVisual />,
  },
  {
    label: "04 · Any size",
    title: "From a study group to a whole faculty",
    desc: "Channels support structured discussion at every scale, from small classrooms to large university programmes.",
    panel: "bg-[#E8F0FD]",
    visual: <SizeVisual />,
  },
];

export const ChannelsFeatures = () => {
  return (
    <section
      aria-labelledby="channels-features-heading"
      className="bg-[#FAFAFF] text-[#1F2530]"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-6 pb-16 pt-20 lg:gap-[88px] lg:pt-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-[13px] font-bold tracking-[0.12em] text-primary-500">
            WHY CHANNELS
          </p>
          <h2
            id="channels-features-heading"
            className="max-w-[760px] text-[clamp(2rem,3.6vw,3rem)] font-black leading-[1.1] tracking-[-0.03em]"
          >
            Organised communication, built for how learning actually happens
          </h2>
          <p className="max-w-[620px] text-lg leading-relaxed text-[#5A6170]">
            Give every course, cohort and project its own space, so students and
            educators always know where to look.
          </p>
        </div>

        {features.map((feature, index) => (
          // Text comes first in the DOM, so mobile and screen readers get text
          // then visual. On desktop, even blocks flip the visual to the left.
          <div
            key={feature.label}
            className={cn(
              "flex flex-col gap-8 lg:items-center lg:gap-14",
              index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
            )}
          >
            <div className="flex min-w-0 flex-col gap-[18px] lg:flex-[1_1_420px]">
              <p className="self-start rounded-full bg-[#EEF0FF] px-3 py-1.5 text-[13px] font-bold text-primary-500">
                {feature.label}
              </p>
              <h3 className="text-[32px] font-bold leading-[1.15] tracking-[-0.02em]">
                {feature.title}
              </h3>
              <p className="text-[17px] leading-[1.65] text-[#5A6170]">
                {feature.desc}
              </p>
            </div>
            <div
              className={cn(
                "flex min-w-0 justify-center rounded-[28px] p-5 sm:p-10 lg:flex-[1_1_480px]",
                feature.panel
              )}
            >
              {feature.visual}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

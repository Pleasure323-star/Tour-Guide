import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ClipboardCheck,
  Folder,
  Mic,
  Sparkles,
} from "lucide-react";
import { cn } from "~/lib/utils";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAFF]";

const products: {
  name: string;
  desc: string;
  href?: string;
  icon: LucideIcon;
  iconClass: string;
}[] = [
  {
    name: "Buzz",
    desc: "Instant voice conversations inside channels.",
    href: "/products/buzz",
    icon: Mic,
    iconClass: "bg-[#EEF0FF] text-primary-500",
  },
  {
    name: "File Management",
    desc: "Share and organise learning materials and resources.",
    href: "/products/file-management",
    icon: Folder,
    iconClass: "bg-[#E6F4EE] text-[#0E7A52]",
  },
  {
    name: "AI Agents",
    desc: "AI assistants that summarise discussions and answer questions.",
    icon: Sparkles,
    iconClass: "bg-[#E8F0FD] text-[#1F5FC9]",
  },
  {
    name: "Assignments",
    // Reused from the File Management page until product confirms final copy.
    desc: "Attach files to coursework and project submissions.",
    icon: ClipboardCheck,
    iconClass: "bg-[#FFF1DD] text-[#9A5800]",
  },
];

const cardClass =
  "flex w-full flex-col gap-3 rounded-[22px] border border-slate-200 bg-white p-[26px]";

export const ChannelsPlatform = () => {
  return (
    <section
      aria-labelledby="channels-platform-heading"
      className="bg-[#FAFAFF] px-6 py-20 text-[#1F2530] lg:py-24"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-11">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <p className="text-[13px] font-bold tracking-[0.12em] text-primary-500">
            THE ZEDU PLATFORM
          </p>
          <h2
            id="channels-platform-heading"
            className="text-[clamp(2rem,3.6vw,3rem)] font-black leading-[1.1] tracking-[-0.03em]"
          >
            More than just channels
          </h2>
          <p className="max-w-[560px] text-lg leading-relaxed text-[#5A6170]">
            Channels work together with the rest of Zedu.
          </p>
        </div>

        <ul className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
          {products.map(({ name, desc, href, icon: Icon, iconClass }) => {
            const content = (
              <>
                <span
                  className={cn(
                    "flex h-[46px] w-[46px] items-center justify-center rounded-[13px]",
                    iconClass
                  )}
                  aria-hidden="true"
                >
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <span className="text-xl font-bold">{name}</span>
                <span className="text-[15px] leading-relaxed text-[#5A6170]">
                  {desc}
                </span>
              </>
            );

            return (
              <li key={name} className="flex">
                {href ? (
                  <Link
                    href={href}
                    className={cn(
                      cardClass,
                      "group transition-colors hover:border-primary-300",
                      focusRing
                    )}
                  >
                    {content}
                    <span className="mt-auto flex items-center gap-1 text-[15px] font-bold text-primary-500">
                      Learn more
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                ) : (
                  <div className={cardClass}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

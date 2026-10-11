import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, GraduationCap, School, Terminal } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F2530]";

const institutions: {
  name: string;
  desc: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    name: "Schools",
    desc: "Organise classes, subjects and staff updates in one place.",
    href: "/solutions/schools",
    icon: School,
  },
  {
    name: "Universities",
    desc: "Structure departments, courses and faculty across campus.",
    href: "/solutions/universities",
    icon: GraduationCap,
  },
  {
    name: "Bootcamps",
    desc: "Run cohorts, mentors and project teams without the chaos.",
    href: "/solutions/bootcamps",
    icon: Terminal,
  },
];

export const ChannelsScale = () => {
  return (
    <section
      aria-labelledby="channels-scale-heading"
      className="bg-[#1F2530] px-6 py-20 text-white lg:py-24"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12">
        <div className="flex flex-col gap-3.5">
          <p className="text-[13px] font-bold tracking-[0.12em] text-blue-50">
            BUILT FOR INSTITUTIONS
          </p>
          <h2
            id="channels-scale-heading"
            className="text-[clamp(2rem,3.6vw,3rem)] font-black leading-[1.1] tracking-[-0.03em]"
          >
            Channels that scale with your institution
          </h2>
          <p className="max-w-[580px] text-lg leading-relaxed text-[#D9D9F5]">
            Whether you run one classroom or a whole university community,
            Channels keeps large groups structured.
          </p>
        </div>

        <ul className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
          {institutions.map(({ name, desc, href, icon: Icon }) => (
            <li key={name} className="flex">
              <Link
                href={href}
                className={cn(
                  "group flex w-full flex-col gap-3.5 rounded-[22px] border border-blue-100 bg-[#3A3A85] p-7 transition-colors hover:bg-[#45459A]",
                  focusRing
                )}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#45459A] text-blue-50"
                  aria-hidden="true"
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-[22px] font-bold">{name}</span>
                <span className="text-[15px] leading-relaxed text-[#D9D9F5]">
                  {desc}
                </span>
                <span className="mt-auto flex items-center gap-1 text-[15px] font-bold text-blue-50">
                  Explore {name}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Button
          asChild
          className={cn(
            "group h-auto gap-2.5 self-start rounded-full bg-white px-7 py-[17px] text-base font-bold text-[#1F2530] shadow-[0_10px_24px_rgba(113,65,248,0.28)] hover:bg-[#EEF0FF]",
            focusRing
          )}
        >
          <Link href="/auth/sign-up">
            Start using channels
            <ArrowRight
              className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              strokeWidth={2.2}
              aria-hidden="true"
            />
          </Link>
        </Button>
      </div>
    </section>
  );
};

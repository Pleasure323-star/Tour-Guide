import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500";

export const ChannelsCTA = () => {
  return (
    <section
      aria-labelledby="channels-cta-heading"
      className="bg-[#FAFAFF] px-6 pb-20 lg:pb-24"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-[22px] rounded-[32px] bg-primary-500 px-6 py-14 text-center text-white sm:px-10 sm:py-[72px]">
        <h2
          id="channels-cta-heading"
          className="max-w-[760px] text-[clamp(2rem,4vw,3.4rem)] font-black leading-[1.08] tracking-[-0.03em]"
        >
          Bring order to every class conversation.
        </h2>
        <p className="max-w-[580px] text-[19px] leading-relaxed text-[#F4F2FF]">
          Create structured spaces where students, educators and teams
          collaborate. Set up your first channel in minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5 pt-2">
          <Button
            asChild
            className={cn(
              "group h-auto gap-2.5 rounded-full bg-white px-7 py-[17px] text-base font-bold text-[#1F2530] hover:bg-[#EEF0FF]",
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
          <Button
            asChild
            className={cn(
              "h-auto rounded-full border-[1.5px] border-white/70 bg-transparent px-[26px] py-4 text-base font-bold text-white hover:bg-white/10",
              focusRing
            )}
          >
            <Link href="/contact-sales">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

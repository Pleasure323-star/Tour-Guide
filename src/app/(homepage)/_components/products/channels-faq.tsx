import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { cn } from "~/lib/utils";
import type { HomeFAQ } from "../../_lib/faqData";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAFF]";

const channelsFAQs: HomeFAQ[] = [
  {
    id: "channels-item-1",
    question: "When should I use Channels?",
    answer:
      "Use Channels whenever you need to organize conversations by class, topic, or team so discussions stay focused and easy to follow.",
  },
  {
    id: "channels-item-2",
    question: "What can I do in Channels?",
    answer:
      "You can share updates, ask questions, post resources, and collaborate through threaded discussions with students, educators, or teams.",
  },
  {
    id: "channels-item-3",
    question: "How do I start a channel?",
    answer:
      "Create a new channel from your workspace, give it a clear name based on purpose, and invite the right participants to begin the conversation.",
  },
  {
    id: "channels-item-4",
    question: "Are Channels free?",
    answer:
      "Channels availability depends on your workspace plan. You can start with available features and upgrade if you need advanced collaboration tools.",
  },
];

export const ChannelsFAQ = () => {
  return (
    <section
      aria-labelledby="channels-faq-heading"
      className="bg-[#FAFAFF] px-6 pb-20 pt-8 text-[#1F2530] lg:pb-24"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 lg:flex-row lg:gap-14">
        <div className="flex min-w-0 flex-col gap-3.5 lg:flex-[1_1_340px]">
          <p className="text-[13px] font-bold tracking-[0.12em] text-primary-500">
            FAQ
          </p>
          <h2
            id="channels-faq-heading"
            className="text-[clamp(2rem,3.6vw,3rem)] font-black leading-[1.1] tracking-[-0.03em]"
          >
            Got a question? We have an answer.
          </h2>
          <p className="text-[17px] leading-relaxed text-[#5A6170]">
            Still unsure?{" "}
            <Link
              href="/contact-sales"
              className={cn(
                "rounded-sm font-bold text-primary-500 underline underline-offset-2 hover:text-blue-100",
                focusRing
              )}
            >
              Talk to our team
            </Link>
            .
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          defaultValue={channelsFAQs[0].id}
          className="flex min-w-0 flex-col gap-3 lg:flex-[2_1_560px]"
        >
          {channelsFAQs.map((faq) => (
            // Radix drops aria-controls while an item is closed because the
            // panel unmounts. forceMount keeps every panel in the DOM so each
            // button can point at its panel, and closed panels are hidden here.
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="overflow-hidden rounded-[18px] border border-slate-200 bg-white [&_[role=region][data-state=closed]]:hidden"
            >
              {/* The item clips overflow, so the focus ring sits inside. */}
              <AccordionTrigger
                aria-controls={`${faq.id}-panel`}
                className="group min-h-11 items-center gap-4 rounded-[18px] px-6 py-[22px] text-lg font-bold text-[#1F2530] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
              >
                {faq.question}
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF0FF] text-primary-500"
                  aria-hidden="true"
                >
                  <Plus className="h-4 w-4 group-data-[state=open]:hidden" />
                  <Minus className="hidden h-4 w-4 group-data-[state=open]:block" />
                </span>
              </AccordionTrigger>
              <AccordionContent
                forceMount
                id={`${faq.id}-panel`}
                className="px-6 pb-[22px] text-base leading-[1.65] text-[#5A6170]"
              >
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

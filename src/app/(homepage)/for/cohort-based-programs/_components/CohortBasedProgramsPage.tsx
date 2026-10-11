import Image from "next/image";
import { Star } from "lucide-react";
import { ArrowBtn, OutlineBtn } from "../../../_components/ui/Button";
import { ComparisonShowcase } from "../../../_components/ui/ComparisonShowcase";
import { FeaturedCard } from "../../../_components/ui/FeaturedCard";
import { WhyCard } from "../../../_components/ui/WhyCard";
import { DynamicFooter } from "../../../_components/footer/dynamic-footer";
import { FAQSection } from "../../../_components/home/FAQSection";
import type { HomeFAQ } from "../../../_lib/faqData";

const valueCards = [
  {
    title: "Onboard every cohort with structure",
    description:
      "Welcome learners into a focused space for program announcements, milestones, resources, and conversations from day one.",
  },
  {
    title: "Keep learners connected",
    description:
      "Help learners, mentors, and instructors communicate in real time through focused discussions without scattering important updates across different tools.",
  },
  {
    title: "Support every learner",
    description:
      "Combine educator guidance with AI-powered support so routine questions are answered while mentors stay focused on progress.",
  },
];

const programFeatures = [
  {
    title: "Run live sessions and discussions",
    description:
      "Bring learners, mentors, and instructors together for live sessions, then keep the follow-up discussion in the right cohort or topic channel.",
    image: "/images/homepage/features/cohort-communication.png",
  },
  {
    title: "Keep resources in context",
    description:
      "Share course files, assignments, and updates where learners already collaborate, making resources easier to find and use.",
    image:
      "/images/homepage/solutions/bootcamps/manage-cohorts-with-structure.png",
  },
];

const comparisonData = {
  withoutItems: [
    "Announcements and questions are scattered across chat, email, and file tools",
    "Learners struggle to find the right conversation or resource",
    "Mentors repeat answers and have limited visibility into learner needs",
    "Program teams spend time coordinating tools instead of supporting learners",
  ],
  withItems: [
    "Every cohort has structured channels for lessons, projects, and updates",
    "Discussions and resources stay connected to the right learning context",
    "Mentors and instructors can support learners in one shared workspace",
    "AI-powered assistance helps teams respond faster and reduce admin work",
  ],
};

const cohortFAQs: HomeFAQ[] = [
  {
    id: "cohort-setup",
    question: "Is Zedu suitable for cohort-based programs?",
    answer:
      "Yes. Zedu is designed for structured learning communities, including cohort-based courses, bootcamps, training programs, and mentorship-led learning experiences.",
  },
  {
    id: "cohort-communication",
    question: "How does Zedu help us manage cohort communication?",
    answer:
      "You can create dedicated channels for cohorts, lessons, projects, and announcements so learners and program teams always know where to communicate.",
  },
  {
    id: "cohort-resources",
    question: "Can we share course resources and assignments?",
    answer:
      "Yes. Teams can share files and learning materials in organized spaces while keeping the related discussion and collaboration connected.",
  },
  {
    id: "cohort-ai-support",
    question: "Can Zedu help us support learners between mentor sessions?",
    answer:
      "AI-powered assistance can help with routine questions and discussion summaries, while mentors and instructors remain in control of learner support.",
  },
  {
    id: "cohort-pricing",
    question: "How does pricing work for cohort-based programs?",
    answer:
      "Zedu offers plans for growing cohorts and structured programs. Teams can review the available plans or contact sales for a program-specific conversation.",
  },
];

const schemaOrgContext = ["https:", "", "schema.org"].join("/");

const faqStructuredData = {
  "@context": schemaOrgContext,
  "@type": "FAQPage",
  mainEntity: cohortFAQs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export const CohortBasedProgramsPage = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <section className="relative isolate overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[35%] w-screen -translate-x-1/2 bg-gradient-to-t from-blue-50/30 to-white"
        />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 rounded-[28px] px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14 lg:px-12 lg:py-14">
          <div className="flex flex-col items-center gap-5 text-center lg:max-w-[500px] lg:items-start lg:text-left">
            <h1 className="text-2xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
              <span className="text-primary-500">Run better cohorts </span>
              and build stronger learning communities
            </h1>
            <p className="max-w-[48ch] text-sm leading-relaxed text-[#5a6170] sm:text-base">
              Give your cohort-based program one organized workspace for
              communication, collaboration, resources, and learner support.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-[#5a6170] lg:justify-start">
              <div className="flex items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} color="gold" fill="gold" size={14} />
                ))}
              </div>
              <span className="font-semibold text-[#1f2530]">4.9</span>
              <span className="text-[#8a90a0]">|</span>
              <span>Built for modern learning teams</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ArrowBtn text="Get started for free" href="/auth/sign-up" />
              <OutlineBtn text="Contact Sales" href="/contact-sales" />
            </div>
          </div>

          <div className="relative w-full pb-10 sm:pb-12">
            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-3xl sm:aspect-[4/3] lg:aspect-[16/10]">
              <Image
                src="/images/homepage/solutions/cohort-programs-hero.jpg"
                alt="Adult learners collaborating with a mentor during a cohort workshop"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 680px"
                className="object-cover object-center"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 w-[58%] max-w-[320px] rounded-2xl bg-white px-3 py-3 shadow-xl sm:px-5 sm:py-4"
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/Zedu.png"
                  alt=""
                  width={78}
                  height={30}
                  className="h-auto w-[55px] sm:w-[78px]"
                />
                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-500 sm:text-xs">
                  Cohort
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 sm:mt-4">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-600 sm:size-8 sm:text-xs">
                  LM
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="h-1.5 w-1/2 rounded-full bg-slate-200" />
                  <span className="h-1.5 w-full rounded-full bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate space-y-10 overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-28">
        <div className="text-center">
          <h2 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
            Everything your cohort program needs
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Replace scattered tools with a structured learning workspace that
            keeps people, conversations, and progress connected.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {valueCards.map((card) => (
            <WhyCard
              key={card.title}
              title={card.title}
              desc={card.description}
              showBadge
              className="h-full"
            />
          ))}
        </div>
      </section>

      <section className="relative isolate space-y-10 overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-28">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
            Keep every cohort moving forward
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Give learners and program teams a shared place to communicate,
            collaborate, and find what they need at every stage of the program.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2">
          {programFeatures.map((feature) => (
            <FeaturedCard
              key={feature.title}
              title={feature.title}
              desc={feature.description}
              image={feature.image}
            />
          ))}
        </div>
      </section>

      <section className="relative isolate space-y-10 overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-28">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
            Turn scattered communication into a structured program
          </h2>
        </div>

        <ComparisonShowcase
          withoutTitle="Without Zedu"
          withoutItems={comparisonData.withoutItems}
          withTitle="With Zedu"
          withItems={comparisonData.withItems}
          ctaText="Contact Sales"
          ctaHref="/contact-sales"
        />
      </section>

      <FAQSection
        faqs={cohortFAQs}
        headingLevel="h2"
        className="py-16 sm:py-20 lg:py-28"
      />

      <DynamicFooter
        headingLevel="h2"
        className="py-16 sm:py-20 lg:py-28"
        text="Build your next cohort in one organized workspace"
        description="Give learners, mentors, and instructors the structure they need to stay connected and make progress together."
      />
    </>
  );
};

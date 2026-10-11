import { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import Image from "next/image";
import { ArrowBtn, OutlineBtn } from "../../_components/ui/Button";
import {
  FilesIcon,
  MessagesQuestionIcon,
  ShareIcon,
} from "../../_components/svgs";
import { MessagesIcon } from "../../_components/svgs";
import { ChannelsScale } from "../../_components/products/channels-scale";
import { ChannelsPlatform } from "../../_components/products/channels-platform";
import { FAQSection } from "../../_components/home/FAQSection";
import { DynamicFooter } from "../../_components/footer/dynamic-footer";
import type { HomeFAQ } from "../../_lib/faqData";

export const metadata: Metadata = {
  title: "Channels",
  description:
    "Explore Zedu Channels for structured classroom and cohort communication. Organize discussions by subject, share updates clearly, and scale collaboration across learning teams.",
  keywords: [
    "Zedu channels",
    "education communication channels",
    "classroom discussion platform",
    "cohort collaboration tools",
    "threaded learning conversations",
    "school communication software",
    "university discussion channels",
    "bootcamp class communication",
  ],
  icons: {
    icon: "/TelexIcon.svg",
  },
  openGraph: {
    title: "Zedu Channels - Organized Communication for Learning Teams",
    description:
      "Keep learning conversations structured with channels built for schools, universities, and cohort-based programs.",
    url: siteUrl("/products/channels"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu channels for organized learning communication",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zedu Channels - Structured Class Communication",
    description:
      "Create focused discussions, announcements, and threaded conversations with channels designed for modern education teams.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/products/channels"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

const featuresData = [
  {
    title: "Keep conversations in the right place",
    icon: FilesIcon,
    desc: "Channels help organize conversations so students and educators can easily follow discussions related to specific subjects, classes, projects, or departments.",
    image: "/images/homepage/products/features/feature-1.png",
  },
  {
    title: "Follow discussions without noise",
    icon: MessagesIcon,
    desc: "Threaded replies allow users to respond directly to specific messages, keeping discussions organized and easy to follow. ",
    image: "/images/homepage/products/features/feature-2.png",
  },
  {
    title: "Share important updates clearly",
    icon: ShareIcon,
    desc: "Professors, teachers, and mentors can send announcements directly within the relevant channels.",
    image: "/images/homepage/products/features/feature-3.png",
  },
  {
    title: "Channels built for education",
    icon: MessagesQuestionIcon,
    desc: "From small classrooms to large university programs, channels are designed to support structured discussions for every type of learning. ",
    image: "/images/homepage/products/features/feature-4.png",
  },
];

const channelsFAQs: HomeFAQ[] = [
  {
    id: "channels-item-1",
    question: "When should I use Channels?",
    answer:
      "Use Channels whenever you need to organize conversations by class, topic, or team so discussions stay focused and easy to follow.",
  },
  {
    id: "channels-item-2",
    question: "What can I do in a Channels?",
    answer:
      "You can share updates, ask questions, post resources, and collaborate through threaded discussions with students, educators, or teams.",
  },
  {
    id: "channels-item-3",
    question: "How do I start a Channels?",
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

const ChannelProductPage = () => {
  return (
    <>
      <section className="relative isolate overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[30%] w-screen -translate-x-1/2 bg-gradient-to-t from-blue-50/30 to-white"
        />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 rounded-[28px] px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14 lg:px-12 lg:py-14 min-h-[85dvh]">
          <div className="flex flex-col items-center gap-5 text-center lg:max-w-[470px] lg:items-start lg:text-left">
            <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
              <span className="text-primary-500">Organise Learning</span> with
              Structured Channels.
            </h1>
            <p className="max-w-[46ch] text-sm leading-relaxed text-[#5a6170] sm:text-base">
              Channels keep discussions organized by course, cohort, or topic so
              students and educators always know where conversations belong.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ArrowBtn text="Start using channels" linkToHome />
              <OutlineBtn text="Watch a Demo" />
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-3xl">
            <div className="relative aspect-[16/11] w-full sm:aspect-[4/3] lg:aspect-[16/10]">
              <Image
                src="/images/homepage/products/channels-hero.png"
                alt="Zedu channels product screenshot"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 680px"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="relative isolate overflow-visible space-y-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16 mt-5">
        <div>
          <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] text-center lg:leading-[1.12]">
            Organized Communication for Learning{" "}
          </h1>
        </div>
        <div className="mx-auto grid w-full place-items-center max-w-7xl grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-8">
          {featuresData.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="flex h-full w-full max-w-[560px] flex-col gap-5 rounded-2xl bg-blue-50/10 p-4 sm:p-6 lg:p-8"
              >
                <div className="flex flex-col gap-3 text-left">
                  <div className="flex h-10 w-10 items-center">
                    <Icon />
                  </div>
                  <h2 className="text-lg font-semibold leading-snug text-[#1f2530] sm:text-xl">
                    {feature.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-[#5a6170] sm:text-base">
                    {feature.desc}
                  </p>
                </div>
                <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl md:mx-0 md:max-w-none">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 48vw, 560px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mx-auto flex items-center justify-center">
          <ArrowBtn text="Get Started" href="/auth/sign-up" />
        </div>
      </section>
      <ChannelsScale />
      <ChannelsPlatform />

      <FAQSection faqs={channelsFAQs} />
      <DynamicFooter
        text="Organize Your Learning Community with Channels"
        description="Create structured spaces where students, educators, and teams can collaborate effectively."
      />
    </>
  );
};

export default ChannelProductPage;

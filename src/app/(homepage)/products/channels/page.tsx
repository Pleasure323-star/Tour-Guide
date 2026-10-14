import { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { ChannelsHero } from "../../_components/products/channels-hero";
import { ChannelsFeatures } from "../../_components/products/channels-features";
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
      <ChannelsHero />
      <ChannelsFeatures />
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

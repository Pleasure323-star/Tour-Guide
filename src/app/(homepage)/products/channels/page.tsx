import { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { ChannelsHero } from "../../_components/products/channels-hero";
import { ChannelsFeatures } from "../../_components/products/channels-features";
import { ChannelsScale } from "../../_components/products/channels-scale";
import { ChannelsPlatform } from "../../_components/products/channels-platform";
import { ChannelsFAQ } from "../../_components/products/channels-faq";
import { ChannelsCTA } from "../../_components/products/channels-cta";

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

const ChannelProductPage = () => {
  return (
    <>
      <ChannelsHero />
      <ChannelsFeatures />
      <ChannelsScale />
      <ChannelsPlatform />
      <ChannelsFAQ />
      <ChannelsCTA />
    </>
  );
};

export default ChannelProductPage;

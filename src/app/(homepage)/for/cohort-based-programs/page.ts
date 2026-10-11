import type { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { CohortBasedProgramsPage } from "./_components/CohortBasedProgramsPage";

const pageUrl = "/for/cohort-based-programs";
const pageTitle =
  "Cohort-Based Program Platform for Learning Communities | Zedu";
const pageDescription =
  "Run cohort-based programs with organized communication, live collaboration, file sharing, and AI-powered learner support in one workspace.";

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  keywords: [
    "cohort-based program platform",
    "cohort-based course platform",
    "cohort learning community platform",
    "cohort management software",
    "learning community platform",
    "Zedu cohort programs",
  ],
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: siteUrl(pageUrl),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu platform for cohort-based programs",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: { canonical: siteUrl(pageUrl) },
  robots: { index: true, follow: true },
  category: "education",
  applicationName: "Zedu",
  creator: "Zedu",
  publisher: "Zedu",
};

export default CohortBasedProgramsPage;

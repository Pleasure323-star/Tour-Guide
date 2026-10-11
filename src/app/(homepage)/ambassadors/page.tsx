import type { Metadata } from "next";
import Link from "next/link";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { WhyCard } from "~/app/(homepage)/_components/ui/WhyCard";
import { ApplyButton } from "~/app/(homepage)/_components/ambassadors/apply-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const title = "Zedu Ambassadors | Bring Zedu to Your Campus or Community";
const description =
  "Help bring Zedu to your school, bootcamp or community. Apply to become a Zedu ambassador and introduce your group to a better way to communicate.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl("/ambassadors"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu Ambassadors page preview",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/ambassadors"),
  },
};

const ambassadorTasks = [
  {
    title: "Introduce Zedu",
    desc: "Tell your class, cohort or community what Zedu is and how it can help them communicate.",
  },
  {
    title: "Help your group get set up",
    desc: "Guide your group through creating a workspace and finding their way around.",
  },
  {
    title: "Share feedback",
    desc: "Pass on what your group likes and what could be better to the Zedu team.",
  },
];

const steps = [
  { title: "Apply", desc: "Fill in the short application form." },
  {
    title: "We review",
    desc: "The Zedu team looks through your application.",
  },
  { title: "We get in touch", desc: "We contact you with the next steps." },
];

const applicants = [
  "Students",
  "Teachers",
  "Bootcamp leaders",
  "Community leaders",
];

const faqs = [
  {
    question: "Does it cost anything to become an ambassador?",
    answer: "No. Applying and being an ambassador is free.",
  },
  {
    question: "How much time does it take?",
    answer:
      "It is up to you. You decide how much time you can give to introducing Zedu to your group.",
  },
  {
    question: "How are applications reviewed?",
    answer:
      "The Zedu team reads each application and contacts the people it would like to work with.",
  },
  {
    question: "Do I need to belong to a school or community?",
    answer:
      "Ambassadors introduce Zedu to a group they are part of, such as a class, bootcamp or community.",
  },
];

const sectionClass = "px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16";
const headingClass =
  "text-center text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]";

const AmbassadorsPage = () => {
  return (
    <>
      <section className={`${sectionClass} bg-blue-50/30`}>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <h1 className={headingClass}>
            Bring <span className="text-primary-500">Zedu</span> to your campus
            or community
          </h1>
          <p className="max-w-[46ch] text-sm leading-relaxed text-[#5a6170] sm:text-base">
            Help your class, bootcamp or community discover a better way to
            communicate, and become a Zedu ambassador.
          </p>
          <ApplyButton />
        </div>
      </section>

      <section className={`${sectionClass} space-y-10`}>
        <h2 className={headingClass}>What ambassadors do</h2>
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ambassadorTasks.map((task) => (
            <WhyCard
              key={task.title}
              title={task.title}
              desc={task.desc}
              className="h-full"
            />
          ))}
        </div>
      </section>

      <section className={`${sectionClass} space-y-10`}>
        <h2 className={headingClass}>How it works</h2>
        <ol className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col items-center gap-3 text-center"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-500 font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="text-xl font-bold text-neutral-900">
                {step.title}
              </h3>
              <p className="text-neutral-600">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${sectionClass} space-y-10`}>
        <h2 className={headingClass}>Who can apply</h2>
        <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3">
          {applicants.map((applicant) => (
            <li
              key={applicant}
              className="rounded-full bg-neutral-100 px-5 py-2 font-medium text-neutral-900"
            >
              {applicant}
            </li>
          ))}
        </ul>
      </section>

      <section className={`${sectionClass} space-y-10`}>
        <h2 className={headingClass}>Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mx-auto max-w-3xl">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-base text-neutral-900">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-neutral-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="flex flex-col items-center gap-5 bg-blue-50/30 px-4 py-12 text-center sm:gap-6 sm:px-8 sm:py-16">
        <h2 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl md:text-4xl">
          Ready to bring Zedu to your group?
        </h2>
        <ApplyButton />
        <p className="text-sm text-neutral-600">
          Read our{" "}
          <Link href="/policy" className="underline hover:text-primary-500">
            Privacy Policy
          </Link>{" "}
          before you apply.
        </p>
      </section>
    </>
  );
};

export default AmbassadorsPage;

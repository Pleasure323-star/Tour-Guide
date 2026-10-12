import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Check, FileText } from "lucide-react";
import { siteUrl } from "~/lib/env-urls";
import {
  getTemplateBySlug,
  resourceTemplates,
} from "~/app/(homepage)/_lib/resource-templates";
import { TemplateLeadForm } from "../../_components/template-lead-form";
import { DynamicFooter } from "../../../_components/footer/dynamic-footer";
import { TemplateDetailTracker } from "../../_components/template-detail-tracker";

interface TemplatePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return resourceTemplates.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({
  params,
}: TemplatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) return {};
  return {
    title: `${template.title} - Free Template`,
    description: template.metaDescription,
    openGraph: {
      title: `${template.title} | Zedu`,
      description: template.metaDescription,
      url: siteUrl(`/resources/templates/${template.slug}`),
      siteName: "Zedu",
      images: [
        {
          url: template.shareImage,
          width: 1200,
          height: 630,
          alt: `${template.title} preview`,
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${template.title} | Zedu`,
      description: template.metaDescription,
      images: [template.shareImage],
    },
    alternates: {
      canonical: siteUrl(`/resources/templates/${template.slug}`),
    },
    robots: { index: true, follow: true },
  };
}

export default async function TemplateDetailPage({
  params,
}: TemplatePageProps) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) notFound();

  return (
    <>
      {/* The tracker reads useSearchParams(), which requires a Suspense
          boundary when the page is statically generated. */}
      <Suspense fallback={null}>
        <TemplateDetailTracker slug={template.slug} />
      </Suspense>
      <section className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <Link
          href="/resources?category=templates"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to templates
        </Link>

        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="inline-block w-fit rounded-full bg-primary-50/50 p-2 text-xs font-medium text-primary-500">
                Free template
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                <FileText size={12} aria-hidden="true" />
                {template.fileType}
              </span>
            </div>
            <h1 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl lg:text-4xl">
              {template.title}
            </h1>
            <p className="text-sm leading-relaxed text-neutral-600 sm:text-base">
              {template.description}
            </p>
            <p className="text-sm text-neutral-500">
              Made for: {template.audience}
            </p>
            <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-neutral-100 sm:h-80">
              <Image
                src={template.preview}
                alt={`${template.title} preview`}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <h2 className="mb-3 text-base font-semibold text-neutral-900">
                What&apos;s inside
              </h2>
              <ul className="flex flex-col gap-2">
                {template.rows.slice(1, 6).map((row, index) => (
                  <li
                    key={`${template.slug}-row-${index}`}
                    className="flex items-start gap-2 text-sm text-neutral-600"
                  >
                    <Check
                      size={16}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-primary-500"
                    />
                    {row[0]}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <TemplateLeadForm template={template} />
            <p className="text-xs leading-relaxed text-neutral-500">
              Free for educators. We&apos;ll email your file and occasional new
              templates if you opt in. Unsubscribe any time.
            </p>
          </div>
        </div>
      </section>
      <DynamicFooter
        text="Use this template in Zedu"
        description="Bring the template to life with structured channels, assignments, and mentor spaces in one workspace."
      />
    </>
  );
}

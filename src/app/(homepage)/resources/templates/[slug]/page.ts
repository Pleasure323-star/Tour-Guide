import type { Metadata } from "next";
import { siteUrl } from "~/lib/env-urls";
import {
  getTemplateBySlug,
  resourceTemplates,
} from "~/app/(homepage)/_lib/resource-templates";
import {
  TemplateDetailPage,
  type TemplatePageProps,
} from "../../_components/template-detail-page";

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

export default TemplateDetailPage;

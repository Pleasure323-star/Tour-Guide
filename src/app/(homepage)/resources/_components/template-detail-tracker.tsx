"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  trackTemplateEvent,
  readUtmSource,
} from "~/app/(homepage)/_lib/template-analytics";

export const TemplateDetailTracker = ({ slug }: { slug: string }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const source = readUtmSource(
      searchParams?.toString() ? `?${searchParams.toString()}` : null
    );
    trackTemplateEvent("template_view", {
      templateSlug: slug,
      source,
    });
  }, [slug, searchParams]);

  return null;
};

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import type { ResourceTemplate } from "~/app/(homepage)/_lib/resource-templates";

interface TemplateResourceCardProps {
  template: ResourceTemplate;
}

export const TemplateResourceCard = ({
  template,
}: TemplateResourceCardProps) => {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg bg-white text-left shadow-md transition-all duration-300">
      <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
        <Image
          src={template.preview}
          alt={`${template.title} preview`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      <div className="flex flex-grow flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-fit rounded-full bg-primary-50/50 p-2 text-xs font-medium text-primary-500">
            Template
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
            <FileText size={12} aria-hidden="true" />
            {template.fileType}
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-neutral-900">
            {template.title}
          </h3>
          <p className="mb-4 line-clamp-2 flex-grow text-sm text-neutral-600">
            {template.description}
          </p>
        </div>

        <Link
          href={`/resources/templates/${template.slug}`}
          aria-label={`Get the ${template.title} template`}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary-500 transition-colors hover:text-primary-600"
        >
          Get template <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

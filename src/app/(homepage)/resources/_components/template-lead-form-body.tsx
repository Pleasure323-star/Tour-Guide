"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
import type { ResourceTemplate } from "~/app/(homepage)/_lib/resource-templates";
import { ConfirmationPanel } from "./template-confirmation-panel";
import { useLeadSubmit } from "./use-lead-submit";
import type { LeadConfirmation } from "./template-lead-form";

interface TemplateLeadFormProps {
  template: ResourceTemplate;
  source?: string;
}

export const TemplateLeadForm = ({
  template,
  source = "direct",
}: TemplateLeadFormProps) => {
  const [confirmation, setConfirmation] = useState<LeadConfirmation | null>(
    null
  );
  const { form, sending, onSubmit } = useLeadSubmit({
    slug: template.slug,
    fileName: template.fileName,
    source,
    onDone: setConfirmation,
  });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = form;
  const consent = watch("consent");

  if (confirmation) {
    return (
      <ConfirmationPanel
        template={template}
        source={source}
        confirmation={confirmation}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={`Get the ${template.title} template`}
      className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-sm"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`lead-name-${template.slug}`}>Full name</Label>
        <Input
          id={`lead-name-${template.slug}`}
          type="text"
          autoComplete="name"
          placeholder="Ada Lovelace"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={
            errors.name ? `lead-name-error-${template.slug}` : undefined
          }
          {...register("name")}
        />
        {errors.name && (
          <p
            id={`lead-name-error-${template.slug}`}
            role="alert"
            className="text-sm text-red-600"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`lead-email-${template.slug}`}>Email address</Label>
        <Input
          id={`lead-email-${template.slug}`}
          type="email"
          autoComplete="email"
          placeholder="you@school.edu"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={
            errors.email ? `lead-email-error-${template.slug}` : undefined
          }
          {...register("email")}
        />
        {errors.email && (
          <p
            id={`lead-email-error-${template.slug}`}
            role="alert"
            className="text-sm text-red-600"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`lead-role-${template.slug}`}>
          Role <span className="font-normal text-neutral-500">(optional)</span>
        </Label>
        <Input
          id={`lead-role-${template.slug}`}
          type="text"
          autoComplete="organization-title"
          placeholder="Teacher, mentor, admin…"
          {...register("role")}
        />
      </div>

      <div className="hidden" aria-hidden="true">
        <Label htmlFor={`lead-website-${template.slug}`}>Website</Label>
        <Input
          id={`lead-website-${template.slug}`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id={`lead-consent-${template.slug}`}
          checked={consent}
          onCheckedChange={(checked) => setValue("consent", checked === true)}
          aria-describedby={`lead-consent-desc-${template.slug}`}
        />
        <div className="flex flex-col gap-1">
          <Label
            htmlFor={`lead-consent-${template.slug}`}
            className="cursor-pointer"
          >
            Email me new educator templates
          </Label>
          <p
            id={`lead-consent-desc-${template.slug}`}
            className="text-xs leading-relaxed text-neutral-600"
          >
            Tick to join the newsletter. Unticked, we only send your file.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={sending || !isValid}
        className={cn(
          "flex items-center justify-center rounded-full bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-400 sm:px-6 sm:py-3",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {sending ? "Sending…" : `Get the ${template.fileType} file`}
      </button>
    </form>
  );
};

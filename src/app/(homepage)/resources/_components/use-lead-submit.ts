import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { showError } from "~/components/toast/sonner";
import {
  trackTemplateEvent,
  readUtmSource,
} from "~/app/(homepage)/_lib/template-analytics";
import type { LeadConfirmation } from "./template-lead-form";

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(254),
  role: z.string().trim().max(120).optional().default(""),
  consent: z.boolean(),
  website: z.string().max(500).optional().default(""),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
export type LeadFormInput = z.input<typeof leadFormSchema>;

interface UseLeadSubmitArgs {
  slug: string;
  fileName: string;
  source: string;
  onDone: (confirmation: LeadConfirmation) => void;
}

export function useLeadSubmit({
  slug,
  fileName,
  source,
  onDone,
}: UseLeadSubmitArgs) {
  const [sending, setSending] = useState(false);

  const form = useForm<LeadFormInput, unknown, LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      consent: true,
      website: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(values: LeadFormValues) {
    setSending(true);
    const utmSource =
      typeof window !== "undefined"
        ? readUtmSource(window.location.search)
        : source;
    try {
      const res = await fetch("/api/resources/template-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          role: values.role ?? "",
          templateSlug: slug,
          consent: values.consent,
          website: values.website ?? "",
          source: utmSource,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        downloadUrl?: string | null;
        error?: string;
        confirmationEmail?: {
          subject: string;
          fileUrl: string;
          unsubscribeUrl: string;
        };
      };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Something went wrong. Try again.");
      }
      trackTemplateEvent("template_lead_submit", {
        templateSlug: slug,
        source: utmSource,
      });
      trackTemplateEvent("template_download", {
        templateSlug: slug,
        source: utmSource,
      });
      const url =
        data.downloadUrl ?? `/api/resources/templates/${slug}/download`;
      onDone({
        downloadUrl: url,
        emailSubject: data.confirmationEmail?.subject ?? "",
        fileUrl: data.confirmationEmail?.fileUrl ?? url,
        unsubscribeUrl: data.confirmationEmail?.unsubscribeUrl ?? "",
      });
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSending(false);
    }
  }

  return { form, sending, onSubmit };
}

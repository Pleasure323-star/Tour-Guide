import { ArrowBtn } from "~/app/(homepage)/_components/ui/Button";
import { trackTemplateEvent } from "~/app/(homepage)/_lib/template-analytics";
import type { ResourceTemplate } from "~/app/(homepage)/_lib/resource-templates";
import type { LeadConfirmation } from "./template-lead-form";

interface ConfirmationPanelProps {
  template: ResourceTemplate;
  source: string;
  confirmation: LeadConfirmation;
}

export const ConfirmationPanel = ({
  template,
  source,
  confirmation,
}: ConfirmationPanelProps) => {
  const handleCta = (cta: string) => () => {
    trackTemplateEvent("template_cta_click", {
      templateSlug: template.slug,
      source,
      cta,
    });
  };
  return (
    <section
      aria-live="polite"
      aria-label="Download ready"
      className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-sm"
    >
      <h2 className="text-xl font-semibold text-neutral-900">
        Your template is ready
      </h2>
      <p className="text-sm leading-relaxed text-neutral-600">
        {confirmation.emailSubject ? `${confirmation.emailSubject}. ` : ""}
        Your download should have started. A confirmation email with the file
        link was sent — unsubscribe any time
        {confirmation.unsubscribeUrl ? (
          <>
            {" "}
            <a
              href={confirmation.unsubscribeUrl}
              className="font-medium text-primary-500 underline"
            >
              here
            </a>
            .
          </>
        ) : (
          "."
        )}
      </p>
      <p className="break-words text-sm leading-relaxed text-neutral-600">
        File link:{" "}
        <a
          href={confirmation.fileUrl}
          className="font-medium break-all text-primary-500 underline"
        >
          {confirmation.fileUrl}
        </a>
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <ArrowBtn
          text="Download again"
          href={confirmation.downloadUrl}
          onClick={handleCta("download-again")}
        />
        <ArrowBtn
          text="Use this template in Zedu"
          href="/auth/sign-up"
          onClick={handleCta("use-in-zedu")}
        />
      </div>
    </section>
  );
};

import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ambassadorFormUrl } from "~/lib/env-urls";
import { cn } from "~/lib/utils";

const buttonClass =
  "h-auto rounded-full bg-primary-500 px-6 py-3 text-base font-medium text-white hover:bg-primary-400";

export const ApplyButton = ({ className }: { className?: string }) => {
  const formUrl = ambassadorFormUrl();

  if (!formUrl) {
    return (
      <Button
        disabled
        className={cn(buttonClass, className)}
        aria-label="Applications open soon"
      >
        Applications open soon
      </Button>
    );
  }

  return (
    <Button asChild className={cn(buttonClass, "gap-2", className)}>
      <a href={formUrl} target="_blank" rel="noopener noreferrer">
        Apply to be an ambassador
        <ArrowRight size={18} aria-hidden="true" />
      </a>
    </Button>
  );
};

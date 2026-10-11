import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ambassadorFormUrl } from "~/lib/env-urls";
import { cn } from "~/lib/utils";

const buttonClass =
  "h-auto rounded-full bg-primary-500 px-4 py-2.5 text-base font-medium text-white hover:bg-primary-400 sm:px-6 sm:py-3";

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
    <Button asChild className={cn(buttonClass, "gap-3", className)}>
      <a href={formUrl} target="_blank" rel="noopener noreferrer">
        Apply to be an ambassador
        <span
          aria-hidden="true"
          className="flex size-6 items-center justify-center rounded-full bg-white text-primary-500"
        >
          <ArrowRight size={14} />
        </span>
      </a>
    </Button>
  );
};

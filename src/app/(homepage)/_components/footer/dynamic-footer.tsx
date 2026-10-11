import { ArrowBtn, OutlineBtn } from "../ui/Button";
import { cn } from "~/lib/utils";

export const DynamicFooter = ({
  text,
  description,
  headingLevel = "h1",
  className,
}: {
  text: string;
  description: string;
  headingLevel?: "h1" | "h2";
  className?: string;
}) => {
  const Heading = headingLevel;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-5 bg-blue-50/30 px-4 py-12 text-center sm:gap-6 sm:px-8 sm:py-16",
        className
      )}
    >
      <Heading className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl md:text-4xl">
        {text}
      </Heading>
      <p className="max-w-2xl text-base text-neutral-600">{description}</p>
      <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-2">
        <ArrowBtn
          text="Get started for free"
          className="w-full sm:w-auto"
          linkToHome
        />
        <OutlineBtn
          text="Contact Sales"
          className="w-full sm:w-auto"
          href="/contact-sales"
        />
      </div>
    </div>
  );
};

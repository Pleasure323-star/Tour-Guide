"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { CircleHelp } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  pricingComparisonDemoSections,
  pricingComparisonPlans,
} from "../../_lib/pricingComparisonData";
import { PricingComparisonTable } from "./PricingComparisonTable";

const mobilePlans = pricingComparisonPlans.map((plan) => ({
  ...plan,
  label: plan.key === "pro" ? "Growth" : plan.label,
}));

export const MobilePricingComparison = () => {
  const [selectedPlanKey, setSelectedPlanKey] = useState(
    mobilePlans[0]?.key ?? "starter"
  );
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const selectedPlan =
    mobilePlans.find((plan) => plan.key === selectedPlanKey) ?? mobilePlans[0];

  const selectPlan = (planIndex: number) => {
    const plan = mobilePlans[planIndex];

    if (!plan) return;

    setSelectedPlanKey(plan.key);
    tabRefs.current[plan.key]?.focus();
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    planIndex: number
  ) => {
    let nextPlanIndex: number | undefined;

    switch (event.key) {
      case "ArrowRight":
        nextPlanIndex = (planIndex + 1) % mobilePlans.length;
        break;
      case "ArrowLeft":
        nextPlanIndex =
          (planIndex - 1 + mobilePlans.length) % mobilePlans.length;
        break;
      case "Home":
        nextPlanIndex = 0;
        break;
      case "End":
        nextPlanIndex = mobilePlans.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectPlan(nextPlanIndex);
  };

  if (!selectedPlan) return null;

  return (
    <div className="md:hidden">
      <h2 className="mb-4 text-2xl font-semibold text-neutral-900">
        Compare plans
      </h2>

      <div
        role="tablist"
        aria-label="Choose a pricing plan"
        className="mb-6 grid grid-cols-3 rounded-lg bg-neutral-100 p-1"
      >
        {mobilePlans.map((plan, planIndex) => {
          const isSelected = plan.key === selectedPlan.key;

          return (
            <button
              key={plan.key}
              ref={(element) => {
                tabRefs.current[plan.key] = element;
              }}
              id={`pricing-plan-tab-${plan.key}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="pricing-plan-panel"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelectedPlanKey(plan.key)}
              onKeyDown={(event) => handleTabKeyDown(event, planIndex)}
              className={cn(
                "rounded-lg px-2 py-3 text-sm font-semibold transition-colors",
                isSelected
                  ? "bg-purple-600 text-white"
                  : "text-neutral-800 hover:bg-neutral-200"
              )}
            >
              {plan.label}
            </button>
          );
        })}
      </div>

      <div
        id="pricing-plan-panel"
        role="tabpanel"
        aria-labelledby={`pricing-plan-tab-${selectedPlan.key}`}
      >
        {pricingComparisonDemoSections.map((section) => (
          <PricingComparisonTable
            key={section.key}
            plans={[selectedPlan]}
            section={section}
            rowInfoIcon={
              <CircleHelp className="h-3.5 w-3.5 text-neutral-400" />
            }
            compact
            className="mb-8 last:mb-0"
          />
        ))}
      </div>
    </div>
  );
};

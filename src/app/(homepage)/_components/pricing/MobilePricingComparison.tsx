"use client";

import { useState } from "react";
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
  const selectedPlan =
    mobilePlans.find((plan) => plan.key === selectedPlanKey) ?? mobilePlans[0];

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
        {mobilePlans.map((plan) => {
          const isSelected = plan.key === selectedPlan.key;

          return (
            <button
              key={plan.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedPlanKey(plan.key)}
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

      {pricingComparisonDemoSections.map((section) => (
        <PricingComparisonTable
          key={section.key}
          plans={[selectedPlan]}
          section={section}
          rowInfoIcon={<CircleHelp className="h-3.5 w-3.5 text-neutral-400" />}
          compact
          className="mb-8 last:mb-0"
        />
      ))}
    </div>
  );
};

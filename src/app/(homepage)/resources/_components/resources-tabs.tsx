"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { tabs } from "../../_lib/resources";
import { resourceTemplates } from "../../_lib/resource-templates";
import { DynamicFooter } from "../../_components/footer/dynamic-footer";
import { ResourcesGrid } from "./resources-grid";

const VALID_TABS = tabs.map((tab) => tab.id);

function ResourcesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get("category") ?? null;
  const [searchQuery, setSearchQuery] = useState("");

  const activeTab = useMemo(() => {
    if (categoryParam && (VALID_TABS as string[]).includes(categoryParam)) {
      return categoryParam;
    }
    return "guides";
  }, [categoryParam]);

  useEffect(() => {
    if (!searchParams || categoryParam) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set("category", "guides");
    router.replace(`/resources?${next.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveTab = (tabId: string) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    next.set("category", tabId);
    router.push(`/resources?${next.toString()}`, { scroll: false });
  };

  return (
    <>
      <section className="relative isolate flex w-full flex-col items-center gap-5 overflow-hidden px-4 py-12 text-center sm:gap-6 sm:px-8 sm:py-16 lg:gap-8 lg:px-12">
        <div className="absolute inset-0 size-full max-h-screen -z-10 bg-blue-50/2" />
        <div className="flex flex-col gap-3 items-center">
          <h1 className=" text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl md:text-4xl text-center">
            Resources for <span className="text-primary-500">Modern</span>{" "}
            Learning Teams
          </h1>
          <p className="max-w-[95%] text-sm text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[85%] lg:max-w-[65%] lg:text-lg">
            Explore guides, insights, and tools to help universities, schools,
            and bootcamps run better learning communities.
          </p>
        </div>
        <div className="w-full max-w-md">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={20}
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder="Search resources..."
              aria-label="Search resources"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>
        </div>
        <div className="w-full max-w-6xl overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex md:justify-center md:overflow-visible">
          <div
            role="tablist"
            aria-label="Resource categories"
            className="inline-flex w-max items-center gap-2 rounded-full bg-purple-100 p-2 md:gap-3"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                id={`resource-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls="resource-panel"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors md:px-6 ${
                  activeTab === tab.id
                    ? "bg-white text-primary-500 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <ResourcesGrid
          activeTab={activeTab}
          searchQuery={searchQuery}
          templates={resourceTemplates}
        />
      </section>
      <DynamicFooter
        text="Need Help Getting Started?"
        description="Find answers, tutorials, and support resources in our comprehensive help center designed for educators and administrators."
      />
    </>
  );
}

export const ResourcesTabs = () => {
  return (
    <Suspense>
      <ResourcesContent />
    </Suspense>
  );
};

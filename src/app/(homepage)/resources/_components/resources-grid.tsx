"use client";

import { Search } from "lucide-react";
import { GuideResourceCard } from "./guide-resource-card";
import { WebinarResourceCard } from "./webinar-resource-card";
import { TemplateResourceCard } from "./template-resource-card";
import { resources } from "../../_lib/resources";
import type { ResourceTemplate } from "../../_lib/resource-templates";

interface ResourcesGridProps {
  activeTab: string;
  searchQuery: string;
  templates: ResourceTemplate[];
}

export const ResourcesGrid = ({
  activeTab,
  searchQuery,
  templates,
}: ResourcesGridProps) => {
  const query = searchQuery.toLowerCase();
  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query)
  );
  const filteredResources = resources.filter((resource) => {
    const matchesTab = resource.tab === activeTab;
    const matchesSearch =
      resource.title.toLowerCase().includes(query) ||
      resource?.description?.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  const showingTemplates = activeTab === "templates";
  const hasResults = showingTemplates
    ? filteredTemplates.length > 0
    : filteredResources.length > 0;

  if (!hasResults) {
    return (
      <div className="w-full max-w-6xl flex flex-col items-center justify-center gap-4 py-16 mt-8">
        <div className="text-neutral-300 mb-2">
          <Search size={48} aria-hidden="true" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No resources found
          </h3>
          <p className="text-sm text-neutral-600">
            {searchQuery
              ? `We couldn't find any resources matching "${searchQuery}". Try a different search term.`
              : "There are no resources available for this category yet. Check back soon!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="resource-panel"
      role="tabpanel"
      aria-labelledby={`resource-tab-${activeTab}`}
      className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8"
    >
      {showingTemplates
        ? filteredTemplates.map((template) => (
            <TemplateResourceCard
              key={`template-${template.slug}`}
              template={template}
            />
          ))
        : filteredResources.map((resource, index) => {
            if (resource.tab === "guides") {
              return (
                <GuideResourceCard
                  key={`guide-${resource.id}-${index}`}
                  id={resource.id}
                  title={resource.title}
                  description={resource?.description ?? " "}
                  image={resource.image}
                  link={resource.link}
                />
              );
            }
            if (resource.tab === "webinars") {
              return (
                <WebinarResourceCard
                  key={`webinar-${resource.id}-${index}`}
                  id={resource.id}
                  title={resource.title}
                  image={resource.image}
                  link={resource.link}
                  duration={resource.duration ?? "45 min"}
                />
              );
            }
            return null;
          })}
    </div>
  );
};

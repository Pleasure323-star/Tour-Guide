export interface TourStep {
  target: "home" | "people" | "dms";
  title: string;
  description: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: "home",
    title: "Your workspace",
    description:
      "Find your way around Zedu from here. Use the navigation to explore your workspace and its available features.",
  },
  {
    target: "people",
    title: "Find people",
    description:
      "Visit People to discover who is available in your workspace and find people you can connect with.",
  },
  {
    target: "dms",
    title: "Start a conversation",
    description: "Use DMs to access direct messages and connect with others.",
  },
];

export interface ResourceTemplate {
  slug: string;
  title: string;
  description: string;
  fileType: "PDF" | "DOCX" | "XLSX" | "CSV";
  fileName: string;
  preview: string;
  shareImage: string;
  metaDescription: string;
  audience: string;
  rows: string[][];
}

export const resourceTemplates: ResourceTemplate[] = [
  {
    slug: "cohort-onboarding-checklist",
    title: "Cohort Onboarding Checklist",
    description:
      "A step-by-step checklist to welcome new learners, set expectations, and get every cohort member active in week one.",
    fileType: "PDF",
    fileName: "zedu-cohort-onboarding-checklist.pdf",
    preview: "/images/homepage/resources/image-1.png",
    shareImage: "/images/homepage/resources/image-1.png",
    metaDescription:
      "Free cohort onboarding checklist for educators. Welcome learners, assign mentors, and launch your cohort with confidence.",
    audience: "Bootcamps and cohort-based programs",
    rows: [
      ["Task", "Owner", "Due", "Done"],
      ["Send welcome message and schedule", "Program lead", "Day 1", "No"],
      ["Invite learners to Zedu channels", "Program lead", "Day 1", "No"],
      ["Assign mentors and study groups", "Mentor lead", "Day 2", "No"],
      ["Share code of conduct and norms", "Program lead", "Day 2", "No"],
      ["Run orientation call and Q&A", "Facilitator", "Day 3", "No"],
      ["Confirm tool access and profiles", "Operations", "Day 3", "No"],
      ["Collect goals and availability", "Mentors", "Week 1", "No"],
      ["Publish first-week assignments", "Instructors", "Week 1", "No"],
    ],
  },
  {
    slug: "weekly-class-schedule",
    title: "Weekly Class Schedule",
    description:
      "A ready-to-fill weekly timetable for lessons, office hours, and study sessions that keeps teachers and students aligned.",
    fileType: "XLSX",
    fileName: "zedu-weekly-class-schedule.xlsx",
    preview: "/images/homepage/resources/image-2.png",
    shareImage: "/images/homepage/resources/image-2.png",
    metaDescription:
      "Free weekly class schedule template for schools. Plan lessons, office hours, and study sessions in one shared timetable.",
    audience: "Schools and classroom teachers",
    rows: [
      ["Day", "Time", "Session", "Owner", "Location"],
      ["Monday", "09:00", "Maths - Algebra basics", "Ms. Ada", "Room 4"],
      ["Monday", "11:00", "English - Essay writing", "Mr. Cole", "Room 2"],
      ["Tuesday", "09:00", "Science - Lab safety", "Dr. Efe", "Lab A"],
      ["Tuesday", "13:00", "Office hours", "All teachers", "Library"],
      ["Wednesday", "09:00", "History - Project work", "Ms. Bisi", "Room 4"],
      ["Thursday", "09:00", "Maths - Practice set", "Ms. Ada", "Room 4"],
      ["Friday", "10:00", "Assembly and review", "Head of school", "Hall"],
    ],
  },
  {
    slug: "assignment-rubric",
    title: "Assignment Rubric",
    description:
      "A fair, transparent grading rubric covering understanding, quality, presentation, and timeliness for any assignment.",
    fileType: "PDF",
    fileName: "zedu-assignment-rubric.pdf",
    preview: "/images/homepage/resources/image-3.png",
    shareImage: "/images/homepage/resources/image-3.png",
    metaDescription:
      "Free assignment rubric template for educators. Grade consistently across understanding, quality, and presentation.",
    audience: "Teachers and instructors",
    rows: [
      ["Criterion", "Excellent (4)", "Good (3)", "Needs work (2)", "Weight"],
      [
        "Understanding",
        "Explains ideas clearly",
        "Mostly clear",
        "Ideas unclear",
        "30%",
      ],
      ["Quality", "Thorough and accurate", "Minor gaps", "Incomplete", "30%"],
      [
        "Presentation",
        "Well formatted",
        "Mostly neat",
        "Hard to follow",
        "20%",
      ],
      ["Timeliness", "Submitted early", "On time", "Late", "20%"],
    ],
  },
  {
    slug: "mentor-feedback-form",
    title: "Mentor Feedback Form",
    description:
      "A structured feedback form mentors can use after each session to track progress, blockers, and next steps.",
    fileType: "DOCX",
    fileName: "zedu-mentor-feedback-form.docx",
    preview: "/images/homepage/resources/image-4.png",
    shareImage: "/images/homepage/resources/image-4.png",
    metaDescription:
      "Free mentor feedback form for bootcamps and schools. Capture session notes, ratings, and action items in minutes.",
    audience: "Mentors and coaches",
    rows: [
      ["Field", "Response"],
      ["Learner name", ""],
      ["Session date", ""],
      ["Topics covered", ""],
      ["Progress rating (1-5)", ""],
      ["Key strengths", ""],
      ["Blockers", ""],
      ["Action items", ""],
      ["Next session goal", ""],
    ],
  },
];

export function getTemplateBySlug(slug: string) {
  return resourceTemplates.find((template) => template.slug === slug);
}

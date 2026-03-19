export const PROJECT_STATUSES = [
  "Waiting to Start",
  "On Hold",
  "Planning",
  "Ready to Design",
  "Designing",
  "Await Design Feedback",
  "Design Revisions",
  "Ready to Develop",
  "Developing",
  "Await Dev Feedback",
  "Dev Revisions",
  "Project Handoff",
  "SEO Prep",
  "Done",
] as const;

export const TASK_STATUSES = ["To Do", "In Progress", "In Review", "Done"] as const;

export const TASK_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

export const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-600",
  High: "bg-orange-50 text-orange-600",
  Urgent: "bg-red-50 text-red-600",
};

export const STATUS_COLORS: Record<string, string> = {
  "Waiting to Start": "bg-slate-100 text-slate-600",
  "On Hold": "bg-amber-50 text-amber-700",
  Planning: "bg-blue-50 text-blue-600",
  "Ready to Design": "bg-indigo-50 text-indigo-600",
  Designing: "bg-violet-50 text-violet-700",
  "Await Design Feedback": "bg-purple-50 text-purple-600",
  "Design Revisions": "bg-fuchsia-50 text-fuchsia-600",
  "Ready to Develop": "bg-cyan-50 text-cyan-700",
  Developing: "bg-teal-50 text-teal-700",
  "Await Dev Feedback": "bg-emerald-50 text-emerald-600",
  "Dev Revisions": "bg-green-50 text-green-700",
  "Project Handoff": "bg-orange-50 text-orange-600",
  "SEO Prep": "bg-yellow-50 text-yellow-700",
  Done: "bg-emerald-50 text-emerald-700",
};

export const PROJECT_TAGS = ["Framer Dev", "Design", "Shopify Dev"] as const;

export const TAG_COLORS: Record<string, string> = {
  "Framer Dev": "bg-violet-50 text-violet-700 border-violet-200",
  Design: "bg-pink-50 text-pink-700 border-pink-200",
  "Shopify Dev": "bg-green-50 text-green-700 border-green-200",
};

export const MEMBER_COLORS = [
  "#007AFF",
  "#FF2D55",
  "#FF9500",
  "#34C759",
  "#AF52DE",
  "#5856D6",
  "#FF3B30",
  "#5AC8FA",
];

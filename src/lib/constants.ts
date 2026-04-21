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

export const TASK_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "To Do": { bg: "bg-slate-100 dark:bg-slate-800/60", text: "text-slate-600 dark:text-slate-300", dot: "bg-slate-400" },
  "In Progress": { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-300", dot: "bg-blue-500" },
  "In Review": { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
  Done: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
};

export const TASK_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

export const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
  Medium: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  High: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300",
  Urgent: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
};

export const STATUS_COLORS: Record<string, string> = {
  "Waiting to Start": "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
  "On Hold": "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Planning: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  "Ready to Design": "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300",
  Designing: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  "Await Design Feedback": "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300",
  "Design Revisions": "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
  "Ready to Develop": "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  Developing: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  "Await Dev Feedback": "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Dev Revisions": "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  "Project Handoff": "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300",
  "SEO Prep": "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
  Done: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

export const PROJECT_TAGS = ["Framer Dev", "Design", "Shopify Dev"] as const;

export const TAG_COLORS: Record<string, string> = {
  "Framer Dev": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60",
  Design: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900/60",
  "Shopify Dev": "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900/60",
};

export const ADMIN_TASK_STATUSES = ["To Do", "Doing", "Done"] as const;

export const ADMIN_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "To Do": { bg: "bg-slate-100 dark:bg-slate-800/60", text: "text-slate-600 dark:text-slate-300", dot: "bg-slate-400" },
  Doing: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-300", dot: "bg-blue-500" },
  Done: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
};

export const CLIENT_STATUSES = [
  "Lead",
  "Contacted",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
  "Past Client",
] as const;

export const CLIENT_STATUS_COLORS: Record<string, string> = {
  Lead: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
  Contacted: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  "Proposal Sent": "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300",
  Negotiation: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Won: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Lost: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
  "Past Client": "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
};

export const DEAL_STAGES = [
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
] as const;

export const DEAL_STAGE_COLORS: Record<string, string> = {
  Lead: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
  Qualified: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  Proposal: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300",
  Negotiation: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  Won: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Lost: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
};

export const REFERRAL_SOURCES = [
  "Cal.com Booking",
  "Instagram",
  "Twitter/X",
  "LinkedIn",
  "Referral",
  "Google Search",
  "Framer Site Showcase",
  "Cold Outreach",
  "Other",
] as const;

export const BUDGET_RANGES = [
  "< $1k",
  "$1k – $3k",
  "$3k – $5k",
  "$5k – $10k",
  "$10k – $25k",
  "$25k+",
  "Unsure",
] as const;

export const PROJECT_INTERESTS = [
  "Framer Dev",
  "Design",
  "Shopify Dev",
  "Webflow",
  "Branding",
  "SEO",
  "Other",
] as const;

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

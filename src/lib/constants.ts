export const PROJECT_STATUSES = ["Active", "On Hold", "Completed"] as const;

export const TASK_STATUSES = ["To Do", "In Progress", "In Review", "Done"] as const;

export const TASK_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

export const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-600",
  High: "bg-orange-50 text-orange-600",
  Urgent: "bg-red-50 text-red-600",
};

export const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  "On Hold": "bg-amber-50 text-amber-700",
  Completed: "bg-slate-100 text-slate-600",
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

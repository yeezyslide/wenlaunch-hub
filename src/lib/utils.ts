import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a UTC ISO date string into a local Date (noon) to avoid off-by-one
 * timezone issues with date-only values.
 */
export function parseLocalDate(isoString: string): Date {
  const [year, month, day] = isoString.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

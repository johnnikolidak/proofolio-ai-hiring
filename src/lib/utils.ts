import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Candidate-facing duration label only. The stored `duration_hours` column still
 * holds the original multi-hour estimates — this maps them onto realistic
 * short-challenge bands until a proper duration schema migration replaces the column.
 */
export function formatChallengeDuration(c: { difficulty?: string | null; duration_hours?: number | null }): string {
  if (c.difficulty === "beginner") return "~20 min";
  if (c.difficulty === "intermediate") return "~30 min";
  if (c.difficulty === "advanced") return "30–45 min";
  if (!c.duration_hours) return "20–30 min";
  if (c.duration_hours <= 4) return "~20 min";
  if (c.duration_hours <= 6) return "~30 min";
  return "30–45 min";
}

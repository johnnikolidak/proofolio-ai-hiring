import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the URL only when it uses a safe http(s) scheme, otherwise undefined.
 * Prevents javascript:, data:, vbscript: and other script-executing URIs from
 * being rendered as clickable links (stored-XSS defense for user-supplied URLs).
 */
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = String(url).trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed, "https://placeholder.invalid");
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      // Reject relative URLs (they'd resolve against the placeholder base).
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
    }
    return undefined;
  } catch {
    return undefined;
  }
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

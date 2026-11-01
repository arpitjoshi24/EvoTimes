export type DateInput = string | number | Date | null | undefined;

function parse(date: DateInput): Date | null {
  if (!date) return null;

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Human readable date, always rendered in IST so server and users agree. */
export function formatDate(date: DateInput): string {
  const parsed = parse(date);

  if (!parsed) return "Recently published";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/** ISO string for <time dateTime> and structured data, or undefined. */
export function toIso(date: DateInput): string | undefined {
  const parsed = parse(date);
  return parsed ? parsed.toISOString() : undefined;
}

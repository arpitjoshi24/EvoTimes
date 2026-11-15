export const SITE_NAME = "EvoTimes";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.evotimes.xyz"
).replace(/\/+$/, "");

export const SITE_TAGLINE = "The world of technology";

export const SITE_DESCRIPTION =
  "EvoTimes brings you the latest technology news, from AI and machine learning to cyber security, gaming, innovation and careers in tech.";

export const DEFAULT_AUTHOR = "EvoTimes Editorial";

/** Trim text to a search-snippet friendly length without cutting words. */
export function truncate(text = "", max = 160) {
  const clean = String(text).replace(/\s+/g, " ").trim();

  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");

  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

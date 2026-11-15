// The `name` values must match the category enum in the backend News model.
export interface Category {
  name: string;
  slug: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    name: "Top Stories",
    slug: "top-stories",
    description:
      "The biggest technology stories of the day, curated by the EvoTimes editorial team.",
  },
  {
    name: "AI & ML",
    slug: "ai-ml",
    description:
      "Artificial intelligence and machine learning news: new models, research breakthroughs, tools and the companies shaping AI.",
  },
  {
    name: "Cyber Security",
    slug: "cyber-security",
    description:
      "Cyber security news covering data breaches, vulnerabilities, threats and the latest ways to stay safe online.",
  },
  {
    name: "Future Tech",
    slug: "future-tech",
    description:
      "Future technology news on emerging hardware, robotics, space, quantum computing and what comes next.",
  },
  {
    name: "Gaming",
    slug: "gaming",
    description:
      "Gaming news covering new releases, hardware, esports and the technology behind modern games.",
  },
  {
    name: "Innovation",
    slug: "innovation",
    description:
      "Innovation news on startups, product launches and ideas that are changing how technology is built and used.",
  },
  {
    name: "Careers",
    slug: "careers",
    description:
      "Tech careers news: hiring trends, in-demand skills, learning paths and advice for people working in technology.",
  },
  {
    name: "Networking",
    slug: "networking",
    description:
      "Networking news on cloud, internet infrastructure, 5G, Wi-Fi and the technology that keeps the world connected.",
  },
];

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function categoryHref(category: Category | null | undefined): string {
  if (!category || category.slug === "top-stories") return "/";
  return `/category/${category.slug}`;
}

export function findCategoryBySlug(
  slug: string | null | undefined
): Category | null {
  const value = safeDecode(String(slug || "")).toLowerCase();
  return CATEGORIES.find((category) => category.slug === value) || null;
}

export function findCategoryByName(
  name: string | null | undefined
): Category | null {
  const value = safeDecode(String(name || "")).trim().toLowerCase();
  return (
    CATEGORIES.find((category) => category.name.toLowerCase() === value) || null
  );
}

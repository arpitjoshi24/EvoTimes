
import type { Metadata } from "next";
import { Suspense } from "react";

import LatestBar from "@/components/LatestBar";
import StoryGrid from "@/components/StoryGrid";

import { getNews } from "@/lib/news";
import { buildMetadata } from "@/lib/seo";
import type { Article } from "@/types/news";

type PageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

// Search results should not be indexed.
const NO_INDEX = {
  index: false,
  follow: true,
};

async function readTerm(
  searchParams: PageProps["searchParams"]
) {
  const { q } = await searchParams;
  const value = Array.isArray(q) ? q[0] : q;

  return (value || "").trim().slice(0, 100);
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const term = await readTerm(searchParams);

  return buildMetadata({
    title: term
      ? `Search results for “${term}”`
      : "Search",
    description: "Search EvoTimes for technology news.",
    path: "/search",
    robots: NO_INDEX,
  });
}

function SearchFallback() {
  return (
    <main className="mx-auto max-w-[1240px] px-4">
      <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
      <div className="mt-6 h-64 animate-pulse rounded-lg bg-gray-100" />
    </main>
  );
}

async function SearchContent({
  searchParams,
}: PageProps) {
  const term = await readTerm(searchParams);

  const {
    articles,
    total,
  }: {
    articles: Article[];
    total: number;
  } = term
    ? await getNews({ search: term, limit: 50 })
    : { articles: [], total: 0 };

  return (
    <main className="mx-auto max-w-[1240px] px-4">
      <LatestBar />

      <StoryGrid
        as="h1"
        title={
          term
            ? `Search results for “${term}”`
            : "Search Results"
        }
        articles={articles}
        total={total}
        emptyMessage={
          term
            ? "No stories found. Try another search or category."
            : "Type a search term in the box above to find stories."
        }
      />
    </main>
  );
}

export default function SearchPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
}


import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";

import JsonLd from "@/components/JsonLD";
import LatestBar from "@/components/LatestBar";
import StoryGrid from "@/components/StoryGrid";

import {
  categoryHref,
  findCategoryByName,
  findCategoryBySlug,
} from "@/lib/categories";

import { getNews } from "@/lib/news";
import { buildMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Page not found",
      robots: { index: false },
    };
  }

  return buildMetadata({
    title: `${category.name} News`,
    description: category.description,
    path: categoryHref(category),
  });
}

function CategoryFallback() {
  return (
    <main className="mx-auto max-w-[1240px] px-4">
      <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
      <div className="mt-6 h-40 animate-pulse rounded-lg bg-gray-100" />
      <div className="mt-6 h-64 animate-pulse rounded-lg bg-gray-100" />
    </main>
  );
}

async function CategoryContent({ params }: PageProps) {
  const { slug } = await params;

  const category = findCategoryBySlug(slug);

  if (!category) {
    const byName = findCategoryByName(slug);

    if (byName) {
      permanentRedirect(categoryHref(byName));
    }

    notFound();
  }

  // Top Stories is the homepage.
  if (category.slug === "top-stories") {
    permanentRedirect("/");
  }

  const { articles, total } = await getNews({
    category: category.name,
    limit: 50,
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} News`,
    description: category.description,
    url: `${SITE_URL}${categoryHref(category)}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: category.name,
          item: `${SITE_URL}${categoryHref(category)}`,
        },
      ],
    },
  };

  return (
    <main className="mx-auto max-w-[1240px] px-4">
      <LatestBar />

      <StoryGrid
        as="h1"
        title={`${category.name} News`}
        description={category.description}
        articles={articles}
        total={total}
        emptyMessage={`No ${category.name} stories yet. Check back soon.`}
      />

      <JsonLd data={structuredData} />
    </main>
  );
}

export default function CategoryPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CategoryFallback />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

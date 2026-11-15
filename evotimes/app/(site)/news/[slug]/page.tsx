import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3 } from "lucide-react";
import ArticleContent from "@/components/ArticleContent";
import JsonLd from "@/components/JsonLD";
import NewsCard from "@/components/NewsCard";
import { categoryHref, findCategoryByName } from "@/lib/categories";
import { formatDate, toIso } from "@/lib/format";
import { getArticle, getNews } from "@/lib/news";
import { buildMetadata } from "@/lib/seo";
import { DEFAULT_AUTHOR, SITE_NAME, SITE_URL, truncate } from "@/lib/site";
import type { Article } from "@/types/news";

type PageProps = { params: Promise<{ slug: string }> };

// `export const revalidate` is not allowed with Cache Components.
// Caching and the 60-second refresh live in getArticle()/getNews() in
// "@/lib/news" ("use cache" + cacheLife("minutes")).

// Cache Components needs at least one known slug at build time. The latest
// articles are prerendered; any other slug is rendered on first request.
export async function generateStaticParams() {
  try {
    const { articles } = await getNews({ limit: 20 });

    if (articles.length > 0) {
      return articles.map((article) => ({ slug: article.slug }));
    }
  } catch {
    // API unreachable at build time: fall through to the placeholder below.
  }

  return [{ slug: "latest" }];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Article not found", robots: { index: false } };
  }

  const description = truncate(article.description, 160);
  const published = toIso(article.publishedAt || article.createdAt);

  return buildMetadata({
    title: article.title,
    description,
    path: `/news/${article.slug}`,
    type: "article",
    images: article.image
      ? [{ url: article.image, alt: article.title }]
      : undefined,
    openGraph: {
      publishedTime: published,
      modifiedTime: toIso(article.updatedAt) || published,
      authors: [article.author || DEFAULT_AUTHOR],
      section: article.category,
    },
  });
}

async function getRelatedNews(article: Article): Promise<Article[]> {
  try {
    const sameCategory = await getNews({
      category: article.category,
      limit: 4,
    });

    const related = sameCategory.articles.filter(
      (item) => item.slug !== article.slug
    );

    if (related.length < 3) {
      const latest = await getNews({ limit: 8 });

      for (const item of latest.articles) {
        if (
          item.slug !== article.slug &&
          !related.some((existing) => existing.slug === item.slug)
        ) {
          related.push(item);
        }
      }
    }

    return related.slice(0, 3);
  } catch {
    // The article itself stays available if related stories fail to load.
    return [];
  }
}

export default async function NewsPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedNews = await getRelatedNews(article);

  const published = article.publishedAt || article.createdAt;
  const author = article.author || DEFAULT_AUTHOR;
  const category = findCategoryByName(article.category);
  const articleUrl = `${SITE_URL}/news/${article.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
        headline: truncate(article.title, 110),
        description: article.description,
        ...(article.image ? { image: [article.image] } : {}),
        datePublished: toIso(published),
        dateModified: toIso(article.updatedAt) || toIso(published),
        author: {
          "@type": author === DEFAULT_AUTHOR ? "Organization" : "Person",
          name: author,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
        articleSection: article.category,
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          ...(category && category.slug !== "top-stories"
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: category.name,
                  item: `${SITE_URL}${categoryHref(category)}`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: category && category.slug !== "top-stories" ? 3 : 2,
            name: article.title,
            item: articleUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto max-w-[1240px] px-4">
      <article className="mx-auto max-w-3xl py-8">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-red-700 hover:underline"
        >
          ← Back to headlines
        </Link>

        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-red-700">
          {article.category}
        </p>

        <h1 className="font-serif text-3xl font-bold leading-tight sm:text-5xl">
          {article.title}
        </h1>

        <p className="mt-4 text-lg leading-7 text-gray-600">
          {article.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-gray-200 py-3 text-xs text-gray-500">
          <span>{author}</span>

          <span className="flex items-center gap-1">
            <Clock3 size={13} aria-hidden="true" />
            <time dateTime={toIso(published)}>{formatDate(published)}</time>
          </span>
        </div>

        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            fetchPriority="high"
            decoding="async"
            className="mt-6 max-h-[520px] w-full object-cover"
          />
        )}

        <ArticleContent
          content={article.content || []}
          className="mx-auto mt-7 max-w-2xl text-base text-gray-800 sm:text-lg"
        />

        <div className="mt-8 border-t border-gray-200 pt-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Category
          </span>

          <Link
            href={category ? categoryHref(category) : "/"}
            className="ml-3 text-sm font-semibold text-red-700 hover:underline"
          >
            {article.category}
          </Link>
        </div>
      </article>

      {relatedNews.length > 0 && (
        <section className="border-t-2 border-gray-900 py-7">
          <h2 className="mb-5 font-serif text-2xl font-bold">More Stories</h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedNews.map((item) => (
              <NewsCard key={item.slug} article={item} />
            ))}
          </div>
        </section>
      )}

      <JsonLd data={structuredData} />
    </main>
  );
}
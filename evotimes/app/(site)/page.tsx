import Link from "next/link";
import JsonLd from "@/components/JsonLD";
import LatestBar from "@/components/LatestBar";
import NewsCard from "@/components/NewsCard";
import StoryGrid from "@/components/StoryGrid";
import { formatDate, toIso } from "@/lib/format";
import { getNews } from "@/lib/news";
import { buildMetadata } from "@/lib/seo";
import {
  DEFAULT_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

// Caching is handled inside getNews() in "@/lib/news" with "use cache".
// `export const revalidate` is not allowed with Cache Components.

export const metadata = buildMetadata({
  description: SITE_DESCRIPTION,
  path: "/",
});

const structuredData: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],
};

export default async function HomePage() {
  const { articles } = await getNews({ limit: 50 });

  // The API returns the newest published articles first.
  const featured = articles[0] || null;
  const headlines = articles.filter(
    (article) => article.slug !== featured?.slug
  );

  const moreHeadlines = featured ? headlines.slice(0, 4) : [];
  const remainingNews = featured ? headlines.slice(4) : headlines;

  const featuredDate = featured
    ? featured.publishedAt || featured.createdAt
    : null;

  return (
    <main className="mx-auto max-w-[1240px] px-4">
      <h1 className="sr-only">{SITE_NAME} – Latest Technology News</h1>

      <LatestBar />

      {featured && (
        <section className="grid grid-cols-1 gap-6 border-b border-gray-300 py-6 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:border-r lg:border-gray-200 lg:pr-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-red-700">
              Top Story
            </p>

            <Link href={`/news/${featured.slug}`} className="block">
              {featured.image && (
                <img
                  src={featured.image}
                  alt={featured.title}
                  fetchPriority="high"
                  decoding="async"
                  className="max-h-[390px] w-full object-cover"
                />
              )}

              <h2 className="mt-4 font-serif text-3xl font-bold leading-tight hover:text-red-700 sm:text-4xl">
                {featured.title}
              </h2>
            </Link>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              {featured.description}
            </p>

            <p className="mt-3 text-xs text-gray-500">
              <time dateTime={toIso(featuredDate)}>
                {formatDate(featuredDate)}
              </time>
              {" · "}
              {featured.author || DEFAULT_AUTHOR}
            </p>

            <Link
              href={`/news/${featured.slug}`}
              className="mt-4 inline-block text-sm font-semibold text-red-700 hover:underline"
            >
              Read full story →
            </Link>
          </div>

          <div className="lg:col-span-5">
            <h2 className="mb-4 border-b-2 border-gray-900 pb-2 font-serif text-xl font-bold">
              More Headlines
            </h2>

            {moreHeadlines.length > 0 ? (
              <div className="space-y-4">
                {moreHeadlines.map((article) => (
                  <NewsCard key={article.slug} article={article} compact />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No additional headlines yet.
              </p>
            )}
          </div>
        </section>
      )}

      <StoryGrid
        title="Latest Technology News"
        articles={remainingNews}
        total={articles.length}
        endMessage={
          articles.length > 0 && remainingNews.length === 0
            ? "You've reached the end of the latest stories."
            : undefined
        }
      />

      <JsonLd data={structuredData} />
    </main>
  );
}
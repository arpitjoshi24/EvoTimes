
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getNews } from "../services/newsService";
import NewsCard from "../components/NewsCard";

function formatDate(date) {
  if (!date) return "Recently published";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently published";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HomePage() {
  const [searchParams] = useSearchParams();

  const activeCategory = searchParams.get("category") || "Top Stories";
  const search = (searchParams.get("search") || "").trim();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchNews() {
      setLoading(true);
      setError("");

      try {
        const data = await getNews({
          category: activeCategory,
          search,
          limit: 50,
        });

        if (!cancelled) {
          setNews(data.articles || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load news. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNews();

    return () => {
      cancelled = true;
    };
  }, [activeCategory, search]);

  // The API returns the newest published articles first.
  const featured =
    activeCategory === "Top Stories" && !search
      ? news[0] || null
      : null;

  const headlines = news.filter(
    (article) => article.slug !== featured?.slug
  );

  const moreHeadlines = featured ? headlines.slice(0, 4) : [];
  const remainingNews = featured ? headlines.slice(4) : headlines;

  const heading = search
    ? "Search Results"
    : activeCategory === "Top Stories"
      ? "Latest Technology News"
      : `${activeCategory} News`;

  return (
    <main className="mx-auto max-w-[1240px] px-4">
      <div className="flex items-center gap-3 border-b border-gray-200 py-3">
        <span className="shrink-0 bg-red-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Latest
        </span>

        <p className="text-xs text-gray-700">
          Technology news, digital trends and developments.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <p className="text-sm text-gray-500">
            Loading the latest technology news...
          </p>
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <h2 className="font-serif text-2xl font-bold">
            Unable to load stories
          </h2>

          <p className="mt-3 text-sm text-gray-600">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 bg-red-700 px-5 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {featured && (
            <section className="grid grid-cols-1 gap-6 border-b border-gray-300 py-6 lg:grid-cols-12">
              <div className="lg:col-span-7 lg:border-r lg:border-gray-200 lg:pr-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-red-700">
                  Top Story
                </p>

                <Link
                  to={`/news/${featured.slug}`}
                  className="block"
                >
                  {featured.image && (
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="max-h-[390px] w-full object-cover"
                    />
                  )}

                  <h1 className="mt-4 font-serif text-3xl font-bold leading-tight hover:text-red-700 sm:text-4xl">
                    {featured.title}
                  </h1>
                </Link>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                  {featured.description}
                </p>

                <p className="mt-3 text-xs text-gray-500">
                  {formatDate(featured.publishedAt || featured.createdAt)}
                  {" · "}
                  {featured.author || "EvoTimes Editorial"}
                </p>

                <Link
                  to={`/news/${featured.slug}`}
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
                      <NewsCard
                        key={article.slug}
                        article={{
                          ...article,
                          date: formatDate(
                            article.publishedAt || article.createdAt
                          ),
                        }}
                        compact
                      />
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

          <section className="py-7">
            <div className="mb-5 flex items-center justify-between border-b-2 border-gray-900 pb-2">
              <h2 className="font-serif text-2xl font-bold">
                {heading}
              </h2>

              <span className="text-xs text-gray-500">
                {news.length} stories
              </span>
            </div>

            {remainingNews.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {remainingNews.map((article) => (
                  <NewsCard
                    key={article.slug}
                    article={{
                      ...article,
                      date: formatDate(
                        article.publishedAt || article.createdAt
                      ),
                    }}
                  />
                ))}
              </div>
            ) : news.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">
                No stories found. Try another search or category.
              </p>
            ) : featured ? (
              <p className="py-6 text-center text-sm text-gray-500">
                You've reached the end of the latest stories.
              </p>
            ) : null}
          </section>
        </>
      )}
    </main>
  );
}

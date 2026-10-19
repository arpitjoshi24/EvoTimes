
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock3 } from "lucide-react";
import { getNews, getNewsBySlug } from "../services/newsService";
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

export default function NewsPage() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchArticle() {
      setLoading(true);
      setError("");
      setArticle(null);
      setRelatedNews([]);

      try {
        const data = await getNewsBySlug(slug);

        if (cancelled) return;

        setArticle(data.article);

        try {
          const relatedData = await getNews({ limit: 50 });

          if (!cancelled) {
            const articles = relatedData.articles || [];

            const related = articles
              .filter((item) => item.slug !== data.article.slug)
              .sort((a, b) => {
                const aSameCategory =
                  a.category === data.article.category ? 1 : 0;
                const bSameCategory =
                  b.category === data.article.category ? 1 : 0;

                return bSameCategory - aSameCategory;
              })
              .slice(0, 3);

            setRelatedNews(related);
          }
        } catch {
          // The main article remains available if related stories fail.
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load this news article."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchArticle();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="mx-auto max-w-[900px] px-4 py-20 text-center">
        <p className="text-sm text-gray-500">
          Loading article...
        </p>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="mx-auto max-w-[900px] px-4 py-16 text-center">
        <h1 className="font-serif text-3xl font-bold">
          News article not found
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          {error ||
            "This article may have been removed or the link may be incorrect."}
        </p>

        <Link
          to="/"
          className="mt-6 inline-block text-sm font-semibold text-red-700 hover:underline"
        >
          ← Back to homepage
        </Link>
      </main>
    );
  }

  const publishedDate = formatDate(
    article.publishedAt || article.createdAt
  );

  return (
    <main className="mx-auto max-w-[1240px] px-4">
      <article className="mx-auto max-w-3xl py-8">
        <Link
          to="/"
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
          <span>{article.author || "EvoTimes Editorial"}</span>

          <span className="flex items-center gap-1">
            <Clock3 size={13} />
            {publishedDate}
          </span>
        </div>

        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            className="mt-6 max-h-[520px] w-full object-cover"
          />
        )}

        <div className="mx-auto mt-7 max-w-2xl">
          {(article.content || []).map((paragraph, index) => (
            <p
              key={index}
              className="mb-5 text-base leading-8 text-gray-800 sm:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8 border-t border-gray-200 pt-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Category
          </span>

          <Link
            to={`/?category=${encodeURIComponent(article.category)}`}
            className="ml-3 text-sm font-semibold text-red-700 hover:underline"
          >
            {article.category}
          </Link>
        </div>
      </article>

      {relatedNews.length > 0 && (
        <section className="border-t-2 border-gray-900 py-7">
          <h2 className="mb-5 font-serif text-2xl font-bold">
            More Stories
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedNews.map((item) => (
              <NewsCard
                key={item.slug}
                article={{
                  ...item,
                  date: formatDate(item.publishedAt || item.createdAt),
                }}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

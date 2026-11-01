import Link from "next/link";
import { Clock3 } from "lucide-react";
import { formatDate, toIso } from "@/lib/format";
import type { Article } from "@/types/news";

interface NewsCardProps {
  article: Article;
  compact?: boolean;
}

export default function NewsCard({ article, compact = false }: NewsCardProps) {
  const href = `/news/${article.slug}`;
  const published = article.publishedAt || article.createdAt;

  return (
    <article
      className={`${
        compact ? "flex gap-3" : "flex flex-col"
      } border-b border-gray-200 pb-4`}
    >
      {article.image && (
        <Link
          href={href}
          className={`block shrink-0 overflow-hidden ${
            compact ? "w-28 sm:w-36" : "w-full"
          }`}
        >
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            decoding="async"
            className={`w-full object-cover ${
              compact ? "h-20 sm:h-24" : "h-48 sm:h-52"
            }`}
          />
        </Link>
      )}

      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
          {article.category}
        </p>

        <Link href={href}>
          <h3
            className={`font-serif font-bold leading-snug text-gray-900 hover:text-red-700 ${
              compact ? "text-base sm:text-lg" : "text-xl"
            }`}
          >
            {article.title}
          </h3>
        </Link>

        {!compact && (
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {article.description}
          </p>
        )}

        <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-500">
          <Clock3 size={12} aria-hidden="true" />
          <time dateTime={toIso(published)}>{formatDate(published)}</time>
        </p>
      </div>
    </article>
  );
}

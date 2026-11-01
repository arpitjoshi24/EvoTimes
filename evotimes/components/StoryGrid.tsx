import type { ElementType } from "react";
import NewsCard from "./NewsCard";
import type { Article } from "@/types/news";

type StoryGridProps = {
  title: string;
  as?: ElementType;
  description?: string;
  articles: Article[];
  total?: number;
  emptyMessage?: string;
  endMessage?: string;
};

export default function StoryGrid({
  title,
  as: Heading = "h2",
  description,
  articles,
  total,
  emptyMessage = "No stories found. Try another search or category.",
  endMessage,
}: StoryGridProps) {
  return (
    <section className="py-7">
      <div className="mb-5 flex items-center justify-between border-b-2 border-gray-900 pb-2">
        <Heading className="font-serif text-2xl font-bold">{title}</Heading>

        <span className="text-xs text-gray-500">
          {total ?? articles.length} stories
        </span>
      </div>

      {description && (
        <p className="mb-5 max-w-3xl text-sm leading-6 text-gray-600">
          {description}
        </p>
      )}

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>
      ) : endMessage ? (
        <p className="py-6 text-center text-sm text-gray-500">{endMessage}</p>
      ) : (
        <p className="py-10 text-center text-sm text-gray-500">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}
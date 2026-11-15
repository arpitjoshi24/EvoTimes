// Server-side data access for the public site.
// Used from Server Components, generateMetadata, sitemap.ts, etc.
// Admin pages use src/services/* instead (browser requests with cookies).

import { cacheLife, cacheTag } from "next/cache";
import type { Article, NewsListResult } from "@/types/news";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

// Kept for any file that still imports it. Caching itself is now controlled
// by "use cache" + cacheLife("minutes") below (revalidates after 60 seconds).
export const REVALIDATE_SECONDS = 60;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface NewsListResponse {
  articles?: Article[];
  total?: number;
  pages?: number;
}

interface ArticleResponse {
  article?: Article;
}

// Plain fetch. With Cache Components, `next: { revalidate, tags }` on fetch
// is no longer how caching is configured; the public functions below are
// cached with "use cache" instead.
async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new ApiError(data.message || "Request failed", response.status);
  }

  return data;
}

export interface GetNewsOptions {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export async function getNews({
  page = 1,
  limit = 10,
  category,
  search,
}: GetNewsOptions = {}): Promise<NewsListResult> {
  "use cache";
  cacheLife("minutes");
  cacheTag("news");

  const query = new URLSearchParams();

  query.set("page", String(page));
  query.set("limit", String(limit));

  if (category && category !== "Top Stories") {
    query.set("category", category);
  }

  if (search) {
    query.set("search", search);
  }

  const data = await request<NewsListResponse>(`/news?${query.toString()}`);
  const articles = data.articles || [];

  return {
    articles,
    total: data.total ?? articles.length,
    pages: data.pages ?? 1,
  };
}

/** Returns the article, or null when the API says it does not exist. */
export async function getArticle(slug: string): Promise<Article | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("news");

  try {
    const data = await request<ArticleResponse>(
      `/news/slug/${encodeURIComponent(slug)}`
    );
    return data.article || null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    // Anything else (backend down, timeout) must not look like a 404 to
    // search engines, so let the error boundary handle it.
    throw error;
  }
}

/** Every published article, for the sitemap. The API caps pages at 50. */
export async function getAllArticles(): Promise<Article[]> {
  const all: Article[] = [];
  let page = 1;
  let pages = 1;

  do {
    const result = await getNews({ page, limit: 50 });
    all.push(...result.articles);
    pages = result.pages;
    page += 1;
  } while (page <= pages && page <= 200);

  return all;
}
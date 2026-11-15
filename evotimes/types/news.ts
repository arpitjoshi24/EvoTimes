export type ArticleStatus = "draft" | "published";

/** An article as returned by the backend API. */
export interface Article {
  _id: string;
  slug: string;
  title: string;
  description: string;
  content: string[];
  image?: string;
  category: string;
  author?: string;
  status?: ArticleStatus;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Fields sent when creating or updating an article. */
export interface ArticleInput {
  title: string;
  description: string;
  image: string;
  category: string;
  author: string;
  content: string[];
  status: ArticleStatus;
}

export interface AdminUser {
  email?: string;
}

export interface NewsListResult {
  articles: Article[];
  total: number;
  pages: number;
}

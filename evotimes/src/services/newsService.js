import { apiRequest } from "./api";

export async function getNews(params = {}) {
  const query = new URLSearchParams();

  query.set("page", params.page || 1);
  query.set("limit", params.limit || 10);

  if (params.category && params.category !== "Top Stories") {
    query.set("category", params.category);
  }

  if (params.search) {
    query.set("search", params.search);
  }

  return apiRequest(`/news?${query.toString()}`);
}

export async function getNewsBySlug(slug) {
  return apiRequest(`/news/slug/${encodeURIComponent(slug)}`);
}
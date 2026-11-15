import type { AdminUser, Article, ArticleInput } from "@/types/news";
import { apiRequest } from "./api";

interface AdminResponse {
  admin?: AdminUser;
  data?: { admin?: AdminUser };
}

interface ImageUploadResponse {
  imageUrl: string;
  publicId: string;
}

export async function adminLogin(email: string, password: string) {
  return apiRequest("/auth/admin-login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentAdmin() {
  return apiRequest<AdminResponse>("/auth/me");
}

export async function adminLogout() {
  return apiRequest("/auth/logout", { method: "POST" });
}

export async function getAdminNews() {
  return apiRequest<{ articles?: Article[] }>("/news/admin/all");
}

export async function getNewsForEditing(id: string) {
  return apiRequest<{ article: Article }>(`/news/admin/${id}`);
}

export async function createNews(article: ArticleInput) {
  return apiRequest("/news", {
    method: "POST",
    body: JSON.stringify(article),
  });
}

export async function uploadNewsImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return apiRequest<ImageUploadResponse>("/news/upload-image", {
    method: "POST",
    body: formData,
  });
}

export async function updateNews(id: string, article: ArticleInput) {
  return apiRequest(`/news/${id}`, {
    method: "PATCH",
    body: JSON.stringify(article),
  });
}

export async function deleteNews(id: string) {
  return apiRequest(`/news/${id}`, {
    method: "DELETE",
  });
}


import { apiRequest } from "./api";

export async function adminLogin(email, password) {
  return apiRequest("/auth/admin-login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentAdmin() {
  return apiRequest("/auth/me");
}

export async function adminLogout() {
  return apiRequest("/auth/logout", { method: "POST" });
}

export async function getAdminNews() {
  return apiRequest("/news/admin/all");
}

export async function getNewsForEditing(id) {
  return apiRequest(`/news/admin/${id}`);
}

export async function createNews(article) {
  return apiRequest("/news", {
    method: "POST",
    body: JSON.stringify(article),
  });
}

export async function updateNews(id, article) {
  return apiRequest(`/news/${id}`, {
    method: "PATCH",
    body: JSON.stringify(article),
  });
}

export async function deleteNews(id) {
  return apiRequest(`/news/${id}`, {
    method: "DELETE",
  });
}

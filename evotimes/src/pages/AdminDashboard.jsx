
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  adminLogout,
  deleteNews,
  getAdminNews,
  getCurrentAdmin,
} from "../services/adminService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const [adminResponse, newsResponse] = await Promise.all([
        getCurrentAdmin(),
        getAdminNews(),
      ]);

      setAdmin(adminResponse.admin || adminResponse.data?.admin);
      setArticles(newsResponse.articles || []);
      setError("");
    } catch (err) {
      navigate("/admin/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleLogout() {
    try {
      await adminLogout();
    } finally {
      navigate("/admin/login", { replace: true });
    }
  }

  async function handleDelete(article) {
    const confirmed = window.confirm(
      `Delete "${article.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteNews(article._id);
      setArticles((current) =>
        current.filter((item) => item._id !== article._id)
      );
    } catch (err) {
      setError(err.message || "Could not delete this article.");
    }
  }

  const publishedCount = articles.filter(
    (article) => article.status === "published"
  ).length;

  const draftCount = articles.filter(
    (article) => article.status === "draft"
  ).length;

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f6f2]">
        <p className="text-sm text-neutral-600">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#171717]">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link to="/" className="font-serif text-2xl font-bold">
            Evo<span className="text-red-700">Times</span>
            <span className="ml-3 border-l border-neutral-300 pl-3 font-sans text-xs font-medium uppercase tracking-widest text-neutral-500">
              Admin
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {admin?.email && (
              <span className="hidden text-sm text-neutral-600 sm:block">
                {admin.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="border border-neutral-300 px-4 py-2 text-sm font-semibold hover:border-red-700 hover:text-red-700"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">
              Editorial workspace
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold">
              News dashboard
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Create stories, manage drafts, and publish news.
            </p>
          </div>

          <Link
            to="/admin/news/new"
            className="bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800"
          >
            + Write an article
          </Link>
        </div>

        {error && (
          <p role="alert" className="mt-6 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total articles", value: articles.length },
            { label: "Published", value: publishedCount },
            { label: "Drafts", value: draftCount },
          ].map((stat) => (
            <div key={stat.label} className="border border-neutral-200 bg-white p-6">
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <p className="mt-2 font-serif text-4xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="font-serif text-xl font-bold">All articles</h2>
            <button
              onClick={loadDashboard}
              className="text-sm font-semibold text-red-700 hover:underline"
            >
              Refresh
            </button>
          </div>

          {articles.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <h3 className="font-serif text-xl font-bold">
                No articles yet
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Write your first story to get started.
              </p>
              <Link
                to="/admin/news/new"
                className="mt-5 inline-block font-semibold text-red-700 hover:underline"
              >
                Create your first article →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-5 py-4">Article</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Updated</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article._id} className="border-t border-neutral-100">
                      <td className="max-w-xs px-5 py-4">
                        <p className="font-semibold">{article.title}</p>
                        <p className="mt-1 truncate text-xs text-neutral-500">
                          /news/{article.slug}
                        </p>
                      </td>
                      <td className="px-5 py-4">{article.category}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-bold capitalize ${
                            article.status === "published"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-neutral-500">
                        {article.updatedAt
                          ? new Date(article.updatedAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/admin/news/${article._id}/edit`}
                            className="font-semibold text-red-700 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(article)}
                            className="font-semibold text-neutral-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                          {article.status === "published" && (
                            <a
                              href={`/news/${article.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-neutral-500 hover:text-black"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

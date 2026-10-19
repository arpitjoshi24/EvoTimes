
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createNews,
  getCurrentAdmin,
  getNewsForEditing,
  updateNews,
} from "../services/adminService";

const categories = [
  "Top Stories",
  "AI & ML",
  "Cyber Security",
  "Future Tech",
  "Gaming",
  "Innovation",
  "Careers",
  "Networking",
];

const emptyForm = {
  title: "",
  description: "",
  image: "",
  category: "Top Stories",
  author: "EvoTimes Editorial",
  content: "",
  status: "draft",
};

export default function AdminNewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function initialize() {
      try {
        await getCurrentAdmin();

        if (isEditing) {
          const response = await getNewsForEditing(id);
          const article = response.article;

          setForm({
            title: article.title || "",
            description: article.description || "",
            image: article.image || "",
            category: article.category || "Top Stories",
            author: article.author || "EvoTimes Editorial",
            content: Array.isArray(article.content)
              ? article.content.join("\n\n")
              : article.content || "",
            status: article.status || "draft",
          });
        }
      } catch {
        navigate("/admin/login", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [id, isEditing, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const article = {
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      category: form.category,
      author: form.author.trim() || "EvoTimes Editorial",
      content: form.content
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
      status: form.status,
    };

    if (!article.content.length) {
      setError("Add at least one paragraph to the article content.");
      setSaving(false);
      return;
    }

    try {
      if (isEditing) {
        await updateNews(id, article);
      } else {
        await createNews(article);
      }

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Could not save the article.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f6f2]">
        <p className="text-sm text-neutral-600">Loading editor...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-5 py-8 text-[#171717] sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin"
          className="text-sm font-semibold text-red-700 hover:underline"
        >
          ← Back to dashboard
        </Link>

        <div className="mt-6 border-t-4 border-red-700 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">
            EvoTimes Editorial
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
            {isEditing ? "Edit article" : "Write a new article"}
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Separate paragraphs with a blank line. Your article will use the
            public news page layout.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-semibold">
                Article title *
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={180}
                className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-red-700"
                placeholder="Write a clear, engaging headline"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold"
              >
                Short description *
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={3}
                maxLength={500}
                className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-red-700"
                placeholder="A short summary shown on news cards"
              />
            </div>

            <div>
              <label htmlFor="image" className="mb-2 block text-sm font-semibold">
                Cover image URL
              </label>
              <input
                id="image"
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
                className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-red-700"
                placeholder="https://example.com/image.jpg"
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="Cover preview"
                  className="mt-4 max-h-64 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  onLoad={(event) => {
                    event.currentTarget.style.display = "block";
                  }}
                />
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-red-700"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="author"
                  className="mb-2 block text-sm font-semibold"
                >
                  Author
                </label>
                <input
                  id="author"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-red-700"
                  placeholder="EvoTimes Editorial"
                />
              </div>
            </div>

            <div>
              <label htmlFor="content" className="mb-2 block text-sm font-semibold">
                Article content *
              </label>
              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                required
                rows={14}
                className="w-full resize-y border border-neutral-300 px-4 py-3 leading-7 outline-none focus:border-red-700"
                placeholder={"Write the first paragraph here.\n\nWrite the next paragraph here."}
              />
              <p className="mt-2 text-xs text-neutral-500">
                Use a blank line between paragraphs.
              </p>
            </div>

            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-semibold">
                Publication status
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-red-700"
              >
                <option value="draft">Save as draft</option>
                <option value="published">Publish article</option>
              </select>
            </div>

            {error && (
              <p role="alert" className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : isEditing
                    ? "Save changes"
                    : form.status === "published"
                      ? "Publish article"
                      : "Save draft"}
              </button>

              <Link
                to="/admin"
                className="border border-neutral-300 px-6 py-3 text-sm font-semibold hover:border-neutral-500"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import {  useRouter } from "next/navigation";
import {
  Bold,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import ArticleContent from "@/components/ArticleContent";
import { CATEGORIES } from "@/lib/categories";
import {
  createNews,
  getCurrentAdmin,
  getNewsForEditing,
  updateNews,
  uploadNewsImage,
} from "@/services/adminService";
import { errorMessage } from "@/services/api";
import type { ArticleInput } from "@/types/news";

const categories = CATEGORIES.map((category) => category.name);

interface FormState {
  title: string;
  description: string;
  image: string;
  category: string;
  author: string;
  content: string;
  status: ArticleInput["status"];
}

const emptyForm: FormState = {
  title: "",
  description: "",
  image: "",
  category: "Top Stories",
  author: "EvoTimes Editorial",
  content: "",
  status: "draft",
};

const TOOLBAR_BUTTON =
  "grid h-9 w-9 place-items-center border border-neutral-300 bg-white text-neutral-700 hover:border-red-700 hover:text-red-700";

export default function AdminNewsForm({ id }: { id?: string }) {
  
  const router = useRouter();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");

  // Cloudinary image upload state
  const [imagePublicId, setImagePublicId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function initialize() {
      try {
        await getCurrentAdmin();

        if (id) {
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
          setImagePublicId(article.imagePublicId || "");
        }
      } catch {
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [id, router]);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const result = await uploadNewsImage(file);
      setForm((current) => ({ ...current, image: result.imageUrl }));
      setImagePublicId(result.publicId);
    } catch (err) {
      setUploadError(errorMessage(err, "Image upload failed. Try again."));
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage() {
    setForm((current) => ({ ...current, image: "" }));
    setImagePublicId("");
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ---- Formatting helpers (work on the content textarea) ----

  function updateContent(value: string, selStart: number, selEnd: number) {
    setForm((current) => ({ ...current, content: value }));

    requestAnimationFrame(() => {
      const el = contentRef.current;

      if (el) {
        el.focus();
        el.setSelectionRange(selStart, selEnd);
      }
    });
  }

  // Wraps the selected text, e.g. **bold** or *italic*.
  function wrapSelection(before: string, after = before, placeholder = "text") {
    const el = contentRef.current;
    if (!el) return;

    const { selectionStart: start, selectionEnd: end, value } = el;
    const selected = value.slice(start, end) || placeholder;
    const next =
      value.slice(0, start) + before + selected + after + value.slice(end);

    updateContent(
      next,
      start + before.length,
      start + before.length + selected.length
    );
  }

  // Adds a prefix to every non-empty selected line: "- ", "1. ", "## ", "> ".
  function prefixLines(getPrefix: (index: number) => string) {
    const el = contentRef.current;
    if (!el) return;

    const { selectionStart: start, selectionEnd: end, value } = el;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = value.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = value.length;

    let counter = 0;
    const replaced = value
      .slice(lineStart, lineEnd)
      .split("\n")
      .map((line) => {
        if (!line.trim()) return line;
        const prefixed = getPrefix(counter) + line;
        counter += 1;
        return prefixed;
      })
      .join("\n");

    const next = value.slice(0, lineStart) + replaced + value.slice(lineEnd);
    updateContent(next, lineStart, lineStart + replaced.length);
  }

  function handleContentKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    const el = event.currentTarget;
    const { selectionStart, selectionEnd, value } = el;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const line = value.slice(lineStart, selectionStart);
    const match = line.match(/^(\s*)(-|\d+\.)\s(.*)$/);

    // Not inside a bullet/numbered list: behave normally.
    if (!match) return;

    event.preventDefault();

    const [, indent, marker, text] = match;

    // Pressing Enter on an empty list item ends the list.
    if (!text.trim()) {
      updateContent(
        value.slice(0, lineStart) + value.slice(selectionStart),
        lineStart,
        lineStart
      );
      return;
    }

    // Otherwise continue the list with the next bullet / number.
    const nextMarker = marker === "-" ? "-" : `${parseInt(marker, 10) + 1}.`;
    const insert = `\n${indent}${nextMarker} `;
    const position = selectionStart + insert.length;

    updateContent(
      value.slice(0, selectionStart) + insert + value.slice(selectionEnd),
      position,
      position
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const article: ArticleInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      imagePublicId,
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
      if (id) {
        await updateNews(id, article);
      } else {
        await createNews(article);
      }

      router.replace("/admin/dashboard");
    } catch (err) {
      setError(errorMessage(err, "Could not save the article."));
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
          href="/admin/dashboard"
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
            Separate paragraphs with a blank line. Use the toolbar to add bold
            text, headings and bullet points.
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
                Cover image
              </label>

              {/* File upload */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="image-file"
                  className={`cursor-pointer border border-neutral-300 px-4 py-2.5 text-sm font-semibold hover:border-red-700 hover:text-red-700 ${uploading ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {uploading ? "Uploading…" : "Choose file"}
                </label>
                <input
                  id="image-file"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleImageUpload}
                />
                <span className="text-xs text-neutral-500">JPG, PNG or WebP · max 5 MB</span>
              </div>

              {uploadError && (
                <p className="mt-2 text-xs text-red-700">{uploadError}</p>
              )}

              {/* URL fallback — still works for existing articles with plain URLs */}
              <div className="mt-3">
                <label htmlFor="image" className="mb-1 block text-xs text-neutral-500">
                  Or paste an image URL directly
                </label>
                <input
                  id="image"
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={(e) => {
                    handleChange(e);
                    // Clear publicId when URL is manually edited
                    setImagePublicId("");
                  }}
                  className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-red-700"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Preview + remove */}
              {form.image && (
                <div className="relative mt-4">
                  <img
                    src={form.image}
                    alt="Cover preview"
                    className="max-h-64 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    onLoad={(event) => {
                      event.currentTarget.style.display = "block";
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute right-2 top-2 bg-black/60 px-2 py-1 text-xs font-semibold text-white hover:bg-black/80"
                  >
                    Remove
                  </button>
                </div>
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
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="content" className="block text-sm font-semibold">
                  Article content *
                </label>

                <div className="flex text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setTab("write")}
                    className={`border px-4 py-2 ${
                      tab === "write"
                        ? "border-red-700 bg-red-700 text-white"
                        : "border-neutral-300 bg-white text-neutral-700"
                    }`}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("preview")}
                    className={`border border-l-0 px-4 py-2 ${
                      tab === "preview"
                        ? "border-red-700 bg-red-700 text-white"
                        : "border-neutral-300 bg-white text-neutral-700"
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {tab === "write" && (
                <div className="mb-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    title="Bold"
                    aria-label="Bold"
                    onClick={() => wrapSelection("**")}
                    className={TOOLBAR_BUTTON}
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    type="button"
                    title="Italic"
                    aria-label="Italic"
                    onClick={() => wrapSelection("*")}
                    className={TOOLBAR_BUTTON}
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    type="button"
                    title="Heading"
                    aria-label="Heading"
                    onClick={() => prefixLines(() => "## ")}
                    className={TOOLBAR_BUTTON}
                  >
                    <Heading2 size={16} />
                  </button>
                  <button
                    type="button"
                    title="Bullet list"
                    aria-label="Bullet list"
                    onClick={() => prefixLines(() => "- ")}
                    className={TOOLBAR_BUTTON}
                  >
                    <List size={16} />
                  </button>
                  <button
                    type="button"
                    title="Numbered list"
                    aria-label="Numbered list"
                    onClick={() => prefixLines((index) => `${index + 1}. `)}
                    className={TOOLBAR_BUTTON}
                  >
                    <ListOrdered size={16} />
                  </button>
                  <button
                    type="button"
                    title="Quote"
                    aria-label="Quote"
                    onClick={() => prefixLines(() => "> ")}
                    className={TOOLBAR_BUTTON}
                  >
                    <Quote size={16} />
                  </button>
                  <button
                    type="button"
                    title="Link"
                    aria-label="Link"
                    onClick={() => wrapSelection("[", "](https://)", "link text")}
                    className={TOOLBAR_BUTTON}
                  >
                    <Link2 size={16} />
                  </button>
                </div>
              )}

              {/* Kept mounted (just hidden) so your text and cursor are not lost
                  when you switch to Preview and back. */}
              <textarea
                ref={contentRef}
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                onKeyDown={handleContentKeyDown}
                rows={14}
                className={`w-full resize-y border border-neutral-300 px-4 py-3 leading-7 outline-none focus:border-red-700 ${
                  tab === "write" ? "" : "hidden"
                }`}
                placeholder={
                  "Write the first paragraph here.\n\nWrite the next paragraph here."
                }
              />

              {tab === "preview" && (
                <div className="min-h-[18rem] border border-neutral-300 bg-white px-4 py-4">
                  {form.content.trim() ? (
                    <ArticleContent content={form.content} />
                  ) : (
                    <p className="text-sm text-neutral-500">
                      Nothing to preview yet.
                    </p>
                  )}
                </div>
              )}

              <p className="mt-2 text-xs text-neutral-500">
                Use a blank line between paragraphs. Formatting: **bold**,
                *italic*, ## heading, - bullet point, 1. numbered point.
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
              <p
                role="alert"
                className="border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
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
                href="/admin/dashboard"
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
import Link from "next/link";

export default function NotFoundContent({
  title = "Page not found",
  message = "This page may have been removed or the link may be incorrect.",
}) {
  return (
    <main className="mx-auto max-w-[900px] px-4 py-16 text-center">
      <h1 className="font-serif text-3xl font-bold">{title}</h1>

      <p className="mt-3 text-sm text-gray-600">{message}</p>

      <Link
        href="/"
        className="mt-6 inline-block text-sm font-semibold text-red-700 hover:underline"
      >
        ← Back to homepage
      </Link>
    </main>
  );
}

"use client";

export default function SiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-[1240px] px-4">
      <div className="py-20 text-center">
        <h1 className="font-serif text-2xl font-bold">
          Unable to load stories
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          Unable to load news. Please try again.
        </p>

        <button
          onClick={() => reset()}
          className="mt-5 bg-red-700 px-5 py-2 text-sm font-semibold text-white hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    </main>
  );
}

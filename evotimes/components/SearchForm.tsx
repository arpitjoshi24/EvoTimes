"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

const BOX_CLASS =
  "ml-auto flex shrink-0 items-center border border-gray-300 focus-within:border-red-700";

const INPUT_CLASS =
  "w-24 bg-transparent px-2 py-2 text-xs text-gray-900 outline-none sm:w-36 md:w-48";

type SearchFormInnerProps = {
  initialValue: string;
};

function SearchFormInner({ initialValue }: SearchFormInnerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialValue);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const term = search.trim();

    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/");
  }

  function clearSearch() {
    setSearch("");

    if (pathname === "/search") {
      router.push("/");
    }
  }

  return (
    <form onSubmit={submitSearch} role="search" className={BOX_CLASS}>
      <Search size={15} className="ml-2 shrink-0" aria-hidden="true" />

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search news..."
        aria-label="Search news"
        className={INPUT_CLASS}
      />

      {search && (
        <button
          type="button"
          onClick={clearSearch}
          aria-label="Clear search"
          className="px-2 text-gray-500 hover:text-red-700"
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}

function SearchFormWithParams() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = pathname === "/search" ? searchParams.get("q") || "" : "";

  // `key` resets the input whenever the URL's search term changes.
  return <SearchFormInner key={query} initialValue={query} />;
}

// useSearchParams() needs a Suspense boundary so the rest of the layout can
// still be prerendered. The fallback is the same box, not yet interactive.
export default function SearchForm() {
  return (
    <Suspense
      fallback={
        <div className={BOX_CLASS}>
          <Search size={15} className="ml-2 shrink-0" aria-hidden="true" />
          <input
            disabled
            placeholder="Search news..."
            aria-label="Search news"
            className={INPUT_CLASS}
          />
        </div>
      }
    >
      <SearchFormWithParams />
    </Suspense>
  );
}
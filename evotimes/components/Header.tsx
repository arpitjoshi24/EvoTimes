"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { CATEGORIES, categoryHref } from "@/lib/categories";
import SearchForm from "./SearchForm";
import TodayDate from "./TodayDate";

export default function Header() {
  const pathname = usePathname();

  // Remember which page the menu was opened on. When the route changes the
  // two no longer match, so the menu closes itself without an effect.
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const menuOpen = openOnPath === pathname;

  return (
    <header className="mx-auto max-w-[1240px] px-4">
      <div className="flex items-center gap-3 border-b border-gray-200 py-3 text-[11px] text-gray-500">
        <TodayDate />

        <span className="hidden flex-1 text-center sm:block">
          Technology · Business · Innovation
        </span>

        <SearchForm />
      </div>

      <Link
        href="/"
        aria-label="EvoTimes home"
        className="block w-full py-5 text-center"
      >
        <span className="font-serif text-5xl font-bold tracking-tight sm:text-6xl">
          Evo<span className="text-red-700">Times</span>
        </span>

        <span className="mt-1 block text-[10px] uppercase tracking-[4px] text-gray-500">
          The world of technology
        </span>
      </Link>

      <div className="border-y-2 border-gray-900">
        <button
          onClick={() => setOpenOnPath(menuOpen ? null : pathname)}
          aria-expanded={menuOpen}
          aria-controls="site-categories"
          className="flex items-center gap-2 py-3 text-sm md:hidden"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
          Categories
        </button>

        {/* The links stay in the HTML on mobile (only hidden with CSS) so
            crawlers always see every category link. */}
        <nav
          id="site-categories"
          aria-label="Categories"
          className={`${
            menuOpen ? "flex" : "hidden"
          } flex-col md:flex md:flex-row md:items-center md:justify-center`}
        >
          {CATEGORIES.map((category) => {
            const href = categoryHref(category);
            const active = pathname === href;

            return (
              <Link
                key={category.slug}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`border-b border-gray-100 px-3 py-3 text-left text-xs font-semibold hover:text-red-700 md:border-0 md:py-4 ${
                  active ? "text-red-700" : "text-gray-800"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
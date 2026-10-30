import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Search, X, Menu } from "lucide-react";

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

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isAdminRoute = location.pathname.startsWith("/admin");

  const activeCategory = searchParams.get("category") || "Top Stories";
  const query = searchParams.get("search") || "";

  const [search, setSearch] = useState(query);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSearch(query);
  }, [query]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  if (isAdminRoute) {
    return null;
  }

  function submitSearch(event) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    const queryString = params.toString();
    navigate(queryString ? `/?${queryString}` : "/");
    setMenuOpen(false);
  }

  function chooseCategory(category) {
    const params = new URLSearchParams();

    if (category !== "Top Stories") {
      params.set("category", category);
    }

    navigate(params.toString() ? `/?${params}` : "/");
    setMenuOpen(false);
  }

  function goHome() {
    navigate("/");
    setSearch("");
    setMenuOpen(false);
  }

  return (
    <header className="mx-auto max-w-[1240px] px-4">
      <div className="flex items-center gap-3 border-b border-gray-200 py-3 text-[11px] text-gray-500">
        <span className="shrink-0">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "Asia/Kolkata",
          })}
        </span>

        <span className="hidden flex-1 text-center sm:block">
          Technology · Business · Innovation
        </span>

        <form
          onSubmit={submitSearch}
          className="ml-auto flex shrink-0 items-center border border-gray-300 focus-within:border-red-700"
        >
          <Search size={15} className="ml-2 shrink-0" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search news..."
            aria-label="Search news"
            className="w-24 bg-transparent px-2 py-2 text-xs text-gray-900 outline-none sm:w-36 md:w-48"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                navigate("/");
              }}
              aria-label="Clear search"
              className="px-2 text-gray-500 hover:text-red-700"
            >
              <X size={14} />
            </button>
          )}
        </form>
      </div>

      <button onClick={goHome} className="block w-full py-5 text-center">
        <span className="font-serif text-5xl font-bold tracking-tight sm:text-6xl">
          Evo<span className="text-red-700">Times</span>
        </span>

        <span className="mt-1 block text-[10px] uppercase tracking-[4px] text-gray-500">
          The world of technology
        </span>
      </button>

      <div className="border-y-2 border-gray-900">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 py-3 text-sm md:hidden"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
          Categories
        </button>

        <nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } flex-col md:flex md:flex-row md:items-center md:justify-center`}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => chooseCategory(category)}
              className={`border-b border-gray-100 px-3 py-3 text-left text-xs font-semibold hover:text-red-700 md:border-0 md:py-4 ${
                activeCategory === category ? "text-red-700" : "text-gray-800"
              }`}
            >
              {category}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

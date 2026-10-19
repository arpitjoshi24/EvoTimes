
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-8 border-t-4 border-red-700 bg-gray-100">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row">
        <Link to="/" className="font-serif text-3xl font-bold">
          Evo<span className="text-red-700">Times</span>
        </Link>

        <p className="text-center text-xs text-gray-500">
          Technology news, ideas and developments.
        </p>

        <span className="text-xs text-gray-500">
          © 2026 EvoTimes
        </span>
      </div>
    </footer>
  );
}

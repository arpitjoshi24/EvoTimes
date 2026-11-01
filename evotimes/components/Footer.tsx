import { cacheLife } from "next/cache";

export default async function Footer() {
  "use cache";
  cacheLife("days");

  return (
    <footer>
      {/* ...rest of your footer... */}
      <span className="text-xs text-gray-500">
        © {new Date().getFullYear()} EvoTimes
      </span>
    </footer>
  );
}
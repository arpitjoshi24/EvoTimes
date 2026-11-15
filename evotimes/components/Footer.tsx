import { cacheLife } from "next/cache";

export default async function Footer() {
  "use cache";
  cacheLife("days");

  return (
    <footer className="border-t border-gray-200 py-5 text-center">
      <p className="text-xs text-gray-500">
        © {new Date().getFullYear()} EvoTimes. All rights reserved. | Your daily dose of technology and innovation.
      </p>
    </footer>
  );
}

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NotFoundContent from "@/components/NotFoundContent";

// Shown for URLs that match no route. Unlike the old SPA, which redirected
// unknown URLs to "/", this returns a real 404 (Next.js adds noindex itself).
export default function NotFound() {
  return (
    <>
      <Header />
      <NotFoundContent />
      <Footer />
    </>
  );
}

import { Suspense } from "react";
import AdminNewsForm from "@/components/admin/AdminNewsForm";

type EditArticlePageProps = {
  params: Promise<{ id: string }>;
};

async function EditArticleContent({ params }: EditArticlePageProps) {
  const { id } = await params;

  return <AdminNewsForm id={id} />;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#f7f6f2]">
          <p className="text-sm text-neutral-600">Loading editor...</p>
        </main>
      }
    >
      <EditArticleContent params={params} />
    </Suspense>
  );
}
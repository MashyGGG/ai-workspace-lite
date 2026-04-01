import Link from "next/link";
import { notFound } from "next/navigation";
import { ImportantDocMarkdown } from "@/components/ImportantDocMarkdown";
import { getImportantDoc } from "@/lib/important-docs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ImportantDocPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const doc = getImportantDoc(slug);

  if (!doc) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="text-sm">
        <Link
          href="/docs/important"
          className="text-gray-700 underline hover:no-underline dark:text-gray-300"
        >
          ← 返回重要文档列表
        </Link>
      </div>

      <header className="border-b border-gray-200 pb-4 dark:border-gray-800">
        <h1 className="text-2xl font-bold">{doc.filename}</h1>
      </header>

      <ImportantDocMarkdown content={doc.content} />
    </main>
  );
}

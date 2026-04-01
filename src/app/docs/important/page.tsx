import Link from "next/link";
import { listImportantDocs } from "@/lib/important-docs";

export default function ImportantDocsIndexPage() {
  const docs = listImportantDocs();

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Important docs</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          浏览仓库内 <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">docs/important</code>{" "}
          下的 Markdown 文件（本地保存后刷新即可看到更新）。
        </p>
      </header>

      {docs.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          未找到文档：请确认项目根目录存在 <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">docs/important</code>{" "}
          且其中包含 <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">.md</code> 文件。
        </p>
      ) : (
        <ul className="list-inside list-disc space-y-2 text-sm">
          {docs.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/docs/important/${encodeURIComponent(d.slug)}`}
                className="text-gray-900 underline hover:no-underline dark:text-gray-100"
              >
                {d.filename}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

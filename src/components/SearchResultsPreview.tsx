import type { SearchResultItem } from "@/types/doc-qa";

const relevanceBadge: Record<string, string> = {
  high: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

export function SearchResultsPreview({
  items,
}: {
  items: SearchResultItem[];
}) {
  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">检索结果预览</h2>
      {items.length ? (
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li key={idx} className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex items-center gap-2">
                <strong>文件：</strong>
                <span>{item.filename || "未知文件"}</span>
                {item.relevance && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${relevanceBadge[item.relevance] ?? relevanceBadge.low}`}
                  >
                    {item.relevance}
                  </span>
                )}
              </div>
              <div className="mt-2 whitespace-pre-wrap text-gray-700">
                {item.text || "无文本预览"}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">当前未返回检索结果</p>
      )}
    </div>
  );
}

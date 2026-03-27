import type { Citation } from "@/types/doc-qa";

export function CitationList({ citations }: { citations: Citation[] }) {
  const unique = citations.filter(
    (item, index, arr) =>
      index === arr.findIndex((x) => x.filename === item.filename),
  );

  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">引用来源</h2>
      {unique.length ? (
        <ul className="space-y-2 text-sm">
          {unique.map((item) => (
            <li key={item.filename} className="rounded-lg bg-gray-50 p-3">
              <div className="font-medium">{item.filename}</div>
              {item.quote && (
                <div className="mt-1 text-gray-600 italic">
                  &ldquo;{item.quote}&rdquo;
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">没有返回明确引用</p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

type Props = {
  value: unknown;
};

export function JsonPreview({ value }: Props) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(value, null, 2);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">JSON 预览</h2>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          {copied ? "已复制" : "复制 JSON"}
        </button>
      </div>
      <pre className="max-h-[min(70vh,32rem)] overflow-auto whitespace-pre-wrap text-sm leading-6">
        {text}
      </pre>
    </div>
  );
}

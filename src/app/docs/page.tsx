"use client";

import { useState } from "react";
import type { DocQAResponse } from "@/types/doc-qa";
import { DocAnswerCard } from "@/components/DocAnswerCard";
import { CitationList } from "@/components/CitationList";
import { SearchResultsPreview } from "@/components/SearchResultsPreview";

export default function DocsPage() {
  const [question, setQuestion] = useState("");
  const [data, setData] = useState<DocQAResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk() {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/ask-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "请求失败");

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Doc QA v1</h1>
        <p className="text-sm text-gray-600">
          基于已上传文档进行带引用问答。
        </p>
      </header>

      <section className="space-y-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={6}
          placeholder="例如：当前版本支持哪些能力？Week 4 的目标是什么？"
          className="w-full rounded-lg border px-3 py-2"
        />

        <div className="flex gap-3">
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "检索中..." : "开始提问"}
          </button>

          <button
            onClick={() => {
              setQuestion("");
              setData(null);
              setError("");
            }}
            className="rounded-lg border px-4 py-2"
          >
            清空
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <DocAnswerCard answer={data.answer} model={data.model} />
            <CitationList citations={data.citations} />
          </div>
          <SearchResultsPreview items={data.searchResults || []} />
        </div>
      ) : null}
    </main>
  );
}

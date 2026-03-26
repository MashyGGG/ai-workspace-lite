"use client";

import { useState } from "react";
import type { ExtractionResult } from "@/schemas/extraction";
import { ExtractionResultCard } from "@/components/ExtractionResultCard";
import { JsonPreview } from "@/components/JsonPreview";
import { extractionToMarkdown } from "@/lib/extraction-markdown";

type ApiErrorBody = {
  error?: string;
  refusal?: string;
};

export default function ExtractPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySummaryDone, setCopySummaryDone] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  async function handleExtract() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = (await res.json()) as ApiErrorBody & {
        result?: ExtractionResult;
        model?: string;
      };

      if (!res.ok) {
        const base = data.error || "请求失败";
        const detail = data.refusal ? ` ${data.refusal}` : "";
        throw new Error(base + detail);
      }

      if (!data.result) {
        throw new Error("响应中缺少结构化结果。");
      }

      setResult(data.result);
      setModel(data.model || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "发生未知错误");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopySummary() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.summary);
      setCopySummaryDone(true);
      setTimeout(() => setCopySummaryDone(false), 2000);
    } catch {
      setCopySummaryDone(false);
    }
  }

  function handleExportMarkdown() {
    if (!result) return;
    const md = extractionToMarkdown(result);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extraction-result.md";
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2000);
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Structured Extractor v1</h1>
        <p className="text-sm text-gray-600">
          输入一段文本，输出结构化摘要、行动项、风险和待确认问题。
        </p>
      </header>

      <section className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder="请输入会议纪要、需求描述、项目背景说明..."
          className="w-full rounded-lg border px-3 py-2"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExtract}
            disabled={loading || !text.trim()}
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "抽取中..." : "开始抽取"}
          </button>

          <button
            type="button"
            onClick={() => {
              setText("");
              setResult(null);
              setError("");
            }}
            className="rounded-lg border px-4 py-2"
          >
            清空
          </button>

          {result ? (
            <>
              <button
                type="button"
                onClick={handleCopySummary}
                className="rounded-lg border px-4 py-2"
              >
                {copySummaryDone ? "摘要已复制" : "复制摘要"}
              </button>
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="rounded-lg border px-4 py-2"
              >
                {exportDone ? "已导出" : "导出 Markdown"}
              </button>
            </>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <ExtractionResultCard data={result} model={model} />
          <JsonPreview value={result} />
        </div>
      ) : null}
    </main>
  );
}

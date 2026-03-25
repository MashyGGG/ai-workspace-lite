 "use client";

import { useState } from "react";
import { ResultCard } from "@/components/ResultCard";
import type { PromptTask } from "@/types/prompt-task";

export default function HomePage() {
  const [text, setText] = useState("");
  const [task, setTask] = useState<PromptTask>("summarize");
  const [result, setResult] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, task }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "请求失败");
      }

      setResult(data.result || "");
      setModel(data.model || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "发生未知错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Prompt Lab v1</h1>
        <p className="text-sm text-gray-600">
          输入一段文本，选择任务，观察不同 prompt 的输出差异。
        </p>
      </header>

      <section className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">任务类型</label>
          <select
            value={task}
            onChange={(e) => setTask(e.target.value as PromptTask)}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="summarize">总结</option>
            <option value="action_items">行动项提取</option>
            <option value="risk_review">风险识别</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">输入文本</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder="请输入会议纪要、需求描述或任意文本..."
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "生成中..." : "开始生成"}
          </button>

          <button
            onClick={() => {
              setText("");
              setResult("");
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

      {result ? <ResultCard result={result} model={model} /> : null}
    </main>
  );
}

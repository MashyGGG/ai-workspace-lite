"use client";

import Link from "next/link";
import { useState } from "react";
import type { DocQAResponse } from "@/types/doc-qa";
import type { Task } from "@/types/task";
import { DocAnswerCard } from "@/components/DocAnswerCard";
import { CitationList } from "@/components/CitationList";
import { SearchResultsPreview } from "@/components/SearchResultsPreview";
import { TaskApprovalCard } from "@/components/TaskApprovalCard";
import { addTask } from "@/lib/task-store";
import { addOpLog, createOpLogFromResponse } from "@/lib/ops-store";
import type { RouteMetrics } from "@/types/api-metrics";
import { createTask } from "@/tools/create-task";

export default function DocsPage() {
  const [question, setQuestion] = useState("");
  const [data, setData] = useState<DocQAResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorBlocked, setErrorBlocked] = useState(false);
  const [taskSaved, setTaskSaved] = useState(false);
  const [pendingSaveTask, setPendingSaveTask] = useState<Task | null>(null);

  const MAX_TASK_TITLE = 200;

  function handleRequestSaveAsTask() {
    if (!data?.answer?.trim()) return;
    const title = data.answer.trim().slice(0, MAX_TASK_TITLE) || "文档问答跟进";
    setPendingSaveTask(createTask({ title, source: "docs" }));
    setTaskSaved(false);
  }

  function handleConfirmSaveTask() {
    if (!pendingSaveTask) return;
    addTask(pendingSaveTask);
    setPendingSaveTask(null);
    setTaskSaved(true);
    window.setTimeout(() => setTaskSaved(false), 2500);
  }

  function handleCancelSaveTask() {
    setPendingSaveTask(null);
  }

  async function handleAsk() {
    setLoading(true);
    setError("");
    setErrorBlocked(false);
    setData(null);
    setPendingSaveTask(null);

    try {
      const res = await fetch("/api/ask-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const json = (await res.json()) as DocQAResponse & {
        error?: string;
        blocked?: boolean;
        metrics?: RouteMetrics;
      };

      if (!res.ok) {
        setErrorBlocked(!!json.blocked);
        setError(json.error || "请求失败");
        return;
      }

      setData(json as DocQAResponse);

      if (json.metrics && json.model) {
        addOpLog(
          createOpLogFromResponse("docs", json.model, json.metrics),
        );
      }
    } catch (err) {
      setErrorBlocked(false);
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
        <p className="text-sm text-gray-600">
          需要直接阅读仓库内重要文档？请打开{" "}
          <Link href="/docs/important" className="underline hover:no-underline">
            Important docs
          </Link>
          。
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
              setErrorBlocked(false);
              setPendingSaveTask(null);
            }}
            className="rounded-lg border px-4 py-2"
          >
            清空
          </button>
        </div>
      </section>

      {error ? (
        <div
          className={
            errorBlocked
              ? "rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
              : "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          }
        >
          <p>{error}</p>
          {errorBlocked ? (
            <p className="mt-2 text-xs text-amber-900/85">
              该请求在安全预检中被判定为高风险或越权特征。请改写措辞后再试；若业务上确需继续，请改为人工处理或拆分问题。
            </p>
          ) : null}
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <DocAnswerCard answer={data.answer} model={data.model} />
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleRequestSaveAsTask}
                disabled={!!pendingSaveTask}
                className="rounded-lg border border-gray-800 px-4 py-2 text-sm disabled:opacity-50"
              >
                {taskSaved ? "已加入任务列表" : "把结论生成任务"}
              </button>
              {pendingSaveTask ? (
                <TaskApprovalCard
                  task={pendingSaveTask}
                  phase="proposed"
                  onApprove={handleConfirmSaveTask}
                  onReject={handleCancelSaveTask}
                />
              ) : null}
              <p className="text-xs text-gray-500">
                保存到本地任务列表前需确认，与 Workspace 中 AI 提议任务的审批一致。
              </p>
            </div>
            <CitationList citations={data.citations} />
          </div>
          <SearchResultsPreview items={data.searchResults || []} />
        </div>
      ) : null}
    </main>
  );
}

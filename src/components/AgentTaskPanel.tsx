"use client";

import { useState } from "react";
import type { Task } from "@/types/task";
import { addTask } from "@/lib/task-store";
import { addOpLog, createOpLogFromResponse } from "@/lib/ops-store";
import type { RouteMetrics } from "@/types/api-metrics";
import {
  TaskApprovalCard,
  type TaskApprovalPhase,
} from "@/components/TaskApprovalCard";

type AgentTaskPanelProps = {
  onTasksChanged: () => void;
};

type ApprovalUi =
  | { task: Task; phase: TaskApprovalPhase }
  | null;

export function AgentTaskPanel({ onTasksChanged }: AgentTaskPanelProps) {
  const [text, setText] = useState("");
  const [source, setSource] = useState<"extract" | "docs">("docs");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorBlocked, setErrorBlocked] = useState(false);
  const [approvalUi, setApprovalUi] = useState<ApprovalUi>(null);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setErrorBlocked(false);
    setMessage("");
    setApprovalUi(null);

    try {
      const res = await fetch("/api/agent-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source }),
      });

      const data = (await res.json()) as {
        error?: string;
        blocked?: boolean;
        message?: string;
        proposedTask?: Task | null;
        approvalRequired?: boolean;
        model?: string;
        metrics?: RouteMetrics;
      };

      if (!res.ok) {
        setErrorBlocked(!!data.blocked);
        setError(data.error || "请求失败");
        return;
      }

      setMessage(data.message || "");

      if (data.metrics && data.model) {
        addOpLog(
          createOpLogFromResponse("task", data.model, data.metrics),
        );
      }

      if (
        data.proposedTask &&
        typeof data.proposedTask === "object" &&
        data.approvalRequired
      ) {
        setApprovalUi({ task: data.proposedTask, phase: "proposed" });
      }
    } catch (err) {
      setErrorBlocked(false);
      setError(err instanceof Error ? err.message : "发生未知错误");
    } finally {
      setLoading(false);
    }
  }

  function handleApprove() {
    if (!approvalUi || approvalUi.phase !== "proposed") return;
    const { task } = approvalUi;
    addTask(task);
    setApprovalUi({ task, phase: "approved" });
    setMessage((m) => (m ? `${m}\n\n任务已确认并保存。` : "任务已确认并保存。"));
    onTasksChanged();
    window.setTimeout(() => setApprovalUi(null), 2600);
  }

  function handleReject() {
    if (!approvalUi || approvalUi.phase !== "proposed") return;
    const { task } = approvalUi;
    setApprovalUi({ task, phase: "rejected" });
    setMessage((m) => (m ? `${m}\n\n已取消保存。` : "已取消保存。"));
    window.setTimeout(() => setApprovalUi(null), 2600);
  }

  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">AI 任务助手</h2>
      <p className="text-sm text-gray-600">
        描述你要跟进的事项；模型会调用{" "}
        <code className="rounded bg-gray-100 px-1">create_task</code>{" "}
        提出任务，需你在下方确认后才会写入本地列表。
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium">来源页面</label>
        <select
          value={source}
          onChange={(e) =>
            setSource(e.target.value as Task["source"])
          }
          className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm"
        >
          <option value="extract">extract</option>
          <option value="docs">docs</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">内容</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="例如：根据这段结论，帮我创建一个跟进任务：确认 Week 4 整合页和最小工具调用闭环"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "处理中..." : "让 AI 处理"}
      </button>

      {error ? (
        <div
          className={
            errorBlocked
              ? "rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
              : "rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
          }
        >
          <p>{error}</p>
          {errorBlocked ? (
            <p className="mt-2 text-xs text-amber-900/85">
              该请求在安全预检中被判定为高风险或越权特征。请改写措辞后再试；若业务上确需继续，请改为人工处理。
            </p>
          ) : null}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-800 whitespace-pre-wrap">
          {message}
        </div>
      ) : null}

      {approvalUi ? (
        <TaskApprovalCard
          task={approvalUi.task}
          phase={approvalUi.phase}
          onApprove={approvalUi.phase === "proposed" ? handleApprove : undefined}
          onReject={approvalUi.phase === "proposed" ? handleReject : undefined}
        />
      ) : null}
    </section>
  );
}

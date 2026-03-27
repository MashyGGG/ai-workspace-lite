"use client";

import type { Task } from "@/types/task";

export type TaskApprovalPhase = "proposed" | "approved" | "rejected";

type TaskApprovalCardProps = {
  task: Task;
  phase?: TaskApprovalPhase;
  onApprove?: () => void;
  onReject?: () => void;
};

export function TaskApprovalCard({
  task,
  phase = "proposed",
  onApprove,
  onReject,
}: TaskApprovalCardProps) {
  const isDone = phase === "approved" || phase === "rejected";

  const shell =
    phase === "approved"
      ? "border-emerald-200 bg-emerald-50/90"
      : phase === "rejected"
        ? "border-gray-200 bg-gray-50"
        : "border-amber-200 bg-amber-50/80";

  const headline =
    phase === "approved"
      ? "已确认"
      : phase === "rejected"
        ? "已取消"
        : "待确认操作";

  const headlineClass =
    phase === "approved"
      ? "text-emerald-900"
      : phase === "rejected"
        ? "text-gray-700"
        : "text-amber-900";

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${shell}`}>
      <div className={`text-sm font-medium ${headlineClass}`}>{headline}</div>
      <p className="text-sm text-gray-800">
        <span className="font-medium">标题：</span>
        {task.title}
      </p>
      <p className="text-sm text-gray-800">
        <span className="font-medium">来源：</span>
        {task.source}
      </p>
      {!isDone ? (
        <p className="text-xs text-gray-600">
          模型仅提出任务，需你确认后才会写入本地列表。
        </p>
      ) : null}
      {!isDone && onApprove && onReject ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onApprove}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            确认创建
          </button>
          <button
            type="button"
            onClick={onReject}
            className="rounded-lg border border-gray-400 px-4 py-2 text-sm"
          >
            取消
          </button>
        </div>
      ) : null}
    </div>
  );
}

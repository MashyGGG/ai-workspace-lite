"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/types/task";
import { getTasks, saveTasks } from "@/lib/task-store";

type TaskListProps = {
  refreshKey?: number;
};

export function TaskList({ refreshKey = 0 }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setTasks(getTasks());
    });
    return () => cancelAnimationFrame(id);
  }, [refreshKey]);

  function toggleDone(task: Task) {
    const next: Task["status"] = task.status === "open" ? "done" : "open";
    const updated = getTasks().map((t) =>
      t.id === task.id ? { ...t, status: next } : t,
    );
    saveTasks(updated);
    setTasks(updated);
  }

  if (tasks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-sm text-gray-600">
        暂无任务。在下方输入内容让 AI 创建，或从 Extract / Docs 结果区保存。
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li
          key={t.id}
          className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
        >
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-medium text-gray-900">{t.title}</p>
            <p className="text-xs text-gray-500">
              来源：{t.source} ·{" "}
              {new Date(t.createdAt).toLocaleString(undefined, {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={
                t.status === "done"
                  ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                  : "rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900"
              }
            >
              {t.status === "done" ? "已完成" : "进行中"}
            </span>
            <button
              type="button"
              onClick={() => toggleDone(t)}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              {t.status === "open" ? "标为完成" : "恢复"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

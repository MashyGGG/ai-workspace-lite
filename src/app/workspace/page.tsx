"use client";

import { useCallback, useState } from "react";
import { AgentTaskPanel } from "@/components/AgentTaskPanel";
import { TaskList } from "@/components/TaskList";

export default function WorkspacePage() {
  const [taskListKey, setTaskListKey] = useState(0);

  const bumpTaskList = useCallback(() => {
    setTaskListKey((k) => k + 1);
  }, []);

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Workspace</h1>
        <p className="text-sm text-gray-600">
          通过 AI 工具调用创建任务，任务保存在浏览器本地，刷新后仍可查看。
        </p>
      </header>

      <AgentTaskPanel onTasksChanged={bumpTaskList} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">任务列表</h2>
        <TaskList refreshKey={taskListKey} />
      </section>
    </main>
  );
}

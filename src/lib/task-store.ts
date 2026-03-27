import type { Task } from "@/types/task";

const STORAGE_KEY = "ai-workspace-lite-tasks";

export function getTasks(): Task[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Task[]) : [];
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function addTask(task: Task) {
  const tasks = getTasks();
  tasks.unshift(task);
  saveTasks(tasks);
}

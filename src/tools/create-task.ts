import type { Task } from "@/types/task";

export type CreateTaskInput = {
  title: string;
  source: "extract" | "docs";
};

export function createTask(input: CreateTaskInput): Task {
  return {
    id: crypto.randomUUID(),
    title: input.title,
    source: input.source,
    status: "open",
    createdAt: new Date().toISOString(),
  };
}

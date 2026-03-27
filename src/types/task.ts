export type Task = {
  id: string;
  title: string;
  source: "extract" | "docs";
  status: "open" | "done";
  createdAt: string;
};

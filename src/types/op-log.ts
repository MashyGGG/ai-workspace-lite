export type OpLogRoute = "extract" | "docs" | "task";

export type OpLog = {
  id: string;
  route: OpLogRoute;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens?: number;
  latencyMs: number;
  usedFileSearch: boolean;
  usedFunctionTool: boolean;
  estimatedCostUsd: number;
  createdAt: string;
  notes?: string;
};

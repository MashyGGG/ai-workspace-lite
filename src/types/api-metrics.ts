/** Returned by extract / ask-docs / agent-task on success. */
export type RouteMetrics = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens: number;
  latencyMs: number;
  estimatedCostUsd: number;
  usedFileSearch: boolean;
  usedFunctionTool: boolean;
  /** 课程示例中的 file_search 调用次数；本应用为本地文档进上下文，通常为 0。 */
  fileSearchCalls: number;
};

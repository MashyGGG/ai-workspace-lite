import type { RouteMetrics } from "@/types/api-metrics";
import type { NormalizedUsage } from "@/lib/chat-usage";
import { estimateCostUsd } from "@/lib/cost";

export function metricsFromNormalizedUsage(opts: {
  usage: NormalizedUsage;
  latencyMs: number;
  model: string;
  usedFileSearch: boolean;
  usedFunctionTool: boolean;
  fileSearchCalls?: number;
}): RouteMetrics {
  const { inputTokens, outputTokens, totalTokens, cachedTokens } = opts.usage;
  const fileSearchCalls = opts.fileSearchCalls ?? 0;
  return {
    inputTokens,
    outputTokens,
    totalTokens,
    cachedTokens,
    latencyMs: opts.latencyMs,
    estimatedCostUsd: estimateCostUsd({
      model: opts.model,
      inputTokens,
      outputTokens,
      cachedTokens,
      fileSearchCalls,
    }),
    usedFileSearch: opts.usedFileSearch,
    usedFunctionTool: opts.usedFunctionTool,
    fileSearchCalls,
  };
}

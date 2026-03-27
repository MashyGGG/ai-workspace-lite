import type { RouteMetrics } from "@/types/api-metrics";
import type { OpLog, OpLogRoute } from "@/types/op-log";

const STORAGE_KEY = "ai-workspace-lite-ops";
const MAX_STORED = 50;

export function getOpLogs(): OpLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as OpLog[]) : [];
  } catch {
    return [];
  }
}

export function saveOpLogs(logs: OpLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function addOpLog(log: OpLog) {
  const logs = getOpLogs();
  logs.unshift(log);
  saveOpLogs(logs.slice(0, MAX_STORED));
}

export function createOpLogFromResponse(
  route: OpLogRoute,
  model: string,
  metrics: RouteMetrics,
  notes?: string,
): OpLog {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    route,
    model,
    inputTokens: metrics.inputTokens,
    outputTokens: metrics.outputTokens,
    totalTokens: metrics.totalTokens,
    cachedTokens: metrics.cachedTokens,
    latencyMs: metrics.latencyMs,
    usedFileSearch: metrics.usedFileSearch,
    usedFunctionTool: metrics.usedFunctionTool,
    estimatedCostUsd: metrics.estimatedCostUsd,
    createdAt: new Date().toISOString(),
    notes,
  };
}

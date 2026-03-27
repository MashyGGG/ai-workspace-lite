"use client";

import { useEffect, useMemo, useState } from "react";
import { getOpLogs } from "@/lib/ops-store";
import type { OpLog } from "@/types/op-log";

const DISPLAY_LIMIT = 20;

export default function OpsPage() {
  const [logs, setLogs] = useState<OpLog[]>([]);

  useEffect(() => {
    function load() {
      setLogs(getOpLogs());
    }
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, []);

  const displayed = useMemo(
    () => logs.slice(0, DISPLAY_LIMIT),
    [logs],
  );

  const summary = useMemo(() => {
    const total = logs.length;
    const avgLatency =
      total > 0
        ? logs.reduce((sum, x) => sum + x.latencyMs, 0) / total
        : 0;
    const totalCost =
      total > 0
        ? logs.reduce((sum, x) => sum + x.estimatedCostUsd, 0)
        : 0;

    return {
      total,
      avgLatency: Math.round(avgLatency),
      totalCost: totalCost.toFixed(6),
    };
  }, [logs]);

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Ops Lite v1</h1>
        <p className="text-sm text-gray-600">
          查看最近请求的 token、延迟、工具使用和估算成本（数据保存在本机
          localStorage）。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">最近请求数（全部已存）</div>
          <div className="text-2xl font-bold">{summary.total}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">平均延迟</div>
          <div className="text-2xl font-bold">{summary.avgLatency} ms</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">总估算成本（USD）</div>
          <div className="text-2xl font-bold">${summary.totalCost}</div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm overflow-auto">
        <p className="mb-3 text-xs text-gray-500">
          表格展示最近 {DISPLAY_LIMIT} 条；本地最多保留 50 条。
        </p>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="pb-2 pr-2">Route</th>
              <th className="pb-2 pr-2">Model</th>
              <th className="pb-2 pr-2">In / Out / Total</th>
              <th className="pb-2 pr-2">Latency</th>
              <th className="pb-2 pr-2">Cost</th>
              <th className="pb-2 pr-2">File search</th>
              <th className="pb-2 pr-2">Function tool</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="border-t py-6 text-center text-gray-500"
                >
                  暂无记录。在 Extract、Docs 或 Workspace 中成功发起请求后会自动记录。
                </td>
              </tr>
            ) : (
              displayed.map((log) => (
                <tr key={log.id} className="border-t border-gray-100">
                  <td className="py-2 pr-2 font-medium">{log.route}</td>
                  <td className="py-2 pr-2 break-all">{log.model}</td>
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {log.inputTokens} / {log.outputTokens} / {log.totalTokens}
                  </td>
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {log.latencyMs} ms
                  </td>
                  <td className="py-2 pr-2 whitespace-nowrap">
                    ${log.estimatedCostUsd.toFixed(6)}
                  </td>
                  <td className="py-2 pr-2">
                    {log.usedFileSearch ? "Yes" : "No"}
                  </td>
                  <td className="py-2 pr-2">
                    {log.usedFunctionTool ? "Yes" : "No"}
                  </td>
                  <td className="py-2 text-xs text-gray-600 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

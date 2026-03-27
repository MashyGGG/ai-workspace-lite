# Week 07 实现复盘（结合本仓库）

本文档对照 [week-07/README.md](./README.md) 的 **Ops Lite v1**，说明本仓库 **实际实现、与课程差异、可优化点**。

---

## 1. 到底做了什么？

| 课程能力 | 本仓库实现 | 说明 |
|----------|------------|------|
| 请求记录字段 | [src/types/op-log.ts](../../src/types/op-log.ts) `OpLog` | route / model / tokens / latency / 工具标记 / 估算成本 / 时间戳 |
| API 返回 metrics | [extract](../../src/app/api/extract/route.ts)、[ask-docs](../../src/app/api/ask-docs/route.ts)、[agent-task](../../src/app/api/agent-task/route.ts) | 成功响应含 `model` + `metrics`（含 `fileSearchCalls`，当前为 0） |
| Usage 归一化 | [src/lib/chat-usage.ts](../../src/lib/chat-usage.ts) | Chat Completions：`prompt_tokens` → `inputTokens`；两轮调用 `addNormalizedUsage` |
| 成本估算 | [src/lib/cost.ts](../../src/lib/cost.ts) | `kimi-k2.5` 为主；未知模型返回 0；含课程示例 `gpt-5-mini` 单价备查 |
| metrics 组装 | [src/lib/route-metrics.ts](../../src/lib/route-metrics.ts) | 统一调用 `estimateCostUsd` |
| 本地 ops store | [src/lib/ops-store.ts](../../src/lib/ops-store.ts) | localStorage，最多 50 条；`createOpLogFromResponse` 供页面复用 |
| 前端接入 | [extract/page](../../src/app/extract/page.tsx)、[docs/page](../../src/app/docs/page.tsx)、[AgentTaskPanel](../../src/components/AgentTaskPanel.tsx) | 成功请求后 `addOpLog` |
| Ops 页 | [src/app/ops/page.tsx](../../src/app/ops/page.tsx) | 摘要卡片 + 最近 **20** 条表；`focus` 时刷新 |
| 导航 | [AppNav](../../src/components/AppNav.tsx) | 增加 **Ops** 链接 |
| 说明文档 | [docs/ops-week7.md](../ops-week7.md)、[docs/ops-retro-week7.md](../ops-retro-week7.md) | 观测动机、边界、复盘模板 |

---

## 2. 与课程文档的差异

- 课程以 **OpenAI Responses API** 的 `input_tokens` / `file_search_call` 为例；本仓库使用 **Kimi Chat Completions**，usage 字段按 OpenAI 兼容形态映射。
- **`ask-docs` 未使用 OpenAI `file_search`**，而是本地文档拼进 system prompt，故 **`usedFileSearch` 恒为 false**，不计 file search 工具费。
- **`extractStructuredJson`** 由返回 `string` 改为返回 `{ content, usage, model }`，仅供 extract 路由读取 usage（见 [llm.ts](../../src/lib/llm.ts)）。

---

## 3. 可优化点

- 将 **Moderation / 文档加载**耗时单独记入 metrics，便于区分「模型慢」与「前置慢」。
- 定价表支持环境变量或远程配置，减少调价时改代码。
- 服务端审计日志或导出；Eval 脚本解析响应中的 `metrics` 写入报告。

---

## 相关链接

- 课程原文：[week-07/README.md](./README.md)
- 根目录：[README.md](../../README.md)

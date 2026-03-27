# Week 7：为什么要记 Ops 日志

## 为什么要记 usage / latency / tool usage

- **usage（token）**：是成本与延迟的主要驱动；没有 token 数字，无法判断「贵」在输入还是输出，也无法验证压缩 prompt 或限制 `max_completion_tokens` 是否有效。
- **latency**：区分「模型慢」「网络慢」与「本地文档拼接/安全预检」等；优化前要能量化。
- **工具使用**：`function` 工具往往意味着多轮 Chat 调用（本仓库 `agent-task` 会合并两轮 usage）；未来若接入 OpenAI `file_search`，还有按次计费项，需要在日志里显式可见。

## 这周不做什么

- 不上完整 tracing / APM 平台（如 OpenAI Agents SDK trace 全链路）。
- 不把 ops 数据写入服务端数据库（当前仅用浏览器 **localStorage**，与课程一致）。
- 不把估算成本当作对账单；定价以厂商官网为准，见 [src/lib/cost.ts](../src/lib/cost.ts) 注释。

## 希望从日志里回答的问题

1. 哪条 **route**（extract / docs / task）平均 **latency** 最高？是否与大 system 上下文或两轮 LLM 有关？
2. 哪条 route **estimatedCostUsd** 最高？是否与 **output tokens** 或未来 `file_search` 调用有关？
3. 换 **MOONSHOT_MODEL**（更小/更大）后，同输入下 token 与延迟如何变化？哪类任务可以继续用默认模型、哪类值得更强模型？

## 与本项目相关的说明

- **Docs 路由**将整库文档拼进 system prompt，属于「长上下文检索」形态；**不是** OpenAI Responses API 的 `file_search` 工具，因此 `usedFileSearch` 在日志中为 **No**，`fileSearchCalls` 在 API `metrics` 中为 **0**。

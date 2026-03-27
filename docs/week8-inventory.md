# Week 8 能力盘点

> **对外一句话**：AI Workspace Lite 是一个面向知识工作流的 AI 应用原型，支持结构化抽取、带引用文档问答、审批式任务创建、最小评测、安全边界与成本/延迟观测。

## 已完成页面

| 路径 | 说明 |
|------|------|
| `/` | 首页，能力入口卡片 |
| `/prompt` | Prompt Lab：按任务类型对比模型输出 |
| `/extract` | 结构化抽取：摘要、行动项、风险、待确认 |
| `/docs` | 文档问答：基于已索引文档，带 `citations` / `searchResults` |
| `/workspace` | 工作台：Agent 提议 `create_task`，用户确认后写入 localStorage |
| `/ops` | Ops：展示最近请求的 token、延迟、估算成本（localStorage） |

全局导航：[src/components/AppNav.tsx](../src/components/AppNav.tsx)。

## 已完成接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/generate` | Prompt Lab 文本生成 |
| POST | `/api/extract` | 结构化 JSON 抽取 |
| POST | `/api/ask-docs` | 文档 QA（本地文档载入 system 上下文 + JSON 输出） |
| POST | `/api/agent-task` | 工具调用 `create_task`，副作用仅在前端确认后落地 |

## 已完成能力

- **结构化输出**：`response_format: json_object` + Zod 校验（extract / ask-docs）。
- **检索与引用**：`ask-docs` 将索引文档拼入 prompt，返回 `citations` 与 `searchResults`（非 OpenAI 托管 `file_search`）。
- **工具与审批**：`agent-task` 暴露 `create_task`；任务列表由前端确认后写入 [src/lib/task-store.ts](../src/lib/task-store.ts)（localStorage）。
- **安全**：输入预检 [src/lib/safety.ts](../src/lib/safety.ts)（本地规则 + 可选 Kimi JSON 安全分类，见 [domestic-llm.md](domestic-llm.md)）；system 中强调文档不可信边界。
- **评测**：`npm run eval`（主数据集）、`npm run eval:security`（安全样本）。
- **可观测性**：API 响应携带 `metrics`；[src/lib/ops-store.ts](../src/lib/ops-store.ts) 记录最近请求。

## 当前最不稳定的地方

- **模型与 prompt 波动**：同一 JSONL 评测在不同模型版本下可能出现边界失败（尤其 task 类 `tool_choice` 行为）。
- **主评测报告未默认入库**：`evals/reports/report_v1.md` 需本地跑 `npm run eval` 生成，克隆仓库后可能仅有安全报告快照。
- **Docs 类「无依据」判定**：依赖 grader 与模型措辞一致，易出现 flaky，需结合报告人工判断。

## 本周不再做的新功能

- 不重构整体目录、不换栈、不引入多 Agent / MCP / Realtime。
- 不补重型后端审计、不上线 staging/prod 流水线。
- Week 8 聚焦：README、架构说明、评测摘要、失败复盘、Demo 脚本与简历材料（见 [week-08/README.md](week-08/README.md)）。

# Week 04 实现复盘（结合本仓库）

本文档对照 [week-04/README.md](./README.md) 的课程说明（**OpenAI Responses API + function calling**），总结本仓库 **实际做了什么、如何实现、为何沿用 Kimi Chat Completions**，以及 **与课程差异、失败案例、可优化点** 与 **下一周方向**。

---

## 1. 到底做了什么？

### 1.1 课程文档中的目标（AI Workspace Lite Alpha）

- 统一导航与首页；`/extract`、`/docs`、`/workspace` 可用。
- 最小工具 `create_task`（`title` + `source`），完成 **抽取/问答 → 创建任务 → 列表可见且刷新仍在**。
- API 层：`function_call` → 执行工具 → `function_call_output` 回传 → 自然语言确认（课程以 Responses API 描述）。

### 1.2 本仓库已实现的功能

| 能力 | 实现位置 | 说明 |
|------|----------|------|
| 首页三卡片 | `src/app/page.tsx` | 入口：Prompt Lab、Structured Extractor、Doc QA；文案链到 `/workspace` |
| Prompt Lab 独立路由 | `src/app/prompt/page.tsx` | 原根路径上的 Prompt Lab 迁入 `/prompt` |
| 导航 | `src/components/AppNav.tsx` | Home、`/prompt`、`/extract`、`/docs`、`/workspace` |
| 任务类型与存储 | `src/types/task.ts`、`src/lib/task-store.ts` | `localStorage` 键 `ai-workspace-lite-tasks` |
| 工具纯函数 + Schema | `src/tools/create-task.ts`、`src/tools/index.ts` | `createTask` 生成 `Task`；`createTaskTool` 为 **Chat Completions** 的 `tools[]` 形态（`type: "function"` + `function.name/parameters`） |
| Agent API | `src/app/api/agent-task/route.ts` | `POST /api/agent-task`，**两轮** `chat.completions.create`：首轮带 `tools`，解析 `tool_calls`；对每个 `create_task` 执行 `createTask` 并构造 `role: "tool"` 消息；次轮仅用消息历史拉取最终回复 |
| 工作台 UI | `src/app/workspace/page.tsx`、`AgentTaskPanel.tsx`、`TaskList.tsx` | 输入、来源、`/api/agent-task`、展示 `message`；若有 `createdTask` 则 `addTask`；列表可读本地任务并 **标为完成/恢复** |
| Extract / Docs 快捷入口 | `src/app/extract/page.tsx`、`src/app/docs/page.tsx` | 「保存为任务」「把结论生成任务」直接 `createTask` + `addTask`，不依赖模型是否调工具 |

### 1.3 与课程文档的本质差异

| 课程假设 | 本仓库 |
|----------|--------|
| `openai.responses.create`，扁平 `function_call` / `function_call_output` | 使用既有 **Kimi（Moonshot）** 客户端 `openai.chat.completions.create`，`assistant.tool_calls` + `tool` 消息完成同一闭环 |
| 示例路径 `@/lib/openai` | 复用 `@/lib/llm` 中的 `openai` 与 `DEFAULT_MODEL` |
| 首轮首页即 Prompt Lab | 首页为产品壳，`/prompt` 为 Prompt Lab（符合课程「三卡片首页」的周六描述） |

---

## 2. 怎么做？（技术路径）

1. **信息架构**：根路径 `page.tsx` 改为静态落地页（三卡片）；Prompt Lab 迁至 `/prompt`；`AppNav` 补齐 Home 与 Workspace。
2. **任务数据**：浏览器侧 `getTasks` / `saveTasks` / `addTask`；服务端 **只返回** `createdTask`，由 `AgentTaskPanel` 写入 `localStorage`（因服务端无法访问 `localStorage`）。
3. **工具调用**：首轮 user 内容包含「来源页面 + 内容」，与课程一致；对每个 `tool_call` 必须回一条 `tool`，避免 Chat Completions 报缺工具结果；若存在非 `create_task` 的调用，返回 JSON 错误说明。
4. **第二轮请求**：在已含 `tool` 结果的消息链上再请求 **一次** completions，**不传** `tools`，倾向让模型输出自然语言收束（避免未处理的再次 tool call）。
5. **产品路径 B**：Extract 优先用首条 `actionItems.task` 作为任务标题，否则用 `summary` 截断；Docs 用 `answer` 截断（上限 200 字），保证演示稳定。

### 2.1 关键代码引用

- Agent 路由：`src/app/api/agent-task/route.ts`
- 工具定义：`src/tools/index.ts`
- 工作台：`src/app/workspace/page.tsx`

---

## 3. 为什么这么做？

1. **供应商一致**：与 Week 3 相同，不为此周单独引入 OpenAI Responses，避免双 Key、双计费与双套编排。
2. **语义等价**：Chat Completions 的 tool 流程与课程描述的「调用 → 回传 → 再生成」一致，满足「最小工具调用闭环」的学习目标。
3. **演示可靠**：Extract/Docs 一键入库不经过 LLM，降低「模型未触发工具」对 Demo 的致命影响；Workspace 仍保留真实 tool 调用练习场景。

---

## 4. 失败案例（课程建议方向）

| 现象 | 可能原因 | 修复思路 |
|------|----------|----------|
| `/api/agent-task` 返回 `createdTask: null` | 工具描述或 system 不够强；用户未明确表达待办/跟进 | 加强 system（明确「创建待办时须调用 create_task」）；在工具 `description` 中写明「用户提到跟进、保存、待办时优先调用」；用户侧提示示例句 |
| 任务标题空或乱 | `arguments` 解析失败或模型 JSON 不合法 | 服务端已对每个 `tool_call` 做 try/catch；可再加 Zod 校验与一次重试 |
| 第二轮仍返回空文本 | 模型或供应商对 `tool` 消息格式敏感 | 记录原始响应；必要时在第二轮加一句短 system 要求「用一句话确认任务已创建」 |

---

## 5. 是否有优化的空间？

| 方向 | 现状 | 可优化点 |
|------|------|----------|
| 工具循环 | 固定两轮 | 抽象 `while` 直到无 `tool_calls`，支持多工具 |
| 多调用 | 多个 `create_task` 时 API 仅将 **第一个** 成功任务作为 `createdTask` 返回给前端 | 返回 `createdTasks[]` 或合并写入 |
| 持久化 | 仅 `localStorage` | 后续接用户体系与后端存储 |
| 流式输出 | 同步 JSON | SSE 改善首字延迟 |
| 严格一致课程 | 当前为 Kimi | 可选另开分支对接 OpenAI Responses（本仓库默认无 OpenAI API） |

---

## 6. 下一周要做什么？

对照课程「Week 5 接上最小 eval」方向（若你沿用同系列 README）：

- 为 `create_task` 触发率、标题质量设计简单评测集或快照测试。
- 将失败案例沉淀为回归用例（输入 → 期望是否含工具调用）。

---

## 相关链接

- 课程原文：[week-04/README.md](./README.md)
- 根目录说明：[README.md](../../README.md)

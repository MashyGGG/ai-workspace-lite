# Week 01 实现复盘（结合本仓库）

本文档对照 [week-01/README.md](./README.md) 的课程说明，总结本仓库 **实际做了什么、如何实现、为何如此设计**，以及 **可优化点** 与 **下一周方向**。

---

## 1. 到底做了什么？

### 1.1 课程文档中的目标

- 跑通 Kimi（Moonshot AI）Chat Completions 的真实调用。
- 对同一段文本执行三类任务：**总结**、**行动项提取**、**风险识别**。
- 观察不同 prompt 下的输出差异，建立「prompt 设计 → 结果对比」的基本功。

### 1.2 本仓库已实现的功能

| 能力 | 实现位置 | 说明 |
|------|----------|------|
| 首页 Prompt Lab | `src/app/page.tsx` | 文本输入、任务下拉框（三种任务）、生成 / 清空 |
| 后端生成接口 | `src/app/api/generate/route.ts` | `POST /api/generate`，校验输入与长度，调用 LLM |
| Kimi 调用封装 | `src/lib/llm.ts` 中 `generateText` | 使用 OpenAI 官方 Node SDK，指向 Moonshot `baseURL`，`chat.completions.create` |
| Prompt 资产化 | `src/prompts/`（`summarize.ts`、`action-items.ts`、`risk-review.ts`）+ `index.ts` 的 `buildPrompt` | 任务与提示词解耦，便于迭代与复盘 |
| 任务类型 | `src/types/prompt-task.ts` | `summarize` / `action_items` / `risk_review` |
| 结果展示 | `src/components/ResultCard.tsx` | 展示模型输出与模型名 |
| 全局导航 | `src/app/layout.tsx` + `src/components/AppNav.tsx` | 链到其他周功能页面 |

### 1.3 与课程文档的差异（若有）

- Week 01 README 中提到的 **401 / 网络 TLS** 等复盘条目属于「运行环境经验」，代码侧统一为 **通用错误文案**（如「生成失败，请稍后重试。」），未在 UI 上细分 HTTP 状态码。
- 输入侧增加了 **约 20000 字符** 的长度保护，避免超长文本导致接口或计费问题，属于工程上的加固，课程原文未强调。

---

## 2. 怎么做？（技术路径）

### 2.1 请求链路

1. 浏览器 `fetch("/api/generate", { text, task })`。
2. `route.ts` 校验 `text`、`task`，拒绝空输入与过长输入。
3. `buildPrompt(task, text)` 组装用户侧提示（不同任务对应不同 `prompts/*.ts`）。
4. `generateText` 发送 **system + user** 消息：system 约束「不编造、中文输出」等；user 为拼接后的任务提示。
5. 返回 `{ result, model }`，前端 `ResultCard` 展示。

### 2.2 环境与模型

- 环境变量：`MOONSHOT_API_KEY`、`MOONSHOT_BASE_URL`、`MOONSHOT_MODEL`（见根目录 `.env.example` 与 [README.md](../../README.md)）。
- 默认模型：`kimi-k2.5`（可在环境变量中覆盖）。

### 2.3 关键代码引用（便于对照）

- 生成路由：`src/app/api/generate/route.ts`
- LLM 封装：`src/lib/llm.ts` 中 `generateText`
- Prompt 入口：`src/prompts/index.ts`

---

## 3. 为什么这么做？

1. **单一职责**：页面只负责交互与展示；路由负责校验与编排；`llm.ts` 负责与供应商 API 的对话形式；`prompts/` 负责「说什么」，符合后续多周扩展（抽取、文档问答）的习惯。
2. **与供应商解耦**：通过 OpenAI 兼容客户端调用 Kimi，Week 1 专注「对话式生成」，不引入向量库、工具调用等复杂度。
3. **Prompt 外置**：同一输入切换任务即可对比输出，直接支撑课程要求的「观察点」——任务定义如何改变模型行为。
4. **轻量约束**：system 层强调不编造与语言，降低胡编概率，同时不把输出锁死为 JSON（留给 Week 2 专门练结构化输出）。

---

## 4. 是否有优化的空间？

| 方向 | 现状 | 可优化点 |
|------|------|----------|
| 错误体验 | 失败时多为统一文案 | 区分鉴权失败、网络超时、内容审核、长度超限等，返回可操作的提示（与 Week 01 README「下周准备改什么」一致） |
| 可观测性 | 控制台 `console.error` | 增加 request id、脱敏日志、或前端展示「错误码」便于排障 |
| Prompt 版本 | 文件内维护 | 引入简单版本号或变更记录，便于 A/B 与失败案例归因 |
| 生成参数 | `max_completion_tokens` 等在 `generateText` 内默认 | 按任务类型区分 `maxTokens`、必要时调温度（若供应商允许且业务需要） |
| 流式输出 | 当前为一次性返回 | 长文本可改为 stream，改善首字延迟（工程复杂度上升） |

---

## 5. 下一周要做什么？

对照 [week-02/README.md](../week-02/README.md) 与 [sample-docs/roadmap.md](../../sample-docs/roadmap.md)：

- **Week 2 主题**：把 Week 1 的**自由文本输出**升级为**固定 schema 的结构化对象**（总结、行动项、风险、待确认问题）。
- **本仓库对应实现**：`/extract` 页面 + `/api/extract` + Zod `ExtractionSchema` + Kimi `response_format: json_object`（详见 [week-02/IMPLEMENTATION_REVIEW.md](../week-02/IMPLEMENTATION_REVIEW.md)）。
- **建议你个人在 Week 1→2 衔接时**：整理 2～3 条 Week 1 失败输入，在 Week 2 用同一输入跑抽取，对比「自由文本 vs 结构化字段」的稳定性和可测试性。

---

## 相关链接

- 课程原文：[week-01/README.md](./README.md)
- 根目录说明：[README.md](../../README.md)

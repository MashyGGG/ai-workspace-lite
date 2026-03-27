---
name: Week 6 Safe Workspace
overview: 对照 [docs/week-06/README.md](docs/week-06/README.md)，本仓库已实现 Safe Workspace v1 的主体能力；计划以「验收核对 + 可选补强」为主，并说明设计取舍与可优化方向。
todos:
  - id: verify-manual
    content: 按 week-06 README Demo 脚本手工验收 /docs 与 /workspace（阻断、审批、写入）
    status: completed
  - id: optional-redteam-notes
    content: （可选）新增 notes/week6-redteam.md 记录 10 条 security 手测结果
    status: completed
  - id: optional-eval-security
    content: （可选）扩展 run-evals 或新增命令跑 security_cases_v1.jsonl 并写报告
    status: completed
  - id: optional-ui-polish
    content: （可选）Docs 页 blocked 专用提示；TaskApprovalCard 显式状态；Docs 保存任务二次确认
    status: completed
  - id: docs-skill-sync
    content: 若有代码/行为变更，增量更新 docs/week-06/IMPLEMENTATION_REVIEW.md
    status: completed
isProject: false
---

# Week 6 Safe Workspace v1 — 实施与优化计划

## 现状结论（与需求对照）


| 验收项（课程 README）                                                                   | 状态       | 主要实现位置                                                                                                                                                               |
| -------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create_task` 先返回待确认                                                             | 已满足      | `[src/app/api/agent-task/route.ts](src/app/api/agent-task/route.ts)` 返回 `proposedTask`、`approvalRequired: true`、`createdTask: null`；工具轮次用 `pendingUserApproval` 告知模型 |
| 确认后写入 `localStorage`                                                             | 已满足      | `[src/components/AgentTaskPanel.tsx](src/components/AgentTaskPanel.tsx)` 中 `handleApprove` → `[addTask](src/lib/task-store.ts)`                                      |
| `/docs` system 将检索内容视为证据非指令                                                      | 已满足      | `[src/app/api/ask-docs/route.ts](src/app/api/ask-docs/route.ts)` 的 `SYSTEM_PROMPT_PREFIX`（含 JSON 职责边界）                                                               |
| 至少 1 个接口 Moderation 预检                                                           | 已满足（2 个） | `agent-task` 与 `ask-docs` 均在调用 Kimi 前调用 `[checkUserInputSafety](src/lib/safety.ts)`                                                                                  |
| `evals/datasets/security_cases_v1.jsonl`                                         | 已满足      | 10 条，与课程示例一致并略有扩展                                                                                                                                                    |
| 文档类                                                                              | 已满足      | `[docs/security-week6.md](docs/security-week6.md)`、`[docs/security-retro-week6.md](docs/security-retro-week6.md)`                                                    |
| 根 README Week 6 登记                                                               | 已满足      | `[README.md](README.md)` 中 Week 06 双链接（与 Week 01–05 风格一致；**未**采用课程附录里的长模板段落，属仓库惯例）                                                                                   |
| `[docs/week-06/IMPLEMENTATION_REVIEW.md](docs/week-06/IMPLEMENTATION_REVIEW.md)` | 已存在      | 与技能要求对齐                                                                                                                                                              |


**结论**：核心功能与文档交付已齐；若你确认「不再改需求」，实施阶段主要是 **走一遍验收演示** 与 **按需做下列可选补强**。

---

## 架构要点（做了什么 / 怎么做 / 为什么）

```mermaid
flowchart LR
  subgraph client [Browser]
    Workspace[Workspace AgentTaskPanel]
    Docs[Docs Page]
  end
  subgraph api [Next API]
    AT["/api/agent-task"]
    AD["/api/ask-docs"]
  end
  subgraph safety [Safety Layer]
    Rules[isSuspiciousPrompt]
    Mod[moderateText OpenAI]
  end
  subgraph llm [Kimi]
    Chat[chat.completions]
  end
  Workspace --> AT
  Docs --> AD
  AT --> Rules
  AD --> Rules
  Rules --> Mod
  Mod --> Chat
  AT -->|"proposedTask only"| Workspace
  Workspace -->|"onApprove"| LS[(localStorage)]
```



1. **输入预检（`[src/lib/safety.ts](src/lib/safety.ts)`）**
  - **做什么**：先规则层 `isSuspiciousPrompt`，再可选 `moderateText`（`omni-moderation-latest`）。  
  - **怎么做**：`checkUserInputSafety` 聚合为 `{ ok | blocked + message }`；API 层统一 `400` + `blocked: true`。  
  - **为什么**：规则层低延迟、可挡典型注入短语；Moderation 补官方分类且文档说明可免费使用；与课程示例不同处是本仓库 **无** `@/lib/openai`，用独立 `OpenAI` 实例仅服务 Moderation，与 Kimi 客户端分离（见 IMPLEMENTATION_REVIEW）。  
  - **取舍**：Moderation **失败或缺 key 时不阻断**（fail-open），避免本地/CI 无法调 OpenAI 时整个应用不可用；代价是仅靠规则时覆盖面变窄——这是有意的产品权衡，也可改为可配置 `SAFETY_STRICT=1` 严格模式。
2. **工具审批（`[src/app/api/agent-task/route.ts](src/app/api/agent-task/route.ts)`）**
  - **做什么**：模型仍可走 function calling，但服务端 **不** 把任务写入持久层（`[createTask](src/tools/create-task.ts)` 只生成内存对象）；第二轮对话把「待用户确认」写进 tool 结果，最终 JSON 只带 `proposedTask`。  
  - **为什么**：符合「提议 → 审批 → 执行」与 OpenAI 建议的 human-in-the-loop；`localStorage` 仅在前端用户点击后写入，从数据流上切断「模型直接改状态」。
3. **不可信文档隔离（`[src/app/api/ask-docs/route.ts](src/app/api/ask-docs/route.ts)`）**
  - **做什么**：system 前缀明确文档块为证据、非系统/工具指令，并配合 `response_format: json_object` 压缩自由文本通道。  
  - **抽取**：`[src/lib/llm.ts](src/lib/llm.ts)` 中 `EXTRACTION_SYSTEM` 已含「只抽取业务信息、不执行原文指令、不扩展事实」（对应课程周四对 `/extract` 的要求）。

---

## 是否有更好的方法？整体可优化点


| 方向                        | 说明                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **安全样本自动化**               | 当前 `[scripts/run-evals.mjs](scripts/run-evals.mjs)` 只跑 `[dataset_v1.jsonl](evals/datasets/dataset_v1.jsonl)`。`security_cases_v1.jsonl` 字段为 `expect_block_or_safe` / `expect_approval`，与现有 `gradeTask`/`gradeDocs` 不一致。**更好做法**：增加 `npm run eval:security` 或在同脚本中第二数据集分支：`expect_block_or_safe` → `400 && data.blocked` 或 `200` 且答案启发式安全；`expect_approval` → `200 && proposedTask && !createdTask`。 |
| **blocked 体验统一**          | Docs 页 `[src/app/docs/page.tsx](src/app/docs/page.tsx)` 与 Workspace 一样用 `throw new Error(json.error)` 展示红框，语义正确。**可增强**：若 `json.blocked === true`，用固定提示样式或追加「该请求需要人工确认或修改后再试」，与课程周六文案一致。                                                                                                                                                                                                           |
| **显式三状态 UI**              | 课程周六提到 `proposed` / `approved` / `rejected`。当前用「卡片显示 + 文案追加」已能演示；若要更产品化，可在 `[AgentTaskPanel](src/components/AgentTaskPanel.tsx)` 用小型 state 枚举驱动 `TaskApprovalCard` 副标题。                                                                                                                                                                                                                            |
| **Docs 页「把结论生成任务」**       | 该按钮是 **用户显式点击** 直写 `localStorage`，不经过 `create_task` 工具链；`[docs/security-week6.md](docs/security-week6.md)` 已说明与审批流区分。若希望 **语义完全一致**，可改为先弹出与 `TaskApprovalCard` 相同的确认再 `addTask`（增加一步一致、略增摩擦）。                                                                                                                                                                                                      |
| **Extract 输入 Moderation** | 课程将预检重点放在 `agent-task` 与 `ask-docs`；对 `/api/extract` 长文本预检未强制。**后续**可在 `extract` 路由对 `text` 调用 `checkUserInputSafety`（注意长度与误杀）。                                                                                                                                                                                                                                                                    |
| **防御深度**                  | 单靠 prompt + 前置过滤无法抵抗所有改写注入；已采用的 **缩小爆炸半径**（审批、结构化输出、文档非指令）是 OpenAI 文档强调的方向；更上一层需审计日志、RBAC 等——课程已明确本周不做。                                                                                                                                                                                                                                                                                            |


---

## 建议执行顺序（待你确认计划后落地）

1. **手工验收（必做）**：按课程 Demo 脚本在 `/docs` 与 `/workspace` 各走一遍（注入问句、任务绕过确认、最终点确认写入列表）。
2. **补课程周六可选产物**：若需与 README 逐字对齐，新建 `[notes/week6-redteam.md](notes/week6-redteam.md)`，记录 10 条 `security_cases_v1` 的手测通过/失败分类。
3. **按需选做**：`eval:security` 或 blocked 专用 UI、`TaskApprovalCard` 状态枚举、Docs 保存任务二次确认。

实施收尾时，若你改动了行为或文件清单，应按 `[.cursor/skills/docs-week-implementation-review/SKILL.md](.cursor/skills/docs-week-implementation-review/SKILL.md)` **增量更新** `[docs/week-06/IMPLEMENTATION_REVIEW.md](docs/week-06/IMPLEMENTATION_REVIEW.md)` 与根 `[README.md](README.md)` 双链接（当前已存在则只更新表格/可优化点）。
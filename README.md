# AI Workspace Lite（Beta / Portfolio Edition）

面向知识工作流的 AI 应用原型：**结构化抽取**、**带引用文档问答**、**审批式任务创建**、**本地评测**、**安全预检**与 **Ops 成本/延迟摘要**。详细文档目录见 [docs/README.md](docs/README.md)。

---

## What it is

一个基于 **Next.js App Router** 与 **Kimi（Moonshot）Chat Completions** 的多页面工作台：把长文本变成稳定 JSON、在本地索引文档上问答并给出引用、通过 function tool 提议创建任务且**仅在前端确认后**写入 localStorage，并用 JSONL + 脚本做回归评测与安全样本测试。

---

## Why this project

区别于「单一聊天 Demo」，本项目强调：**可校验的结构化输出**、**有据可查的回答**、**副作用的人工闸门**、**可复现的评测与安全回归**、以及**最小可观测性**（token / latency / 估算成本）。适合作为 AI Application Engineer 路线的作品集载体。

---

## Core features

- **Structured extraction**：`/extract` → `POST /api/extract`，JSON 字段 + Zod 校验。
- **Citation-based Doc QA**：`/docs` → `POST /api/ask-docs`，文档内容进 system 上下文，`citations` / `searchResults`（非 OpenAI 托管 `file_search`）。
- **Approval-based task action**：`/workspace` → `POST /api/agent-task`（`create_task` tool），列表写入需 UI 确认。
- **Eval harness**：`npm run eval`，数据集 [evals/datasets/dataset_v1.jsonl](evals/datasets/dataset_v1.jsonl)，报告默认 [evals/reports/report_v1.md](evals/reports/report_v1.md)（运行后生成）。
- **Safety checks**：输入预检 [src/lib/safety.ts](src/lib/safety.ts)（规则 + 可选 Kimi 安全分类，无 OpenAI API）；文档侧不可信边界写在 `ask-docs` system prompt。
- **Cost / latency logging**：成功响应含 `metrics`；`/ops` 读 localStorage 近期记录。

---

## System design

- **架构与数据流（Mermaid）**：[docs/architecture-overview.md](docs/architecture-overview.md)  
- **页面与 API 对照**：见该文档末尾表格。  
- **能力盘点（Week 8）**：[docs/week8-inventory.md](docs/week8-inventory.md)

**栈说明**：与部分课程原文中的 OpenAI Responses / `file_search` 表述不同，本仓库主链路为 **Kimi Chat** + **本地文档载入**；Ops 中部分字段为与课程对齐的预留形态，以代码与本文为准。  
**国内 / 无 OpenAI API**：[docs/domestic-llm.md](docs/domestic-llm.md)（`openai` npm 包仅作兼容客户端，请求发往 Moonshot）。

---

## Evaluation

- **主评测**：`npm run dev` 后另开终端 `npm run eval`（可选 `EVAL_BASE_URL`、`EVAL_REPORT_PATH`）。需 `MOONSHOT_API_KEY` 与 `node scripts/setup-doc-index.mjs`。  
- **安全评测**：`npm run eval:security`；数据集 [evals/datasets/security_cases_v1.jsonl](evals/datasets/security_cases_v1.jsonl)，示例报告 [evals/reports/report_security_v1.md](evals/reports/report_security_v1.md)。  
- **一页摘要**：[docs/benchmark-summary.md](docs/benchmark-summary.md)  
- **规则与脚本说明**：[evals/README.md](evals/README.md)

---

## Safety

- 路由层 `checkUserInputSafety`：本地规则 + 可选 **Kimi JSON 安全分类**（与 `MOONSHOT_API_KEY` 共用，见 [docs/domestic-llm.md](docs/domestic-llm.md)）。  
- `ask-docs`：system 中声明文档内容不可作为越权指令。  
- 任务写入：仅前端确认后落地；安全样本见 `evals/datasets/security_cases_v1.jsonl`。

---

## Cost / latency（Ops）

- 页面：`/ops`。  
- 实现要点：[docs/week-07/IMPLEMENTATION_REVIEW.md](docs/week-07/IMPLEMENTATION_REVIEW.md)  
- 摘要数字与复现：[docs/benchmark-summary.md](docs/benchmark-summary.md)

---

## Failures and fixes

工程化的失败复盘（ incident / repro / root cause / fix / regression ）：

- [docs/postmortems/retrieval-miss.md](docs/postmortems/retrieval-miss.md)  
- [docs/postmortems/tool-not-called.md](docs/postmortems/tool-not-called.md)  
- [docs/postmortems/approval-boundary.md](docs/postmortems/approval-boundary.md)

---

## Roadmap

- **下一步**：向量检索与分块、服务端审计、CI 挂 eval、定价配置化等（见各周 `IMPLEMENTATION_REVIEW`）。  
- **刻意未做**：多 Agent、MCP、Realtime、重型生产基础设施（与 [docs/week-08/README.md](docs/week-08/README.md) 一致）。

---

## Demo 与求职材料

- **Demo 口播脚本**：[docs/demo-script.md](docs/demo-script.md)  
- **简历描述 + 面试摘要**：[docs/resume-and-interview.md](docs/resume-and-interview.md)

---

## 快速开始

1. 复制环境变量模板：将 [`.env.example`](.env.example) 复制为 `.env.local`（或 `.env`），填入密钥。  
2. `npm install`  
3. `npm run dev`，浏览器打开 [http://localhost:3000](http://localhost:3000)  
4. 文档问答前执行：`node scripts/setup-doc-index.mjs`

### 环境变量说明

| 变量 | 说明 |
|------|------|
| `MOONSHOT_API_KEY` | Kimi 开放平台 API Key（必填） |
| `MOONSHOT_BASE_URL` | 一般为 `https://api.moonshot.cn/v1`（国内）或官方文档推荐地址 |
| `MOONSHOT_MODEL` | 如 `kimi-k2.5`；相关 API 路由共用 |
| `MOONSHOT_SAFETY_MODEL` | 可选；输入安全 JSON 分类所用模型，默认与 `MOONSHOT_MODEL` 相同（见 [docs/domestic-llm.md](docs/domestic-llm.md)） |

> **说明：** Week 2 使用 Moonshot 文档支持的 Chat **`response_format: json_object`**，再配合 Zod 校验得到结构化对象；与 OpenAI Responses API 的 `responses.parse` 不是同一路径，但学习目标（稳定业务对象）一致。  
> **无需 `OPENAI_API_KEY`：** 本仓库不调用 OpenAI 官方 API；`npm` 依赖里的 `openai` 包仅作为访问 Moonshot 兼容接口的 HTTP 客户端。

---

## Week 01 - 文档详细内容

- 对应完整文档：[docs/week-01/README.md](docs/week-01/README.md)

- 对应复盘文档: [docs/week-01/IMPLEMENTATION_REVIEW.md](docs/week-01/IMPLEMENTATION_REVIEW.md)

## Week 02 - Structured Extractor v1

- 对应完整文档：[docs/week-02/README.md](docs/week-02/README.md)

- 对应复盘文档: [docs/week-02/IMPLEMENTATION_REVIEW.md](docs/week-02/IMPLEMENTATION_REVIEW.md)

## Week 03 - Doc QA v1

- 对应完整文档：[docs/week-03/README.md](docs/week-03/README.md)

- 对应复盘文档: [docs/week-03/IMPLEMENTATION_REVIEW.md](docs/week-03/IMPLEMENTATION_REVIEW.md)

## Week 04 - AI Workspace Lite Alpha

- 对应完整文档：[docs/week-04/README.md](docs/week-04/README.md)

- 对应复盘文档: [docs/week-04/IMPLEMENTATION_REVIEW.md](docs/week-04/IMPLEMENTATION_REVIEW.md)

## Week 05 - Eval Harness v1

- 对应完整文档：[docs/week-05/README.md](docs/week-05/README.md)

- 对应复盘文档: [docs/week-05/IMPLEMENTATION_REVIEW.md](docs/week-05/IMPLEMENTATION_REVIEW.md)

## Week 06 - Safe Workspace v1

- 对应完整文档：[docs/week-06/README.md](docs/week-06/README.md)

- 对应复盘文档: [docs/week-06/IMPLEMENTATION_REVIEW.md](docs/week-06/IMPLEMENTATION_REVIEW.md)

## Week 07 - Ops Lite v1

- 对应完整文档：[docs/week-07/README.md](docs/week-07/README.md)

- 对应复盘文档: [docs/week-07/IMPLEMENTATION_REVIEW.md](docs/week-07/IMPLEMENTATION_REVIEW.md)

## Week 08 - AI Workspace Lite Beta（Portfolio Edition）

- 对应完整文档：[docs/week-08/README.md](docs/week-08/README.md)

- 对应复盘文档: [docs/week-08/IMPLEMENTATION_REVIEW.md](docs/week-08/IMPLEMENTATION_REVIEW.md)

### 本周目标

把 AI Workspace Lite Alpha 封装成可投递、可演示、可解释的作品集版本（Beta）。

### 本周做了什么

- 完整 README（本文）与深度文档拆分至 `docs/`  
- 架构与数据流（Mermaid）：[docs/architecture-overview.md](docs/architecture-overview.md)  
- 评测与安全摘要：[docs/benchmark-summary.md](docs/benchmark-summary.md)  
- 失败复盘：[docs/postmortems/](docs/postmortems/)  
- Demo 脚本与简历材料：[docs/demo-script.md](docs/demo-script.md)、[docs/resume-and-interview.md](docs/resume-and-interview.md)  
- 能力盘点：[docs/week8-inventory.md](docs/week8-inventory.md)

### 为什么重要

作品集价值不只「本地能跑」，还包括：解决什么问题、如何工作、**哪里会失败**、**如何修复与回归**。

### 本周复盘（可自行填写）

#### 我最满意的一点

- 

#### 我最想继续补的一点

- 

#### 这个项目最能代表我的能力是什么

- 

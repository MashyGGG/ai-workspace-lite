---
name: Week 5 Eval Harness
overview: 对照课程文档，本仓库已基本完成 Week 5「Eval Harness v1」：20 条 JSONL、本地评测脚本、Markdown 报告与根 README 链接。本计划按「做什么 / 怎么做 / 为什么 / 可替代方案」梳理全流程，并标出文档与 grader 的细微偏差及可优化方向。
todos:
  - id: align-evals-readme-task
    content: （可选）将 evals/README.md 中 task 的 pass 规则改为与 gradeTask（proposedTask || createdTask）一致
    status: completed
  - id: optional-report-flag
    content: （可选）为 run-evals.mjs 增加报告输出路径参数，便于改动前后保留 report_v1 / report_v2 对比
    status: completed
isProject: false
---

# Week 5 Eval Harness v1 — 实现流程与优化分析

## 与需求文档的对照结论

[docs/week-05/README.md](docs/week-05/README.md) 的核心交付物与当前仓库状态：


| 验收项（课程）                    | 仓库现状                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `evals/dataset_v1.jsonl`   | 使用 [evals/datasets/dataset_v1.jsonl](evals/datasets/dataset_v1.jsonl)（与课程「推荐目录结构」一致，优于骨架里的扁平路径） |
| ≥20 条、三类 extract/docs/task | grep 显示 **8+8+4=20** 条，且 `docs_004` 等覆盖「文档无依据」场景                                                |
| 一键批量评测                     | [package.json](package.json) 中 `npm run eval` → [scripts/run-evals.mjs](scripts/run-evals.mjs)  |
| Markdown 报告                | 写入 [evals/reports/report_v1.md](evals/reports/report_v1.md)（运行后生成）                              |
| 改 prompt 后能按类型看涨跌          | 报告含 **By type** 汇总（`extract` / `docs` / `task` 各自 pass 数）                                       |


课程明确**本周不做**的项（OpenAI Evals API、Datasets UI、LLM-as-judge、复杂 grader、CI）——当前均未引入，符合边界。

---

## 分阶段实现流程（What / How / Why / Alternatives）

### 阶段 A：范围与文档（对应课程「周一」）

- **做什么**：建立 `evals/`、`evals/datasets/`、`evals/reports/`、`scripts/`，并写 [evals/README.md](evals/README.md)。
- **怎么做**：四段式说明——为何 eval、评什么、每类 pass/fail、本周不评什么；并补充运行前置条件（dev 服务、Moonshot Key、文档索引脚本）。
- **为什么**：先固定「评测对象与规则」，避免先写脚本再反推样本导致指标漂移。
- **更好方法**：无本质替代；若团队更大，可把 pass/fail 写成 JSON Schema 校验样本字段完整性，但仍需人工可读说明。

### 阶段 B：数据集（对应「周二–周三」）

- **做什么**：JSONL，每行一条；字段对齐课程模板：`id`、`type`、`input`、`must_include` / `must_not_include`、`notes`；docs 可加 `require_citation`；task 用 `expect_task`。
- **怎么做**：按 8/8/4 扩充；docs 刻意包含「有答案 / 部分依据 / 无依据保守回答」（如 `docs_004` 量子计算章节）。
- **为什么**：规则型 grader 依赖**可字符串匹配**的预期；抽象词会导致假阴/假阳。
- **更好方法**：`must_include` 支持 **OR 组**（同义词、多种保守措辞）可降低 flaky，但实现与维护成本上升——适合在通过率稳定后再加（[docs/week-05/IMPLEMENTATION_REVIEW.md](docs/week-05/IMPLEMENTATION_REVIEW.md) 已提及）。

### 阶段 C：评测脚本（对应「周四」）

- **做什么**：Node ESM 读 JSONL，按 `type` 调用 `POST /api/extract`、`/api/ask-docs`、`/api/agent-task`，规则打分，写 Markdown。
- **怎么做**（相对课程骨架的**合理增强**）：
  - 用 `fileURLToPath` + `path.join` 解析 **ROOT**，避免从错误 cwd 运行失败。
  - `EVAL_BASE_URL` 环境变量覆盖默认 `http://localhost:3000`。
  - 检查 `res.ok`，失败时把 HTTP 状态与 body 记入 debug。
  - 样本间 `sleep(400)` 降低限频风险。
  - 报告增加 **By type** 小节；debug 用 fenced `text` 块避免 Markdown 破坏。
- **为什么**：课程骨架是教学最小版；生产化一点的路径解析与 HTTP 处理能减少「脚本其实没打到 API」的误判。
- **更好方法**：
  - **并发 + 限流**（p-queue）可缩短总时长，但要与 Kimi 配额匹配。
  - **Vitest + MSW** 固定 mock 响应可做纯单元测试 grader，但与「测真实集成行为」目标不同；当前方案是**集成评测**，更符合 Week 5 定义。

### 阶段 D：Grader 逻辑与 API 契约

- **extract**：`JSON.stringify(result)` 上跑 `must_include` / `must_not_include`（与课程一致）。
- **docs**：在 `answer` 上跑关键字；`require_citation` 时要求 `citations.length > 0`（与 [src/app/api/ask-docs/route.ts](src/app/api/ask-docs/route.ts) 返回形状一致）。
- **task**：课程示例只看 `createdTask`；本仓库 [agent-task 路由](src/app/api/agent-task/route.ts) 存在**审批流**（可能只返回 `proposedTask` 而未 `createdTask`）。脚本中 `gradeTask` 将 `**proposedTask || createdTask`** 视为「有任务提案」更符合产品行为，但与课程字面「createdTask != null」略有偏差——这是**有意对齐实现**的选择。

**文档不一致（建议后续小修）**：[evals/README.md](evals/README.md) 仍写「`expect_task: true` 则要求 `createdTask` 非空」，与 [scripts/run-evals.mjs](scripts/run-evals.mjs) 实际逻辑不符，应改为「`proposedTask` 或 `createdTask`」以免读者误解。

### 阶段 E：根 README 与复盘（对应「周日」部分）

- **做什么**：根 [README.md](README.md) 含 Week 5 快速运行说明与链到 [docs/week-05/README.md](docs/week-05/README.md)、[docs/week-05/IMPLEMENTATION_REVIEW.md](docs/week-05/IMPLEMENTATION_REVIEW.md)。
- **怎么做**：技能 `[.cursor/skills/docs-week-implementation-review/SKILL.md](.cursor/skills/docs-week-implementation-review/SKILL.md)` 所描述的「复盘 + 双链」模式已体现在 IMPLEMENTATION_REVIEW 中。
- **为什么**：把「如何跑 eval」放在入口 README，降低协作与未来的自己遗忘成本。
- **课程周日非代码项**：1–2 分钟 Demo 视频、3 条失败案例、一页「retrieval / prompt / tool」归因——属内容产出，不在仓库代码中强制；若要做成可版本化资产，可追加 `docs/week-05/retro.md`（可选）。

---

## 数据流（便于理解 harness）

```mermaid
flowchart LR
  jsonl[dataset_v1.jsonl]
  script[run-evals.mjs]
  apiE[/api/extract]
  apiD[/api/ask-docs]
  apiT[/api/agent-task]
  report[report_v1.md]
  jsonl --> script
  script --> apiE
  script --> apiD
  script --> apiT
  apiE --> script
  apiD --> script
  apiT --> script
  script --> report
```



---

## 方案可优化点（汇总）

1. **文档与实现对齐**：更新 [evals/README.md](evals/README.md) 中 task 的 pass 规则描述（`proposedTask` / `createdTask`）。
2. **docs 类「无依据」**：除 `answer` 关键字外，可联合检查 `searchResults` 为空或低相关（需先统一 API 字段），减少「胡编但碰巧没踩 must_not_include」的漏网（IMPLEMENTATION_REVIEW 已列）。
3. **task 类 flaky**：`expect_task: false` 依赖模型不调用工具，天然不稳定；可改为软指标（多次运行统计）或单独标记为「非门禁」样本。
4. **回归对比**：课程要求「改动前后对比」；当前靠人工 diff 两份 `report_v1.md`。可增强：支持 `EVAL_REPORT_PATH` 或 `--out` 生成 `report_v2.md`，或脚本输出简短 JSON summary 便于 jq 对比。
5. **CI**：课程本周不做；后续若做，需 **headless 起 Next + eval** 或 **staging URL**，成本明显高于本地 harness。

---

## 建议的后续小动作（若你希望仓库更「闭环」）

- 修正 [evals/README.md](evals/README.md) 与 `gradeTask` 一致（纯文档，1 处）。
- 可选：为 `npm run eval` 在 README 或 evals README 中注明「需先 `npm run dev`」，与现有说明一致即可。

当前 **无需重写 harness** 即可满足 Week 5 工程验收；优化以「文档一致、对比体验、grader 精细度」为主。
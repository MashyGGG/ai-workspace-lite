# Week 05 实现复盘（结合本仓库）

本文档对照 [week-05/README.md](./README.md) 的课程说明（**Eval Harness、本地 JSONL、规则型 grader**），总结本仓库 **实际做了什么、如何实现、与课程差异**，以及 **可优化点** 与 **下一周方向**。

---

## 1. 到底做了什么？

### 1.1 课程目标（Eval Harness v1）

- 覆盖三条主链：`/api/extract`、`/api/ask-docs`、`/api/agent-task`。
- 固定数据集 `dataset_v1.jsonl`（至少 20 条，分 extract / docs / task）。
- 本地一键批量评测，输出 Markdown 报告。

### 1.2 本仓库交付物

| 能力 | 路径 | 说明 |
|------|------|------|
| Eval 说明 | [evals/README.md](../../evals/README.md) | 评测范围、pass/fail 规则、运行方式 |
| 数据集 | [evals/datasets/dataset_v1.jsonl](../../evals/datasets/dataset_v1.jsonl) | 8 extract + 8 docs + 4 task，共 20 条 |
| 运行脚本 | [scripts/run-evals.mjs](../../scripts/run-evals.mjs) | Node ESM，`fetch` 调本地 Next API，规则打分 |
| 报告 | `evals/reports/report_v1.md` | 脚本生成，含按类型汇总与逐条 debug |
| npm 脚本 | `package.json` 中 `npm run eval` | 等价 `node scripts/run-evals.mjs` |

### 1.3 与课程文档的差异

- 课程示例路径 `evals/dataset_v1.jsonl`：本仓库放在 **`evals/datasets/dataset_v1.jsonl`**，与课程推荐目录 `evals/datasets/` 一致。
- 课程骨架中 `gradeDocs` 仅用 `output.answer`：本仓库与当前 API 一致，使用顶层 `answer` / `citations`（非嵌套在单一 `output` 对象下）。
- 模型为 **Kimi（Moonshot）**，通过率会随模型与 prompt 波动；本 harness 用于**回归对比**，不保证首次全绿。

---

## 2. 怎么做？（技术路径）

1. **数据集**：JSONL，每行一个样本；`docs` 类刻意包含「文档有答案 / 部分依据 / 无依据」等情形（如 `docs_004` 量子计算指南）。
2. **脚本**：读取 JSONL → 按 `type` POST 到 `EVAL_BASE_URL`（默认 `http://localhost:3000`）→ `gradeExtract` / `gradeDocs` / `gradeTask`。
3. **请求节流**：样本间 `sleep(400)`，降低限频概率。
4. **报告**：写入 `evals/reports/report_v1.md`，便于 diff 与版本管理。

---

## 3. 为什么这么做？

1. **规则型 grader** 可解释、易维护，符合课程「先不要 LLM-as-judge」。
2. **直连本地 API** 无需 OpenAI Evals 平台，与 Week 1–4 的 Kimi 栈一致。
3. **Markdown 报告** 便于与 Git 或笔记对比「改 prompt 前后」。

---

## 4. 可优化点

| 方向 | 说明 |
|------|------|
| Grader | docs 类对「无依据」可同时检查 `answer` 与 `searchResults` 是否为空 |
| 稳定性 | task 类对 `expect_task: false` 的样本可能因模型误触工具而 flaky，可改为统计通过率而非硬门禁 |
| CI | 后续可对 `npm run eval` 做可选 job（需 dev server 或 test server） |
| 配置 | `must_include` 支持同义 OR 组（正则或小词表） |

---

## 5. 下一周方向

对照 [week-06/README.md](../week-06/README.md)：在保留 eval 的前提下，为 `agent-task` / `ask-docs` 增加安全预检与**审批式**任务写入；安全样本可扩展为独立 JSONL 并由脚本或手工回归。

---

## 相关链接

- 课程原文：[week-05/README.md](./README.md)
- 根目录说明：[README.md](../../README.md)

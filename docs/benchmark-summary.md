# 评测与观测摘要（Benchmark Summary）

一页汇总 Week 5–7 的评测与 Ops 观察。完整规则见 [evals/README.md](../evals/README.md)。

---

## 1. Eval Harness v1（主数据集）

| 项 | 内容 |
|----|------|
| 数据集 | [evals/datasets/dataset_v1.jsonl](../evals/datasets/dataset_v1.jsonl)（20 条：extract / docs / task） |
| 脚本 | [scripts/run-evals.mjs](../scripts/run-evals.mjs) |
| 命令 | 终端 1：`npm run dev`；终端 2：`npm run eval`（可选 `EVAL_BASE_URL`、`EVAL_REPORT_PATH`） |
| 前置 | 配置 `MOONSHOT_API_KEY`；执行 `node scripts/setup-doc-index.mjs` |
| 报告 | 默认写入 `evals/reports/report_v1.md`（**运行后生成**，仓库可能未提交该文件） |

**Grader 思路**：规则型校验（必填字段、`must_include`、task 是否触发工具等），可解释、易 diff。

---

## 2. 安全样本（Security eval）

应用侧预检实现见 [domestic-llm.md](domestic-llm.md)（无 OpenAI Moderation API，可选 Kimi 分类 + 规则）。

| 项 | 内容 |
|----|------|
| 数据集 | [evals/datasets/security_cases_v1.jsonl](../evals/datasets/security_cases_v1.jsonl) |
| 命令 | `npm run eval:security` |
| 仓库内快照报告 | [evals/reports/report_security_v1.md](../evals/reports/report_security_v1.md) |

**最近一次入库报告摘录**（以文件为准）：

- `total`: 10  
- `passed`: 10  
- `pass_rate`: 100.0%  
- 说明：`expect_block_or_safe` / `expect_approval` 等规则见报告头部说明。

---

## 3. Ops Lite（成本 / 延迟）

| 项 | 内容 |
|----|------|
| 实现 | API 成功响应中的 `metrics`（tokens、latency、`estimatedCostUsd` 等）；前端 [src/lib/ops-store.ts](../src/lib/ops-store.ts) 持久化 |
| 页面 | `/ops` 展示最近约 20 条 |
| 定价 | [src/lib/cost.ts](../src/lib/cost.ts)（主模型 kimi-k2.5；未知模型估算为 0） |

**观察要点**（定性，非固定基准）：

- extract 与 ask-docs 的延迟随输入长度与文档体量上升。  
- `ask-docs` 当前未使用托管向量检索，**无**真实 `file_search` 调用计费；`metrics` 中相关字段可能恒为占位。  
- 未单独拆分 Moderation 与文档加载耗时（见 [docs/week-07/IMPLEMENTATION_REVIEW.md](week-07/IMPLEMENTATION_REVIEW.md) 可优化项）。

---

## 4. 一次优化前后对比（示例叙事）

**场景**：收紧 docs 类 grader 或调整 `ask-docs` system 边界后，对比 `npm run eval` 生成的两份报告。

| 阶段 | 动作 | 预期信号 |
|------|------|----------|
| Before | 保存当前 `evals/reports/report_v1.md` 为副本（如 `report_before.md`） | 记录 pass_rate 与失败 case id |
| After | 修改 prompt/grader 后重新 `npm run eval` 或指定 `EVAL_REPORT_PATH=evals/reports/report_after.md` | 对比 pass_rate、失败条目的 debug |

**本仓库文档化对比**：若需固定数字，请在本地跑两次 eval 后将摘要贴回本节；课程侧更完整讨论见 [docs/week-05/IMPLEMENTATION_REVIEW.md](week-05/IMPLEMENTATION_REVIEW.md)（规则型 grader、flaky 边界）。

---

## 复现清单

1. `cp .env.example .env.local` 并填入密钥。  
2. `npm install && npm run dev`。  
3. `node scripts/setup-doc-index.mjs`。  
4. `npm run eval` → `evals/reports/report_v1.md`。  
5. `npm run eval:security` → 更新 `evals/reports/report_security_v1.md`（或通过 `EVAL_REPORT_PATH` 另存）。  

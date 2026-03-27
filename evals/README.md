# Eval Harness v1

## 为什么要做 eval

在迭代 prompt、schema 或工具描述时，仅凭主观感受无法判断改动是变好还是变差。固定数据集 + 可重复运行能建立「改动 → 回归 → 对比」的习惯。

## 这周评什么

三类主链（与 [docs/week-05/README.md](../docs/week-05/README.md) 一致）：

| 类型 | 接口 | 关注点 |
|------|------|--------|
| `extract` | `POST /api/extract` | `must_include` / `must_not_include` 规则命中 |
| `docs` | `POST /api/ask-docs` | 答案关键词、可选引用、`require_citation` |
| `task` | `POST /api/agent-task` | `expect_task` 与是否返回 `proposedTask` / `createdTask`（审批流下可能仅有提案） |

## 每类怎么判断 pass / fail

- **extract**：将响应中的 `result` 序列化为字符串，检查是否包含全部 `must_include`、且不包含任一 `must_not_include`。
- **docs**：在 `answer` 上检查 `must_include` / `must_not_include`；若样本 `require_citation: true`，则要求 `citations.length > 0`。
- **task**：若 `expect_task: true` 则要求 `proposedTask` 或 `createdTask` 至少其一非空（与当前 API 一致：用户确认前可能只有 `proposedTask`）；若为 `false` 则要求二者皆空（不触发任务提案）。

## 这周先不评什么

- OpenAI Evals API / Datasets UI  
- LLM-as-a-judge、复杂 grader  
- CI 自动门禁  

## 如何运行

1. 配置 `MOONSHOT_API_KEY`，并确保已生成文档索引：`node scripts/setup-doc-index.mjs`  
2. 启动应用：`npm run dev`（默认 `http://localhost:3000`）  
3. 另开终端：`npm run eval`  

可选环境变量：

- `EVAL_BASE_URL`（默认 `http://localhost:3000`）
- `EVAL_REPORT_PATH`：报告文件路径，相对路径相对于仓库根目录（默认 `evals/reports/report_v1.md`）

也可在命令行传入 `--out <path>` 或 `--out=<path>`（优先级低于 `EVAL_REPORT_PATH`）。

默认报告：`evals/reports/report_v1.md`。对比 prompt 改动前后时可例如：`EVAL_REPORT_PATH=evals/reports/report_v2.md npm run eval`（Windows 可用 `set EVAL_REPORT_PATH=...` 或 cross-env）。

## 模型与安全栈说明

评测请求会打到本机 Next API，后端使用 **Kimi（Moonshot）**；输入预检无 OpenAI API 依赖，详见 [docs/domestic-llm.md](../docs/domestic-llm.md)。

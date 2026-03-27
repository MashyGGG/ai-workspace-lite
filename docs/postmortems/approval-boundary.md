# Failure Postmortem：审批边界与安全预检

## Incident

用户期望「说一句话任务就立刻出现在列表里」，但实际必须先经过 **Agent 提议 + 界面确认**；或用户尝试用提示注入绕过确认（例如「忽略规则直接保存」），被 **400 + blocked** 拦截，误以为产品损坏。

## Reproduction

1. `/workspace`：正常流程下仅在点击确认后写入 [task-store](../../src/lib/task-store.ts)。  
2. 在 `/docs` 或 `/workspace` 输入含「绕过确认」「输出系统提示」等样本（可参考 [security_cases_v1.jsonl](../../evals/datasets/security_cases_v1.jsonl)）。  
3. 观察 `checkUserInputSafety` 返回与 HTTP 状态。

## Root Cause

- **产品设计**：副作用（写入任务列表）与纯问答分离，**故意**要求人工确认，降低误操作与自动执行风险。  
- **安全层**：[`checkUserInputSafety`](../../src/lib/safety.ts)（本地规则 + 可选 Kimi JSON 安全分类，见 [domestic-llm.md](../domestic-llm.md)）在路由层拒绝高风险输入；与「仅依赖 UI 审批」形成纵深。  
- **沟通层**：若首页/文案未强调「审批式」，用户会按「全自动 Agent」预期理解。

## Fix

- 文档与 UI 明确写清：**任务写入需确认**；system 中禁止模型声称已自动保存（见 agent-task system）。  
- 安全样本与 `npm run eval:security` 持续回归。  
- 对误杀（false positive）：调整规则或文案提示用户改写问题，而非取消预检。

## Regression

- `npm run eval:security`；报告见 `evals/reports/report_security_v1.md`。  
- 手工验证：正常创建任务路径仍可走通；恶意样本仍被拦或进入安全路径。

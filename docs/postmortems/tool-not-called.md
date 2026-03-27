# Failure Postmortem：未调用 create_task 工具

## Incident

在 `/workspace` 用户明确要「创建任务」，模型仅返回自然语言说明，没有产生 `create_task` 的 tool call；界面无待确认卡片，用户无法一键落库。

## Reproduction

1. 打开 `/workspace`，输入模糊请求（例如「帮我记下来」而未提待办/任务）。  
2. 或输入极短指令，模型选择直接对话而非工具。  
3. 多次重试同一上下文，观察 `agent-task` 响应是否稳定出现 `tool_calls`。

## Root Cause

- **Tool / LLM 层**：`tool_choice: "auto"` 下，模型可能判断无需工具或优先解释性回复；与 system 中「优先调用 create_task」的指令存在张力。  
- **Prompt 层**：用户文本来自 `extract`/`docs` 的摘要时，模型可能视为「讨论」而非「创建指令」。  
- **Eval 层**：task 类样本对「必须出工具」敏感，易产生 flaky（见 Week 5 复盘）。

## Fix

- 收紧 [agent-task](../../src/app/api/agent-task/route.ts) system 提示：在「创建待办」意图上增加明确触发词与反例。  
- 产品侧：在 UI 提供简短示例按钮或占位文案，引导用户写出可判定为「创建任务」的句子。  
- 评测侧：对失败样本保留 `debug` 输出，区分「无 tool」与「有 tool 但参数无效」。

## Regression

- `npm run eval` 中 task 类用例；必要时单独重跑 task 子集。  
- 手工走一遍：明确句「请创建任务：xxx」应稳定出现审批卡片。

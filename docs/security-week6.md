# Week 6 安全边界说明（Safe Workspace v1）

## 什么内容是不可信的

- **用户输入**：可能包含越权、注入或诱导模型泄露与误执行的内容。
- **注入到上下文中的文档正文**：仅可作为问答**证据**，不是系统规则，不能驱动工具或覆盖安全策略。

## 哪些动作需要审批

- **`create_task`（经 `/api/agent-task`）**：模型只生成**提议**；用户必须在 Workspace 点击「确认创建」后，任务才写入 `localStorage`。
- **Extract / Docs 页上一键保存任务**：属于用户显式点击的本地操作，不经过该审批流（与课程「最小人工确认」一致）。

## 哪些接口先做 moderation / 规则预检

- `POST /api/agent-task`：在调用 Kimi 主模型前执行 `checkUserInputSafety`（规则层 + 可选 **Kimi JSON 安全分类**，见 [domestic-llm.md](domestic-llm.md)）。
- `POST /api/ask-docs`：同上，对用户问题预检。
- `POST /api/extract`：对粘贴正文同样执行 `checkUserInputSafety`，避免明显注入/越权话术直达抽取模型。

## 本周先不解决什么

- 复杂 RBAC、审计后台、统一安全中间件、全站 trace 平台。
- 对 `/api/extract` 做与上述一致的预检；更细粒度误杀调参、全文审计日志仍不在本周范围。

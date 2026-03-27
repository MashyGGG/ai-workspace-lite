# 简历与面试用摘要

## 简历项目描述（英文，3–4 行）

Built an AI workspace prototype with structured extraction, citation-based document QA, approval-based task actions, a local evaluation harness, prompt-injection-oriented safeguards, and basic cost/latency observability. Implemented Kimi (Moonshot) Chat Completions workflows with JSON-only routes, local document-grounded answers, function tools with explicit human confirmation before side effects, and Markdown eval reports for regression.

（可按岗位删减一句，保留与 JD 最相关的两条。）

---

## 简历项目描述（中文，可选）

用 Next.js 与 Kimi API 搭建 AI 工作台原型：结构化抽取、带引用文档问答、需确认的任务创建；配套本地 JSONL 评测、安全样本回归与 Ops 页 token/延迟/成本摘要。强调副作用经人工审批与输入预检，而非「全自动 Agent」。

---

## 面试一页摘要：项目是什么

- **问题域**：知识工作者处理长文本、内部文档问答、跟进事项，需要**可校验的结构化结果**和**可审计的副作用**。  
- **你做了什么**：  
  - 抽取与问答走 **JSON schema** + 校验，减少自由文本漂移。  
  - 文档 QA **强制引用**与「无依据则不编造」。  
  - 任务创建走 **tool call + UI 确认**，路由层 **safety 预检**。  
  - **Eval**：规则 grader + 安全 JSONL；**Ops**：metrics 进 localStorage。  
- **技术选型理由**：课程对齐 OpenAI 能力栈，本仓库落地为 **Kimi 兼容 Chat**，文档为 **本地索引进 prompt**（非托管向量商店），便于本地一键跑通与说明边界。  
- **失败案例**：见 [postmortems/](postmortems/)（检索漏检、工具未调用、审批/安全边界）。  
- **若问「下一步」**：向量检索与分块、服务端审计日志、CI 集成 eval、定价配置化等（见各周 IMPLEMENTATION_REVIEW「可优化点」）。

---

## 30 秒电梯陈述（中文）

「这是一个工作台型 AI 原型：把长文本抽成结构化字段，文档问答带引用，创建任务必须点确认，并配有本地评测和安全样本、以及简单的成本延迟页。我想展示的是会接模型、接工具、接评测和观测，而不是只会调一个聊天接口。」

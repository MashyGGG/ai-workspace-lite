# Demo 解说词（约 3–5 分钟）

按顺序演示；口播可按现场略缩，但建议保留「失败与修复」一段。

---

## 0:00–0:30 开场（首页）

**口播**：这是 **AI Workspace Lite**，不是单一聊天框，而是一组面向知识工作流的原型页面：结构化抽取、带引用的文档问答、需要人工确认的任务写入，再加上本地评测、安全样本和成本延迟观测。

**操作**：打开 `/`，指向 Workspace、Ops 等入口（或导航栏）。

---

## 0:30–1:15 结构化抽取（`/extract`）

**口播**：第一段是 **Structured Extractor**。我把一段非结构化需求扔进去，模型用 JSON 返回摘要、行动项、风险和待确认点，便于下游工作台消费。

**操作**：粘贴一段示例长文本 → 运行 → 展示结构化字段与（若有）metrics。

---

## 1:15–2:00 文档问答与引用（`/docs`）

**口播**：**Doc QA** 基于仓库内已索引文档。回答里带 **citations** 和 **searchResults**，方便核对是不是「有据可查」。如果文档里没有依据，应该明确说找不到，而不是编造。

**操作**：提一个文档里能答的问题 → 展示引用；可选再提一个边界问题看拒答或弱依据。

---

## 2:00–2:45 审批式任务（`/workspace`）

**口播**：**Workspace** 里模型可以提议调用 `create_task`，但**不会自动写入列表**——必须点确认。这是故意设计的副作用边界，避免 Agent 误创建任务。

**操作**：输入明确创建意图 → 展示提议 → 确认后 localStorage 出现任务。

---

## 2:45–3:15 成本与延迟（`/ops`）

**口播**：**Ops** 页汇总最近请求的 token、延迟和估算成本，对应「最小可观测性」——知道贵不贵、慢在哪里。

**操作**：刷新 `/ops`，指一两行真实记录。

---

## 3:15–3:45 评测与安全资产

**口播**：评测是**规则型 grader**，跑在本地 JSONL 上，输出 Markdown 报告，适合回归对比。安全侧有独立样本集和报告。

**操作**（屏幕共享编辑器或浏览器 raw）：

- `evals/reports/report_v1.md`（若已运行 `npm run eval` 生成）  
- 已入库示例：[evals/reports/report_security_v1.md](../evals/reports/report_security_v1.md)  
- 样本数据：[evals/datasets/security_cases_v1.jsonl](../evals/datasets/security_cases_v1.jsonl)

---

## 3:45–4:30 失败与修复（postmortem）

**口播**：作品集里我刻意放了 **failure postmortem**：例如检索漏检、工具没被调用、审批与安全预检的边界。每个都写了复现、根因、修复和回归手段——这比只贴成功截图更接近真实工程。

**操作**：打开 [docs/postmortems/retrieval-miss.md](postmortems/retrieval-miss.md) 或任意一篇，快速扫结构。

---

## 收尾一句

**口播**：这条线串起来的是：**结构化输出、检索与引用、工具与审批、评测、安全、观测**——一个 AI 应用工程师最小闭环的原型。

---

## 演示前检查清单

- [ ] `npm run dev` 可访问，`MOONSHOT_API_KEY` 已配置。  
- [ ] 已执行 `node scripts/setup-doc-index.mjs`。  
- [ ] localStorage 可清空或保留几条好看的任务/Ops 记录。  
- [ ] 如需展示 `report_v1.md`，提前跑 `npm run eval`。  

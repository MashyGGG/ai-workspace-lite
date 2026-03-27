下面是 **Week 8 的执行版**。
这一周不再加新功能，目标非常明确：

# 把 AI Workspace Lite Alpha 封装成“可投递、可演示、可解释”的作品集版本

这和你两份文档的最终落点完全一致：到这个阶段，重点已经从“本地能跑”转向“可展示的系统”，至少要补上 **README、架构图、评测结果、成本/延迟、失败案例复盘**，因为这部分是求职信号最强的部分。 你原文也明确强调，作品集不该只放成功截图，而要把**失败与修复**写出来，这会更像真正的工程师作品。

---

## 本周唯一目标

做出 **AI Workspace Lite Beta（Portfolio Edition）**，至少包含：

- 一个能正常打开的完整项目仓库

- 一份像样的 README

- 一张系统架构图

- 一份评测报告摘要

- 一页成本/延迟总结

- 2–3 个失败案例复盘

- 一个 3–5 分钟 Demo 视频脚本

- 一段可直接放简历的项目描述

这一步本质上是在把你前 7 周做出的能力，重新组织成“别人一看就懂你会什么”的证据。你的文档里也明确建议，到作品集阶段至少要展示：**架构图、模型选择理由、评测结果、成本、失败案例、下一步计划**。

---

## 本周结束的验收标准

到周日，你至少要满足这 8 条：

1. 仓库根目录有完整 README

2. README 能讲清楚：做了什么、为什么这样做、系统长什么样

3. 你有一张架构图

4. 你能展示 eval 结果和至少 1 次优化前后对比

5. 你能展示安全边界和审批式工具调用

6. 你能展示成本/延迟页面

7. 你有 2–3 篇 failure postmortem

8. 你能用 3–5 分钟完整讲一遍项目

你的文档里已经把这个阶段定义得很清楚：**可展示的系统，不是本地截图**；而且 staging / prod、README、架构图、eval 报告、失败案例复盘都属于这一阶段的核心交付物。

---

## 这周先不要做

先别做这些：

- 重构整套代码结构

- 新加一大块功能

- 换技术栈

- 临时补很重的后端基础设施

- 纠结“要不要多 agent / MCP / realtime”

因为你文档里反复强调的主线其实很稳定：**先把 Responses / Tools / Evals / Retrieval / Security / Cost-Perf 这条主干做扎实，再考虑多模态或更复杂分支。**

---

# 每日执行版

## 周一，下班后 1–1.5 小时

目标：先收口，不急着美化。

今天只做 3 件事：

### 1. 盘点当前能力

新建：

```Plain Text
docs/week8-inventory.md
```


内容只写这 5 段：

- 已完成页面

- 已完成接口

- 已完成能力

- 当前最不稳定的地方

- 本周不再做的新功能

### 2. 定最终对外叙事

把项目用一句话写清楚，例如：

> AI Workspace Lite 是一个面向知识工作流的 AI 应用原型，支持结构化抽取、带引用文档问答、审批式任务创建、最小评测、安全边界与成本/延迟观测。

### 3. 列 README 大纲

先写标题，不填细节。

### 今天的完成标准

你已经把 Week 8 定义成“封装周”，不是“继续乱加功能周”。

---

## 周二，下班后 1–1.5 小时

目标：写 README 主体。

你的文档里已经很明确，这一步的 README 不只是“如何运行”，还要包含：

- 架构图

- 模型选择理由

- 评测结果

- 成本

- 失败案例

- 下一步计划

### 今天做

把 `README.md` 写到至少这 8 个章节：

9. What it is

10. Why this project

11. Core features

12. System design

13. Evaluation

14. Safety

15. Cost / latency

16. Roadmap

### 今天的完成标准

README 不再只是启动命令说明，而是开始像作品集首页。

---

## 周三，下班后 1–1.5 小时

目标：补架构图和数据流图。

### 今天做

至少画 2 张图：

#### 图 1：系统架构图

包含：

- Next.js pages

- API routes

- localStorage

- OpenAI Responses

- file_search vector store

- function tool

- eval scripts

- ops logs

#### 图 2：关键数据流

至少画这 3 条：

- Extract 流

- Docs QA 流

- Task approval 流

你的文档里对作品集阶段的要求很明确：**必须有架构图**，而且要能把系统设计讲清楚。

### 今天的完成标准

别人即使不读代码，也能通过图看懂系统。

---

## 周四，下班后 1–2 小时

目标：整理评测与运行结果。

### 今天做

把 Week 5、Week 6、Week 7 的关键结果统一整理成一个文件：

```Plain Text
docs/benchmark-summary.md
```


建议包含 4 个部分：

17. Eval Harness v1 结果摘要

18. 安全样本结果摘要

19. Ops Lite 里的成本/延迟观察

20. 你做过的一次优化前后对比

你的原文已经明确要求作品集阶段展示：

- 评测页 / eval 报告

- 成本 / 延迟

- 失败案例
而不是只有功能截图。

### 今天的完成标准

你已经能把“项目质量”讲成一页文档，而不是散落在各周笔记里。

---

## 周五，下班后 1 小时

目标：写 failure postmortem。

### 今天做

写 2–3 篇最短但真实的失败复盘。

建议文件：

```Plain Text
docs/postmortems/
  retrieval-miss.md
  tool-not-called.md
  approval-boundary.md
```


每篇都按这个结构：

```Plain Text
# Failure Postmortem

## Incident
发生了什么？

## Reproduction
怎么稳定复现？

## Root Cause
是 retrieval / prompt / tool / safety / UI 哪一层的问题？

## Fix
做了什么修复？

## Regression
后面加了什么测试，避免再犯？
```


你的文档里对这一点态度非常明确：**作品集里一定要放失败与修复**，这比全是成功截图更有职业信号。

### 今天的完成标准

你已经有“工程可信度”，不只是功能展示。

---

## 周六，4–6 小时

目标：录制 Demo 所需的一切都准备好。

今天做 4 件事：

### 1. 梳理最终演示路径

推荐固定成这一条：

21. 首页：解释项目定位

22. `/extract`：展示结构化抽取

23. `/docs`：展示带引用回答

24. `/workspace`：展示审批式任务创建

25. `/ops`：展示成本与延迟

26. `evals/reports`：展示最小评测

27. `security_cases_v1.jsonl`：展示安全测试样本

28. postmortem：展示失败与修复

### 2. 清理 Demo 数据

至少保证：

- localStorage 里有几条合适任务

- ops 页里有几条可讲的数据

- eval 报告是最新一版

### 3. 写 Demo 解说词

控制在 3–5 分钟。

### 4. 补首页文案和截图

如果首页还太空，这一天顺手补 3 个能力卡片：

- Structured Extractor

- Doc QA with Citations

- Approval-based Task Action

### 周六完成标准

你已经能完整、不结巴地讲完项目，而不是一边演示一边想说什么。

---

## 周日，3–4 小时

目标：最终封装。

### 今天做

29. 最终润色 README

30. 导出架构图

31. 录 Demo

32. 写简历版项目描述

33. 写一页“面试回答版摘要”

### 简历项目描述建议写法

控制在 3–4 行：

> Built an AI workspace prototype with structured extraction, citation-based document QA, approval-based task actions, local evaluation harness, prompt-injection safeguards, and basic cost/latency observability.
Implemented OpenAI Responses-based workflows, hosted retrieval, function tools, safety checks, and local regression reporting across extract, docs, and task routes.

这和你文档里的总目标是完全一致的：**用一个 Team AI Workspace 项目，把 Agent、RAG、Evals、Observability、Deployment 串起来，证明你是 AI Application Engineer 路线，而不是只会调接口。**

---

# 推荐目录增量

```Plain Text
docs/
  week8-inventory.md
  benchmark-summary.md
  architecture-overview.md
  ops-retro-week7.md
  security-retro-week6.md
  postmortems/
    retrieval-miss.md
    tool-not-called.md
    approval-boundary.md

assets/
  architecture-diagram.png
  dataflow-diagram.png
  demo-cover.png
```


---

# Week 8 推荐 README 结构

直接按这个写最稳：

```Plain Text
# AI Workspace Lite

## What it is
一句话定义项目。

## Why this project
为什么做这个，而不是另一个聊天 demo。

## Core features
- Structured extraction
- Citation-based Doc QA
- Approval-based task action
- Eval Harness
- Safety checks
- Cost / latency logging

## System design
- 架构图
- 数据流图
- 页面与 API 说明

## Evaluation
- 数据集规模
- 规则型 grader
- 通过率
- 失败样本

## Safety
- 输入预检查
- 文档内容不可信
- 工具审批
- 安全样本集

## Ops
- usage
- latency
- estimated cost
- simple optimization findings

## Failures and fixes
- case 1
- case 2
- case 3

## Roadmap
- What’s next
- What I deliberately did not build
```


这份结构正好对应你文档里对作品集阶段的要求：**架构、评测、成本、失败、下一步计划**。

---

# Week 8 Demo 脚本

周日录视频时，直接按这个顺序讲：

34. 这是一个 AI Workspace Lite，不是单纯聊天框

35. 在 `/extract` 输入一段需求文本，展示结构化结果

36. 在 `/docs` 提问，展示带引用回答

37. 在 `/workspace` 让 AI 提议创建任务，展示审批后才写入

38. 在 `/ops` 展示最近请求的 token、latency、cost

39. 打开 `evals/reports/report_v1.md`，展示评测思路

40. 打开 `security_cases_v1.jsonl`，展示安全样本

41. 打开一个 postmortem，说明你如何定位和修复失败

42. 最后总结：这个项目覆盖了 retrieval、tools、evals、safety、observability 的最小闭环

---

# Week 8 README 增量模板

你可以直接追加这一段：

```Plain Text
## Week 8 - Portfolio Packaging

### 本周目标
把 AI Workspace Lite Alpha 封装成可投递、可演示、可解释的作品集版本。

### 本周做了什么
- 完整 README
- 架构图与数据流图
- benchmark summary
- failure postmortems
- 最终 demo 脚本
- 简历项目描述

### 为什么重要
AI 项目的价值，不只是“本地能跑”，而是别人能否快速理解：
1. 它解决什么问题
2. 它如何工作
3. 它哪里会失败
4. 你如何修它

### 本周复盘
#### 我最满意的一点
- 

#### 我最想继续补的一点
- 

#### 这个项目最能代表我的能力是什么
- 
```


---

# 这周最容易踩的 3 个坑

第一，**把 Week 8 做成 UI 美化周**。
这周重点不是页面更漂亮，而是**表达更完整**。你的文档里对这点已经很清楚：作品集阶段最值钱的是 README、架构图、eval、成本、失败复盘。

第二，**把所有东西都往 README 里堆**。
README 负责概览，详细 benchmark、postmortem、架构说明最好拆到 `docs/`。

第三，**只展示成功路径**。
你原文已经明确提醒：只放成功截图不够，失败与修复更能体现工程能力。

---

# 8 周结束后，你真正拿到的是什么

不是“我学过一些 AI 概念”，而是这套更职业化的证据：

- 你会用 TS 主战做 AI 应用外壳

- 你会把结构化输出、文档检索、工具调用接成连续工作流

- 你知道为什么要做最小 eval

- 你知道为什么副作用动作要审批

- 你会看 token、latency、cost

- 你能把失败说清楚，也能把修复说清楚

这和你文档里的初心是对齐的：**不是转去纯算法研究，而是成为能把 AI 能力做成产品、做成系统、做成作品集的 AI Application Engineer。**

如果你愿意，我下一条可以继续把 **这 8 周的所有周计划整理成一份总表**，做成“按周 + 按日 + 每周交付物 + 每周 Demo + 每周验收标准”的总览版，方便你直接照着执行。


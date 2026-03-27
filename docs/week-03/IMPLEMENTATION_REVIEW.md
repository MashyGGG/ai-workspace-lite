# Week 03 实现复盘（结合本仓库）

本文档对照 [week-03/README.md](./README.md) 的课程说明（**OpenAI vector store + Responses API `file_search`**），总结本仓库 **实际做了什么、如何实现、为何适配为 Kimi**，以及 **可优化点** 与 **下一周方向**。

---

## 1. 到底做了什么？

### 1.1 课程文档中的目标（Doc QA v1）

- 将 3～5 份本地文档接入 **OpenAI `file_search`**（需 vector store）。
- 网页提问，返回：**答案 + 引用来源 + 检索结果预览**（便于区分「没检索到」还是「总结错了」）。
- 明确**本周不做**：浏览器上传、自建向量库、自研 chunking、登录权限、文档后台等。

### 1.2 课程文档中的完成标准（五条）

1. 本地 `sample-docs/` 中有样例文档。  
2. 能跑脚本把文档同步到 **vector store**（课程示例：`setup-vector-store.mjs` + `OPENAI_VECTOR_STORE_ID`）。  
3. 网页可提问并返回答案。  
4. 页面至少展示引用文件名。  
5. 页面展示检索结果预览。

### 1.3 本仓库**实际**实现的功能（与五条标准对齐）

| 标准 | 本仓库实现 | 说明 |
|------|------------|------|
| 样例文档 | `sample-docs/product.md`、`roadmap.md`、`faq.txt` | 内容与课程建议一致 |
| 「上传/索引」脚本 | `scripts/setup-doc-index.mjs` | **非** OpenAI 上传；生成本地根目录 `doc-index.json`（含 `filename`、`content`、`charCount` 等） |
| 问答 API | `src/app/api/ask-docs/route.ts` | `POST /api/ask-docs`，读取索引、拼 system 上下文、Kimi `json_object` |
| 答案 + 引用 | `DocAnswerCard` + `CitationList` | 引用含 **文件名 + 可选 quote** |
| 检索预览 | `SearchResultsPreview` | 展示 `filename`、`relevance`（high/medium/low）、`text`；**由模型在 JSON 中给出**，非向量分数 |
| 前端页 | `src/app/docs/page.tsx` | 与课程布局思路一致：左侧答案+引用，右侧检索预览 |
| 类型 | `src/types/doc-qa.ts` | `DocQAResponse`、`Citation`、`SearchResultItem` |
| 文档加载 | `src/lib/doc-loader.ts` | 读 `doc-index.json`，`buildDocContext` 生成带文件边界的文本块 |
| 导航 / 文档 | `AppNav` 链到 `/docs`；根 [README.md](../../README.md) 含 Week 3 使用说明 | 环境仍只用 `MOONSHOT_*` |

### 1.4 与课程文档的本质差异（一句话）

课程：**托管向量检索 + API 级 file_search + annotations**。  
本仓库：**全量文档进上下文 + 模型结构化输出引用与「检索片段」**，不依赖 OpenAI vector store。

---

## 2. 怎么做？（技术路径）

### 2.1 准备阶段（本地）

```bash
node scripts/setup-doc-index.mjs
```

- 扫描 `sample-docs/` 下 `.md` / `.txt`（及脚本中允许的其他扩展名）。
- 写入 `doc-index.json`（需提交或 CI 生成，运行前必须存在）。

### 2.2 运行阶段

1. 用户打开 `/docs`，输入问题，`POST { question }`。
2. `loadDocuments()` 读取 `doc-index.json`；不存在则 500 并提示先跑脚本。
3. `buildDocContext` 将每份文档包在 `=== 文件：xxx ===` 边界内，拼入 **system**。
4. System 前半为规则：仅依据文档、无依据则说明、输出 **唯一 JSON** 对象，字段包括 `answer`、`citations`、`searchResults`。
5. `openai.chat.completions.create`（实为 Kimi）+ `response_format: { type: "json_object" }`。
6. 解析字符串（含去 fence），返回 JSON 给前端。

### 2.3 关键代码引用

- API：`src/app/api/ask-docs/route.ts`
- 加载器：`src/lib/doc-loader.ts`
- 索引脚本：`scripts/setup-doc-index.mjs`

---

## 3. 为什么这么做？

1. **供应商一致**：全项目以 Moonshot/Kimi 为主，Kimi **不提供** 与 OpenAI 完全同构的 `file_search` + vector store 组合；若强行接 OpenAI 仅服务 Week 3，会增加 **双 Key、双账单、双 SDK 配置**。
2. **符合课程「先跑通主链路」**：在少量小文档场景下，**全上下文注入** 是最短路径；Kimi 上下文窗口大（文档所述 256K 量级），样例文档体积极小，风险可控。
3. **复用 Week 2 能力**：`json_object` + 服务端解析与 Week 2 一致，学习曲线平滑。
4. **保留产品语义**：仍有「引用」与「检索预览」两块 UI，用户仍可做 **定性** 排查（尽管「检索」不是真实向量召回分数）。

---

## 4. 是否有优化的空间？

| 方向 | 现状 | 可优化点 |
|------|------|----------|
| 真实检索 | 无向量检索；`searchResults` 由模型生成 | 引入 BM25/小型 embedding 先筛片段再问答；或 Kimi `file-extract` 上传 + 按需拉取内容，减轻本地索引 |
| 引用可信度 | 依赖模型自报 `quote` | 服务端用原文对 `quote` 做子串校验，不通过则标红或降级展示 |
| 文档规模 | 全量进 system | 文档变多时分块、map-reduce、或按文件名先分类再调用 |
| 安全与隐私 | 文档在服务端内存展开 | 敏感文档需访问控制、审计日志、环境隔离 |
| `doc-index.json` | 需手动/CI 生成 | `npm run` 脚本封装、watch 模式、或构建步骤自动生成 |
| UI | 答案为纯文本 | Markdown 渲染、代码高亮、引用跳转至原文段落 |
| 与课程对齐 | 未使用 OpenAI file_search | 若学习目标包含该平台，可另开分支或文档说明「双实现对比」 |

---

## 5. 下一周要做什么？

对照 [week-03/README.md](./README.md) 文末与 [sample-docs/roadmap.md](../../sample-docs/roadmap.md)：

- **Week 4 目标（路线图原文）**：将前三周能力 **整合为 AI Workspace Lite Alpha**，并加入 **最小工具调用**（tool / function calling 或等价能力）。
- **结合当前代码的可执行拆解建议**：
  1. **产品整合**：统一布局、设计系统、错误与 loading 模式；考虑「工作台」首页串联 Prompt Lab / Extract / Doc QA。
  2. **工具调用**：选一个低风险场景（如「根据抽取结果生成待办清单文件」「调用内置计算器/日期」），走通 **模型 → tool_calls → 服务端执行 → 再回合** 的闭环（Kimi 文档中有 tool 与 builtin 工具说明，需按模型版本选型）。
  3. **质量与可信**：为 Doc QA 增加 1～2 条自动化或半自动回归用例；为 Week 2 抽取保留 golden cases。
  4. **文档与演示**：按 Week 3 README 的 Demo 脚本录屏，并填写「失败案例模板」。

---

## 相关链接

- 课程原文：[week-03/README.md](./README.md)
- Week 4 预告：见 `sample-docs/roadmap.md` 与 [week-01/IMPLEMENTATION_REVIEW.md](../week-01/IMPLEMENTATION_REVIEW.md)、[week-02/IMPLEMENTATION_REVIEW.md](../week-02/IMPLEMENTATION_REVIEW.md) 的衔接说明
- 根目录说明：[README.md](../../README.md)

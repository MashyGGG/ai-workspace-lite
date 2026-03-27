# Week 02 实现复盘（结合本仓库）

本文档对照 [week-02/README.md](./README.md) 的课程说明（其中大量示例基于 **OpenAI Responses API + `responses.parse` + Zod**），总结本仓库 **实际做了什么、如何实现、为何偏离官方示例**，以及 **可优化点** 与 **下一周方向**。

---

## 1. 到底做了什么？

### 1.1 课程文档中的目标

- 名称：**Structured Extractor v1**。
- 输入：会议纪要、需求描述等长文本。
- 输出：固定结构对象：`summary`、`actionItems`、`risks`、`openQuestions`。
- 过关标准包括：稳定得到**合法对象**（而非「像 JSON 的字符串」）、前端**卡片化渲染**、能解释 **schema 与业务边界** 的关系、可演示 Demo。

### 1.2 课程文档中的「参考实现」

- 使用 `openai.responses.parse`、`zodTextFormat(ExtractionSchema, ...)`，从 `response.output_parsed` 取解析结果（OpenAI 平台 Structured Outputs 路线）。

### 1.3 本仓库**实际**实现的功能

| 能力 | 实现位置 | 说明 |
|------|----------|------|
| Schema 定义 | `src/schemas/extraction.ts` | Zod：`ActionItemSchema`、`RiskSchema`、`ExtractionSchema`，与课程字段设计一致 |
| 抽取 API | `src/app/api/extract/route.ts` | `POST /api/extract`：校验 Key、文本、长度 → 调 `extractStructuredJson` → `JSON.parse`（含去 fence）→ `ExtractionSchema.safeParse` |
| LLM 调用 | `src/lib/llm.ts` 中 `extractStructuredJson` | **Kimi Chat Completions**：`response_format: { type: "json_object" }`，system 内写明 JSON 形状（Moonshot 文档要求） |
| 前端页面 | `src/app/extract/page.tsx` | 输入框、抽取按钮、loading、错误展示 |
| 结构化展示 | `src/components/ExtractionResultCard.tsx` | 分块展示总结、行动项、风险、待确认问题（非单纯 `JSON.stringify`） |
| JSON 预览 / 复制 | `src/components/JsonPreview.tsx` 等 | 便于调试与对照 |
| Markdown 导出 | `src/lib/extraction-markdown.ts` | 与课程「导出 markdown」建议一致 |
| 导航 | `src/components/AppNav.tsx` | 入口「Structured Extractor v1」 |

### 1.4 与课程文档的核心差异（必须理解）

| 维度 | 课程文档（OpenAI） | 本仓库（Moonshot/Kimi） |
|------|---------------------|-------------------------|
| API | `responses.parse` + `zodTextFormat` | `chat.completions.create` + `json_object` |
| 结构化保证 | SDK/平台侧与 schema 绑定 | **提示词描述 JSON 形状** + **服务端 Zod 校验** |
| 解析入口 | `output_parsed` | 字符串 → `parseModelJsonObject` → `safeParse` |

**结论**：学习目标一致（**交付可用的业务对象**），实现路径因 **统一使用 Kimi** 而切换为 **JSON 模式 + Zod 校验**，这在根目录 [README.md](../../README.md) 中已有说明。

---

## 2. 怎么做？（技术路径）

### 2.1 请求链路

1. 前端 `POST /api/extract`，body `{ text }`。
2. 校验 `MOONSHOT_API_KEY`、非空文本、长度上限（与 Week 1 同为约 20000 字符）。
3. `extractStructuredJson(text)`：system 为 `EXTRACTION_SYSTEM`（内含完整 JSON 示例与规则），user 为「请抽取并只输出 JSON」+ 原文。
4. 模型返回字符串 → 去掉可选 ```json 围栏 → `JSON.parse`。
5. `ExtractionSchema.safeParse`：失败则 500 并打日志；成功则返回 `{ result, model }`。

### 2.2 为何在 system 里写死 JSON 形状？

Moonshot 对 `json_object` 的要求是：须在提示中明确 JSON 结构，否则模型难以稳定满足解析器期望。`EXTRACTION_SYSTEM` 同时承担「角色 + 格式 + 业务规则（不编造、空数组）」。

### 2.3 关键代码引用

- 路由：`src/app/api/extract/route.ts`
- LLM：`src/lib/llm.ts` 中 `extractStructuredJson`、`EXTRACTION_SYSTEM`
- Schema：`src/schemas/extraction.ts`

---

## 3. 为什么这么做？

1. **全项目单一供应商**：Week 1 已用 Kimi，Week 2 继续用同一 `baseURL` 与 Key，降低环境与文档分裂成本。
2. **结构化输出的本质未变**：无论 OpenAI `responses.parse` 还是 Kimi `json_object`，产品侧都需要 **可解析、可校验、可展示** 的对象；Zod 仍是业务边界的「单一真相」。
3. **防御性解析**：模型偶发仍可能输出 fence 或轻微脏数据，`parseModelJsonObject` + `safeParse` 把「格式风险」挡在 API 层，避免前端收到半结构化垃圾。
4. **与 Week 1 形成对比**：同一项目内可直观看到「自由文本生成」与「JSON + schema」在可测试性、UI 组装上的差别。

---

## 4. 是否有优化的空间？

| 方向 | 现状 | 可优化点 |
|------|------|----------|
| 与 OpenAI 路线对齐 | 未使用 `responses.parse` | 若未来引入 OpenAI 或混合供应商，可抽象 `StructuredLLM` 接口，按 provider 切换实现 |
| Schema 与提示同步 | JSON 形状在 `EXTRACTION_SYSTEM` 字符串与 Zod 中**双份维护** | 考虑从 Zod 生成简要 JSON 说明，或单一来源生成 prompt 片段，减少漂移 |
| 拒答与部分字段 | 路由未单独处理「模型拒绝回答」字段 | 若 Kimi 返回结构化拒答，可扩展类型与 UI |
| Eval / 回归 | 无自动化测试 | 固定几条 golden input，对 `ExtractionSchema.safeParse` 做快照或契约测试 |
| 流式结构化 | 当前一次性返回 | 若需 UX 提升，可调研 stream + partial JSON（复杂度高） |
| 错误信息 | 用户看到泛化错误 | 开发环境可返回 `flatten()` 摘要（注意勿泄露敏感信息） |

---

## 5. 下一周要做什么？

对照 [week-03/README.md](../week-03/README.md) 与 [sample-docs/roadmap.md](../../sample-docs/roadmap.md)：

- **Week 3 主题**：**Doc QA v1**——基于**多份文档**回答问题，并展示 **引用** 与 **检索/相关片段预览**，减少「模型背答案」不可信问题。
- **课程原文技术栈**：OpenAI `file_search` + vector store + Responses API。
- **本仓库实际路线**：因继续使用 Kimi，采用 **本地 `doc-index.json` + 全量文档注入 system + `json_object` 返回 answer/citations/searchResults**（详见 [week-03/IMPLEMENTATION_REVIEW.md](../week-03/IMPLEMENTATION_REVIEW.md)）。

**衔接建议**：在 Week 3 对比「Week 2 单段输入抽取」与「Week 3 多文档问答」在 **依据可追溯性** 上的差异；刻意记录 1～2 个「检索预览为空但答案却在编」的失败案例，为 Week 4 整合与工具调用做铺垫。

---

## 相关链接

- 课程原文：[week-02/README.md](./README.md)
- Week 3 课程：[week-03/README.md](../week-03/README.md)
- 根目录说明：[README.md](../../README.md)
